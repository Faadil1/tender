import baseWorker, { TenderOperatorStoreDurableObject } from "./index.js";
import { normalizeDecimalString } from "../domain/identity.js";

export { TenderOperatorStoreDurableObject };

type RuntimeEnv = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  TENDER_OPERATOR_TOKEN?: string;
  TENDER_OPERATOR_STORE?: unknown;
  TENDER_OPERATOR_DO?: unknown;
  BASE_SEPOLIA_RPC_URL?: string;
  [key: string]: unknown;
};

const OFFICIAL_BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const PUBLICNODE_BASE_SEPOLIA_RPC = "https://base-sepolia-rpc.publicnode.com";
const BASE_SEPOLIA_USDC = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
const ERC20_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export function isOperatorRuntimeConfigured(env: RuntimeEnv) {
  return Boolean(env.TENDER_OPERATOR_TOKEN && (env.TENDER_OPERATOR_DO || env.TENDER_OPERATOR_STORE));
}

export function rpcCandidates(env: RuntimeEnv) {
  return [...new Set([
    env.BASE_SEPOLIA_RPC_URL,
    OFFICIAL_BASE_SEPOLIA_RPC,
    PUBLICNODE_BASE_SEPOLIA_RPC
  ].filter((value): value is string => Boolean(value)))];
}

function amountToBaseUnits(value: string, decimals = 6) {
  const normalized = normalizeDecimalString(value);
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error("invalid canonical amount");
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) throw new Error("canonical amount exceeds token precision");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt((fraction.padEnd(decimals, "0") || "0"));
}

function responseJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

async function canonicalProof(request: Request, env: RuntimeEnv) {
  const proofRequest = new Request(new URL("/api/proof", request.url), { method: "GET" });
  const response = await baseWorker.fetch(proofRequest, env as never);
  if (!response.ok) throw new Error(`canonical evidence unavailable (${response.status})`);
  return (await response.json()) as any;
}

export function verifyCanonicalTransfer(proof: any, chainReceipt: any) {
  const receipt = proof.settlement.receipt;
  const txHash = String(proof.settlement.transactionHash).toLowerCase();
  const recipient = String(receipt.recipients[0].wallet).toLowerCase();
  const expectedAmount = amountToBaseUnits(String(receipt.amount));
  const recipientTopic = `0x${recipient.replace(/^0x/, "").padStart(64, "0")}`;

  if (String(chainReceipt?.transactionHash ?? "").toLowerCase() !== txHash) {
    throw new Error("independent chain verification transaction hash mismatch");
  }

  const transferLog = (chainReceipt?.logs ?? []).find((log: any) => {
    const addressMatches = String(log.address ?? "").toLowerCase() === BASE_SEPOLIA_USDC;
    const transferMatches = String(log.topics?.[0] ?? "").toLowerCase() === ERC20_TRANSFER_TOPIC;
    const recipientMatches = String(log.topics?.[2] ?? "").toLowerCase() === recipientTopic;
    let amountMatches = false;
    try { amountMatches = BigInt(log.data ?? "0x0") === expectedAmount; } catch { amountMatches = false; }
    return addressMatches && transferMatches && recipientMatches && amountMatches;
  });

  if (chainReceipt?.status !== "0x1" || !transferLog) {
    throw new Error("independent chain verification did not match the canonical Tender Receipt");
  }

  return {
    verified: true,
    transactionHash: proof.settlement.transactionHash,
    transactionStatus: "success",
    usdcContract: BASE_SEPOLIA_USDC,
    recipient,
    amount: receipt.amount,
    amountBaseUnits: expectedAmount.toString(),
    transferEventMatched: true,
    blockNumber: BigInt(chainReceipt.blockNumber).toString(),
    keeperHubWasTrustedForThisCheck: false
  };
}

async function fetchTransactionReceipt(rpcUrl: string, txHash: string) {
  let lastError = "unavailable";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getTransactionReceipt", params: [txHash] })
      });
      if (response.ok) {
        const payload = await response.json() as any;
        if (payload?.result) return payload.result;
        lastError = payload?.error?.message ?? "transaction receipt unavailable";
        break;
      }
      lastError = `HTTP ${response.status}`;
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "network failure";
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 125));
  }
  throw new Error(lastError);
}

async function independentChainProof(request: Request, env: RuntimeEnv) {
  const proof = await canonicalProof(request, env);
  const txHash = String(proof.settlement.transactionHash);
  const failures: string[] = [];

  for (const rpcUrl of rpcCandidates(env)) {
    try {
      const chainReceipt = await fetchTransactionReceipt(rpcUrl, txHash);
      const verified = verifyCanonicalTransfer(proof, chainReceipt);
      return {
        ...verified,
        verifier: "independent Base Sepolia JSON-RPC",
        rpcProvider: new URL(rpcUrl).hostname,
        evaluatedAt: new Date().toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown RPC failure";
      if (message.includes("did not match") || message.includes("hash mismatch")) throw error;
      failures.push(`${new URL(rpcUrl).hostname}: ${message}`);
    }
  }

  throw new Error(`independent Base RPC unavailable after fallback (${failures.join("; ")})`);
}

export default {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (request.method === "GET" && url.pathname === "/api/runtime") {
        const response = await baseWorker.fetch(request, env as never);
        if (!response.ok) return response;
        const body = await response.json() as Record<string, unknown>;
        return responseJson({
          ...body,
          operatorRuntimeConfigured: isOperatorRuntimeConfigured(env),
          operatorStoreConsistency: env.TENDER_OPERATOR_DO ? "strong" : env.TENDER_OPERATOR_STORE ? "eventual" : "none"
        });
      }

      if (request.method === "GET" && url.pathname === "/api/chain-proof") {
        return responseJson(await independentChainProof(request, env));
      }

      return baseWorker.fetch(request, env as never);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown runtime error";
      return responseJson({ error: "runtime_failure", message }, 500);
    }
  }
};

import { KeeperHubExecutor } from "../adapters/keeperhub.js";
import { MemorySettlementRepository } from "../adapters/memoryRepository.js";
import { claimIdFor, idempotencyKeyFor, normalizeDecimalString } from "../domain/identity.js";
import { verifyEconomicIdentity, type EconomicOverride } from "../domain/obligationVerifier.js";
import { TenderOperatorService, type OperatorStore } from "../domain/operatorRuntime.js";
import { SettlementEngine } from "../domain/settlementEngine.js";
import type { AcceptanceEvidence, Contribution, SettlementExecutor, SettlementPolicy, SettlementRecord } from "../domain/types.js";

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
};

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  TENDER_OPERATOR_TOKEN?: string;
  TENDER_OPERATOR_STORE?: KVNamespace;
  KEEPERHUB_API_KEY?: string;
  KEEPERHUB_BASE_URL?: string;
  KEEPERHUB_WORKFLOW_ID?: string;
  OPERATOR_SETTLEMENT_MODE?: "mock" | "workflow";
};

const policy: SettlementPolicy = {
  version: "policy.live.base-sepolia-usdc.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: "5",
  requireReview: false
};

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const BASE_SEPOLIA_USDC = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
const ERC20_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const noBroadcastExecutor: SettlementExecutor = {
  async preflight() { throw new Error("judge runtime must never preflight a new payment"); },
  async execute() { throw new Error("judge runtime must never broadcast a payment"); },
  async reconcile(record) { return record; }
};

class CloudflareKVOperatorStore implements OperatorStore {
  readonly consistency = "eventual" as const;
  constructor(private readonly kv: KVNamespace) {}
  async get<T>(key: string) {
    const value = await this.kv.get(key);
    return value ? JSON.parse(value) as T : undefined;
  }
  async put<T>(key: string, value: T) {
    await this.kv.put(key, JSON.stringify(value));
  }
  async delete(key: string) {
    await this.kv.delete(key);
  }
  async list<T>(prefix: string) {
    const listed = await this.kv.list({ prefix });
    const values = await Promise.all(listed.keys.map(async ({ name }) => ({ key: name, value: await this.get<T>(name) })));
    return values.flatMap(({ key, value }) => value === undefined ? [] : [{ key, value }]);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

async function requireOperator(request: Request, env: Env) {
  if (!env.TENDER_OPERATOR_TOKEN || !env.TENDER_OPERATOR_STORE) {
    return { ok: false as const, response: json({ error: "operator_runtime_not_configured" }, 503) };
  }
  if ((request.headers.get("Authorization") ?? "") !== `Bearer ${env.TENDER_OPERATOR_TOKEN}`) {
    return { ok: false as const, response: json({ error: "operator_unauthorized" }, 401) };
  }
  const store = new CloudflareKVOperatorStore(env.TENDER_OPERATOR_STORE);
  return { ok: true as const, service: new TenderOperatorService(store), store };
}

async function readJson<T>(request: Request) {
  return (await request.json()) as T;
}

function operatorExecutor(env: Env, store: OperatorStore) {
  if (env.OPERATOR_SETTLEMENT_MODE === "mock") return new KeeperHubExecutor({ mode: "mock" });
  if (store.consistency !== "strong") throw new Error("strong_operator_store_required_for_workflow_settlement");
  if (!env.KEEPERHUB_API_KEY || !env.KEEPERHUB_WORKFLOW_ID) throw new Error("keeperhub_operator_execution_not_configured");
  return new KeeperHubExecutor({
    apiKey: env.KEEPERHUB_API_KEY,
    workflowId: env.KEEPERHUB_WORKFLOW_ID,
    baseUrl: env.KEEPERHUB_BASE_URL ?? "https://app.keeperhub.com",
    mode: "workflow"
  });
}

async function canonicalProof(request: Request, env: Env) {
  const assetUrl = new URL("/live-proof.json", request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: "GET" }));
  if (!response.ok) throw new Error(`canonical evidence unavailable (${response.status})`);
  return (await response.json()) as any;
}

function materializeCanonicalRecord(proof: any) {
  const receipt = proof.settlement.receipt;
  const taskId = proof.contribution.taskId;
  const pullRequestId = proof.contribution.pullRequestId;
  const acceptedWorkId = proof.contribution.acceptedWorkId;
  const recipient = receipt.recipients[0];

  const contribution: Contribution = {
    source: "github",
    repository: proof.repository,
    taskId,
    issueId: taskId,
    pullRequestId,
    contributor: "Faadil1",
    recipientWallet: recipient.wallet,
    recipients: receipt.recipients,
    token: receipt.asset,
    chainId: 84532,
    amount: receipt.amount
  };

  const acceptance: AcceptanceEvidence = {
    source: "github",
    eventId: receipt.acceptanceEvidence.eventId,
    eventTime: receipt.acceptanceEvidence.eventTime,
    action: "workflow_run.completed",
    acceptanceKind: receipt.acceptanceEvidence.acceptanceKind,
    accepted: true,
    acceptedWorkId,
    repository: proof.repository,
    issueId: taskId,
    pullRequestId,
    merged: false,
    mergeSha: receipt.acceptanceEvidence.mergeSha,
    requiredChecksPassed: true,
    requiredReviewApproved: true,
    headSha: proof.commitSha,
    sender: "Faadil1",
    signatureVerified: true,
    rawFingerprint: `canonical-${proof.commitSha}`
  };

  const computedClaimId = claimIdFor(contribution, acceptance, policy);
  if (computedClaimId !== proof.tenderClaim.claimId) throw new Error(`canonical claim mismatch: computed ${computedClaimId}`);

  const record: SettlementRecord = {
    claim: {
      claimId: proof.tenderClaim.claimId,
      settlementId: proof.tenderClaim.claimId,
      idempotencyKey: idempotencyKeyFor(proof.tenderClaim.claimId),
      contribution,
      acceptance,
      policyVersion: policy.version,
      status: "SETTLED",
      createdAt: receipt.settledAt
    },
    keeperHubExecutionId: proof.keeperHub.executionId,
    transactionHash: proof.settlement.transactionHash,
    receipt,
    status: "SETTLED",
    attempts: [{ attempt: 1, executionId: proof.keeperHub.executionId, status: "success", startedAt: receipt.settledAt, completedAt: receipt.settledAt, transactionHash: proof.settlement.transactionHash }],
    replayCount: 0,
    duplicatePayoutsPrevented: 0,
    timeline: [
      { at: receipt.acceptanceEvidence.eventTime, type: "ACCEPTED", label: "Canonical accepted work", detail: acceptedWorkId },
      { at: receipt.settledAt, type: "SETTLED", label: "Canonical Tender Receipt", detail: receipt.receiptId }
    ],
    updatedAt: receipt.settledAt
  };

  return { contribution, acceptance, record };
}

async function replayCanonicalClaim(request: Request, env: Env) {
  const proof = await canonicalProof(request, env);
  const { contribution, acceptance, record } = materializeCanonicalRecord(proof);
  const repo = new MemorySettlementRepository();
  await repo.put(structuredClone(record));
  const engine = new SettlementEngine(repo, noBroadcastExecutor, policy);
  const replay = await engine.handleAcceptance(contribution, { ...acceptance, eventId: `judge-replay-${crypto.randomUUID()}`, eventTime: new Date().toISOString(), action: "replayed", rawFingerprint: `judge-replay-${crypto.randomUUID()}` });
  if (replay.status !== "ALREADY_SETTLED" || replay.claim.claimId !== proof.tenderClaim.claimId || replay.attempts.length !== record.attempts.length) {
    throw new Error("runtime replay invariant failed");
  }
  return { runtime: "cloudflare-worker", engine: "Tender SettlementEngine", evaluatedAt: new Date().toISOString(), status: replay.status, claimId: replay.claim.claimId, sameClaim: true, additionalKeeperHubExecutions: 0, additionalMovement: "$0", broadcastAttempted: false, keeperHubExecutionId: replay.keeperHubExecutionId, transactionHash: replay.transactionHash, duplicatePayoutsPrevented: replay.duplicatePayoutsPrevented };
}

async function verifyCandidate(request: Request, env: Env) {
  const proof = await canonicalProof(request, env);
  const { contribution, acceptance } = materializeCanonicalRecord(proof);
  const body = await readJson<EconomicOverride>(request);
  return { runtime: "cloudflare-worker", evaluatedAt: new Date().toISOString(), ...verifyEconomicIdentity(contribution, acceptance, policy, body) };
}

function amountToBaseUnits(value: string, decimals = 6) {
  const normalized = normalizeDecimalString(value);
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error("invalid canonical amount");
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) throw new Error("canonical amount exceeds token precision");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt((fraction.padEnd(decimals, "0") || "0"));
}

async function independentChainProof(request: Request, env: Env) {
  const proof = await canonicalProof(request, env);
  const receipt = proof.settlement.receipt;
  const txHash = proof.settlement.transactionHash as string;
  const recipient = receipt.recipients[0].wallet.toLowerCase() as string;
  const expectedAmount = amountToBaseUnits(receipt.amount);
  const recipientTopic = `0x${recipient.replace(/^0x/, "").padStart(64, "0")}`;
  const rpcResponse = await fetch(BASE_SEPOLIA_RPC, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getTransactionReceipt", params: [txHash] }) });
  if (!rpcResponse.ok) throw new Error(`independent Base RPC unavailable (${rpcResponse.status})`);
  const chainReceipt = ((await rpcResponse.json()) as any).result;
  if (!chainReceipt) throw new Error("canonical transaction not found on independent Base RPC");
  const transferLog = (chainReceipt.logs ?? []).find((log: any) => {
    const addressMatches = String(log.address ?? "").toLowerCase() === BASE_SEPOLIA_USDC;
    const transferMatches = String(log.topics?.[0] ?? "").toLowerCase() === ERC20_TRANSFER_TOPIC;
    const recipientMatches = String(log.topics?.[2] ?? "").toLowerCase() === recipientTopic.toLowerCase();
    let amountMatches = false;
    try { amountMatches = BigInt(log.data ?? "0x0") === expectedAmount; } catch { amountMatches = false; }
    return addressMatches && transferMatches && recipientMatches && amountMatches;
  });
  if (chainReceipt.status !== "0x1" || !transferLog) throw new Error("independent chain verification did not match the canonical Tender Receipt");
  return { verified: true, verifier: "independent Base Sepolia JSON-RPC", evaluatedAt: new Date().toISOString(), transactionHash: txHash, transactionStatus: "success", usdcContract: BASE_SEPOLIA_USDC, recipient, amount: receipt.amount, amountBaseUnits: expectedAmount.toString(), transferEventMatched: true, blockNumber: BigInt(chainReceipt.blockNumber).toString(), keeperHubWasTrustedForThisCheck: false };
}

async function handleOperator(request: Request, env: Env, pathname: string) {
  const auth = await requireOperator(request, env);
  if (!auth.ok) return auth.response;
  const service = auth.service;
  const segments = pathname.split("/").filter(Boolean);

  if (request.method === "POST" && pathname === "/api/operator/policies") {
    return json(await service.createPolicy(await readJson<any>(request)), 201);
  }
  if (request.method === "POST" && segments[2] === "policies" && segments[4] === "lock") {
    return json(await service.lockPolicy(decodeURIComponent(segments[3])));
  }
  if (request.method === "POST" && pathname === "/api/operator/acceptances") {
    return json(await service.ingestAcceptance(await readJson<AcceptanceEvidence>(request)), 201);
  }
  if (request.method === "POST" && pathname === "/api/operator/obligations") {
    const body = await readJson<{ contribution: Contribution; acceptance: AcceptanceEvidence; policyVersion: string }>(request);
    return json(await service.createObligation(body.contribution, body.acceptance, body.policyVersion), 201);
  }
  if (request.method === "GET" && segments[2] === "obligations" && segments[4] === "status") {
    return json(await service.status(decodeURIComponent(segments[3])));
  }
  if (request.method === "POST" && segments[2] === "claims" && segments[4] === "authorize") {
    const body = await readJson<Omit<Parameters<TenderOperatorService["authorizeClaim"]>[0], "candidateClaimId">>(request);
    return json(await service.authorizeClaim({ ...body, candidateClaimId: decodeURIComponent(segments[3]) }), 201);
  }
  if (request.method === "POST" && segments[2] === "claims" && segments[4] === "settle") {
    return json(await service.settleClaim(decodeURIComponent(segments[3]), operatorExecutor(env, auth.store)));
  }
  if (request.method === "POST" && segments[2] === "claims" && segments[4] === "reconcile") {
    return json(await service.reconcileClaim(decodeURIComponent(segments[3]), operatorExecutor(env, auth.store)));
  }
  if (request.method === "POST" && segments[2] === "claims" && segments[4] === "supersede") {
    const body = await readJson<{ supersededByClaimId: string; reason: string }>(request);
    return json(await service.supersedeUnsettledClaim(decodeURIComponent(segments[3]), body.supersededByClaimId, body.reason));
  }
  if (request.method === "POST" && segments[2] === "claims" && segments[4] === "corrections") {
    const body = await readJson<{ contribution: Contribution; acceptance: AcceptanceEvidence; policyVersion: string; authorizedBy: string; reason: string }>(request);
    return json(await service.createCorrectiveClaim({ linkedClaimId: decodeURIComponent(segments[3]), ...body }), 201);
  }
  return json({ error: "operator_endpoint_not_found" }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/operator/")) return handleOperator(request, env, url.pathname);
      if (request.method === "GET" && url.pathname === "/api/runtime") {
        const proof = await canonicalProof(request, env);
        return json({ runtime: "cloudflare-worker", mode: "judge-safe-dynamic", serverTime: new Date().toISOString(), claimId: proof.tenderClaim.claimId, canonicalSettlement: proof.settlement.status, valueMovingExecutionEnabled: false, operatorRuntimeConfigured: Boolean(env.TENDER_OPERATOR_TOKEN && env.TENDER_OPERATOR_STORE), replayEngineEnabled: true, economicIdentityVerifierEnabled: true, independentChainVerificationEnabled: true });
      }
      if (request.method === "GET" && url.pathname === "/api/proof") return json(await canonicalProof(request, env));
      if (request.method === "GET" && url.pathname === "/api/acceptance-packet") {
        const proof = await canonicalProof(request, env);
        return json({ acceptedWorkId: proof.contribution.acceptedWorkId, acceptanceEvidence: proof.settlement.receipt.acceptanceEvidence, settlementPolicy: policy, claimId: proof.tenderClaim.claimId, principle: "policy precedes acceptance; accepted work plus policy creates one economic obligation" });
      }
      if (request.method === "GET" && url.pathname === "/api/chain-proof") return json(await independentChainProof(request, env));
      if (request.method === "POST" && url.pathname === "/api/replay") return json(await replayCanonicalClaim(request, env));
      if (request.method === "POST" && url.pathname === "/api/claim/verify") return json(await verifyCandidate(request, env));
      if (url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
      return env.ASSETS.fetch(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown runtime error";
      return json({ error: "runtime_failure", message }, 500);
    }
  }
};

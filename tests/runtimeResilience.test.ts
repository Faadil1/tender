import test from "node:test";
import assert from "node:assert/strict";
import { isOperatorRuntimeConfigured, rpcCandidates, verifyCanonicalTransfer } from "../src/cloudflare/runtime.js";

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const USDC = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
const RECIPIENT = "0x2ca7ba27ab8686F3a073c053FaD6258C003a02bb";
const TX = "0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db";

function proof() {
  return {
    settlement: {
      transactionHash: TX,
      receipt: {
        amount: "0.01",
        recipients: [{ wallet: RECIPIENT, amount: "0.01", role: "primary" }]
      }
    }
  };
}

function chainReceipt(data = "0x2710") {
  const recipientTopic = `0x${RECIPIENT.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`;
  return {
    transactionHash: TX,
    status: "0x1",
    blockNumber: "0x10",
    logs: [{
      address: USDC,
      topics: [TRANSFER_TOPIC, `0x${"1".padStart(64, "0")}`, recipientTopic],
      data
    }]
  };
}

test("runtime configuration recognizes Durable Object operator authority", () => {
  assert.equal(isOperatorRuntimeConfigured({ ASSETS: {} as any, TENDER_OPERATOR_TOKEN: "secret" }), false);
  assert.equal(isOperatorRuntimeConfigured({ ASSETS: {} as any, TENDER_OPERATOR_TOKEN: "secret", TENDER_OPERATOR_DO: {} }), true);
  assert.equal(isOperatorRuntimeConfigured({ ASSETS: {} as any, TENDER_OPERATOR_TOKEN: "secret", TENDER_OPERATOR_STORE: {} }), true);
});

test("Base Sepolia RPC candidates prefer configured provider and retain public fallback", () => {
  const candidates = rpcCandidates({ ASSETS: {} as any, BASE_SEPOLIA_RPC_URL: "https://rpc.example.test" });
  assert.equal(candidates[0], "https://rpc.example.test");
  assert.ok(candidates.includes("https://sepolia.base.org"));
  assert.ok(candidates.includes("https://base-sepolia-rpc.publicnode.com"));
});

test("independent transfer verification matches canonical USDC recipient and amount", () => {
  const result = verifyCanonicalTransfer(proof(), chainReceipt());
  assert.equal(result.verified, true);
  assert.equal(result.amountBaseUnits, "10000");
  assert.equal(result.recipient, RECIPIENT.toLowerCase());
  assert.equal(result.keeperHubWasTrustedForThisCheck, false);
});

test("independent transfer verification fails closed on altered amount", () => {
  assert.throws(
    () => verifyCanonicalTransfer(proof(), chainReceipt("0x2711")),
    /did not match the canonical Tender Receipt/
  );
});

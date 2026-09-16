import test from "node:test";
import assert from "node:assert/strict";
import { idempotencyKeyFor, settlementIdFor } from "../src/domain/identity.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

const policy = { version: "policy.test.v1", token: "USDC", chainId: 84532, maxAmount: "5", requireReview: false };

test("settlement identity ignores webhook delivery id and preserves economic identity", () => {
  const a = settlementIdFor(demoContribution, demoAcceptance({ eventId: "delivery-1" }), policy);
  const b = settlementIdFor(demoContribution, demoAcceptance({ eventId: "delivery-2" }), policy);
  assert.equal(a, b);
  assert.equal(idempotencyKeyFor(a), `tender:claim:${a}`);
});

test("settlement identity changes when recipient changes", () => {
  const a = settlementIdFor(demoContribution, demoAcceptance(), policy);
  const changed = {
    ...demoContribution,
    recipientWallet: "0x2222222222222222222222222222222222222222",
    recipients: [{ wallet: "0x2222222222222222222222222222222222222222", amount: "1.00", role: "primary" as const }]
  };
  const b = settlementIdFor(changed, demoAcceptance(), policy);
  assert.notEqual(a, b);
});

test("settlement identity changes when policy version changes", () => {
  const a = settlementIdFor(demoContribution, demoAcceptance(), policy);
  const b = settlementIdFor(demoContribution, demoAcceptance(), { ...policy, version: "policy.test.v2" });
  assert.notEqual(a, b);
});

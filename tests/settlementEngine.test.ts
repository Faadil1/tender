import test from "node:test";
import assert from "node:assert/strict";
import { MemorySettlementRepository } from "../src/adapters/memoryRepository.js";
import { SettlementEngine } from "../src/domain/settlementEngine.js";
import type { SettlementClaim, SettlementExecutor, SettlementRecord } from "../src/domain/types.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

class FakeExecutor implements SettlementExecutor {
  calls = 0;
  fail = false;
  async preflight() {
    return { ok: true as const };
  }
  async execute(claim: SettlementClaim) {
    this.calls += 1;
    if (this.fail) return { executionId: "kh_fail", status: "failed" as const, error: "temporary outage" };
    return { executionId: `kh_${this.calls}`, status: "success" as const, transactionHash: `0x${claim.settlementId.slice(-8).padStart(64, "0")}` };
  }
  async reconcile(record: SettlementRecord) {
    record.status = "SETTLED";
    record.transactionHash = "0xreconciled";
    return record;
  }
}

function engine(executor = new FakeExecutor()) {
  return {
    executor,
    engine: new SettlementEngine(new MemorySettlementRepository(), executor, {
      token: "USDC",
      chainId: 84532,
      maxAmount: "5",
      requireReview: false
    })
  };
}

test("deterministic claim settles accepted contribution once", async () => {
  const { engine: tender, executor } = engine();
  const first = await tender.handleAcceptance(demoContribution, demoAcceptance());
  const firstStatus = first.status;
  const replay = await tender.handleAcceptance(demoContribution, demoAcceptance({ eventId: "duplicate" }));

  assert.equal(firstStatus, "SETTLED");
  assert.equal(replay.status, "ALREADY_SETTLED");
  assert.equal(first.claim.settlementId, replay.claim.settlementId);
  assert.equal(executor.calls, 1);
});

test("PR closed without merge is not owed", async () => {
  const { engine: tender, executor } = engine();
  const record = await tender.handleAcceptance(demoContribution, demoAcceptance({ merged: false, mergeSha: undefined }));
  assert.equal(record.status, "NOT_YET_OWED");
  assert.equal(executor.calls, 0);
});

test("failing required checks blocks settlement", async () => {
  const { engine: tender, executor } = engine();
  const record = await tender.handleAcceptance(demoContribution, demoAcceptance({ requiredChecksPassed: false }));
  assert.equal(record.status, "ACCEPTANCE_INCOMPLETE");
  assert.equal(executor.calls, 0);
});

test("invalid recipient wallet blocks before execution", async () => {
  const { engine: tender, executor } = engine();
  const record = await tender.handleAcceptance({ ...demoContribution, recipientWallet: "bad" }, demoAcceptance());
  assert.equal(record.status, "BLOCKED");
  assert.equal(executor.calls, 0);
});

test("temporary KeeperHub failure is retryable under same settlement identity", async () => {
  const fake = new FakeExecutor();
  fake.fail = true;
  const { engine: tender } = engine(fake);
  const failed = await tender.handleAcceptance(demoContribution, demoAcceptance());
  assert.equal(failed.status, "RETRYABLE_FAILURE");
  assert.equal(fake.calls, 1);
  assert.equal(failed.claim.idempotencyKey, `tender:settlement:${failed.claim.settlementId}`);
});

test("forged webhook evidence is quarantined", async () => {
  const { engine: tender, executor } = engine();
  const record = await tender.handleAcceptance(demoContribution, demoAcceptance({ signatureVerified: false }));
  assert.equal(record.status, "QUARANTINED");
  assert.equal(executor.calls, 0);
});

test("reconciliation can recover completed payment after interrupted callback", async () => {
  const { engine: tender } = engine();
  const settled = await tender.handleAcceptance(demoContribution, demoAcceptance());
  settled.status = "SETTLING";
  settled.transactionHash = undefined;
  const recovered = await tender.reconcile(settled.claim.settlementId);
  assert.equal(recovered?.status, "SETTLED");
  assert.equal(recovered?.transactionHash, "0xreconciled");
});

import test from "node:test";
import assert from "node:assert/strict";
import { MemorySettlementRepository } from "../src/adapters/memoryRepository.js";
import { claimIdFor } from "../src/domain/identity.js";
import { MemoryOperatorStore, StoreBackedAuthorizationVerifier } from "../src/domain/operatorRuntime.js";
import { SettlementEngine } from "../src/domain/settlementEngine.js";
import type { EconomicAuthorization, SettlementClaim, SettlementExecutor, SettlementPolicy, SettlementRecord } from "../src/domain/types.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

class FakeExecutor implements SettlementExecutor {
  calls = 0;
  reconcileCalls = 0;
  fail = false;
  running = false;
  async preflight() { return { ok: true as const }; }
  async execute(claim: SettlementClaim) {
    this.calls += 1;
    if (this.fail) return { executionId: "kh_fail", status: "failed" as const, error: "temporary outage" };
    if (this.running) return { executionId: "kh_running", status: "running" as const };
    return { executionId: `kh_${this.calls}`, status: "success" as const, transactionHash: `0x${claim.settlementId.slice(-8).padStart(64, "0")}` };
  }
  async reconcile(record: SettlementRecord) { this.reconcileCalls += 1; record.status = "SETTLED"; record.transactionHash = "0xreconciled"; return record; }
}

const testPolicy: SettlementPolicy = { version: "policy.test.v1", token: "USDC", chainId: 84532, maxAmount: "5", requireReview: false };

function engine(executor = new FakeExecutor(), authorizationVerifier?: StoreBackedAuthorizationVerifier) {
  return { executor, engine: new SettlementEngine(new MemorySettlementRepository(), executor, testPolicy, authorizationVerifier) };
}

async function authorizedCorrection(
  linkedClaimId: string,
  contribution = { ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] }
) {
  const store = new MemoryOperatorStore();
  const acceptance = demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" });
  const authorizedClaimId = claimIdFor(contribution, acceptance, testPolicy);
  const authorization: EconomicAuthorization = {
    authorizationId: "auth-correct-1",
    kind: "corrective_claim",
    authorizedClaimId,
    authorizedBy: "maintainer",
    authorizedAt: new Date().toISOString(),
    linkedClaimId,
    reason: "accepted additional contributor scope"
  };
  await store.put(`authorization:${authorization.authorizationId}`, authorization);
  return { contribution: { ...contribution, economicAuthorization: authorization }, acceptance, verifier: new StoreBackedAuthorizationVerifier(store), store, authorization };
}

test("deterministic claim settles accepted contribution once", async () => {
  const { engine: tender, executor } = engine();
  const first = await tender.handleAcceptance(demoContribution, demoAcceptance());
  const firstStatus = first.status;
  const replay = await tender.handleAcceptance(demoContribution, demoAcceptance({ eventId: "duplicate" }));
  assert.equal(firstStatus, "SETTLED");
  assert.equal(replay.status, "ALREADY_SETTLED");
  assert.equal(first.claim.claimId, replay.claim.claimId);
  assert.equal(replay.duplicatePayoutsPrevented, 1);
  assert.equal(executor.calls, 1);
  assert.ok(first.receipt);
});

test("PR closed without acceptance is not accepted", async () => {
  const { engine: tender, executor } = engine();
  const record = await tender.handleAcceptance(demoContribution, demoAcceptance({ accepted: false, merged: false, acceptedWorkId: undefined, mergeSha: undefined }));
  assert.equal(record.status, "NOT_ACCEPTED");
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
  const fake = new FakeExecutor(); fake.fail = true;
  const { engine: tender } = engine(fake);
  const failed = await tender.handleAcceptance(demoContribution, demoAcceptance());
  assert.equal(failed.status, "RETRYABLE_FAILURE");
  assert.equal(fake.calls, 1);
  assert.equal(failed.claim.idempotencyKey, `tender:claim:${failed.claim.claimId}`);
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
  settled.status = "SETTLING"; settled.transactionHash = undefined;
  const recovered = await tender.reconcile(settled.claim.settlementId);
  assert.equal(recovered?.status, "SETTLED");
  assert.equal(recovered?.transactionHash, "0xreconciled");
  assert.ok(recovered?.receipt);
});

test("two concurrent workers converge on one claim and one execution", async () => {
  const { engine: tender, executor } = engine();
  const [first, second] = await Promise.all([tender.handleAcceptance(demoContribution, demoAcceptance({ eventId: "worker-a" })), tender.handleAcceptance(demoContribution, demoAcceptance({ eventId: "worker-b" }))]);
  assert.equal(first.claim.claimId, second.claim.claimId);
  assert.equal(executor.calls, 1);
  assert.equal(second.status, "ALREADY_SETTLED");
});

test("altered economics on already settled accepted work require new acceptance and do not execute", async () => {
  const { engine: tender, executor } = engine();
  const first = await tender.handleAcceptance(demoContribution, demoAcceptance());
  const altered = await tender.handleAcceptance({ ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] }, demoAcceptance());
  assert.notEqual(first.claim.claimId, altered.claim.claimId);
  assert.equal(altered.status, "REQUIRES_ACCEPTANCE");
  assert.equal(altered.claim.linkedClaimId, first.claim.claimId);
  assert.equal(executor.calls, 1);
});

test("authorized corrective claim creates a linked new obligation without rewriting original receipt", async () => {
  const repo = new MemorySettlementRepository();
  const executor = new FakeExecutor();
  const firstTender = new SettlementEngine(repo, executor, testPolicy);
  const first = await firstTender.handleAcceptance(demoContribution, demoAcceptance());
  const authorized = await authorizedCorrection(first.claim.claimId);
  const tender = new SettlementEngine(repo, executor, testPolicy, authorized.verifier);
  const corrective = await tender.handleAcceptance(authorized.contribution, authorized.acceptance);
  assert.equal(corrective.status, "SETTLED");
  assert.equal(corrective.claim.linkedClaimId, first.claim.claimId);
  assert.equal(first.status, "SETTLED");
  assert.equal(executor.calls, 2);
});

test("forged corrective authorization is rejected before KeeperHub execution", async () => {
  const { engine: tender, executor } = engine();
  const first = await tender.handleAcceptance(demoContribution, demoAcceptance());
  const contribution = { ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] };
  const acceptance = demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" });
  const forged = await tender.handleAcceptance({
    ...contribution,
    economicAuthorization: {
      authorizationId: "forged-auth",
      kind: "corrective_claim",
      authorizedClaimId: claimIdFor(contribution, acceptance, testPolicy),
      authorizedBy: "attacker",
      authorizedAt: new Date().toISOString(),
      linkedClaimId: first.claim.claimId,
      reason: "not stored by operator"
    }
  }, acceptance);
  assert.equal(forged.status, "REQUIRES_ACCEPTANCE");
  assert.equal(executor.calls, 1);
});

test("authorization linked to the wrong settled claim is rejected", async () => {
  const repo = new MemorySettlementRepository();
  const executor = new FakeExecutor();
  const firstTender = new SettlementEngine(repo, executor, testPolicy);
  const first = await firstTender.handleAcceptance(demoContribution, demoAcceptance());
  const authorized = await authorizedCorrection("tclaim_wrong_linked_claim");
  const tender = new SettlementEngine(repo, executor, testPolicy, authorized.verifier);
  const rejected = await tender.handleAcceptance(authorized.contribution, authorized.acceptance);
  assert.equal(rejected.status, "REQUIRES_ACCEPTANCE");
  assert.equal(rejected.claim.linkedClaimId, first.claim.claimId);
  assert.equal(executor.calls, 1);
});

test("authorization bound to a different candidate claim is rejected", async () => {
  const repo = new MemorySettlementRepository();
  const executor = new FakeExecutor();
  const firstTender = new SettlementEngine(repo, executor, testPolicy);
  const first = await firstTender.handleAcceptance(demoContribution, demoAcceptance());
  const contribution = { ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] };
  const acceptance = demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" });
  const store = new MemoryOperatorStore();
  const authorization: EconomicAuthorization = {
    authorizationId: "auth-wrong-candidate",
    kind: "corrective_claim",
    authorizedClaimId: "tclaim_some_other_candidate",
    authorizedBy: "maintainer",
    authorizedAt: new Date().toISOString(),
    linkedClaimId: first.claim.claimId,
    reason: "bound to a different correction"
  };
  await store.put(`authorization:${authorization.authorizationId}`, authorization);
  const tender = new SettlementEngine(repo, executor, testPolicy, new StoreBackedAuthorizationVerifier(store));
  const rejected = await tender.handleAcceptance({ ...contribution, economicAuthorization: authorization }, acceptance);
  assert.equal(rejected.status, "REQUIRES_ACCEPTANCE");
  assert.equal(executor.calls, 1);
});

test("consumed authorization cannot be replayed for a second candidate claim", async () => {
  const repo = new MemorySettlementRepository();
  const executor = new FakeExecutor();
  const firstTender = new SettlementEngine(repo, executor, testPolicy);
  const first = await firstTender.handleAcceptance(demoContribution, demoAcceptance());
  const authorized = await authorizedCorrection(first.claim.claimId);
  const tender = new SettlementEngine(repo, executor, testPolicy, authorized.verifier);
  const corrective = await tender.handleAcceptance(authorized.contribution, authorized.acceptance);
  assert.equal(corrective.status, "SETTLED");

  const changedAgain = {
    ...demoContribution,
    amount: "1.50",
    recipients: [{ ...demoContribution.recipients[0], amount: "1.50" }],
    economicAuthorization: { ...authorized.authorization, authorizedClaimId: claimIdFor({ ...demoContribution, amount: "1.50", recipients: [{ ...demoContribution.recipients[0], amount: "1.50" }] }, authorized.acceptance, testPolicy) }
  };
  const rejected = await tender.handleAcceptance(changedAgain, authorized.acceptance);
  assert.equal(rejected.status, "REQUIRES_ACCEPTANCE");
  assert.equal(executor.calls, 2);
});

test("in-flight KeeperHub execution is reconciled without rebroadcast", async () => {
  const fake = new FakeExecutor(); fake.running = true;
  const { engine: tender } = engine(fake);
  const first = await tender.handleAcceptance(demoContribution, demoAcceptance({ eventId: "first-run" }));
  const firstStatus = first.status;
  const recovered = await tender.handleAcceptance(demoContribution, demoAcceptance({ eventId: "replay-while-settling" }));
  assert.equal(firstStatus, "SETTLING");
  assert.equal(recovered.status, "SETTLED");
  assert.equal(recovered.transactionHash, "0xreconciled");
  assert.equal(fake.calls, 1);
  assert.equal(fake.reconcileCalls, 1);
  assert.ok(recovered.receipt);
});

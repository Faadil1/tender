import test from "node:test";
import assert from "node:assert/strict";
import { TenderOperatorService, MemoryOperatorStore } from "../src/domain/operatorRuntime.js";
import type { SettlementClaim, SettlementExecutor, SettlementRecord } from "../src/domain/types.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

class OperatorExecutor implements SettlementExecutor {
  calls = 0;
  mode: "success" | "running" | "failed" = "success";
  async preflight() { return { ok: true as const }; }
  async execute(claim: SettlementClaim) {
    this.calls += 1;
    if (this.mode === "failed") return { executionId: `operator_fail_${this.calls}`, status: "failed" as const, error: "temporary_failure" };
    if (this.mode === "running") return { executionId: `operator_running_${this.calls}`, status: "running" as const };
    return {
      executionId: `operator_kh_${this.calls}`,
      status: "success" as const,
      transactionHash: `0x${claim.claimId.replace("tclaim_", "").padEnd(64, "0").slice(0, 64)}`
    };
  }
  async reconcile(record: SettlementRecord) {
    record.status = "SETTLED";
    record.claim.status = "SETTLED";
    record.transactionHash ??= "0xoperator_reconciled";
    return record;
  }
}

const policyInput = {
  version: "policy.operator.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: "5",
  requireReview: false,
  policyDigest: "sha256:operator-policy-v1",
  createdBy: "operator"
};

test("operator-created policies require a policy digest", async () => {
  const operator = new TenderOperatorService(new MemoryOperatorStore());
  await assert.rejects(
    operator.createPolicy({ ...policyInput, policyDigest: "" }),
    /policyDigest_required/
  );
});

test("locked policy versions cannot be overwritten and draft policies cannot create obligations", async () => {
  const operator = new TenderOperatorService(new MemoryOperatorStore());
  const policy = await operator.createPolicy(policyInput);
  await assert.rejects(
    operator.createObligation(demoContribution, demoAcceptance(), policy.version),
    /policy_must_be_locked_before_obligation/
  );
  await operator.lockPolicy(policy.version);
  await assert.rejects(
    operator.createPolicy({ ...policyInput, policyDigest: "sha256:replacement" }),
    /locked_policy_cannot_be_overwritten/
  );
});

test("policy must be locked before the acceptance event", async () => {
  const operator = new TenderOperatorService(new MemoryOperatorStore());
  const policy = await operator.createPolicy({ ...policyInput, version: "policy.operator.precommit" });
  const acceptanceBeforeLock = demoAcceptance({ eventTime: "2020-01-01T00:00:00.000Z" });
  await operator.lockPolicy(policy.version);
  await assert.rejects(
    operator.createObligation(demoContribution, acceptanceBeforeLock, policy.version),
    /policy_not_precommitted_before_acceptance/
  );
});

test("operator runtime creates policy, locks it, ingests acceptance, creates obligation, and settles", async () => {
  const store = new MemoryOperatorStore();
  const operator = new TenderOperatorService(store);
  const policy = await operator.createPolicy(policyInput);
  const locked = await operator.lockPolicy(policy.version);
  const acceptance = await operator.ingestAcceptance(demoAcceptance());
  const obligation = await operator.createObligation(demoContribution, acceptance, locked.version);
  const executor = new OperatorExecutor();
  const record = await operator.settleClaim(obligation.claimId, executor);

  assert.equal(locked.status, "LOCKED");
  assert.equal(record.status, "SETTLED");
  assert.equal(record.claim.claimId, obligation.claimId);
  assert.equal(executor.calls, 1);
  assert.equal((await operator.status(obligation.claimId)).settlement?.status, "SETTLED");
});

test("operator authorization is bound to the exact corrective candidate and consumed once", async () => {
  const store = new MemoryOperatorStore();
  const operator = new TenderOperatorService(store);
  await operator.createPolicy(policyInput);
  await operator.lockPolicy(policyInput.version);

  const executor = new OperatorExecutor();
  const original = await operator.createObligation(demoContribution, demoAcceptance(), policyInput.version);
  const settled = await operator.settleClaim(original.claimId, executor);
  assert.equal(settled.status, "SETTLED");

  const correction = await operator.createCorrectiveClaim({
    linkedClaimId: settled.claim.claimId,
    contribution: { ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] },
    acceptance: demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" }),
    policyVersion: policyInput.version,
    authorizedBy: "maintainer",
    reason: "accepted additional scope"
  });
  const correctiveRecord = await operator.settleClaim(correction.obligation.claimId, executor);
  assert.equal(correctiveRecord.status, "SETTLED");
  assert.equal(correctiveRecord.claim.linkedClaimId, settled.claim.claimId);

  const reuse = await operator.createObligation(
    { ...demoContribution, amount: "1.50", recipients: [{ ...demoContribution.recipients[0], amount: "1.50" }] },
    demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" }),
    policyInput.version
  );
  await store.put(`obligation:${reuse.claimId}`, { ...reuse, authorizationId: correction.authorization.authorizationId, status: "AUTHORIZED" });
  const rejected = await operator.settleClaim(reuse.claimId, executor);
  assert.equal(rejected.status, "REQUIRES_ACCEPTANCE");
  assert.equal(executor.calls, 2);
});

test("operator supersedes an unsettled claim without mutating settled receipts", async () => {
  const operator = new TenderOperatorService(new MemoryOperatorStore());
  await operator.createPolicy(policyInput);
  await operator.lockPolicy(policyInput.version);
  const oldObligation = await operator.createObligation(demoContribution, demoAcceptance(), policyInput.version);
  const replacement = await operator.createObligation(
    { ...demoContribution, amount: "1.10", recipients: [{ ...demoContribution.recipients[0], amount: "1.10" }] },
    demoAcceptance({ acceptedWorkId: "accepted-replacement", mergeSha: "accepted-replacement" }),
    policyInput.version
  );
  const superseded = await operator.supersedeUnsettledClaim(oldObligation.claimId, replacement.claimId, "recipient/amount corrected before settlement");
  assert.equal(superseded.status, "SUPERSEDED");
  assert.equal(superseded.supersededByClaimId, replacement.claimId);
});

test("operator reconciliation routes through Tender receipt finalization without rebroadcast", async () => {
  const operator = new TenderOperatorService(new MemoryOperatorStore());
  await operator.createPolicy({ ...policyInput, version: "policy.operator.reconcile" });
  await operator.lockPolicy("policy.operator.reconcile");
  const obligation = await operator.createObligation(demoContribution, demoAcceptance(), "policy.operator.reconcile");
  const executor = new OperatorExecutor();
  executor.mode = "running";
  const settling = await operator.settleClaim(obligation.claimId, executor);
  assert.equal(settling.status, "SETTLING");
  assert.equal(executor.calls, 1);

  const reconciled = await operator.reconcileClaim(obligation.claimId, executor);
  assert.equal(reconciled.status, "SETTLED");
  assert.equal(reconciled.transactionHash, "0xoperator_reconciled");
  assert.ok(reconciled.receipt);
  assert.equal(executor.calls, 1);
  assert.equal((await operator.status(obligation.claimId)).obligation?.status, "SETTLED");
});

test("operator projection preserves retryable failure status", async () => {
  const operator = new TenderOperatorService(new MemoryOperatorStore());
  await operator.createPolicy({ ...policyInput, version: "policy.operator.failure" });
  await operator.lockPolicy("policy.operator.failure");
  const obligation = await operator.createObligation(demoContribution, demoAcceptance(), "policy.operator.failure");
  const executor = new OperatorExecutor();
  executor.mode = "failed";
  const failed = await operator.settleClaim(obligation.claimId, executor);
  assert.equal(failed.status, "RETRYABLE_FAILURE");
  assert.equal((await operator.status(obligation.claimId)).obligation?.status, "RETRYABLE_FAILURE");
});

test("strong operator store consumes only one concurrent authorization attempt", async () => {
  const store = new MemoryOperatorStore();
  const operator = new TenderOperatorService(store);
  await operator.createPolicy({ ...policyInput, version: "policy.operator.concurrent" });
  await operator.lockPolicy("policy.operator.concurrent");
  const executor = new OperatorExecutor();
  const original = await operator.createObligation(demoContribution, demoAcceptance(), "policy.operator.concurrent");
  const settled = await operator.settleClaim(original.claimId, executor);
  const correction = await operator.createCorrectiveClaim({
    linkedClaimId: settled.claim.claimId,
    contribution: { ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] },
    acceptance: demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" }),
    policyVersion: "policy.operator.concurrent",
    authorizedBy: "maintainer",
    reason: "accepted concurrent correction"
  });
  const [a, b] = await Promise.all([
    operator.authorizationVerifier().consume(correction.authorization, {
      candidateClaimId: correction.obligation.claimId,
      linkedClaimId: settled.claim.claimId,
      contribution: correction.obligation.contribution,
      acceptance: correction.obligation.acceptance,
      policy: { ...policyInput, version: "policy.operator.concurrent", status: "LOCKED", lockedAt: new Date().toISOString() } as any
    }),
    operator.authorizationVerifier().consume(correction.authorization, {
      candidateClaimId: correction.obligation.claimId,
      linkedClaimId: settled.claim.claimId,
      contribution: correction.obligation.contribution,
      acceptance: correction.obligation.acceptance,
      policy: { ...policyInput, version: "policy.operator.concurrent", status: "LOCKED", lockedAt: new Date().toISOString() } as any
    })
  ]);
  assert.equal([a.ok, b.ok].filter(Boolean).length, 1);
  assert.equal([a, b].filter((result) => !result.ok && result.error === "authorization_already_consumed").length, 1);
});

test("two operator runtime instances cannot both settle the same authorized corrective claim", async () => {
  const store = new MemoryOperatorStore();
  const setupOperator = new TenderOperatorService(store);
  await setupOperator.createPolicy({ ...policyInput, version: "policy.operator.two-runtimes" });
  await setupOperator.lockPolicy("policy.operator.two-runtimes");

  const executor = new OperatorExecutor();
  const original = await setupOperator.createObligation(demoContribution, demoAcceptance(), "policy.operator.two-runtimes");
  const settled = await setupOperator.settleClaim(original.claimId, executor);
  const correction = await setupOperator.createCorrectiveClaim({
    linkedClaimId: settled.claim.claimId,
    contribution: { ...demoContribution, amount: "1.25", recipients: [{ ...demoContribution.recipients[0], amount: "1.25" }] },
    acceptance: demoAcceptance({ acceptanceKind: "operator_correction", action: "operator.accepted" }),
    policyVersion: "policy.operator.two-runtimes",
    authorizedBy: "maintainer",
    reason: "accepted concurrent runtime correction"
  });

  const runtimeA = new TenderOperatorService(store);
  const runtimeB = new TenderOperatorService(store);
  const beforeCorrectionCalls = executor.calls;
  const [a, b] = await Promise.all([
    runtimeA.settleClaim(correction.obligation.claimId, executor),
    runtimeB.settleClaim(correction.obligation.claimId, executor)
  ]);

  const statuses = [a.status, b.status].sort();
  assert.deepEqual(statuses, ["REQUIRES_ACCEPTANCE", "SETTLED"]);
  assert.equal(executor.calls - beforeCorrectionCalls, 1);
  assert.equal((await setupOperator.status(correction.obligation.claimId)).settlement?.status, "SETTLED");
});

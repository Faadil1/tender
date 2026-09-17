import test from "node:test";
import assert from "node:assert/strict";
import { TenderOperatorService, MemoryOperatorStore } from "../src/domain/operatorRuntime.js";
import type { SettlementClaim, SettlementExecutor, SettlementRecord } from "../src/domain/types.js";
import { demoAcceptance, demoContribution } from "../src/server/demoData.js";

class OperatorExecutor implements SettlementExecutor {
  calls = 0;
  async preflight() { return { ok: true as const }; }
  async execute(claim: SettlementClaim) {
    this.calls += 1;
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

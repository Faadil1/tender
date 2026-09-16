import { createHash } from "node:crypto";
import type { Contribution, AcceptanceEvidence, SettlementPolicy } from "./types.js";

export function canonicalTenderClaimPayload(
  contribution: Contribution,
  acceptance: AcceptanceEvidence,
  policy: SettlementPolicy
) {
  const acceptedWorkId = acceptance.acceptedWorkId ?? acceptance.mergeSha;
  if (!acceptedWorkId) {
    throw new Error("accepted contribution identity requires acceptedWorkId or mergeSha");
  }

  return {
    source: contribution.source,
    repository: contribution.repository.toLowerCase(),
    taskId: contribution.taskId,
    pullRequestId: contribution.pullRequestId,
    acceptanceKind: acceptance.acceptanceKind,
    acceptedContribution: acceptedWorkId.toLowerCase(),
    policyVersion: policy.version,
    recipients: contribution.recipients.map((recipient) => ({
      wallet: recipient.wallet.toLowerCase(),
      amount: recipient.amount,
      role: recipient.role
    })),
    token: contribution.token.toUpperCase(),
    chainId: contribution.chainId,
    amount: contribution.amount
  };
}

export function claimIdFor(contribution: Contribution, acceptance: AcceptanceEvidence, policy: SettlementPolicy) {
  const payload = canonicalTenderClaimPayload(contribution, acceptance, policy);
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `tclaim_${digest.slice(0, 32)}`;
}

export function settlementIdFor(contribution: Contribution, acceptance: AcceptanceEvidence, policy: SettlementPolicy) {
  return claimIdFor(contribution, acceptance, policy);
}

export function idempotencyKeyFor(claimId: string) {
  return `tender:claim:${claimId}`;
}

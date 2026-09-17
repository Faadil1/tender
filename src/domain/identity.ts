import { createHash } from "node:crypto";
import type { Contribution, AcceptanceEvidence, SettlementPolicy } from "./types.js";

export function normalizeDecimalString(value: string) {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return trimmed;
  const [wholeRaw, fractionRaw = ""] = trimmed.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  const fraction = fractionRaw.replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function acceptedWorkIdentity(acceptance: AcceptanceEvidence) {
  return acceptance.acceptedWorkId ?? acceptance.mergeSha;
}

export function canonicalTenderClaimPayload(contribution: Contribution, acceptance: AcceptanceEvidence, policy: SettlementPolicy) {
  const acceptedWorkId = acceptedWorkIdentity(acceptance);
  if (!acceptedWorkId) throw new Error("accepted contribution identity requires acceptedWorkId or mergeSha");
  return {
    source: contribution.source,
    repository: contribution.repository.toLowerCase(),
    taskId: contribution.taskId,
    pullRequestId: contribution.pullRequestId,
    acceptanceKind: acceptance.acceptanceKind,
    acceptedContribution: acceptedWorkId.toLowerCase(),
    policyVersion: policy.version,
    policyDigest: policy.policyDigest,
    recipients: contribution.recipients.map((recipient) => ({
      wallet: recipient.wallet.toLowerCase(),
      amount: normalizeDecimalString(recipient.amount),
      role: recipient.role
    })),
    token: contribution.token.toUpperCase(),
    chainId: contribution.chainId,
    amount: normalizeDecimalString(contribution.amount)
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

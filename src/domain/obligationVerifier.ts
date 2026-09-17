import { claimIdFor, normalizeDecimalString } from "./identity.js";
import type { AcceptanceEvidence, Contribution, SettlementPolicy } from "./types.js";

export type EconomicOverride = { amount?: string; recipient?: string; policyVersion?: string; acceptedWorkId?: string };

export function verifyEconomicIdentity(contribution: Contribution, acceptance: AcceptanceEvidence, policy: SettlementPolicy, override: EconomicOverride = {}) {
  const canonicalClaimId = claimIdFor(contribution, acceptance, policy);
  const nextContribution: Contribution = { ...contribution, recipients: contribution.recipients.map((recipient) => ({ ...recipient })) };
  const nextAcceptance: AcceptanceEvidence = { ...acceptance };
  const nextPolicy: SettlementPolicy = { ...policy };
  const changedFields: string[] = [];

  if (override.amount !== undefined) {
    const normalized = normalizeDecimalString(override.amount);
    if (normalized !== normalizeDecimalString(contribution.amount)) changedFields.push("amount");
    nextContribution.amount = normalized;
    nextContribution.recipients = nextContribution.recipients.map((recipient, index) => index === 0 ? { ...recipient, amount: normalized } : recipient);
  }
  if (override.recipient !== undefined) {
    const normalized = override.recipient.trim().toLowerCase();
    if (normalized !== contribution.recipientWallet.toLowerCase()) changedFields.push("recipient");
    nextContribution.recipientWallet = override.recipient.trim();
    nextContribution.recipients = nextContribution.recipients.map((recipient, index) => index === 0 ? { ...recipient, wallet: override.recipient!.trim() } : recipient);
  }
  if (override.policyVersion !== undefined) {
    const normalized = override.policyVersion.trim();
    if (normalized !== policy.version) changedFields.push("policyVersion");
    nextPolicy.version = normalized;
  }
  if (override.acceptedWorkId !== undefined) {
    const normalized = override.acceptedWorkId.trim();
    const canonicalAcceptedWork = acceptance.acceptedWorkId ?? acceptance.mergeSha ?? "";
    if (normalized.toLowerCase() !== canonicalAcceptedWork.toLowerCase()) changedFields.push("acceptedWorkId");
    nextAcceptance.acceptedWorkId = normalized;
    nextAcceptance.mergeSha = normalized;
  }

  const candidateClaimId = claimIdFor(nextContribution, nextAcceptance, nextPolicy);
  const sameClaim = candidateClaimId === canonicalClaimId;
  return {
    canonicalClaimId,
    candidateClaimId,
    sameClaim,
    changedFields,
    status: sameClaim ? "ALREADY_SETTLED" : "NEW_CLAIM_REQUIRES_ACCEPTANCE",
    originalImmutable: true,
    correctiveClaimRequired: !sameClaim,
    broadcastAttempted: false,
    additionalMovement: "$0"
  } as const;
}

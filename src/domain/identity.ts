import { createHash } from "node:crypto";
import type { Contribution, AcceptanceEvidence } from "./types.js";

export function canonicalSettlementPayload(contribution: Contribution, acceptance: AcceptanceEvidence) {
  if (!acceptance.mergeSha) {
    throw new Error("accepted contribution identity requires mergeSha");
  }

  return {
    source: contribution.source,
    repository: contribution.repository.toLowerCase(),
    issueId: contribution.issueId,
    pullRequestId: contribution.pullRequestId,
    acceptedContribution: acceptance.mergeSha.toLowerCase(),
    recipientWallet: contribution.recipientWallet.toLowerCase(),
    token: contribution.token.toUpperCase(),
    chainId: contribution.chainId,
    amount: contribution.amount
  };
}

export function settlementIdFor(contribution: Contribution, acceptance: AcceptanceEvidence) {
  const payload = canonicalSettlementPayload(contribution, acceptance);
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `tender_${digest.slice(0, 32)}`;
}

export function idempotencyKeyFor(settlementId: string) {
  return `tender:settlement:${settlementId}`;
}

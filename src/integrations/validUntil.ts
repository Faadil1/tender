import { claimIdFor, idempotencyKeyFor } from "../domain/identity.js";
import type { AcceptanceEvidence, Contribution, SettlementPolicy } from "../domain/types.js";

export const VALID_UNTIL = {
  name: "Valid Until",
  repository: "Faadil1/valid-until-agent-os",
  productionUrl: "https://valid-until-agent-os.pages.dev",
  acceptedWorkId: "aeec4ed165eb0917688a885b960175d58f729692",
  acceptedWorkUrl: "https://github.com/Faadil1/valid-until-agent-os/commit/aeec4ed165eb0917688a885b960175d58f729692",
  acceptedWorkSummary: "Bind exact action into execution validity contract",
} as const;

export function validUntilAcceptance(input: {
  recipientWallet: string;
  amount: string;
  actor?: string;
  eventId?: string;
  eventTime?: string;
}) {
  const actor = input.actor ?? "Faadil1";
  const eventTime = input.eventTime ?? new Date().toISOString();
  const eventId = input.eventId ?? `valid-until-maintainer-${VALID_UNTIL.acceptedWorkId.slice(0, 12)}`;

  const contribution: Contribution = {
    source: "github",
    repository: VALID_UNTIL.repository,
    taskId: `valid-until-exact-action-${VALID_UNTIL.acceptedWorkId.slice(0, 12)}`,
    issueId: `valid-until-exact-action-${VALID_UNTIL.acceptedWorkId.slice(0, 12)}`,
    pullRequestId: `commit-${VALID_UNTIL.acceptedWorkId.slice(0, 12)}`,
    contributor: actor,
    recipientWallet: input.recipientWallet,
    recipients: [{ wallet: input.recipientWallet, amount: input.amount, role: "primary" }],
    token: "USDC",
    chainId: 84532,
    amount: input.amount,
  };

  const acceptance: AcceptanceEvidence = {
    source: "github",
    eventId,
    eventTime,
    action: "operator.accepted",
    acceptanceKind: "maintainer_attestation",
    accepted: true,
    acceptedWorkId: VALID_UNTIL.acceptedWorkId,
    repository: VALID_UNTIL.repository,
    issueId: contribution.issueId,
    pullRequestId: contribution.pullRequestId,
    merged: true,
    mergeSha: VALID_UNTIL.acceptedWorkId,
    requiredChecksPassed: true,
    requiredReviewApproved: true,
    headSha: VALID_UNTIL.acceptedWorkId,
    sender: actor,
    signatureVerified: true,
    rawFingerprint: `valid-until:${VALID_UNTIL.acceptedWorkId}`,
  };

  return { contribution, acceptance };
}

export function validUntilClaimPreview(input: {
  recipientWallet: string;
  amount: string;
  policy: SettlementPolicy;
}) {
  const { contribution, acceptance } = validUntilAcceptance(input);
  const claimId = claimIdFor(contribution, acceptance, input.policy);
  return {
    project: VALID_UNTIL,
    contribution,
    acceptance,
    claimId,
    idempotencyKey: idempotencyKeyFor(claimId),
    valueMovingExecutionPerformed: false,
  } as const;
}

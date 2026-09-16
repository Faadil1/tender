import { createHash } from "node:crypto";
import { contributionFromIssueMetadata } from "../adapters/github.js";
import type { AcceptanceEvidence } from "../domain/types.js";

export const demoContribution = contributionFromIssueMetadata({
  repository: "Faadil1/tender-demo-repo",
  issueId: "17",
  pullRequestId: "42",
  contributor: "contributor-agent",
  recipientWallet: "0x1111111111111111111111111111111111111111",
  amount: "1.00",
  token: "USDC",
  chainId: 84532
});

export function demoAcceptance(overrides: Partial<AcceptanceEvidence> = {}): AcceptanceEvidence {
  const base = {
    source: "github" as const,
    eventId: "evt_demo_merge_001",
    eventTime: new Date().toISOString(),
    action: "closed" as const,
    acceptanceKind: "github_merge" as const,
    accepted: true,
    acceptedWorkId: "abc123def456abc123def456abc123def456abcd",
    repository: demoContribution.repository,
    issueId: demoContribution.issueId,
    pullRequestId: demoContribution.pullRequestId,
    merged: true,
    mergeSha: "abc123def456abc123def456abc123def456abcd",
    requiredChecksPassed: true,
    requiredReviewApproved: true,
    headSha: "def456abc123def456abc123def456abc123def4",
    sender: "maintainer",
    signatureVerified: true,
    rawFingerprint: "demo"
  };
  const next = { ...base, ...overrides };
  next.rawFingerprint = createHash("sha256").update(JSON.stringify(next)).digest("hex").slice(0, 24);
  return next;
}

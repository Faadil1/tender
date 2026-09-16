import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import type { AcceptanceEvidence, Contribution } from "../domain/types.js";

export function verifyGitHubSignature(secret: string, payload: string, signatureHeader?: string) {
  if (!secret || !signatureHeader?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const left = Buffer.from(expected);
  const right = Buffer.from(signatureHeader);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function contributionFromIssueMetadata(input: {
  repository: string;
  issueId: string;
  taskId?: string;
  pullRequestId: string;
  contributor: string;
  recipientWallet: string;
  amount: string;
  token?: string;
  chainId?: number;
}): Contribution {
  return {
    source: "github",
    repository: input.repository,
    taskId: input.taskId ?? input.issueId,
    issueId: input.issueId,
    pullRequestId: input.pullRequestId,
    contributor: input.contributor,
    recipientWallet: input.recipientWallet,
    recipients: [{ wallet: input.recipientWallet, amount: input.amount, role: "primary" }],
    amount: input.amount,
    token: input.token ?? "USDC",
    chainId: input.chainId ?? 84532
  };
}

export function acceptanceFromGitHubPullRequestEvent(
  eventId: string,
  payload: any,
  signatureVerified: boolean,
  requiredChecksPassed: boolean
): AcceptanceEvidence {
  const pr = payload.pull_request ?? {};
  const repo = payload.repository?.full_name ?? "unknown/unknown";
  return {
    source: "github",
    eventId,
    eventTime: new Date().toISOString(),
    action: payload.action ?? "closed",
    acceptanceKind: "github_merge",
    accepted: Boolean(pr.merged),
    acceptedWorkId: pr.merge_commit_sha,
    repository: repo,
    issueId: String(pr.issue_url?.split("/").pop() ?? pr.number ?? "unknown"),
    pullRequestId: String(pr.number ?? "unknown"),
    merged: Boolean(pr.merged),
    mergeSha: pr.merge_commit_sha,
    requiredChecksPassed,
    requiredReviewApproved: true,
    headSha: pr.head?.sha,
    sender: payload.sender?.login,
    signatureVerified,
    rawFingerprint: createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 24)
  };
}

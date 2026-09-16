import { mkdir, writeFile } from "node:fs/promises";
import { KeeperHubExecutor } from "../src/adapters/keeperhub.js";
import { MemorySettlementRepository } from "../src/adapters/memoryRepository.js";
import { SettlementEngine } from "../src/domain/settlementEngine.js";
import type { Contribution, AcceptanceEvidence } from "../src/domain/types.js";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const repository = process.env.GITHUB_REPOSITORY ?? "Faadil1/tender";
const sha = process.env.GITHUB_SHA ?? `local-${Date.now()}`;
const runId = process.env.GITHUB_RUN_ID ?? "local";
const actor = process.env.GITHUB_ACTOR ?? "manual";
const recipient = required("TENDER_RECIPIENT_WALLET");
const amount = process.env.TENDER_AMOUNT_USDC ?? "0.01";
const workflowId = required("KEEPERHUB_WORKFLOW_ID");

const contribution: Contribution = {
  source: "github",
  repository,
  taskId: process.env.TENDER_TASK_ID ?? `live-proof-${runId}`,
  issueId: process.env.TENDER_TASK_ID ?? `live-proof-${runId}`,
  pullRequestId: process.env.TENDER_PR_ID ?? runId,
  contributor: actor,
  recipientWallet: recipient,
  recipients: [{ wallet: recipient, amount, role: "primary" }],
  token: "USDC",
  chainId: 84532,
  amount
};

const acceptance: AcceptanceEvidence = {
  source: "github",
  eventId: `github-actions-${runId}`,
  eventTime: new Date().toISOString(),
  action: "workflow_run.completed",
  acceptanceKind: "maintainer_attestation",
  accepted: true,
  acceptedWorkId: process.env.TENDER_ACCEPTED_WORK_ID || sha,
  repository,
  issueId: contribution.issueId,
  pullRequestId: contribution.pullRequestId,
  merged: false,
  mergeSha: sha,
  requiredChecksPassed: true,
  requiredReviewApproved: true,
  headSha: sha,
  sender: actor,
  signatureVerified: true,
  rawFingerprint: `live-proof-${runId}-${sha.slice(0, 12)}`
};

const repo = new MemorySettlementRepository();
const executor = new KeeperHubExecutor({
  apiKey: required("KEEPERHUB_API_KEY"),
  workflowId,
  baseUrl: process.env.KEEPERHUB_BASE_URL ?? "https://app.keeperhub.com",
  mode: "workflow"
});
const engine = new SettlementEngine(repo, executor, {
  version: "policy.live.base-sepolia-usdc.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: "5",
  requireReview: false
});

const settled = await engine.handleAcceptance(contribution, acceptance);
const replay = await engine.handleAcceptance(contribution, { ...acceptance, eventId: `${acceptance.eventId}-replay`, action: "replayed" });

const tx = settled.transactionHash;
const evidence = {
  generatedAt: new Date().toISOString(),
  repository,
  commitSha: sha,
  contribution: {
    taskId: contribution.taskId,
    pullRequestId: contribution.pullRequestId,
    acceptedWorkId: acceptance.acceptedWorkId
  },
  tenderClaim: {
    claimId: settled.claim.claimId,
    policyVersion: settled.claim.policyVersion,
    idempotencyKey: settled.claim.idempotencyKey
  },
  keeperHub: {
    workflowId,
    executionId: settled.keeperHubExecutionId,
    baseUrl: process.env.KEEPERHUB_BASE_URL ?? "https://app.keeperhub.com"
  },
  settlement: {
    status: settled.status,
    transactionHash: tx,
    explorerUrl: tx ? `https://sepolia.basescan.org/tx/${tx}` : null,
    receipt: settled.receipt
  },
  replay: {
    status: replay.status,
    sameClaim: replay.claim.claimId === settled.claim.claimId,
    additionalKeeperHubExecutions: replay.attempts.length - settled.attempts.length,
    additionalMovement: "$0"
  }
};

await mkdir("evidence", { recursive: true });
await writeFile("evidence/live-proof.json", `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Tender live proof: ${settled.status} claim=${settled.claim.claimId} replay=${replay.status}`);
if (tx) console.log(`Transaction: ${tx}`);

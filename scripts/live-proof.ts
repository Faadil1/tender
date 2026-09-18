import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { KeeperHubExecutor } from "../src/adapters/keeperhub.js";
import { MemorySettlementRepository } from "../src/adapters/memoryRepository.js";
import { SettlementEngine } from "../src/domain/settlementEngine.js";
import type { Contribution, AcceptanceEvidence } from "../src/domain/types.js";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const runnerRepository = process.env.GITHUB_REPOSITORY ?? "Faadil1/tender";
const repository = process.env.TENDER_SOURCE_REPOSITORY ?? runnerRepository;
const sha = process.env.GITHUB_SHA ?? `local-${Date.now()}`;
const runId = process.env.GITHUB_RUN_ID ?? "local";
const actor = process.env.GITHUB_ACTOR ?? "manual";
const recipient = required("TENDER_RECIPIENT_WALLET");
const amount = process.env.TENDER_AMOUNT_USDC ?? "0.01";
const workflowId = required("KEEPERHUB_WORKFLOW_ID");
const acceptedWorkId = process.env.TENDER_ACCEPTED_WORK_ID || sha;
const externalAcceptedWork = repository !== runnerRepository;
const stableTaskId = process.env.TENDER_TASK_ID || `accepted-${acceptedWorkId.slice(0, 16)}`;
const stablePullRequestId = process.env.TENDER_PR_ID || stableTaskId;

const contribution: Contribution = {
  source: "github",
  repository,
  taskId: stableTaskId,
  issueId: stableTaskId,
  pullRequestId: stablePullRequestId,
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
  acceptedWorkId,
  repository,
  issueId: contribution.issueId,
  pullRequestId: contribution.pullRequestId,
  merged: false,
  mergeSha: externalAcceptedWork ? undefined : sha,
  requiredChecksPassed: true,
  requiredReviewApproved: true,
  headSha: acceptedWorkId,
  sender: actor,
  signatureVerified: true,
  rawFingerprint: `live-proof-${runId}-${acceptedWorkId.slice(0, 12)}`
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
if (settled.status !== "SETTLED" || !settled.transactionHash) {
  throw new Error(`Canonical live proof did not reach SETTLED; status=${settled.status}. Do not replay or rebroadcast blindly.`);
}

const settledSnapshot = structuredClone(settled);
const replay = await engine.handleAcceptance(contribution, { ...acceptance, eventId: `${acceptance.eventId}-replay`, action: "replayed" });
const additionalKeeperHubExecutions = replay.attempts.length - settledSnapshot.attempts.length;

if (replay.status !== "ALREADY_SETTLED") {
  throw new Error(`Replay invariant failed: expected ALREADY_SETTLED, got ${replay.status}`);
}
if (replay.claim.claimId !== settledSnapshot.claim.claimId) {
  throw new Error("Replay invariant failed: claim identity changed");
}
if (additionalKeeperHubExecutions !== 0) {
  throw new Error(`Replay invariant failed: ${additionalKeeperHubExecutions} additional KeeperHub execution(s)`);
}

const tx = settledSnapshot.transactionHash;
const evidence = {
  generatedAt: new Date().toISOString(),
  repository,
  runnerRepository,
  commitSha: sha,
  contribution: {
    taskId: contribution.taskId,
    pullRequestId: contribution.pullRequestId,
    acceptedWorkId: acceptance.acceptedWorkId
  },
  tenderClaim: {
    claimId: settledSnapshot.claim.claimId,
    policyVersion: settledSnapshot.claim.policyVersion,
    idempotencyKey: settledSnapshot.claim.idempotencyKey
  },
  keeperHub: {
    workflowId,
    executionId: settledSnapshot.keeperHubExecutionId,
    baseUrl: process.env.KEEPERHUB_BASE_URL ?? "https://app.keeperhub.com"
  },
  settlement: {
    status: settledSnapshot.status,
    transactionHash: tx,
    explorerUrl: tx ? `https://sepolia.basescan.org/tx/${tx}` : null,
    receipt: settledSnapshot.receipt
  },
  replay: {
    status: replay.status,
    sameClaim: replay.claim.claimId === settledSnapshot.claim.claimId,
    additionalKeeperHubExecutions,
    additionalMovement: "$0"
  }
};

const evidencePath = process.env.TENDER_EVIDENCE_PATH ?? "evidence/live-proof.json";
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Tender live proof: ${settledSnapshot.status} claim=${settledSnapshot.claim.claimId} replay=${replay.status}`);
console.log(`Evidence: ${evidencePath}`);
console.log(`Transaction: ${tx}`);

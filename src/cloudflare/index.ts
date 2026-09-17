import { MemorySettlementRepository } from "../adapters/memoryRepository.js";
import { claimIdFor, idempotencyKeyFor } from "../domain/identity.js";
import { SettlementEngine } from "../domain/settlementEngine.js";
import type { AcceptanceEvidence, Contribution, SettlementExecutor, SettlementPolicy, SettlementRecord } from "../domain/types.js";

type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

const policy: SettlementPolicy = {
  version: "policy.live.base-sepolia-usdc.v1",
  token: "USDC",
  chainId: 84532,
  maxAmount: "5",
  requireReview: false
};

const noBroadcastExecutor: SettlementExecutor = {
  async preflight() {
    throw new Error("judge runtime must never preflight a new payment");
  },
  async execute() {
    throw new Error("judge runtime must never broadcast a payment");
  },
  async reconcile(record) {
    return record;
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function canonicalProof(request: Request, env: Env) {
  const assetUrl = new URL("/live-proof.json", request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: "GET" }));
  if (!response.ok) throw new Error(`canonical evidence unavailable (${response.status})`);
  return (await response.json()) as any;
}

function materializeCanonicalRecord(proof: any) {
  const receipt = proof.settlement.receipt;
  const taskId = proof.contribution.taskId;
  const pullRequestId = proof.contribution.pullRequestId;
  const acceptedWorkId = proof.contribution.acceptedWorkId;
  const recipient = receipt.recipients[0];

  const contribution: Contribution = {
    source: "github",
    repository: proof.repository,
    taskId,
    issueId: taskId,
    pullRequestId,
    contributor: "Faadil1",
    recipientWallet: recipient.wallet,
    recipients: receipt.recipients,
    token: receipt.asset,
    chainId: 84532,
    amount: receipt.amount
  };

  const acceptance: AcceptanceEvidence = {
    source: "github",
    eventId: receipt.acceptanceEvidence.eventId,
    eventTime: receipt.acceptanceEvidence.eventTime,
    action: "workflow_run.completed",
    acceptanceKind: receipt.acceptanceEvidence.acceptanceKind,
    accepted: true,
    acceptedWorkId,
    repository: proof.repository,
    issueId: taskId,
    pullRequestId,
    merged: false,
    mergeSha: receipt.acceptanceEvidence.mergeSha,
    requiredChecksPassed: true,
    requiredReviewApproved: true,
    headSha: proof.commitSha,
    sender: "Faadil1",
    signatureVerified: true,
    rawFingerprint: `canonical-${proof.commitSha}`
  };

  const computedClaimId = claimIdFor(contribution, acceptance, policy);
  if (computedClaimId !== proof.tenderClaim.claimId) {
    throw new Error(`canonical claim mismatch: computed ${computedClaimId}`);
  }

  const record: SettlementRecord = {
    claim: {
      claimId: proof.tenderClaim.claimId,
      settlementId: proof.tenderClaim.claimId,
      idempotencyKey: idempotencyKeyFor(proof.tenderClaim.claimId),
      contribution,
      acceptance,
      policyVersion: policy.version,
      status: "SETTLED",
      createdAt: receipt.settledAt
    },
    keeperHubExecutionId: proof.keeperHub.executionId,
    transactionHash: proof.settlement.transactionHash,
    receipt,
    status: "SETTLED",
    attempts: [
      {
        attempt: 1,
        executionId: proof.keeperHub.executionId,
        status: "success",
        startedAt: receipt.settledAt,
        completedAt: receipt.settledAt,
        transactionHash: proof.settlement.transactionHash
      }
    ],
    replayCount: 0,
    duplicatePayoutsPrevented: 0,
    timeline: [
      {
        at: receipt.acceptanceEvidence.eventTime,
        type: "ACCEPTED",
        label: "Canonical accepted work",
        detail: acceptedWorkId
      },
      {
        at: receipt.settledAt,
        type: "SETTLED",
        label: "Canonical Tender Receipt",
        detail: receipt.receiptId
      }
    ],
    updatedAt: receipt.settledAt
  };

  return { contribution, acceptance, record };
}

async function replayCanonicalClaim(request: Request, env: Env) {
  const proof = await canonicalProof(request, env);
  const { contribution, acceptance, record } = materializeCanonicalRecord(proof);
  const repo = new MemorySettlementRepository();
  await repo.put(structuredClone(record));

  const engine = new SettlementEngine(repo, noBroadcastExecutor, policy);
  const replay = await engine.handleAcceptance(contribution, {
    ...acceptance,
    eventId: `judge-replay-${crypto.randomUUID()}`,
    eventTime: new Date().toISOString(),
    action: "replayed",
    rawFingerprint: `judge-replay-${crypto.randomUUID()}`
  });

  const extraExecutions = replay.attempts.length - record.attempts.length;
  if (replay.status !== "ALREADY_SETTLED" || replay.claim.claimId !== proof.tenderClaim.claimId || extraExecutions !== 0) {
    throw new Error("runtime replay invariant failed");
  }

  return {
    runtime: "cloudflare-worker",
    engine: "Tender SettlementEngine",
    evaluatedAt: new Date().toISOString(),
    status: replay.status,
    claimId: replay.claim.claimId,
    sameClaim: true,
    additionalKeeperHubExecutions: 0,
    additionalMovement: "$0",
    broadcastAttempted: false,
    keeperHubExecutionId: replay.keeperHubExecutionId,
    transactionHash: replay.transactionHash,
    duplicatePayoutsPrevented: replay.duplicatePayoutsPrevented
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/api/runtime") {
        const proof = await canonicalProof(request, env);
        return json({
          runtime: "cloudflare-worker",
          mode: "judge-safe-dynamic",
          serverTime: new Date().toISOString(),
          claimId: proof.tenderClaim.claimId,
          canonicalSettlement: proof.settlement.status,
          valueMovingExecutionEnabled: false,
          replayEngineEnabled: true
        });
      }

      if (request.method === "GET" && url.pathname === "/api/proof") {
        const proof = await canonicalProof(request, env);
        return json(proof);
      }

      if (request.method === "POST" && url.pathname === "/api/replay") {
        return json(await replayCanonicalClaim(request, env));
      }

      if (url.pathname.startsWith("/api/")) {
        return json({ error: "not_found" }, 404);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown runtime error";
      return json({ error: "runtime_failure", message }, 500);
    }
  }
};

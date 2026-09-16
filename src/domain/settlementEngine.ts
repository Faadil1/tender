import { claimIdFor, idempotencyKeyFor } from "./identity.js";
import { validateContribution } from "./validation.js";
import type {
  AcceptanceEvidence,
  Contribution,
  SettlementExecutor,
  SettlementPolicy,
  SettlementRecord,
  SettlementRepository,
  TimelineEvent
} from "./types.js";

function now() {
  return new Date().toISOString();
}

function event(type: TimelineEvent["type"], label: string, detail: string): TimelineEvent {
  return { at: now(), type, label, detail };
}

export class SettlementEngine {
  constructor(
  private readonly repo: SettlementRepository,
    private readonly executor: SettlementExecutor,
    private readonly policy: SettlementPolicy
  ) {}

  private readonly locks = new Map<string, Promise<SettlementRecord>>();

  async handleAcceptance(contribution: Contribution, acceptance: AcceptanceEvidence) {
    if (!acceptance.signatureVerified) {
      return this.blocked(contribution, acceptance, "GitHub webhook signature was not verified", "QUARANTINED");
    }

    const validationError = validateContribution(contribution, this.policy);
    if (validationError) {
      return this.blocked(contribution, acceptance, validationError, "BLOCKED");
    }

    if (!acceptance.accepted) {
      return this.blocked(contribution, acceptance, "contribution was not accepted", "NOT_ACCEPTED");
    }

    if (!acceptance.requiredChecksPassed || (this.policy.requireReview && !acceptance.requiredReviewApproved)) {
      return this.blocked(contribution, acceptance, "acceptance evidence incomplete", "ACCEPTANCE_INCOMPLETE");
    }

    const claimId = claimIdFor(contribution, acceptance, this.policy);
    const running = this.locks.get(claimId);
    if (running) {
      await running;
      const existing = await this.repo.get(claimId);
      if (existing) return this.markReplay(existing, "Concurrent worker converged on the same Tender Claim; $0 moved.");
    }

    const operation = this.createOrSettleClaim(claimId, contribution, acceptance);
    this.locks.set(claimId, operation);
    try {
      return await operation;
    } finally {
      this.locks.delete(claimId);
    }
  }

  private async createOrSettleClaim(claimId: string, contribution: Contribution, acceptance: AcceptanceEvidence) {
    const existing = await this.repo.get(claimId);
    if (existing?.status === "SETTLED" || existing?.status === "ALREADY_SETTLED") {
      return this.markReplay(existing, "Replay mapped to the same Tender Claim; $0 moved.");
    }

    if (existing?.status === "SETTLEABLE" || existing?.status === "SETTLING" || existing?.status === "RETRYABLE_FAILURE") {
      existing.timeline.push(event("RETRY", "Retry resumed", "Existing Tender Claim reused; no second obligation created."));
    }

    const claim = {
      claimId,
      settlementId: claimId,
      idempotencyKey: idempotencyKeyFor(claimId),
      contribution,
      acceptance,
      policyVersion: this.policy.version,
      status: "CLAIMED" as const,
      createdAt: now()
    };

    const record: SettlementRecord =
      existing ?? {
        claim,
        status: "CLAIMED",
        attempts: [],
        replayCount: 0,
        duplicatePayoutsPrevented: 0,
        timeline: [
          event("TASK", "Accepted-work task", `${contribution.repository}#${contribution.taskId}`),
          event("CONTRIBUTION", "Contribution linked", `PR #${contribution.pullRequestId} by ${contribution.contributor}`),
          event("ACCEPTED", "Work accepted", acceptance.acceptedWorkId ?? acceptance.mergeSha ?? "accepted contribution"),
          event("CLAIM_CREATED", "Tender Claim created", claimId)
        ],
        updatedAt: now()
      };

    const preflight = await this.executor.preflight(record.claim);
    record.timeline.push(event("PREFLIGHT", "KeeperHub preflight", preflight.ok ? "Preflight accepted." : preflight.error));
    if (!preflight.ok) {
      record.status = "BLOCKED";
      record.updatedAt = now();
      await this.repo.put(record);
      return record;
    }

    record.status = "SETTLEABLE";
    record.claim.status = "SETTLEABLE";
    record.timeline.push(event("SETTLEABLE", "Claim is settleable", record.claim.idempotencyKey));
    await this.repo.put(record);

    record.status = "SETTLING";
    record.claim.status = "SETTLING";
    record.timeline.push(event("SETTLING", "KeeperHub execution started", record.claim.idempotencyKey));
    const result = await this.executor.execute(record.claim);
    record.keeperHubExecutionId = result.executionId;
    record.attempts.push({
      attempt: record.attempts.length + 1,
      executionId: result.executionId,
      status: result.status === "success" ? "success" : result.status === "running" ? "running" : "failed",
      startedAt: now(),
      completedAt: result.status === "running" ? undefined : now(),
      error: result.error,
      transactionHash: result.transactionHash
    });

    if (result.status === "success" && result.transactionHash) {
      record.status = "SETTLED";
      record.claim.status = "SETTLED";
      record.transactionHash = result.transactionHash;
      record.receipt = {
        receiptId: `treceipt_${claimId.replace("tclaim_", "")}`,
        acceptedContribution: acceptance.acceptedWorkId ?? acceptance.mergeSha ?? contribution.pullRequestId,
        acceptanceEvidence: {
          source: acceptance.source,
          acceptanceKind: acceptance.acceptanceKind,
          eventId: acceptance.eventId,
          acceptedWorkId: acceptance.acceptedWorkId,
          mergeSha: acceptance.mergeSha,
          eventTime: acceptance.eventTime
        },
        claimId,
        policyVersion: this.policy.version,
        recipients: contribution.recipients,
        asset: contribution.token,
        amount: contribution.amount,
        keeperHubExecutionId: result.executionId,
        transactionHash: result.transactionHash,
        status: "SETTLED",
        settledAt: now()
      };
      record.timeline.push(event("SETTLED", "Tender Receipt issued", record.receipt.receiptId));
    } else if (result.status === "running") {
      record.status = "SETTLING";
      record.claim.status = "SETTLING";
    } else {
      record.status = "RETRYABLE_FAILURE";
      record.claim.status = "RETRYABLE_FAILURE";
      record.timeline.push(event("RETRY", "Recoverable KeeperHub failure", result.error ?? "Unknown execution failure"));
    }

    record.updatedAt = now();
    await this.repo.put(record);
    return record;
  }

  private async markReplay(existing: SettlementRecord, detail: string) {
      existing.status = "ALREADY_SETTLED";
      existing.replayCount += 1;
      existing.duplicatePayoutsPrevented += 1;
      existing.timeline.push(event("REPLAY", "Same claim, $0 moved", detail));
      existing.updatedAt = now();
      await this.repo.put(existing);
      return existing;
  }

  async reconcile(settlementId: string) {
    const record = await this.repo.get(settlementId);
    if (!record) return undefined;
    const reconciled = await this.executor.reconcile(record);
    await this.repo.put(reconciled);
    return reconciled;
  }

  private async blocked(
    contribution: Contribution,
    acceptance: AcceptanceEvidence,
    reason: string,
    status: SettlementRecord["status"]
  ) {
    const fallbackId = `blocked_${acceptance.rawFingerprint}`;
    const record: SettlementRecord = {
      claim: {
        claimId: fallbackId,
        settlementId: fallbackId,
        idempotencyKey: idempotencyKeyFor(fallbackId),
        contribution,
        acceptance,
        policyVersion: this.policy.version,
        status,
        createdAt: now()
      },
      status,
      attempts: [],
      replayCount: 0,
      duplicatePayoutsPrevented: 0,
      timeline: [event("BLOCKED", status, reason)],
      updatedAt: now()
    };
    await this.repo.put(record);
    return record;
  }
}

import { idempotencyKeyFor, settlementIdFor } from "./identity.js";
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

  async handleAcceptance(contribution: Contribution, acceptance: AcceptanceEvidence) {
    if (!acceptance.signatureVerified) {
      return this.blocked(contribution, acceptance, "GitHub webhook signature was not verified", "QUARANTINED");
    }

    const validationError = validateContribution(contribution, this.policy);
    if (validationError) {
      return this.blocked(contribution, acceptance, validationError, "BLOCKED");
    }

    if (!acceptance.merged) {
      return this.blocked(contribution, acceptance, "pull request closed without merge", "NOT_YET_OWED");
    }

    if (!acceptance.requiredChecksPassed || (this.policy.requireReview && !acceptance.requiredReviewApproved)) {
      return this.blocked(contribution, acceptance, "acceptance evidence incomplete", "ACCEPTANCE_INCOMPLETE");
    }

    const settlementId = settlementIdFor(contribution, acceptance);
    const existing = await this.repo.get(settlementId);
    if (existing?.status === "SETTLED") {
      existing.status = "ALREADY_SETTLED";
      existing.timeline.push(event("REPLAY", "Already settled", "Replay mapped to the same settlement ID; no new transfer created."));
      existing.updatedAt = now();
      await this.repo.put(existing);
      return existing;
    }

    const claim = {
      settlementId,
      idempotencyKey: idempotencyKeyFor(settlementId),
      contribution,
      acceptance,
      status: "OWED" as const,
      createdAt: now()
    };

    const record: SettlementRecord =
      existing ?? {
        claim,
        status: "OWED",
        attempts: [],
        timeline: [
          event("TASK", "Bounty-backed issue", `${contribution.repository}#${contribution.issueId}`),
          event("CONTRIBUTION", "Pull request linked", `PR #${contribution.pullRequestId} by ${contribution.contributor}`),
          event("ACCEPTED", "Work accepted", `Merged at ${acceptance.mergeSha}`),
          event("CLAIM_CREATED", "Settlement claim created", settlementId)
        ],
        updatedAt: now()
      };

    const preflight = await this.executor.preflight(claim);
    record.timeline.push(event("PREFLIGHT", "KeeperHub preflight", preflight.ok ? "Preflight accepted." : preflight.error));
    if (!preflight.ok) {
      record.status = "BLOCKED";
      record.updatedAt = now();
      await this.repo.put(record);
      return record;
    }

    record.status = "SETTLING";
    record.timeline.push(event("SETTLING", "KeeperHub execution started", claim.idempotencyKey));
    const result = await this.executor.execute(claim);
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
      record.transactionHash = result.transactionHash;
      record.timeline.push(event("SETTLED", "Contribution settled", result.transactionHash));
    } else if (result.status === "running") {
      record.status = "SETTLING";
    } else {
      record.status = "RETRYABLE_FAILURE";
      record.timeline.push(event("RETRY", "Recoverable KeeperHub failure", result.error ?? "Unknown execution failure"));
    }

    record.updatedAt = now();
    await this.repo.put(record);
    return record;
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
        settlementId: fallbackId,
        idempotencyKey: idempotencyKeyFor(fallbackId),
        contribution,
        acceptance,
        status,
        createdAt: now()
      },
      status,
      attempts: [],
      timeline: [event("BLOCKED", status, reason)],
      updatedAt: now()
    };
    await this.repo.put(record);
    return record;
  }
}

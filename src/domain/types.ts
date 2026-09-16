export type SettlementStatus =
  | "NOT_YET_OWED"
  | "ACCEPTANCE_INCOMPLETE"
  | "OWED"
  | "SETTLING"
  | "SETTLED"
  | "ALREADY_SETTLED"
  | "BLOCKED"
  | "RETRYABLE_FAILURE"
  | "QUARANTINED";

export type SourceKind = "github";

export interface Contribution {
  source: SourceKind;
  repository: string;
  issueId: string;
  pullRequestId: string;
  contributor: string;
  recipientWallet: string;
  token: string;
  chainId: number;
  amount: string;
}

export interface AcceptanceEvidence {
  source: SourceKind;
  eventId: string;
  eventTime: string;
  action: "closed" | "synchronize" | "workflow_run.completed" | "replayed";
  repository: string;
  issueId: string;
  pullRequestId: string;
  merged: boolean;
  mergeSha?: string;
  requiredChecksPassed: boolean;
  requiredReviewApproved?: boolean;
  headSha?: string;
  sender?: string;
  signatureVerified?: boolean;
  rawFingerprint: string;
}

export interface SettlementPolicy {
  token: string;
  chainId: number;
  maxAmount: string;
  requireReview: boolean;
}

export interface SettlementClaim {
  settlementId: string;
  idempotencyKey: string;
  contribution: Contribution;
  acceptance: AcceptanceEvidence;
  status: SettlementStatus;
  createdAt: string;
}

export interface ExecutionAttempt {
  attempt: number;
  executionId: string;
  status: "preflight" | "running" | "success" | "failed";
  startedAt: string;
  completedAt?: string;
  error?: string;
  transactionHash?: string;
}

export interface SettlementRecord {
  claim: SettlementClaim;
  keeperHubExecutionId?: string;
  transactionHash?: string;
  status: SettlementStatus;
  timeline: TimelineEvent[];
  attempts: ExecutionAttempt[];
  updatedAt: string;
}

export interface TimelineEvent {
  at: string;
  type:
    | "TASK"
    | "CONTRIBUTION"
    | "ACCEPTED"
    | "CLAIM_CREATED"
    | "PREFLIGHT"
    | "SETTLING"
    | "SETTLED"
    | "REPLAY"
    | "BLOCKED"
    | "RETRY";
  label: string;
  detail: string;
}

export interface SettlementRepository {
  get(settlementId: string): Promise<SettlementRecord | undefined>;
  put(record: SettlementRecord): Promise<void>;
  all(): Promise<SettlementRecord[]>;
}

export interface SettlementExecutor {
  preflight(claim: SettlementClaim): Promise<{ ok: true } | { ok: false; error: string }>;
  execute(claim: SettlementClaim): Promise<{
    executionId: string;
    transactionHash?: string;
    status: "success" | "running" | "failed";
    error?: string;
  }>;
  reconcile(record: SettlementRecord): Promise<SettlementRecord>;
}

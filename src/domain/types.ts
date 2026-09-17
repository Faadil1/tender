export type SettlementStatus =
  | "NOT_ACCEPTED"
  | "ACCEPTANCE_INCOMPLETE"
  | "ACCEPTED"
  | "CLAIMED"
  | "SETTLEABLE"
  | "SETTLING"
  | "SETTLED"
  | "ALREADY_SETTLED"
  | "REQUIRES_ACCEPTANCE"
  | "SUPERSEDED"
  | "BLOCKED"
  | "RETRYABLE_FAILURE"
  | "QUARANTINED";

export type SourceKind = "github" | "external" | "manual";

export interface Contribution {
  source: SourceKind;
  repository: string;
  taskId: string;
  issueId: string;
  pullRequestId: string;
  contributor: string;
  recipientWallet: string;
  recipients: SettlementRecipient[];
  token: string;
  chainId: number;
  amount: string;
  economicAuthorization?: EconomicAuthorization;
}

export interface EconomicAuthorization {
  authorizationId: string;
  kind: "initial_claim" | "corrective_claim" | "supersession";
  authorizedBy: string;
  authorizedAt: string;
  reason: string;
  linkedClaimId?: string;
}

export interface SettlementRecipient {
  wallet: string;
  amount: string;
  role: "primary" | "co_contributor" | "maintainer_override";
}

export interface AcceptanceEvidence {
  source: SourceKind;
  eventId: string;
  eventTime: string;
  action: "closed" | "synchronize" | "workflow_run.completed" | "replayed" | "operator.accepted";
  acceptanceKind: "github_merge" | "maintainer_attestation" | "external_acceptance" | "operator_correction";
  accepted: boolean;
  acceptedWorkId?: string;
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
  version: string;
  token: string;
  chainId: number;
  maxAmount: string;
  requireReview: boolean;
  policyDigest?: string;
  effectiveFrom?: string;
  supersedes?: string;
}

export interface TenderClaim {
  claimId: string;
  settlementId: string;
  idempotencyKey: string;
  contribution: Contribution;
  acceptance: AcceptanceEvidence;
  policyVersion: string;
  status: SettlementStatus;
  createdAt: string;
  linkedClaimId?: string;
  correctionReason?: string;
}

export type SettlementClaim = TenderClaim;

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
  claim: TenderClaim;
  keeperHubExecutionId?: string;
  transactionHash?: string;
  receipt?: TenderReceipt;
  status: SettlementStatus;
  timeline: TimelineEvent[];
  attempts: ExecutionAttempt[];
  replayCount: number;
  duplicatePayoutsPrevented: number;
  supersededByClaimId?: string;
  updatedAt: string;
}

export interface TenderReceipt {
  receiptId: string;
  acceptedContribution: string;
  acceptanceEvidence: Pick<
    AcceptanceEvidence,
    "source" | "acceptanceKind" | "eventId" | "acceptedWorkId" | "mergeSha" | "eventTime"
  >;
  claimId: string;
  policyVersion: string;
  recipients: SettlementRecipient[];
  asset: string;
  amount: string;
  keeperHubExecutionId: string;
  transactionHash: string;
  status: "SETTLED";
  settledAt: string;
}

export interface TimelineEvent {
  at: string;
  type:
    | "TASK"
    | "CONTRIBUTION"
    | "ACCEPTED"
    | "CLAIM_CREATED"
    | "SETTLEABLE"
    | "PREFLIGHT"
    | "SETTLING"
    | "SETTLED"
    | "REPLAY"
    | "BLOCKED"
    | "RETRY"
    | "REQUIRES_ACCEPTANCE"
    | "SUPERSEDED"
    | "CORRECTION";
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

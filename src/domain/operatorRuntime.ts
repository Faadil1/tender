import { MemorySettlementRepository } from "../adapters/memoryRepository.js";
import { claimIdFor, idempotencyKeyFor } from "./identity.js";
import { SettlementEngine } from "./settlementEngine.js";
import type {
  AcceptanceEvidence,
  Contribution,
  EconomicAuthorization,
  EconomicAuthorizationContext,
  EconomicAuthorizationDecision,
  EconomicAuthorizationVerifier,
  SettlementExecutor,
  SettlementPolicy,
  SettlementRecord
} from "./types.js";

export type OperatorPolicyStatus = "DRAFT" | "LOCKED";

export interface OperatorSettlementPolicy extends SettlementPolicy {
  policyDigest: string;
  status: OperatorPolicyStatus;
  createdBy: string;
  createdAt: string;
  lockedAt?: string;
}

export interface OperatorObligation {
  claimId: string;
  policyVersion: string;
  contribution: Contribution;
  acceptance: AcceptanceEvidence;
  status: SettlementRecord["status"] | "AUTHORIZED" | "SUPERSEDED";
  authorizationId?: string;
  supersededByClaimId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorStore {
  readonly consistency: "strong" | "eventual";
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list<T>(prefix: string): Promise<Array<{ key: string; value: T }>>;
  consumeAuthorization?(key: string, context: EconomicAuthorizationContext, payload: EconomicAuthorization): Promise<EconomicAuthorizationDecision>;
}

const keys = {
  policy: (version: string) => `policy:${version}`,
  acceptance: (eventId: string) => `acceptance:${eventId}`,
  obligation: (claimId: string) => `obligation:${claimId}`,
  settlement: (claimId: string) => `settlement:${claimId}`,
  authorization: (authorizationId: string) => `authorization:${authorizationId}`
};

function now() {
  return new Date().toISOString();
}

function requireNonEmpty(value: string | undefined, label: string) {
  if (!value?.trim()) throw new Error(`${label}_required`);
  return value;
}

function operatorId(prefix: string) {
  return `${prefix}_${globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
}

export class MemoryOperatorStore implements OperatorStore {
  readonly consistency = "strong" as const;
  private readonly values = new Map<string, unknown>();
  private readonly locks = new Map<string, Promise<unknown>>();

  async get<T>(key: string) {
    return this.values.get(key) as T | undefined;
  }

  async put<T>(key: string, value: T) {
    this.values.set(key, structuredClone(value));
  }

  async delete(key: string) {
    this.values.delete(key);
  }

  async list<T>(prefix: string) {
    return [...this.values.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => ({ key, value: structuredClone(value) as T }));
  }

  async consumeAuthorization(key: string, context: EconomicAuthorizationContext, payload: EconomicAuthorization) {
    const prior = this.locks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const current = prior.then(() => new Promise<void>((resolve) => { release = resolve; }));
    this.locks.set(key, current);
    await prior;
    try {
      const stored = this.values.get(key) as EconomicAuthorization | undefined;
      const decision = validateAuthorization(stored, payload, context);
      if (!decision.ok) return decision;
      this.values.set(key, structuredClone({ ...stored, consumedAt: now() }));
      return { ok: true as const };
    } finally {
      release();
      if (this.locks.get(key) === current) this.locks.delete(key);
    }
  }
}

export class StoreBackedSettlementRepository extends MemorySettlementRepository {
  constructor(private readonly store: OperatorStore) {
    super();
  }

  async hydrate() {
    const records = await this.store.list<SettlementRecord>("settlement:");
    for (const { value } of records) await super.put(value);
  }

  async put(record: SettlementRecord) {
    await super.put(record);
    await this.store.put(keys.settlement(record.claim.claimId), record);
  }
}

export class StoreBackedAuthorizationVerifier implements EconomicAuthorizationVerifier {
  constructor(private readonly store: OperatorStore) {}

  async consume(authorization: EconomicAuthorization, context: EconomicAuthorizationContext): Promise<EconomicAuthorizationDecision> {
    const key = keys.authorization(authorization.authorizationId);
    if (!this.store.consumeAuthorization) return { ok: false, error: "authorization_store_not_atomic" };
    return this.store.consumeAuthorization(key, context, authorization);
  }
}

function validateAuthorization(stored: EconomicAuthorization | undefined, authorization: EconomicAuthorization, context: EconomicAuthorizationContext): EconomicAuthorizationDecision {
  if (!stored) return { ok: false, error: "authorization_not_found" };
  if (stored.consumedAt) return { ok: false, error: "authorization_already_consumed" };
  if (stored.kind !== authorization.kind) return { ok: false, error: "authorization_kind_mismatch" };
  if (stored.authorizedClaimId !== context.candidateClaimId) return { ok: false, error: "authorization_candidate_claim_mismatch" };
  if (stored.authorizedClaimId !== authorization.authorizedClaimId) return { ok: false, error: "authorization_payload_claim_mismatch" };
  if (stored.linkedClaimId !== context.linkedClaimId || authorization.linkedClaimId !== context.linkedClaimId) return { ok: false, error: "authorization_linked_claim_mismatch" };
  return { ok: true };
}

export class TenderOperatorService {
  constructor(private readonly store: OperatorStore) {}

  async createPolicy(input: SettlementPolicy & { createdBy: string }) {
    const policyDigest = requireNonEmpty(input.policyDigest, "policyDigest");
    const existing = await this.store.get<OperatorSettlementPolicy>(keys.policy(input.version));
    if (existing?.status === "LOCKED") throw new Error("locked_policy_cannot_be_overwritten");
    if (existing) throw new Error("policy_version_already_exists");
    const policy: OperatorSettlementPolicy = {
      ...input,
      policyDigest,
      status: "DRAFT",
      createdAt: now()
    };
    await this.store.put(keys.policy(policy.version), policy);
    return policy;
  }

  async lockPolicy(version: string) {
    const policy = await this.requirePolicy(version);
    if (policy.status === "LOCKED") return policy;
    const locked: OperatorSettlementPolicy = { ...policy, status: "LOCKED", lockedAt: now() };
    await this.store.put(keys.policy(version), locked);
    return locked;
  }

  async ingestAcceptance(acceptance: AcceptanceEvidence) {
    await this.store.put(keys.acceptance(acceptance.eventId), acceptance);
    return acceptance;
  }

  async createObligation(contribution: Contribution, acceptance: AcceptanceEvidence, policyVersion: string) {
    const policy = await this.requirePolicy(policyVersion);
    this.assertPolicyPrecommitted(policy, acceptance);
    const claimId = claimIdFor(contribution, acceptance, policy);
    const obligation: OperatorObligation = {
      claimId,
      policyVersion,
      contribution: { ...contribution, economicAuthorization: undefined },
      acceptance,
      status: "CLAIMED",
      createdAt: now(),
      updatedAt: now()
    };
    await this.store.put(keys.obligation(claimId), obligation);
    return obligation;
  }

  async authorizeClaim(input: {
    candidateClaimId: string;
    kind: EconomicAuthorization["kind"];
    authorizedBy: string;
    reason: string;
    linkedClaimId?: string;
  }) {
    requireNonEmpty(input.authorizedBy, "authorizedBy");
    requireNonEmpty(input.reason, "reason");
    if (input.kind === "corrective_claim") requireNonEmpty(input.linkedClaimId, "linkedClaimId");

    const authorization: EconomicAuthorization = {
      authorizationId: operatorId("auth"),
      kind: input.kind,
      authorizedClaimId: input.candidateClaimId,
      authorizedBy: input.authorizedBy,
      authorizedAt: now(),
      linkedClaimId: input.linkedClaimId,
      reason: input.reason
    };
    await this.store.put(keys.authorization(authorization.authorizationId), authorization);

    const obligation = await this.store.get<OperatorObligation>(keys.obligation(input.candidateClaimId));
    if (obligation) {
      obligation.authorizationId = authorization.authorizationId;
      obligation.status = "AUTHORIZED";
      obligation.updatedAt = now();
      await this.store.put(keys.obligation(obligation.claimId), obligation);
    }
    return authorization;
  }

  async settleClaim(claimId: string, executor: SettlementExecutor) {
    const obligation = await this.requireObligation(claimId);
    const policy = await this.requirePolicy(obligation.policyVersion);
    this.assertPolicyPrecommitted(policy, obligation.acceptance);
    const repo = await this.repository();
    const verifier = new StoreBackedAuthorizationVerifier(this.store);
    const authorization = obligation.authorizationId
      ? await this.store.get<EconomicAuthorization>(keys.authorization(obligation.authorizationId))
      : undefined;

    const contribution = authorization
      ? { ...obligation.contribution, economicAuthorization: authorization }
      : obligation.contribution;
    const engine = new SettlementEngine(repo, executor, policy, verifier);
    const record = await engine.handleAcceptance(contribution, obligation.acceptance);
    await this.store.put(keys.obligation(claimId), {
      ...obligation,
      status: record.status,
      updatedAt: now()
    } satisfies OperatorObligation);
    return record;
  }

  async reconcileClaim(claimId: string, executor: SettlementExecutor) {
    const repo = await this.repository();
    const record = await repo.get(claimId);
    if (!record) throw new Error("settlement_record_not_found");
    const obligation = await this.requireObligation(claimId);
    const policy = await this.requirePolicy(obligation.policyVersion);
    const engine = new SettlementEngine(repo, executor, policy, new StoreBackedAuthorizationVerifier(this.store));
    const reconciled = await engine.reconcile(claimId);
    if (!reconciled) throw new Error("settlement_record_not_found");
    await this.store.put(keys.obligation(claimId), { ...obligation, status: reconciled.status, updatedAt: now() } satisfies OperatorObligation);
    return reconciled;
  }

  async supersedeUnsettledClaim(claimId: string, supersededByClaimId: string, reason: string) {
    const obligation = await this.requireObligation(claimId);
    if (obligation.status === "SETTLED") throw new Error("settled_obligation_is_immutable");
    const superseded: OperatorObligation = {
      ...obligation,
      status: "SUPERSEDED",
      supersededByClaimId,
      updatedAt: now()
    };
    await this.store.put(keys.obligation(claimId), superseded);

    const record = await this.store.get<SettlementRecord>(keys.settlement(claimId));
    if (record && record.status !== "SETTLED" && record.status !== "ALREADY_SETTLED") {
      record.status = "SUPERSEDED";
      record.claim.status = "SUPERSEDED";
      record.supersededByClaimId = supersededByClaimId;
      record.timeline.push({ at: now(), type: "SUPERSEDED", label: "Unsettled claim superseded", detail: reason });
      record.updatedAt = now();
      await this.store.put(keys.settlement(claimId), record);
    }
    return superseded;
  }

  async createCorrectiveClaim(input: {
    linkedClaimId: string;
    contribution: Contribution;
    acceptance: AcceptanceEvidence;
    policyVersion: string;
    authorizedBy: string;
    reason: string;
  }) {
    const obligation = await this.createObligation(input.contribution, input.acceptance, input.policyVersion);
    const authorization = await this.authorizeClaim({
      candidateClaimId: obligation.claimId,
      kind: "corrective_claim",
      linkedClaimId: input.linkedClaimId,
      authorizedBy: input.authorizedBy,
      reason: input.reason
    });
    return { obligation: { ...obligation, authorizationId: authorization.authorizationId, status: "AUTHORIZED" as const }, authorization };
  }

  async status(claimId: string) {
    return {
      obligation: await this.store.get<OperatorObligation>(keys.obligation(claimId)),
      settlement: await this.store.get<SettlementRecord>(keys.settlement(claimId))
    };
  }

  authorizationVerifier() {
    return new StoreBackedAuthorizationVerifier(this.store);
  }

  private async repository() {
    const repo = new StoreBackedSettlementRepository(this.store);
    await repo.hydrate();
    return repo;
  }

  private async requirePolicy(version: string) {
    const policy = await this.store.get<OperatorSettlementPolicy>(keys.policy(version));
    if (!policy) throw new Error("policy_not_found");
    return policy;
  }

  private assertPolicyPrecommitted(policy: OperatorSettlementPolicy, acceptance: AcceptanceEvidence) {
    if (policy.status !== "LOCKED" || !policy.lockedAt) throw new Error("policy_must_be_locked_before_obligation");
    if (new Date(policy.lockedAt).getTime() > new Date(acceptance.eventTime).getTime()) throw new Error("policy_not_precommitted_before_acceptance");
  }

  private async requireObligation(claimId: string) {
    const obligation = await this.store.get<OperatorObligation>(keys.obligation(claimId));
    if (!obligation) throw new Error("obligation_not_found");
    return obligation;
  }
}

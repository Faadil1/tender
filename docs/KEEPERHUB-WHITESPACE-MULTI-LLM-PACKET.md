# KeeperHub Whitespace Multi-LLM Packet

Date: 2026-09-17
Purpose: discover a new, unclaimed, mergeable KeeperHub bounty contribution after rejecting the original execution-reference direction.

## Canonical context

Main product: Tender — economic clearing for accepted work.

Tender remains separate from the upstream KeeperHub bounty work.

Tender owns:
- whether accepted work creates an economic obligation;
- deterministic obligation identity;
- authorization semantics;
- correction/supersession semantics;
- exactly-once settlement at the Claim/domain layer;
- causal receipt/proof.

KeeperHub owns:
- reliable execution of an already-authorized action;
- retry/idempotency behavior;
- broadcast/result handling;
- platform execution infrastructure.

Do not blur those layers.

## Already rejected / occupied directions

Do NOT rescue or re-propose these unless you can prove current repo state changed materially:

- generic Effect-Bound Execution Reference;
- permanent org+reference deduplication;
- universal semantic-effect fingerprinting;
- metadata-only callerReference as the primary recommendation unless strong independent demand is found;
- #2373 asynchronous idempotency release;
- #2495/#2552 partial payout resume / web3/disburse;
- #2408 softened-error execution reporting;
- top-level direct-execution typed failure status normalization as a bounty candidate (Claude + source fact-check found no recurring caller harm; keep RESEARCH ONLY unless new evidence appears);
- generic post-broadcast outcome/reconciliation;
- generic sequential simulation / invariant firewall;
- receipt export;
- executed-call verification;
- permission cards;
- multi-model consensus;
- generic EVM sign-and-hold;
- generic framework adapters;
- generic Merkle audit;
- generic cross-chain status.

Known verified state:
- #1840 open/accepted/confirmed; PR #2372 open, mergeable, not merged.
- #2373 open/confirmed/needs-discussion; active implementation/tests already exist.
- #2020 closed; PR #2162 merged.
- #2177 closed/completed.
- #2374 closed; PR #2386 merged.
- #1979 closed/completed.
- #2206 closed; PR #2213 merged and current staging now returns the standardized ExecuteResponse envelope for protocol writes.
- #2408 closed/completed/accepted/confirmed; PR #2446 merged; remaining execution-level shape retained by core team.
- #2495 open/accepted/confirmed; PR #2552 open, mergeable, not merged.

## Mission

Find KeeperHub bounty whitespace that is:

1. a real current problem or missing capability;
2. independently evidenced beyond Tender;
3. not already owned by an open issue/PR/contributor;
4. small enough to get issue acceptance, implement, test, and PR to `staging`;
5. backwards-compatible;
6. useful to KeeperHub generally;
7. substantial enough for a mergeability-first feature bounty;
8. not a disguised duplication of existing idempotency, payout, reconciliation, or observability work.

Search current sources before asserting:
- KeeperHub `staging` source;
- open AND closed issues;
- open, closed and merged PRs;
- docs;
- recent release notes if relevant;
- current/recent hackathon submissions when discoverable;
- adjacent execution/relayer/workflow products for recurrent user needs.

## Required candidate search

Generate at least 5 candidate opportunities, then aggressively eliminate weak/occupied ones.

For every candidate, provide:
- exact user/problem evidence;
- exact KeeperHub source/issue/PR overlap;
- why it is not already solved;
- smallest credible v1;
- expected files/components touched;
- migration/API risk;
- tests required;
- why maintainers might reject it;
- why it is useful beyond Tender;
- confidence: VERIFIED / SUPPORTED / INFERRED / UNKNOWN.

Then reduce to:
- PRIMARY candidate;
- SECONDARY candidate;
- NO-GO list.

Do not pick a PRIMARY candidate if evidence is weak. "No bounty candidate survives" is an acceptable conclusion.

## Role-specific instruction

Use the role below depending on the model:

### Claude
Act as a KeeperHub maintainer and senior reviewer.
Optimize for mergeability, hidden coupling, scope discipline, API compatibility, review burden and maintainer acceptance.
Try to reject candidates before recommending one.

#### Targeted adjudication result: direct-execution typed failure status — RESEARCH ONLY

Treat this as a specific RESEARCH-ONLY hypothesis to adjudicate, not as a preselected bounty candidate.

Verified on current `staging`:
- `ExecuteResponse` exposes optional `rejection` and `errorClass`.
- `ExecutionStatusResponse` exposes top-level `error` but not top-level `rejection`, `errorClass`, `errorCode` or `retryable`.
- `GET /api/execute/{executionId}/status` returns the persisted execution `output` as `result`.
- `failExecution()` already persists `rejection` and `errorClass` inside that output when those values are available.
- Historical incidents such as #1979 and #2374 show why callers need to make safe post-failure decisions, but those incidents do **not** by themselves prove that top-level normalization is the missing primitive; their underlying status/outcome defects were separately addressed.

Your job is to decide whether this asymmetry is:
1. an intentional/acceptable contract where typed details belong in `result`;
2. a small DX/documentation issue that is not bounty-worthy;
3. or a real, recurring API-contract gap that a maintainer would plausibly accept as a narrow feature/fix.

Before recommending any change:
- inspect current status-route consumers, CLI/MCP/client helpers, docs, tests, open/closed issues and PRs;
- identify at least one concrete current caller failure, repeated parsing workaround, contract drift, or independently evidenced demand caused specifically by the nested-vs-top-level shape;
- check whether another maintainer/core-team thread already owns this contract area;
- distinguish `errorClass` / `rejection` exposure from a much stronger `retryable` promise.

Important safety constraint:
- Do **not** invent a generic `retryable` boolean unless KeeperHub already has a stable source of truth for that semantic. A caller must not be encouraged to retry merely because an execution has `status: "failed"` or a particular error class.

If you think a change is justified, propose the smallest backwards-compatible v1 and explain why it is better than:
- documenting `result.errorClass` / `result.rejection`;
- adding a typed client helper;
- or leaving the current nested contract intact.

Promotion bar:
- Mere API symmetry or convenience => keep RESEARCH ONLY.
- A concrete recurring caller problem + no active owner + bounded backwards-compatible patch + clear tests => candidate may be promoted.
- If evidence is insufficient, explicitly return RESEARCH PRIMARY FURTHER or NO BOUNTY CANDIDATE SURVIVES.

Claude completed this adjudication and found no concrete recurring caller harm, no repeated parsing workaround, and no evidence that the nested placement itself caused an unsafe decision. Fact-check also established that adjacent issue #2206 is already closed via merged PR #2213. Therefore the hypothesis is locked at RESEARCH ONLY unless another reviewer produces materially new evidence.

### Gemini
Act as a systems/API/schema reviewer.
Focus on data model, migrations, state machines, concurrency, persistence, retention, multi-surface parity and backward compatibility.
Prefer candidates with crisp invariants and low migration risk.

### Grok
Act as an adversarial competitive-intelligence researcher.
Search hard for duplicates, current contributors, hackathon overlap, prior art, user complaints and reasons a candidate is not unique.
Treat "already being worked on" as a fatal objection.

### Perplexity
Act as an evidence/research reviewer.
Prioritize independent recurrence evidence, current docs/issues, analogous infrastructure systems and source-backed claims.
Separate strong evidence from speculation.

### Kimi
Act as a product-boundary and semantics reviewer.
Look for architectural inversion, business semantics leaking into KeeperHub, UX/DX ambiguity, scope mismatch and weak problem framing.
Prefer domain-native platform improvements.

### DeepSeek
Act as a source-level reliability engineer.
Inspect current code paths and look for narrow bugs or missing primitives at boundaries where state crosses:
- REST ↔ MCP ↔ CLI;
- simulation ↔ broadcast;
- sponsored ↔ direct;
- workflow ↔ direct execution;
- DB row ↔ reconciler;
- plugin ↔ core execution;
- auth/policy ↔ execution;
- chain-specific adapter ↔ shared abstraction.

Prioritize:
- inconsistent behavior across sibling routes;
- fields accepted on one surface but dropped on another;
- state transitions that are not symmetric;
- missing typed errors;
- stale or lossy persistence;
- race windows;
- partial propagation;
- documentation/code contract drift that causes operational harm.

Do not recommend a broad refactor. Find the smallest upstream change with the strongest concrete failure evidence.

## Required output

# 1. Current repo facts
Only verified facts that materially affect the search.

# 2. Candidate inventory
At least five candidates with overlap/evidence analysis.

# 3. Eliminations
Explain why each rejected candidate fails.

# 4. Primary candidate
Only if one clearly survives.

Include:
- problem;
- evidence;
- exact scope;
- likely files;
- tests;
- migration risk;
- API risk;
- likely maintainer objections;
- why it is not duplicate work.

# 5. Secondary candidate
Same, but shorter.

# 6. Reason / Scope / Plan draft
Only for the PRIMARY candidate and only if it survives.

# 7. Confidence ledger
VERIFIED / SUPPORTED / INFERRED / UNKNOWN for important claims.

# 8. Final recommendation
One of:
- FILE PRIMARY ISSUE
- RESEARCH PRIMARY FURTHER
- NO BOUNTY CANDIDATE SURVIVES

## Rules

- Search before asserting current KeeperHub facts.
- Do not flatter Tender.
- Do not optimize for agreement.
- Do not revive rejected ideas without new evidence.
- Do not invent issues/PRs/code paths.
- Prefer current source over marketing.
- Prefer independent user evidence over theoretical elegance.
- A negative result is valuable.

# External LLM Critique Packet — Tender / KeeperHub Bounty

Date: 2026-09-17
Status: ready for independent review; no external-model verdict has been recorded yet

## Purpose

Use this packet unchanged with independent models before filing any upstream KeeperHub issue. The goal is not to get agreement. The goal is to make Claude, Gemini and Grok try to kill the current bounty hypothesis before we spend time on it.

The candidate is intentionally separate from Tender's main hackathon product. Tender itself remains the economic clearing layer for accepted work and its verified runtime/proof path is locked.

## Candidate

Working name: **Effect-Bound Execution Reference**

Short version:

KeeperHub already has strong 24-hour request idempotency, but integrations repeatedly maintain a longer-lived logical identifier outside KeeperHub so they can answer which execution discharged a particular piece of work. The proposal is an optional organization-scoped caller reference on value-moving direct execution, durably bound to the original request/effect and execution ID.

Desired semantics:

- same reference + same bound request/effect -> resolve the original execution/proof; never broadcast again;
- same reference + changed bound request/effect -> typed conflict; never broadcast;
- reference survives API-key rotation because scope is organization, not credential;
- existing Idempotency-Key semantics remain unchanged;
- KeeperHub does not interpret invoices, accepted work, payroll, bounties or economic obligations.

## Why this is not just Idempotency-Key

KeeperHub's direct-execution idempotency is deliberately short-lived retry safety:

- organization + endpoint/scope + idempotency key;
- deterministic request hash conflict checking;
- processing lock for in-flight requests;
- completed/failed replay records expire after 24 hours;
- after expiry the same key can execute again.

That is correct transport behavior. It is not a durable caller-owned correlation identity.

The direct execution itself already has a durable audit row holding execution ID, organization, redacted input, lifecycle status, transaction hash, receipts, output, gas/cost fields and timestamps. `checkAndReserveExecution` creates that row at the atomic value-cap reservation boundary.

The proposed feature would compose with those existing mechanics rather than change idempotency TTL globally.

## Recurrence evidence

Independent integrations are already inventing adjacent state:

- Tender: a deterministic Claim ID identifies the economic obligation independently of the execution attempt.
- KeeperHub issue #2495 (`web3/disburse`): proposes a caller `runKey` to identify payout legs across executions so a partially failed payout can resume without repaying settled legs.
- FINALTab: maintains a durable settlement-intent journal and replay/crash recovery around KeeperHub execution.
- Landed: uses a stable external reference around execution/recovery.

This is not proof that the proposed platform abstraction is right. It is evidence that the underlying need recurs in more than one integration.

## Source-level seam

Current KeeperHub direct-execution architecture inspected on `staging`:

- `app/api/execute/_lib/execution-service.ts`: durable `directExecutions` row and receipt persistence.
- `app/api/execute/[executionId]/status/route.ts`: read by internal execution ID; no caller-defined durable reference.
- `app/api/execute/_lib/spending-cap.ts`: atomic execution-row creation at the value reservation boundary.
- `lib/idempotency.ts`: short-lived key + deterministic request hash + replay/conflict/in-progress semantics.
- direct write routes call idempotency before state-changing work and reserve the execution before broadcasting.

Current implementation bias for a mergeable v1:

1. Prefer exact-request binding over inventing a universal cross-route semantic effect canonicalizer.
2. Add an optional reference on a deliberately bounded set of value-moving direct execution routes.
3. Reserve/bind the reference atomically with the direct execution row.
4. Store the deterministic request hash used for conflict checking.
5. Same reference + same request -> resolve original execution.
6. Same reference + different request -> typed conflict.
7. Surface the reference on status and through one read-only lookup path.
8. Leave `Idempotency-Key` unchanged.

## Current overlap / no-go map

Do not reinterpret the candidate as any of these existing directions:

- #2495 partial payout resume / `web3/disburse`;
- #2395 direct-execution receipt export;
- #2503 executed-call verification;
- #2398 permission / generative cards;
- #2318 multi-model consensus node;
- #2479 generic sign-and-hold;
- generic sequential simulation / preflight firewall;
- generic Merkle audit;
- generic cross-chain status;
- generic framework connector.

Final issue/PR name sweep completed on 2026-09-17 for the phrases `execution reference`, `effect reference`, `durable reference`, and `reference lookup`. No direct duplicate was found. Search results contained related idempotency/recovery work, which is precisely why semantic overlap still needs reviewer scrutiny.

## Competitive / hackathon context

Current Agent Economy main-track framing favors KeeperHub integrated into a live project/product rather than a standalone demo, and the separate bounty is explicitly for a feature KeeperHub can merge.

Prior KeeperHub winner signal is consistent: production seriousness, real live use, reusable primitives, tests, reproducible feedback and upstream usefulness matter more than novelty theater.

Current submissions already occupy much of the obvious space:

- FINALTab: deterministic settlement plan, wallet consent, KeeperHub execution, independent chain proof, crash/replay recovery.
- AgentKeeper-MCP: guarded transaction/MCP gateway, dry-run, idempotency, x402, Merkle audit, multi-chain controls.
- Landed: simulate -> broadcast -> verified receipt plus stable reference/recovery semantics.
- Nyrvok: sequential preflight/invariant firewall before KeeperHub execution.

Therefore the candidate should be rejected if its value reduces to 'another idempotency layer' or 'another settlement intent'.

## Tender uniqueness boundary

Tender's product thesis must not move downward into the execution layer.

Tender answers:

> Did accepted work create this exact economic obligation, under which policy, and has that exact obligation been discharged?

KeeperHub answers:

> Can the authorized transaction be executed and reconciled reliably?

A KeeperHub reference may identify a caller's logical execution request. It must not decide whether an economic obligation exists.

## Questions every reviewer must answer

1. Is this a real KeeperHub platform seam or merely application state that belongs in callers like Tender?
2. Does existing `Idempotency-Key` plus durable `executionId` already solve enough of the problem that this feature would be redundant?
3. Is exact-request binding actually useful after 24 hours, or would callers legitimately need the same reference to be rebound to a corrected request?
4. Is organization-scoped uniqueness the right boundary? Should route/action type also participate in the unique key?
5. Should the reference attach directly to `directExecutions`, or should a separate binding table exist to avoid polluting the audit row?
6. What is the retention contract? Does reference lifetime automatically inherit execution-retention lifetime?
7. Which write routes form a coherent v1? Transfer only, all direct EVM writes, or all value-moving direct executions?
8. Could storing a caller reference leak sensitive business identifiers into logs/status surfaces? What validation/redaction is required?
9. What race remains if two callers concurrently send the same reference with different bodies?
10. Can the feature be additive without changing existing response semantics or introducing a dangerous new retry pattern?
11. Is there an existing open issue, PR, branch, internal-looking feature, or hackathon submission that makes this duplicate or too crowded?
12. What is the smallest version a KeeperHub maintainer could reasonably merge before the hackathon deadline?

## Reviewer-specific prompts

### Claude — maintainer / mergeability attack

Act as a skeptical KeeperHub maintainer. Assume you do not want another abstraction unless it removes repeated real integration code. Review the candidate for semantic duplication with idempotency, migration cost, atomicity, retention, API surface creep and maintenance burden. Identify the smallest acceptable scope or say `DO NOT FILE` if the abstraction belongs in clients. Search for hidden coupling with direct-execution reservation, reconciliation, spend caps, status responses and organization isolation. Do not reward novelty. Return:

- fatal objections;
- non-fatal objections;
- required evidence before filing;
- smallest mergeable scope;
- final verdict: FILE / REVISE / DO NOT FILE.

### Gemini — API / schema / migration attack

Act as an API and data-model reviewer. Focus on naming, uniqueness boundaries, backward compatibility, database schema, retention, query/index shape, route semantics, privacy/redaction, and concurrency. Compare exact-request binding versus a route-specific canonical effect fingerprint. Model at least four edge cases: concurrent same reference/same body, concurrent same reference/different body, corrected work after a settled execution, and API-key rotation. Return:

- recommended schema;
- API shape;
- migration risks;
- concurrency invariants;
- compatibility risks;
- final verdict: FILE / REVISE / DO NOT FILE.

### Grok — adversarial uniqueness / duplicate attack

Act as a hostile hackathon competitor and open-source issue triager. Try to prove the feature is not unique or not useful. Search KeeperHub issues/PRs and current submissions for equivalents under different names (`runKey`, intent, external id, correlation id, business id, request id, dedup key, effect id). Compare it with #2495 and existing idempotency/recovery work. Also attack Tender's differentiation: explain exactly how current projects could make Tender look like a clone. Return:

- closest duplicates;
- crowded claims we must not make;
- real remaining white space, if any;
- what proof would make the bounty credible;
- final verdict: FILE / REVISE / DO NOT FILE.

## Synthesis rule

Do not majority-vote the models. A single evidence-backed fatal objection wins. For disagreements:

1. prefer source/reproduction evidence over model intuition;
2. prefer a smaller KeeperHub-native primitive over a Tender-specific abstraction;
3. reject any scope that changes locked Tender semantics;
4. reject any feature already claimed by an accepted KeeperHub issue;
5. only file after the final upstream overlap search is clean.

## Expected next artifact

After the three reviews, create `docs/EXTERNAL-LLM-CRITIQUE-SYNTHESIS.md` containing:

- each objection and whether evidence supports it;
- candidate changes accepted/rejected;
- final feature name and exact v1 scope;
- final KeeperHub Reason / Scope / Plan issue draft;
- explicit FILE / REVISE / DROP decision.

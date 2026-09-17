# KeeperHub Bounty — External Review Packet

Date: 2026-09-17
Status: ready for independent review; no KeeperHub issue filed

## Reviewer instruction

Act as an adversarial reviewer. Do not optimize for agreement. Find reasons this feature should **not** be accepted, hidden overlap with existing KeeperHub work, API/schema mistakes, unsafe semantics, and a smaller or better-shaped alternative.

Do not assume hackathon novelty is enough. Judge whether KeeperHub maintainers could merge and support the feature.

## Context

Tender is a live hackathon project using KeeperHub as the value-moving settlement executor. Tender's business primitive is a deterministic Claim created from accepted work under a precommitted policy. The canonical Tender proof already settled one real Claim through KeeperHub on Base Sepolia and independently verified the chain receipt.

Tender must stay one layer above KeeperHub:

`accepted work -> economic obligation identity -> authorization -> KeeperHub execution -> receipt`

The bounty feature must therefore be generic KeeperHub infrastructure, not Tender business logic.

## KeeperHub contribution constraint

KeeperHub requires:

`issue -> Reason / Scope / Plan -> maintainer accepted label -> code -> tests -> PR to staging`

No implementation should begin before `accepted`.

## Observed platform facts from current KeeperHub staging

1. Direct execution creates a durable `directExecutions` audit row with organization, API key, type, network, redacted input and lifecycle state.
2. Completion persists transaction hash, independently verified receipts, gas/cost fields, output, error and completion time.
3. `GET /api/execute/{executionId}/status` is keyed by KeeperHub's generated execution ID; there is no caller-defined durable lookup reference in the current status contract.
4. `checkAndReserveExecution` atomically creates the direct-execution row at the same transaction boundary that reserves value against spending caps.
5. All main direct write surfaces converge on this reservation helper: transfer, contract-call, check-and-execute, generic node execution, and protocol actions.
6. KeeperHub has separate idempotency records keyed by organization + scope + Idempotency-Key + deterministic request hash.
7. Completed/failed idempotency records expire after 24 hours.
8. Idempotency correctly distinguishes same-body replay, conflicting body and in-progress work. It is transport/retry safety.

## Recurrence evidence

Several independent integrations create their own longer-lived logical identity above KeeperHub:

- Tender: long-lived Claim ID -> KeeperHub execution -> Tender Receipt.
- Landed: caller `reference` -> deterministic KeeperHub idempotency/evidence mapping.
- FINALTab: durable settlement-intent state and replay/crash recovery.
- KeeperHub issue #2495: proposed `runKey` to identify payout legs across separate workflow executions.

The hypothesis is not "KeeperHub idempotency is broken." The hypothesis is:

> A logical execution reference often needs to outlive transport idempotency, and integrations repeatedly rebuild that mapping themselves.

## Candidate feature

Working concept: **Effect-Bound Execution Reference**.

Potential public name is undecided: `reference`, `executionReference`, `externalReference`, or `effectReference`.

Proposed semantics:

- Caller may attach an optional durable reference to a value-moving direct execution.
- Reference is unique per organization, not per API key.
- KeeperHub binds that reference to the exact request/effect identity and the created execution.
- Same reference + same bound request/effect later => resolve the original execution/proof; do not broadcast again.
- Same reference + changed bound request/effect => typed conflict; do not broadcast.
- Status exposes the caller reference.
- A read-only lookup can resolve reference -> execution.
- Existing `Idempotency-Key` remains unchanged and keeps its 24-hour replay window.
- KeeperHub does not interpret invoices, accepted work, payroll, tasks or economic obligations.

## Mergeability bias

Prefer the smallest version that proves durable reference semantics:

- exact-request binding first;
- do not invent a universal cross-route semantic effect canonicalizer in v1;
- use the existing deterministic request-hash machinery or an equivalent stable hash excluding the reference metadata itself;
- reserve reference atomically with the direct execution row;
- use organization scope so key rotation does not break the mapping;
- apply the primitive consistently at the shared direct-execution layer rather than creating route-specific semantics.

## Known overlap / no-go areas

Do not collapse this into any of these active ideas:

- #2495 partial payout resume / `web3/disburse`
- #2395 receipt export
- #2503 verify executed call against caller expectation
- #2398 permission cards
- #2318 multi-model consensus node
- #2479 generic EVM sign-and-hold
- simulation/preflight firewall work
- framework connectors
- Merkle audit trail
- generic cross-chain message status

Searches for the exact candidate terms `execution reference`, `executionReference`, `effectReference`, `effect reference`, `external reference`, `business reference`, and `intentId` found no direct open/closed issue or PR match as of 2026-09-17. That is not proof of non-overlap; reviewers should search conceptually too.

## Questions every reviewer must answer

1. Is this a real platform primitive or merely "idempotency with a longer TTL" under another name?
2. What semantic distinction makes it worth a separate contract?
3. Is exact-request binding sufficient, or would it make the feature too brittle to be useful?
4. Should the reference be a body field, header, MCP argument, or some combination?
5. Should the lookup be a dedicated endpoint or an additive query parameter?
6. Is organization-wide uniqueness correct, or should scope include execution type / route?
7. What happens to reference identity if direct-execution audit rows are eventually purged?
8. Are failed pre-broadcast executions allowed to permanently consume a reference? Why or why not?
9. How should `unconfirmed` outcomes behave? The safe default should be to keep the binding and never permit a second broadcast while outcome is unknown.
10. Does applying this across all direct write surfaces make one coherent feature, or should the first issue be narrower?
11. What tests are necessary to prove concurrent same-reference requests cannot double-broadcast?
12. What existing KeeperHub feature / issue / PR makes this redundant?
13. Would you merge this if it were not attached to a hackathon? If not, why?

## Model-specific task

### Claude — maintainer / mergeability reviewer

Focus on KeeperHub contributor policy, one-change scope, shared abstractions, migration blast radius, concurrency safety, compatibility, tests, and whether a maintainer would prefer a different seam. Return: blockers, scope reductions, required evidence, then a suggested Reason/Scope/Plan outline.

### Gemini — API / data-model reviewer

Focus on schema, uniqueness constraints, request hashing, status/lookup API shape, MCP/REST parity, retention, versioning, backward compatibility and failure semantics. Return: a proposed minimal contract, edge cases, and migration/test matrix.

### Grok — adversarial uniqueness reviewer

Search conceptually for duplicates in KeeperHub issues/PRs and current hackathon submissions. Attack the novelty claim. Identify adjacent submissions that already solve the user-level problem and explain what, if anything, remains platform-generic and distinct. Return: duplication risks, competitor map, and the narrowest defensible differentiation.

## Decision rule after reviews

Proceed to an upstream issue only if all are true:

- the user problem remains real after critique;
- no existing issue/PR already owns the same change;
- the feature is smaller than the workaround burden it removes;
- the semantics are distinct from the 24-hour transport idempotency contract;
- unknown outcomes fail closed;
- implementation can be described as one coherent change;
- Tender remains only evidence/consumer, not embedded business logic.

Otherwise discard the candidate and return to the intelligence map for a new one.
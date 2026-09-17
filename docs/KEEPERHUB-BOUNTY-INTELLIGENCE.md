# KeeperHub Bounty & Competitive Intelligence

Date: 2026-09-17
Status: research in progress — no upstream KeeperHub issue filed yet

## Objective

Run a separate intelligence workstream beside Tender's main-track product work:

1. identify recurring KeeperHub user pain from current issues and integrations;
2. compare adjacent execution / automation products for reusable mechanisms;
3. inspect prior winners and current hackathon submissions for crowded ideas;
4. preserve Tender's unique product thesis;
5. find one small, mergeable, genuinely useful KeeperHub feature for the separate bounty BUIDL.

This workstream must not destabilize Tender's already verified settlement/runtime path.

## Upstream contribution rule

KeeperHub's current contributor policy requires an issue before behavior-changing code. The issue must state Reason, Scope and Plan. Coding starts only after maintainers apply the `accepted` label, and the accepted plan — including any maintainer edits — is the implementation contract. Pull requests target `staging` and reference the accepted issue.

Therefore the bounty sequence is:

`RESEARCH -> OVERLAP CHECK -> ISSUE (Reason/Scope/Plan) -> WAIT FOR accepted -> IMPLEMENT -> TEST -> PR -> SEPARATE BUIDL`

Do not open a speculative PR first.

## What previous KeeperHub winners teach us

KeeperHub's OpenAgents review covered all 180 submissions. The strongest signal was not visual polish; it was whether KeeperHub could merge, adopt, or build on the work directly.

Patterns to preserve:

- production seriousness and reproducible evidence;
- reusable platform primitives rather than one-off wrappers;
- real activity / live proof rather than a single mocked happy path;
- failure-mode thinking and explicit refusal states;
- tests as product evidence;
- feedback grounded in a real integration.

Examples cited by KeeperHub:

- Tradewise Agentlab: live x402 + KeeperHub flows, 125 tests, reproducible issue reports.
- Keeper-Gate: framework-agnostic core with thin LangChain / ElizaOS / OpenClaw adapters.
- ZW.ARM: live Base activity plus an independent critique agent before execution.
- Later Agents Onchain signal: n8n-nodes-keeperhub was adopted upstream by n8n; KeeperHub reports 64 PRs landed during that event.

## Current submission map — crowded territory

### Landed

Uses KeeperHub inside Lucid Agents. Strong on `simulate -> broadcast -> verified receipt`, stable references, idempotency, x402 settlement and proof. Conclusion: **verified landing + reference-based retry alone is not unique enough for Tender**.

### Nyrvok

Wayfinder route ingestion, sequential preflight simulation, invariant guard, KeeperHub execution, Base receipt confirmation and ERC-8004 reputation telemetry. Conclusion: **do not turn Tender into another simulation / execution firewall**.

### FINALTab

Strong settlement intent, deterministic allocation/netting, review stages, frozen ledger, external-wallet consent, KeeperHub execution, independent chain verification and crash/replay recovery. Conclusion: **generic durable settlement intent + public proof is already crowded**.

### Gavel

Focuses on detecting executable Safe transactions with a pure decision function and named refusal outcomes. The useful lesson is methodological: measure false positives, distinguish live-observed claims from test-covered claims, and make refusal states first-class.

### AgentKeeper-MCP

Guarded MCP execution gateway with dry-run, idempotency, x402, Merkle audit, multi-chain budgeting and an upstream KeeperHub PR. Conclusion: **do not compete on generic guarded gateway / Merkle audit framing**.

## Recurring KeeperHub problems found in current issues

The issue corpus shows several repeated families rather than isolated bugs.

### 1. Durable execution identity, replay and ambiguous outcomes

Examples:

- #2495: a partially failed payout run cannot safely resume; rerunning may pay a settled leg again.
- #1840: reusing an idempotency key can replay a stale failure after the chain precondition has changed.
- #2373: a held idempotency record can outlive the moment a reconciler proves a definite failure.
- #2211: For Each could continue downstream after an iteration failure.

Signal: transport idempotency and business-level identity are not the same problem.

### 2. Simulation fidelity

Examples include sequential state propagation, cleared storage slots, transport errors being confused with reverts, and workflow nodes being simulated independently of prior writes.

Signal: high value, but very crowded and technically broad. **Not the current bounty direction.**

### 3. Proof, receipts and execution interpretation

Examples:

- #2395: bounded direct-execution receipt export.
- #2503: verify the executed call matched the expected chain / contract / function.
- #2428: expose the acting wallet for sponsored execution.
- #2408: a softened write error can disappear at execution-level status.

Signal: developers need more than a transaction hash; they need evidence with the right semantics. Several obvious versions are already filed.

### 4. Machine-readable schemas and agent discoverability

Examples include missing units, advertised output paths that do not exist at runtime, missing direct-execution capability flags, undocumented simulate response shapes, manual inputSchema friction, and misleading template errors.

Signal: agents fail when a platform's semantic contract is implicit even if the raw API works.

### 5. Trigger liveness / observability

State-threshold, trace triggers, silent event-registration failure and invisible event firing rates all recur.

Signal: meaningful but large/crowded for this deadline.

### 6. Authorization clarity

Missing signer routing can validate cleanly; there is also an active proposal for a generic EVM sign-and-hold primitive.

Signal: do not duplicate generic human-approval / permission-card / hold work.

## Adjacent platform lessons

The useful mechanisms from KeeperHub-like products are architectural, not features to copy wholesale.

- Chainlink Automation / CRE: separate deterministic upkeep execution from arbitrary agent reasoning; liveness/funding are explicit.
- OpenZeppelin Relayer: current issues around nonce drift, stale receipts and submission statuses show that transaction-state ambiguity is an industry problem, not a KeeperHub-only bug.
- OpenZeppelin Monitor / Hypernative: keep detection distinct from execution; machine-to-machine alert context and retry semantics matter.
- Almanak: strategy simulation and human gates belong above the execution plane.
- Orbs / AVS-style systems: multiple independent checks can improve trust, but are much heavier than this bounty needs.

A recurring adjacent-system lesson is: **never derive business truth from a transient transport state**.

## Tender uniqueness guardrail

Tender must remain one layer above KeeperHub:

`ACCEPTANCE EVIDENCE -> ECONOMIC OBLIGATION IDENTITY -> AUTHORIZATION -> KEEPERHUB EXECUTION -> RECEIPT / CHAIN PROOF`

Tender answers:

> Does this accepted work create this exact economic obligation, and has that exact obligation been discharged?

KeeperHub answers:

> Can this transaction be executed and reconciled reliably?

Therefore Tender must not be reframed as generic merge-to-pay, generic settlement verification, a simulator, a relayer, a bounty marketplace, or another execution firewall.

The durable differentiator remains:

- policy precedes acceptance;
- acceptance creates an obligation only under that policy;
- the obligation has deterministic economic identity;
- changing economics creates a different Claim requiring new acceptance;
- settled history is immutable.

## Bounty whitespace candidate — provisional

### Working name: Effect-Bound Execution Reference

Problem hypothesis:

KeeperHub's idempotency mechanism is excellent transport safety, but it is time-bounded and scoped to an execution request. Integrations repeatedly invent a longer-lived domain reference (`reference`, `runKey`, settlement intent, claim id) outside KeeperHub so they can answer: "which execution discharged this logical piece of work?"

Potential minimal feature:

- optional caller-supplied `reference` on value-moving direct execution;
- durable `(organization, reference)` binding to a canonical effect fingerprint and `executionId`;
- same reference + same effect => return / resolve the original execution and proof;
- same reference + different effect => fail closed with a typed conflict;
- expose reference in execution status and a read-only lookup-by-reference surface;
- do not interpret invoices, accepted work, payroll, bounties or obligations inside KeeperHub.

Why it may be useful:

- Tender has a long-lived Claim identity that should outlive a 24-hour retry cache;
- Landed independently uses a stable external `reference`;
- FINALTab maintains durable settlement-intent state;
- #2495 proposes a `runKey` specifically to identify payout legs across executions.

These independent implementations suggest a generic platform seam: **logical effect identity can outlive request idempotency**.

### Current validation status

- No open or closed KeeperHub issue was found using the exact terms `external reference`, `business reference`, or `intentId`.
- Direct execution already persists execution status, input/output, transaction hash/receipts, retry count and network.
- KeeperHub maintains a separate idempotency record keyed by organization + scope + idempotency key + request hash with expiry.
- Source-level feasibility inspection is now complete enough to draft a bounded issue; a final PR/issue-name overlap sweep and maintainer critique are still required before filing.

### Source-level validation — 2026-09-17

KeeperHub `staging` was inspected directly at the direct-execution boundary.

Observed architecture:

- `app/api/execute/_lib/execution-service.ts` creates a durable `directExecutions` row with organization, API key, execution type, network, redacted input and lifecycle status; it later persists transaction hash, independently verified receipts, gas/cost fields, output, error and completion time.
- `app/api/execute/[executionId]/status/route.ts` returns the execution by internal `executionId` and organization. Its public status contract currently has no caller-defined durable reference.
- `app/api/execute/_lib/spending-cap.ts` creates the direct-execution row atomically inside the value-cap reservation transaction. That is the correct concurrency boundary if a future reference must be reserved before value can move.
- `lib/idempotency.ts` already provides organization + scope + key + deterministic request-hash conflict semantics, but completed/failed records expire after **24 hours**. It is intentionally transport/retry safety, not durable domain identity.
- The transfer route reserves idempotency before cap reservation/broadcast, and its idempotency hash is based on the request body. Replays and conflicting bodies are already typed and fail closed.

This validates the core distinction:

`Idempotency-Key = short-lived safe retry identity`

`Execution Reference = durable logical execution identity`

A useful bounty feature should **compose with** existing idempotency rather than replace or extend its TTL globally.

### Likely minimal implementation seam

The smallest credible shape is now:

1. Add an optional `reference` (final name still subject to upstream naming review) to value-moving direct-execution requests.
2. Persist it with a deterministic request/effect hash at the direct-execution reservation boundary.
3. Enforce uniqueness at organization scope so concurrent callers cannot bind the same reference twice.
4. On an existing reference:
   - same bound effect/request => resolve the existing execution instead of broadcasting;
   - changed effect/request => typed conflict and no broadcast.
5. Surface `reference` on execution status and provide a read-only lookup path or query form.
6. Keep existing 24-hour `Idempotency-Key` semantics unchanged.

### Design questions to settle before filing

- **Name:** `reference`, `executionReference`, or `effectReference`. Avoid `intentId` if it suggests KeeperHub owns business intent semantics.
- **Fingerprint semantics:** reusing the existing deterministic request hash is maximally mergeable but binds transport-level fields too. A separate canonical effect hash is semantically cleaner but increases route-specific normalization scope.
- **API surface:** dedicated `GET .../by-reference/{reference}` vs a query parameter on the existing status surface.
- **Retention:** direct-execution rows appear to be the durable audit record; confirm maintainers are comfortable with reference lifetime matching that record rather than inventing a second TTL.
- **Routes in v1:** transfer only is smaller but may look product-specific; all value-moving direct-execution routes are more reusable but widen the change. Ask maintainers before coding.

Current bias for mergeability: start with **exact-request binding** rather than claiming a universal cross-route semantic effect canonicalizer. The user value is durable correlation and conflict safety; a richer effect normalizer can follow separately if KeeperHub wants it.

### Important boundary

This feature must not absorb Tender's semantics. KeeperHub would bind a caller's reference to an **execution effect/request**. Tender remains responsible for deciding whether the underlying **economic obligation exists**.

## Explicit no-go list for bounty ideation

Do not file another version of:

- partial payout resume / `web3/disburse` (#2495);
- generic preflight firewall or sequential simulator;
- receipt export (#2395);
- direct-call verification (#2503);
- permission / generative cards (#2398);
- multi-model consensus node (#2318);
- chain-agnostic sign-and-hold (#2479);
- generic framework adapter / connector unless a real unserved framework is proven;
- generic Merkle audit trail;
- generic cross-chain status;
- another protocol integration simply because it is easy.

## External LLM review plan

Before an upstream issue is filed, prepare one evidence packet and ask independent models to attack it from different angles:

- Claude: maintainer/reviewer critique — scope, mergeability, hidden coupling.
- Gemini: API/schema critique — compatibility, data model, migration and DX.
- Grok: adversarial uniqueness critique — find duplicates, competing submissions and obvious objections.
- Final synthesis: keep only claims supported by source/reproduction evidence.

Status: **planned, not yet executed in this chat**. No direct Claude/Gemini/Grok connector is currently available here, so do not represent an external-model review as completed until outputs are actually obtained.

## Next gate

1. Repeat open/closed KeeperHub issue and PR overlap search with the final candidate names (`executionReference`, `effectReference`, `reference lookup`, `durable reference`).
2. Draft a KeeperHub issue in required Reason / Scope / Plan form using Tender plus independent current integrations as evidence that the need recurs.
3. Prepare the external-LLM critique packet and run it outside this chat if necessary.
4. Incorporate only evidence-backed criticism.
5. File only if the overlap check remains clean.
6. Wait for `accepted` before implementing any KeeperHub code.

Tender main-track runtime stays locked while this research proceeds.
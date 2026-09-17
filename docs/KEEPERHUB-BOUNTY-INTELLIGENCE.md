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

KeeperHub's contributor policy requires an issue before behavior-changing code. The issue must state Reason, Scope and Plan. Coding starts only after maintainers apply the `accepted` label, and the accepted plan — including maintainer edits — becomes the implementation contract. Pull requests target `staging` and reference the accepted issue.

Sequence:

`RESEARCH -> OVERLAP CHECK -> ISSUE (Reason/Scope/Plan) -> WAIT FOR accepted -> IMPLEMENT -> TEST -> PR -> SEPARATE BUIDL`

Do not open a speculative PR first.

## Current hackathon signal

KeeperHub's current public Agent Economy framing is unusually explicit: the main track prefers KeeperHub integrated into a live project/product rather than another standalone demo, while the separate feature bounty rewards something KeeperHub can merge.

Implication for Tender:

- the main-track proof should be attached to a real existing workstream/product context rather than presented as an isolated payment demo;
- the bounty work should optimize for upstream usefulness and mergeability, not for Tender-specific cleverness;
- these are two parallel workstreams and should remain separately packaged.

## What previous KeeperHub winners teach us

KeeperHub says it reviewed all 180 ETHGlobal Open Agents submissions. The strongest winner signal was production seriousness and downstream usefulness rather than surface polish.

Patterns to preserve:

- production seriousness and reproducible evidence;
- reusable platform primitives rather than one-off wrappers;
- real activity / live proof rather than a single mocked happy path;
- failure-mode thinking and explicit refusal states;
- tests as product evidence;
- feedback grounded in a real integration.

Examples cited by KeeperHub:

- Tradewise Agentlab: live x402 + KeeperHub flows, 125 tests, reproducible issue reports.
- Keeper-Gate: framework-agnostic core with thin framework adapters.
- ZW.ARM: live Base activity plus an independent critique agent before execution.
- Later Agents Onchain signal: n8n-nodes-keeperhub was adopted upstream by n8n; KeeperHub says 64 PRs landed during that event.

This reinforces one rule: **a feature that maintainers can reuse is strategically stronger than a flashy wrapper around an existing route.**

## Current submission map — crowded territory

### FINALTab

Deterministic receipt allocation/netting, review stages, frozen ledger, external-wallet consent, KeeperHub execution, independent chain verification and crash/replay recovery.

Conclusion: **generic durable settlement intent + consent + proof + replay recovery is already crowded.**

### AgentKeeper-MCP

Guarded MCP transaction gateway with dry-run, idempotency, x402, Merkle audit, multi-chain controls and an upstream KeeperHub contribution.

Conclusion: **do not compete on generic gateway / Merkle audit / bounded execution framing.**

### Landed

Strong on `simulate -> broadcast -> verified receipt`, stable references and recovery semantics.

Conclusion: **verified landing + a stable external reference alone is not enough to make Tender unique.**

### Nyrvok

Sequential preflight, invariant guard, KeeperHub execution and execution telemetry.

Conclusion: **do not turn Tender into another simulation / execution firewall.**

### Gavel-style refusal systems

Pure decision functions, named refusal outcomes and empirical false-positive reduction are useful methodological patterns.

Conclusion: keep refusal states explicit, but Tender should not become a generic transaction classifier.

## Recurring KeeperHub problems found in current issues

The issue corpus shows repeated families rather than isolated bugs.

### 1. Durable execution identity, replay and ambiguous outcomes

Examples:

- #2495: a partially failed payout run cannot safely resume; rerunning can repay a settled leg.
- #1840: a reused idempotency key can replay a stale failure after chain preconditions change.
- #2373: a held idempotency record can outlive the point where reconciliation proves a definite failure.
- direct-execution docs now explicitly warn that the 24-hour replay window expires and the same key can execute again afterwards.

Signal: **transport idempotency and long-lived logical work identity are different concerns.**

### 2. Ambiguous status and proof semantics

Examples:

- #2408: a softened write error can disappear at execution-level status.
- #2428: sponsored execution can make the explorer sender misleading unless the acting address is surfaced.
- #2395: integrations want bounded portable receipt evidence.
- KeeperHub's own recovery docs distinguish `completed` from independently verified successful receipt evidence.

Signal: transaction hash, execution status and business completion are separate layers. Tender should continue to make this separation visible.

### 3. Simulation fidelity

Current issues cover sequential state propagation, cleared storage slots, transport errors being confused with reverts, and workflow nodes simulated independently of earlier state changes.

Signal: high value but crowded and technically broad. **Not the current bounty direction.**

### 4. Machine-readable contracts for agents

Examples include:

- missing units in action schemas;
- advertised output paths that do not exist at runtime;
- missing direct-execution capability flags;
- undocumented simulate response shape;
- template rendering inconsistencies;
- direct protocol actions that look callable but 501 at runtime.

Signal: agent systems fail when semantics are implicit even when the raw API technically works.

### 5. Trigger liveness / observability

State thresholds, trace triggers, event registration visibility and event-rate previews recur.

Signal: useful but large/crowded for this deadline.

### 6. Authorization clarity

Missing signer routing, permission-card proposals and sign-and-hold work show repeated demand for explicit authority boundaries.

Signal: do not duplicate generic human approval. Tender's authority model should remain domain-specific: acceptance -> obligation -> explicit settlement authorization.

## Lessons from adjacent KeeperHub-like systems

KeeperHub itself groups its landscape around Chainlink Automation, OpenZeppelin Defender/Relayer, Hypernative, Almanak, Orbs and Ava Protocol. That comparison is vendor-authored and therefore not neutral, but it is still useful for identifying mechanism boundaries.

### Chainlink Automation / deterministic keepers

Useful mechanism: deterministic, bounded execution separate from open-ended agent reasoning.

Tender implication: keep policy, acceptance and settlement rules deterministic and inspectable even if AI helps with intake or analysis.

### OpenZeppelin Relayer / Defender successor path

Useful mechanism: explicit nonce, transaction-state and recovery discipline. Industry-wide relayer problems around stale receipts, unknown outcomes and retry safety reinforce KeeperHub's own issue pattern.

Tender implication: never translate a transport failure into a business truth such as `not paid` unless the settlement outcome is actually known.

### Hypernative / OpenZeppelin Monitor

Useful mechanism: detection and execution are separate planes.

Tender implication: acceptance evidence should remain separate from settlement execution; the executor should not be allowed to redefine why money is owed.

### Almanak

Useful mechanism: strategy simulation and human approval gates live above the execution plane.

Tender implication: Tender can own economic-policy review and authorization while KeeperHub remains the executor.

### Orbs / AVS-style systems

Useful mechanism: independent validators can improve trust in high-value actions.

Tender implication: useful for future high-assurance modes, but too heavy for the current bounty. Tender's existing independent chain verification already gives a simpler second source of truth.

### Common adjacent-system law

**Never derive durable business truth from a transient transport state.**

This is now a canonical design principle for Tender.

## Mechanisms worth adopting into Tender without copying competitors

These mechanisms strengthen Tender while preserving its own category:

1. **Authority separation:** keep acceptance, obligation creation, settlement authorization and execution as separate named stages.
2. **Explicit non-terminal states:** unknown/unconfirmed must never be presented as failed or settled.
3. **Independent proof:** KeeperHub's response is operational evidence; onchain verification remains independent evidence.
4. **Stable domain identity:** the Tender Claim remains the long-lived economic identity, separate from execution IDs and transport retry keys.
5. **Poll/recovery discipline:** public proof can show exactly which states are terminal and which require more evidence.
6. **Live-product binding:** add at least one real acceptance adapter from an existing product/workstream so Tender demonstrates economic clearing in context, not only as an isolated demo.

Do not copy generic permission cards, generic audit exports, generic simulation dashboards or generic transaction relays. Translate useful mechanics into Tender's domain-native clearing model.

## Tender uniqueness guardrail

Tender remains one layer above KeeperHub:

`ACCEPTANCE EVIDENCE -> ECONOMIC OBLIGATION IDENTITY -> AUTHORIZATION -> KEEPERHUB EXECUTION -> RECEIPT / CHAIN PROOF`

Tender answers:

> Does this accepted work create this exact economic obligation, under which policy, and has that exact obligation been discharged?

KeeperHub answers:

> Can this authorized transaction be executed and reconciled reliably?

Therefore Tender must not be reframed as generic merge-to-pay, generic settlement verification, a simulator, a relayer, a bounty marketplace or another execution firewall.

Durable differentiator:

- policy precedes acceptance;
- acceptance creates an obligation only under that policy;
- the obligation has deterministic economic identity;
- changing economics creates a different Claim requiring new acceptance;
- settled history is immutable;
- corrections create linked new claims rather than mutating settled history.

## Bounty whitespace candidate — provisional

### Working name: Effect-Bound Execution Reference

Problem hypothesis:

KeeperHub's idempotency mechanism is strong transport safety but time-bounded. Integrations repeatedly invent longer-lived caller state (`reference`, `runKey`, settlement intent, claim ID) so they can answer which execution discharged a logical piece of work.

Potential minimal feature:

- optional caller-supplied durable reference on value-moving direct execution;
- durable organization-scoped binding to a deterministic exact-request/effect fingerprint and execution ID;
- same reference + same bound request/effect -> resolve original execution/proof;
- same reference + changed bound request/effect -> typed conflict, no broadcast;
- expose reference in status and a read-only lookup path;
- leave existing 24-hour `Idempotency-Key` semantics unchanged;
- do not interpret invoices, work acceptance, payroll, bounties or obligations inside KeeperHub.

### Why the need may be real

- Tender needs Claim identity to outlive retry cache duration.
- #2495 independently proposes `runKey` across executions for payout recovery.
- FINALTab independently persists a settlement-intent journal.
- Landed uses stable external references around execution/recovery.

These are independent reimplementations of a similar seam: **logical effect identity can outlive request idempotency**.

### Source-level validation

KeeperHub `staging` direct execution was inspected directly:

- `directExecutions` is the durable organization-scoped audit record;
- status lookup is by internal execution ID and has no caller-defined durable reference;
- the direct-execution row is created atomically at the value-cap reservation boundary;
- idempotency already provides deterministic request-hash conflict behavior;
- completed/failed idempotency records are replayable for 24 hours, then expire;
- direct write routes reserve idempotency before state-changing work.

Core distinction:

`Idempotency-Key = short-lived safe retry identity`

`Execution Reference = durable caller-owned logical execution identity`

The proposed feature must compose with idempotency rather than extend its TTL globally.

### Final overlap sweep — 2026-09-17

Open/closed KeeperHub issue and PR searches were repeated for:

- `execution reference`
- `effect reference`
- `durable reference`
- `reference lookup`

No direct duplicate was found. Search results did return related recovery/idempotency work, so the candidate is **not yet cleared for filing**; semantic overlap still needs independent critique.

### Likely minimal implementation seam

1. Optional `reference`/`executionReference` on a bounded set of direct write routes.
2. Persist it with deterministic exact-request hash at the direct-execution reservation boundary.
3. Organization-scoped uniqueness.
4. Existing same reference + same request -> resolve original execution.
5. Existing same reference + different request -> typed conflict.
6. Additive status field and one read-only lookup path.
7. Keep current idempotency behavior and TTL unchanged.

Current mergeability bias: **exact-request binding in v1**, not a universal semantic effect canonicalizer.

### Open design questions

- final name: `reference`, `executionReference`, or `effectReference`;
- whether route/action type participates in uniqueness scope;
- direct column vs separate binding table;
- lookup route shape;
- retention semantics;
- transfer-only v1 vs all value-moving direct-execution routes;
- validation/redaction rules to prevent sensitive caller references from leaking into logs.

## Explicit no-go list

Do not file another version of:

- #2495 partial payout resume / `web3/disburse`;
- generic sequential simulation or preflight firewall;
- #2395 receipt export;
- #2503 direct-call verification;
- #2398 permission/generative cards;
- #2318 multi-model consensus node;
- #2479 chain-agnostic sign-and-hold;
- generic framework adapter;
- generic Merkle audit trail;
- generic cross-chain status;
- a random protocol integration chosen only because it is easy.

## External LLM review gate

A ready-to-use critique packet now exists at:

`docs/EXTERNAL-LLM-CRITIQUE-PACKET.md`

Planned roles:

- Claude: KeeperHub maintainer / mergeability attack.
- Gemini: API/schema/migration/concurrency attack.
- Grok: adversarial uniqueness / duplicate / competing-submission attack.

The plugin directory was checked in this ChatGPT session and no direct Claude/Gemini/Grok provider integration surfaced. Therefore no external-model review is being represented as complete here.

Synthesis rule: a single evidence-backed fatal objection beats majority agreement. Do not average model opinions.

## Next gate

1. Run the external LLM packet.
2. Record outputs in `docs/EXTERNAL-LLM-CRITIQUE-SYNTHESIS.md`.
3. Accept only evidence-backed scope changes.
4. Draft the final KeeperHub Reason / Scope / Plan issue.
5. Re-run one last upstream issue/PR overlap check immediately before filing.
6. File only if still distinct.
7. Wait for `accepted` before implementing any KeeperHub code.

Tender main-track runtime stays locked while this research proceeds.
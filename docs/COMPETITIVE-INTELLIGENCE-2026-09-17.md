# Tender Competitive & KeeperHub Bounty Intelligence — 2026-09-17

Status: **active intelligence workstream — no bounty implementation started**

This document preserves the research state used to differentiate Tender, identify reusable ideas from adjacent execution/workflow platforms, and find a KeeperHub bounty contribution that is useful upstream without weakening Tender's main-track product thesis.

## Locked product boundary

Tender remains the **economic clearing layer for accepted work**.

- Acceptance proves what work was accepted.
- Tender decides whether that acceptance creates an economic obligation.
- A Tender Claim gives that obligation deterministic economic identity.
- KeeperHub executes value movement after explicit authorization.
- Tender Receipt + independent chain evidence prove discharge.
- North star: **Accepted once. Owed once. Settled once.**

Competitive research must not collapse Tender into a generic workflow orchestrator, transaction gateway, trading agent, bounty marketplace, or "pay when tx lands" wrapper.

## Hackathon / bounty constraints

The Best KeeperHub Feature bounty is a distinct upstream contribution problem, not merely deeper use of KeeperHub inside Tender.

Current rules observed on DoraHacks:

- feature should be shipped as a pull request to KeeperHub;
- examples include a chain integration, node, trigger/action, connector, or developer-experience improvement;
- judging emphasizes mergeability, value to the platform, code quality/tests, and scope/completeness;
- the bounty stacks with the main track, but a separate BUIDL is required for the bounty submission.

KeeperHub contribution policy on `staging/ISSUES.md`:

1. Search open **and closed** issues first.
2. File an issue before any behavior-changing implementation.
3. The issue must contain **Reason / Scope / Plan**.
4. Do not code until the issue carries `accepted`.
5. If maintainers replace the proposed plan in a triage comment, build the accepted plan, not the original plan.
6. PR targets `staging`, references the accepted issue, and is expected to survive the repository's tests/CI.

## Recurring pain visible in KeeperHub itself

### 1. Side effects, retries, and unknown outcomes

Strongest recurring cluster.

- #2495 — resume a partially failed payout run without re-paying settled legs.
- #2498 — direct node route can ignore a step's declared `maxRetries`, dangerous for irreversible side effects.
- #2513 — retry-budget arithmetic can outlive the intended idempotency lock window.
- #1840 — a reused idempotency key can replay a cached failure and prevent later recovery.

Interpretation: **idempotency at one API call is not enough**. The hard problem is the durable identity and outcome of the real-world effect across crash/retry/resume boundaries.

### 2. Simulation that can be confidently wrong

- #2517 — fallback sequence simulation can trace against raw state rather than earlier simulated writes.
- #2541 — slots cleared to zero can remain stale in state overrides.
- #2542 — transport failure can be presented as a reverting transaction.
- #2519 — workflow preflight needs later writes simulated against state produced by earlier writes.

Interpretation: a useful proof layer must distinguish **transaction would fail**, **execution outcome unknown**, and **our observation failed**.

### 3. Proof, reconciliation, and executed-intent verification

- #2395 — export bounded direct-execution receipt evidence as JSON.
- #2503 — verify that a direct execution matched expected chain/contract/function.
- #2428 — return the acting wallet for sponsored execution.

Interpretation: integrations need more than `success`; they need a portable, independently checkable record of **what KeeperHub actually executed** and how it maps back to caller intent.

### 4. Discoverability / schema ambiguity

- #2486 — action search does not say whether direct execution is supported.
- #2466 — action schemas can hide amount units.
- #2424 / #2514 — advertised output fields can disagree with runtime output paths.

Interpretation: machine consumers need capabilities and contracts to be explicit enough to reason about before execution.

### 5. Trigger observability

- #2491 — an event trigger that will never register can look identical to a rare trigger waiting normally.
- #2523 — firing rate can be invisible until billing starts.
- #2240 / #2464 — demand for state-threshold and trace/internal-call triggers.

Interpretation: operators need to know **why an automation will fire, did fire, or cannot fire**, before the financial consequence.

## External workflow/agent pain corroboration

Community reports around Temporal, generic automation, and agent workflows repeatedly describe the same failure pattern:

- a side effect succeeds;
- the worker crashes or loses the response;
- durable workflow state cannot prove whether reality changed;
- a retry can duplicate money movement, messages, records, or downstream actions.

Repeated remedies include stable operation IDs, persisting intent before execution, durable per-step ledgers, explicit `confirmed / no-effect / unknown` outcome states, step-scoped resume, reconciliation, and approval gates.

This validates Tender's receipt / exact-obligation identity thesis, but it also means "idempotency" by itself is not unique enough to lead the submission.

## Adjacent platforms: useful mechanisms to borrow, not copy

### Chainlink Automation / CRE

Useful mechanisms:
- explicit trigger/upkeep conditions;
- deterministic execution boundary;
- funding / liveness state visible separately from business logic.

Potential Tender translation: make settlement readiness and blocked reasons first-class, rather than a generic success/error state.

### OpenZeppelin Defender / Monitor / Relayer

Useful mechanisms:
- separation of monitoring, relaying, roles, and approvals;
- operational controls around privileged actions;
- security-first audit semantics.

Potential Tender translation: preserve a distinct authorization surface and make policy provenance visible in every Claim/Receipt.

### Gelato Functions

Useful mechanisms / lessons:
- automation logic was portable code, but product shutdown creates migration cost;
- platform lock-in hurts when execution definitions cannot be exported or reconstructed.

Potential Tender translation: Claims, Acceptance Packets, and Receipts should remain portable artifacts rather than UI-only state.

### Hypernative

Useful mechanism:
- detection is a separate discipline from response execution.

Potential Tender translation: acceptance/economic determination stays separate from KeeperHub execution; do not merge the two layers.

### Almanak

Useful mechanisms:
- strategy/decision layer separated from deterministic execution;
- backtesting / simulation;
- human approval gates.

Potential Tender translation: Tender can accept inputs from agents or humans but the Claim identity and settlement authorization remain deterministic.

### Orbs Agentic Execution / Ava Protocol

Useful mechanisms:
- verifiable/cosigned preconditions;
- explicit trust model for execution triggers.

Potential Tender translation: strengthen the provenance chain from acceptance evidence -> Claim -> authorization -> execution proof.

### Temporal / durable workflow systems

Useful mechanisms:
- durable workflow history;
- explicit replay semantics;
- activity-level retry boundaries;
- deterministic orchestration separated from side effects.

Potential Tender translation: replay is evidence, not merely a retry mechanism; unknown side-effect state must fail closed and reconcile rather than blindly execute again.

## Previous winner signal

### ETHGlobal OpenAgents / KeeperHub

KeeperHub's own post says the winning bar was whether they could **merge, adopt, or build on the work directly**; polished shallow integrations did not meet the bar.

1. Tradewise Agentlab — live deployment, 125 tests, real x402 flows, real KeeperHub paths, detailed reproducible bug reports.
2. Keeper-Gate — reusable framework-agnostic core + thin adapters for LangChain, ElizaOS, and OpenClaw.
3. ZW.ARM — real-money Base mainnet operation, 450 confirmed transactions, independent critique agent, per-user KeeperHub wallets.

Signals to preserve:
- production seriousness;
- reusable primitive/integration;
- real evidence, not mocked claims;
- explicit failure-mode thinking;
- independent critique / verification;
- deep KeeperHub use where KeeperHub is load-bearing.

## Current / recent submission overlap

### Landed — `0xsaroj001/landed`

Core: Lucid seller agent uses KeeperHub; buyer's x402 payment finalizes only when the underlying transaction is verifiably landed. Stable business `reference` is mapped into idempotency and execution proof.

Overlap risk:
- verified receipt;
- same reference does not pay twice;
- settlement tied to successful execution.

Tender distinction to defend:
- Landed answers **"did the paid entrypoint land?"**
- Tender answers **"did this accepted work create this exact economic obligation, and has that obligation already been discharged?"**

### Nyrvok — `mystiquemide/nyrvok`

Core: Wayfinder route -> KeeperHub preflight firewall -> custody execution -> independent Base confirmation -> ERC-8004 reputation.

Overlap risk:
- preflight;
- provenance-bound execution;
- independent confirmation.

Tender distinction: economic obligation identity and discharge, not route safety or slippage control.

### AgentKeeper-MCP — `Ishant5436/agent-keeper-mcp`

Core: bounded MCP execution gateway, local key sandbox, dry-run composition, x402 settlement, Merkle audit, multi-chain budgeting.

Overlap risk:
- deterministic execution guards;
- dedupe;
- audit proofs.

Tender distinction: business/economic causality above execution, not another transaction gateway.

### KeeperHub #2495

This is the most important overlap to avoid. It already proposes durable per-leg payout state so a partial payout can resume without paying settled recipients again.

**Do not propose another resumable-disbursement / per-leg exactly-once feature.**

## Current white-space hypothesis for the KeeperHub bounty

Not yet approved, not yet filed, and not yet implementation-ready:

### Business / Effect Reference bound to direct execution

Problem hypothesis:

KeeperHub has strong execution idempotency and audit records, but integrations often still need to correlate a financial/business obligation — invoice, claim, accepted task, payroll line, governance action, customer order — to the exact execution and resulting onchain effect.

Potential minimal primitive:

- caller supplies an explicit immutable `reference` / `effectReference` separate from the temporary retry/idempotency mechanism;
- KeeperHub persists it with the direct execution;
- status / receipt evidence returns it;
- optionally derive a canonical effect fingerprint from the executed effect fields;
- changed effect under the same immutable reference must fail closed rather than silently become "the same work";
- no Tender-specific semantics in KeeperHub — this stays generic infrastructure.

Why it may matter:

`business intent -> stable reference -> KeeperHub execution -> verified receipt`

This would improve causality and reconciliation for invoices, accepted work, payroll, agent jobs, treasury operations, and other integrations without duplicating #2495.

### Required gap proof before filing

Do **not** treat this hypothesis as selected until we verify current `staging` and all open/closed issues for:

- existing client/business/external reference metadata;
- execution metadata / memo fields;
- durable reference search/lookups;
- canonical effect fingerprints;
- behavior around same logical reference + changed effect;
- whether #2503 / #2395 or another issue already subsumes it.

If overlap is substantial, discard this hypothesis and choose a smaller uncovered seam.

## Main-track differentiation requirements

Tender should become **more** distinct as intelligence is incorporated:

- Above the fold: accepted work -> obligation identity -> discharge.
- Never lead with generic "safe transactions", "AI agent execution", or "idempotency" language.
- Keep Acceptance Packet, Tender Claim, and Tender Receipt visible as one causal chain.
- Show replay and changed-economics mutation as the signature proof.
- Keep independent chain verification.
- Keep operator surface write-enabled, while public proof surface stays non-value-moving.
- UI/UX redesign can be multi-page; semantics remain locked.

## External-LLM review plan

No direct Claude/Gemini/Grok connector is currently available in this ChatGPT session. Before final bounty selection and before final submission lock, use the same frozen packet with independent reviewers where available externally:

- Claude: architecture / maintainability / upstream mergeability attack.
- Gemini: competitive overlap / missing comparable products / UX and product surface critique.
- Grok: adversarial novelty / "why is this not just idempotency?" critique and current-market blind spots.
- Perplexity or equivalent: source-backed freshness check for current hackathon submissions and KeeperHub changes.

Do not merge their suggestions blindly. Record disagreements and resolve them against KeeperHub current source, the accepted issue plan, and Tender's locked product thesis.

## Decision gate

Before any new implementation:

`INTELLIGENCE -> GAP PROOF -> ONE BOUNTY HYPOTHESIS -> KEEPERHUB ISSUE -> ACCEPTED -> IMPLEMENT -> TEST -> PR -> BOUNTY BUIDL`

Main Tender runtime remains locked during this workstream unless a real bug is found.

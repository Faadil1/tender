# Tender — Competitive Winning Delta

## Goal

Tender should not win by imitating the largest current submission or by accumulating the most chains, agents, MCP tools, or DeFi protocols. KeeperHub's own retrospective makes the bar explicit: the team reviewed every project, rejected shallow integrations with polished demos, and rewarded code that looked adoptable, mergeable, production-serious, and proven under real execution.

This document converts that evidence plus the current Agent Economy field into concrete product rules.

## Winner DNA we implement — not copy

### Tradewise Agentlab

Signal: production seriousness under hackathon conditions — 125 tests, live deployment, real x402 flow, reproducible KeeperHub bug reports, and a novel ownership primitive.

Tender implementation:

- canonical live KeeperHub settlement, not a mock hero;
- domain tests plus a 10-scenario replay harness;
- runtime proof rather than screenshots only;
- explicit evidence artifacts and reproducible preflight diagnostics;
- one memorable primitive: **Tender Claim**.

### Keeper-Gate

Signal: correct abstraction boundary — reusable core separated from thin framework adapters.

Tender implementation:

- `SettlementEngine` remains source-agnostic and execution-agnostic;
- GitHub is the first acceptance adapter, not the definition of acceptance;
- KeeperHub is the execution adapter, not the business logic;
- economic identity and obligation verification live in the domain layer so future acceptance adapters can reuse them.

### ZW.ARM

Signal: real execution, measurable runtime outcomes, explicit failure-mode thinking, and independent critique before value moves.

Tender implementation:

- KeeperHub moves the canonical value;
- Tender separately proves replay refusal and failure behavior;
- the public runtime independently verifies the Base Sepolia receipt and exact USDC Transfer event instead of trusting KeeperHub's success string;
- the economic fingerprint inspector challenges the claim before any new value-moving path can exist.

### Adoptable/upstream integrations

Signal: projects such as n8n-nodes-keeperhub stood out because another ecosystem could actually adopt the work.

Tender implementation:

- documented acceptance-adapter boundary;
- machine-readable proof endpoints;
- deterministic claim identity;
- no UI-only business logic;
- an architecture that can be embedded into another live project without rewriting settlement semantics.

## Current field pressure

Visible Agent Economy projects already cover much of the obvious space:

| Project / pattern | Strong territory already occupied | Tender response |
| --- | --- | --- |
| MergeSplit | accepted GitHub PR -> deterministic reward -> KeeperHub/Superfluid | Do not compete as merge-to-pay. Tender models why an economic obligation exists and whether that exact obligation has already been discharged. |
| Landed | x402 + KeeperHub, verified landing, two idempotency layers | Keep exactly-once settlement, but make economic identity and acceptance provenance the product. |
| Nyrvok | execution firewall, dry-run gate, route verification | Do not become another execution firewall. |
| Almanak KeeperGate | intent policy gate before KeeperHub execution | Tender's policy is about obligation creation, not whether a DeFi intent may execute. |
| AgentKeeper-MCP | broad safe MCP gateway | Do not enter the MCP feature-count race. |
| KeeperSentinel / self-healing DeFi | autonomous monitoring and corrective execution | Stay outside crowded DeFi monitoring. |
| FINALTab precedent | rich settlement, consent, verification, replay | Tender must prove a different causal object: accepted work -> economic obligation -> clearing record. |

## White-space lock

Tender owns the layer between **acceptance** and **execution**.

> **What exactly became owed, why did it become owed, and has that exact obligation already been discharged?**

That creates the canonical lifecycle:

`POLICY -> WORK -> ACCEPTANCE PACKET -> TENDER CLAIM -> KEEPERHUB CLEARING -> TENDER RECEIPT`

GitHub supplies the first acceptance evidence. A separate live product should eventually supply the real work context; GitHub itself is an acceptance adapter, not the long-term live-project claim.

## Three laws

1. **Policy precedes acceptance.** Economic rules must already exist before accepted work can create an obligation. A contributor or coding agent cannot rewrite its own economics through the contribution being evaluated.
2. **Economic identity is deterministic.** Accepted work + acceptance kind + policy version + recipients + asset + amount + chain resolve to one Tender Claim. Semantically equivalent decimal formatting normalizes to the same claim.
3. **Settlement history is immutable.** A settled obligation is never rewritten. Same economics replay the settled claim. Changed economics create a new, unauthorized claim until new acceptance exists.

## Judge-facing proof stack

### 1. Acceptance Packet

Shows *why* the obligation exists:

- acceptance source;
- acceptance kind;
- accepted-work identity;
- evidence event;
- settlement policy version.

### 2. Tender Claim

Shows *what* became owed:

- deterministic claim ID;
- recipient;
- amount / asset;
- policy version;
- idempotency identity.

### 3. Tender Receipt

Shows *how* it was discharged:

- KeeperHub execution ID;
- transaction hash;
- settlement time;
- canonical receipt ID.

### 4. Independent Chain Proof

The runtime queries Base Sepolia independently and requires:

- successful transaction receipt;
- Base Sepolia USDC contract;
- ERC-20 `Transfer` event;
- exact canonical recipient;
- exact canonical amount.

KeeperHub is not trusted for this verification.

### 5. Economic Fingerprint Inspector

The judge can alter the economics safely.

- unchanged values -> **SAME CLAIM / ALREADY_SETTLED / $0 moved**;
- amount changed -> **NEW CLAIM / REQUIRES ACCEPTANCE / $0 moved**;
- recipient changed -> **NEW CLAIM / REQUIRES ACCEPTANCE / $0 moved**;
- policy changed -> **NEW CLAIM / REQUIRES ACCEPTANCE / $0 moved**.

This turns idempotency from an invisible implementation detail into a product-level proof of economic identity.

## Signature moment

**Accepted once. Owed once. Settled once.**

The judge first verifies the exact same obligation and sees a refused second settlement. Then the judge changes one economic field and sees Tender refuse to pretend it is the same obligation.

Compressed explanation:

> GitHub proves what was accepted. Tender proves what became owed. KeeperHub proves what was settled.

## Measured evidence

- canonical KeeperHub-caused Base Sepolia settlement: `0.01 USDC`;
- same canonical claim replay: `ALREADY_SETTLED`;
- additional KeeperHub executions on replay: `0`;
- additional movement: `$0`;
- replay harness: `10 settlement scenarios replayed · 0 duplicate payouts`;
- current target after economic-verifier delta: `16/16` unit/domain tests.

## Design lineage lock

- **CARI** — institutional / archival lineage and anti-AI-slop check.
- **Annual Report Gallery** — evidence hierarchy, numerical proof, document authority.
- **Study Old Ads** — compressed promise and memorable above-the-fold sentence.
- **Spectrum UI** — mechanisms only, not aesthetic imitation.
- **Motion & Interaction Grammar** — motion explains state transitions; reduced-motion parity required.
- **Design Engineer Tools** — capability router, never final aesthetic authority.

The product should feel like a clearing office / economic record packet, not a generic crypto dashboard.

## Do not add just because competitors have it

- generic chat agent;
- broad MCP tool suite;
- DeFi portfolio monitoring;
- arbitrary wallet execution;
- multi-chain breadth without a product reason;
- agent marketplace/tokenomics;
- decorative dashboard metrics.

Every new surface must strengthen **acceptance provenance, economic identity, clearing correctness, or proof**.

## Remaining winner-grade gates

- bind Tender to a genuinely live external project/workstream rather than claiming GitHub itself as the live product;
- add one upstream-quality reusable acceptance adapter or integration package if time permits;
- submit one specific reproducible KeeperHub feedback item if a genuine issue/documentation gap was encountered;
- record a <= 3 minute demo around the signature moment, not a feature tour;
- keep the canonical transaction fixed — no second live proof for presentation purposes.

## Sources reviewed

- KeeperHub, "What 180 Hackathon Builders Taught Us About Agents" — https://keeperhub.com/blog/010-openagents-hackathon-wrap
- KeeperHub, "Agents decide, KeeperHub executes" — https://keeperhub.com/blog/keeperhub-for-agents
- KeeperHub Agent Economy Hackathon — https://dorahacks.io/hackathon/agent-economy/detail
- current public field: MergeSplit, Landed, Nyrvok, Almanak KeeperGate, AgentKeeper-MCP, KeeperSentinel
- prior KeeperHub reference: FINALTab

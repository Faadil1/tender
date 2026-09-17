# Tender — Competitive Winning Delta

## Why this delta exists

The KeeperHub Agent Economy Hackathon is not asking for another standalone agent demo. The main track is explicitly about integrating KeeperHub into a live project, proving real value movement, surviving unhappy paths, and shipping code another team could pick up.

Tender's job is therefore not to imitate the most common hackathon pattern — `agent decides -> KeeperHub pays` — but to occupy a category with a sharper economic primitive and a more memorable proof.

## What KeeperHub's own winners teach us

KeeperHub's OpenAgents retrospective is unusually explicit about its bar. The team reviewed every submission and said shallow integrations with polished demos were not enough; winning projects had to look adoptable, mergeable, or production-serious.

Signals from prior winners:

- **Tradewise Agentlab** — production seriousness, 125 tests, live deployment, real x402 flow, and a genuinely novel primitive: an agent as an equity issuer.
- **Keeper-Gate** — a reusable abstraction, not a one-off wrapper: one framework-agnostic core with thin adapters.
- **ZW.ARM** — real activity, measurable outcomes, independent critique before execution, and explicit failure-mode thinking.
- **Meld / ChronicleAI / n8n-nodes-keeperhub** from Agents Onchain — the pattern continued: measurable runtime evidence, integration into a real existing surface, and code that can be adopted upstream. n8n's node was subsequently approved by n8n.

The common DNA is not "more agent features." It is:

1. KeeperHub is load-bearing.
2. The other side of the integration is real and named.
3. There is a primitive or abstraction worth remembering.
4. Reliability is demonstrated, not asserted.
5. The repo survives close inspection.
6. Proof is independently verifiable.

## Current field pressure

Visible Agent Economy submissions are already crowding these territories:

- deterministic MCP gateways;
- DeFi risk monitors and liquidation protection;
- generic safe transaction middleware;
- dry-run + idempotency wrappers;
- broad multi-chain tool surfaces.

Tender should not enter that feature-count race.

## Tender's category

**Economic completion for accepted software work.**

A software contribution can be technically complete in GitHub but economically incomplete. Merge, approval, maintainer attestation, or another acceptance signal says the work is accepted; it does not itself define or prove settlement.

Tender binds those two moments:

`WORK -> ACCEPTANCE -> TENDER CLAIM -> KEEPERHUB SETTLEMENT -> TENDER RECEIPT`

The live named project on the other side is **GitHub**. GitHub provides the acceptance semantics. Tender converts accepted-work identity plus versioned settlement policy into one deterministic economic obligation. KeeperHub clears the obligation onchain.

This is specific to GitHub's contribution lifecycle rather than a generic payment webhook.

## Product lock

| Element | Canonical Tender answer |
| --- | --- |
| Category | Economic completion infrastructure for software work |
| Live integration | GitHub acceptance -> KeeperHub settlement |
| Primitive | Tender Claim |
| Invariant | one accepted obligation -> one settlement |
| Signature artifact | Tender Receipt |
| Negative artifact | explicit non-settlement / replay outcome |
| Hero proof | real 0.01 USDC settlement + same claim replay -> 0 additional executions -> $0 moved |
| Failure proof | interactive Settlement Failure Lab running the real Tender SettlementEngine server-side without a broadcast adapter |
| Measured evidence | 13/13 unit tests; 10 replay scenarios; 0 duplicate payouts |

## Demo memory sentence

**Merged is not settled. Tender turns accepted work into one economic claim and settles it exactly once.**

Supporting line:

**GitHub proves acceptance. Tender proves what is owed. KeeperHub proves it was settled.**

## The signature interaction

The judge should be invited to attack the invariant:

> **Try to make Tender pay twice.**

The public runtime exposes safe engine-level failure scenarios:

- duplicate webhook delivery;
- two concurrent workers;
- failed acceptance checks;
- malformed recipient;
- callback loss after execution begins.

The lab uses the real `SettlementEngine` and an in-memory non-network executor. It never calls KeeperHub and never moves value. Its purpose is to make failure behavior inspectable while the canonical onchain transaction remains the real execution proof.

The most memorable result is not another successful payment. It is a deliberately refused second payment.

## Winning Intelligence rules carried forward

- Prefer one narrow thesis over broad agent feature count.
- Make authority boundaries explicit: GitHub accepts, Tender determines the obligation, KeeperHub executes.
- Fail closed when evidence or recipient data is incomplete.
- Use versioned settlement policy and deterministic identity.
- Treat refusal and replay as designed outputs, not error states to hide.
- Preserve an evidence passport through claim -> execution -> receipt.
- Distinguish canonical onchain proof from safe runtime simulation.
- Never substitute a dashboard score for causal evidence.
- Never claim reliability without a replay or failure artifact.

## Design lineage lock

User-supplied reference systems remain active:

- **CARI** — institutional / archival lineage, anti-AI-slop checks, no generic neon crypto dashboard.
- **Annual Report Gallery** — evidence hierarchy, number-led proof, editorial restraint.
- **Study Old Ads** — compressed promise and one memorable sentence above the fold.
- **Spectrum UI** — dense, functional state / record mechanisms rather than decorative cards.
- **Motion & Interaction Grammar** — every motion maps to a state transition; reduced-motion parity is required.
- **Design Engineer Tools** — implementation router only; it does not override the domain-native visual language.

The interface should feel like an economic record packet: acceptance evidence, claim, cleared receipt, refusal stamp, replay proof.

## What not to add

Do not add these just because competitors have them:

- a generic chat agent;
- a broad MCP tool suite;
- DeFi portfolio/risk monitoring;
- arbitrary wallet execution;
- multi-chain breadth with no product reason;
- tokenomics or agent marketplace mechanics;
- a giant dashboard of vanity metrics.

Every new surface must strengthen one of three things: **acceptance semantics, settlement correctness, or proof.**

## Sources reviewed

- KeeperHub, "What 180 Hackathon Builders Taught Us About Agents" — https://keeperhub.com/blog/010-openagents-hackathon-wrap
- KeeperHub Agent Economy Hackathon — https://dorahacks.io/hackathon/agent-economy/detail
- Tradewise Agentlab — https://github.com/fritzschoff/hackagent
- Keeper-Gate — https://github.com/chronogist/keeper-gate
- ChronicleAI — https://github.com/zaikaman/ChronicleAI
- n8n-nodes-keeperhub — https://github.com/iamrobertmoore/n8n-nodes-keeperhub
- Current-field references reviewed: KeeperSentinel and AgentKeeper-MCP

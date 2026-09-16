# Winning Intelligence

## Current Hackathon Signals

The Agent Economy Hackathon rewards the best integration of KeeperHub into a live project. The official brief emphasizes deterministic execution, auditable records, and real value movement through KeeperHub. Submission requires a source code link, a short demo video, and a link to a transaction executed through KeeperHub.

Main judging rubric:

| Signal | Implication for Tender |
| --- | --- |
| Integration depth | GitHub must be a real source of accepted work, not a mock toggle. |
| Execution through KeeperHub | The final demo needs a real KeeperHub execution and transaction link. |
| Reliability and observability | Replay protection, retries, and reconciliation are core product proof. |
| Usefulness and originality | Tender must be a settlement primitive, not a bounty marketplace. |
| Developer experience and code quality | Domain model, adapters, tests, README, and handoff must be clean. |

KeeperHub docs confirm REST and MCP surfaces, workflow execution, direct execution, API key auth, execution wait/status endpoints, testnet USDC support on Base Sepolia, and stable idempotency requirements on write retries.

## Competitive Landscape

Crowded patterns:

| Pattern | Weakness |
| --- | --- |
| Generic agent wallet dashboards | Looks like a wallet front end, not a causal settlement protocol. |
| If-this-then-pay automations | Weak obligation model; often retries with unsafe identities. |
| Bounty marketplaces | Focus on listing/discovery, not accepted-work settlement. |
| GitHub Actions payout scripts | Often tied to CI glue and shallow receipt/audit records. |
| Escrow clones | Put funds in custody before acceptance; Tender starts from accepted contribution evidence. |

Prior KeeperHub winners suggest that serious submissions have real execution, tests, live deployments, useful abstractions, and failure-mode thinking. Shallow one-workflow demos are explicitly weak.

## Differentiation

Tender owns this sentence:

> Accepted work becomes a settled obligation.

Tender does not decide whether work is good. GitHub acceptance evidence does that. Tender converts the immutable acceptance event into a deterministic settlement claim, executes it through KeeperHub, and prevents duplicate economic effect.

## Danger Zones

- Do not look like a crypto dashboard.
- Do not say “valid until” or frame the product around expiry.
- Do not make KeeperHub a decorative final API call.
- Do not submit without a transaction executed through KeeperHub.
- Do not call mock mode a live proof.
- Do not use webhook delivery ID as settlement identity.

## Recommended Scope

Build one high-integrity path:

1. GitHub PR merge acceptance evidence.
2. Deterministic settlement claim.
3. KeeperHub workflow execution with idempotency key.
4. Receipt and transaction hash.
5. Replay produces `ALREADY_SETTLED`.
6. Failure cases visible and tested.

## Features Intentionally Not Built

- Bounty marketplace.
- Escrow/fund custody.
- Multi-platform adapters beyond GitHub.
- Token selection marketplace.
- Arbitrary AI approval/rejection.
- Rich contributor profiles.
- Production billing.


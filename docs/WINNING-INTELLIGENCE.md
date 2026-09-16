# Winning Intelligence

## Post-Build Delta

Crowded pattern: `external event -> safe KeeperHub payment`.

Tender should not compete as another GitHub bounty automation or generic payout script. Tender's stronger territory is settlement infrastructure for accepted software contributions.

Canonical separation:

| Layer | Responsibility |
| --- | --- |
| GitHub | Proves what work was accepted. |
| Tender | Determines what is economically owed. |
| KeeperHub | Proves it was settled. |

## Memorability Lock

| Element | Tender Lock |
| --- | --- |
| Primitive | Tender Claim |
| Invariant | one accepted obligation -> one settlement |
| Signature artifact | Tender Receipt |
| Measured proof | Settlement Replay Harness |
| Hero demo | same accepted contribution replayed -> same claim -> $0 additional movement |

Compressed sentences under test:

- A merge creates one economic claim. Tender settles it exactly once.
- GitHub proves the work was accepted. Tender proves what is owed. KeeperHub proves it was paid.
- No bounty. No race. Accepted work becomes a claim.

## Differentiation

Tender does not force contributors to compete for a public bounty. It settles value after useful work has actually been accepted.

GitHub merge is only the first acceptance adapter. The architecture preserves room for explicit maintainer acceptance, accepted-outside-merge contributions, shared contribution settlement, and future non-GitHub acceptance adapters.

## Winning DNA Applied

- Production-grade KeeperHub path via workflow execution.
- Reusable architecture: domain engine plus source/execution adapters.
- Failure-first testing.
- Explicit negative-path proof.
- Quantitative replay harness evidence.
- Honest limitations around mock/local mode and live proof.
- One sharp invariant.
- Domain-native visual identity: claim, accepted, due, ledger, receipt, cleared, settled.

## Danger Zones

- Do not regress to a bounty marketplace.
- Do not make `accepted contribution === merged PR` a permanent assumption.
- Do not broadcast a second KeeperHub transfer for replay proof.
- Do not call manual calibration the canonical hero proof.
- Do not expose API keys, webhook secrets, wallet secrets, or private recipient data.

## Current Evidence

- Unit/domain tests: 12 passing.
- Replay Harness: `10 settlement scenarios replayed · 0 duplicate payouts`.
- Manual KeeperHub calibration succeeded on Base Sepolia for `0.01 USDC`; preserved only as calibration evidence.

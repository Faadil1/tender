# Tender — Competitive Winning Delta

## Current Read

The Agent Economy field is crowded around generic `external event -> KeeperHub payment`, MCP gateways, x402 flows, DeFi automation, execution firewalls, and GitHub reward automation. KeeperHub's own prior-winner retrospective says polished demos are not enough: winning projects had real execution, reusable abstractions, serious code, measurable proof, and failure-mode discipline.

## Winner Patterns Extracted

- **Tradewise Agentlab:** production seriousness, real x402 flow, many tests, live deployment, reproducible KeeperHub feedback.
- **Keeper-Gate:** reusable core plus thin adapters; framework portability mattered.
- **ZW.ARM:** real transactions, measurable outcomes, critique before execution, isolated execution authority.
- **Feedback bounty winners:** structured, reproducible gaps and honest limitations were rewarded.

## Tender Differentiation

Tender should not fight for the GitHub-bounty or DeFi-firewall category. Tender owns the clearing layer between acceptance and execution:

> What exactly became owed, why did it become owed, and has that exact obligation already been discharged?

## Hardening Applied

- Tender Claim identity now supports policy digests and future source adapters.
- Settled claims are immutable.
- Changed economics on already-settled accepted work return `REQUIRES_ACCEPTANCE` and execute zero KeeperHub calls.
- Corrective claims require explicit economic authorization and link back to the original settled claim.
- Replay harness now measures 11 scenarios, including changed economics and authorized correction.
- Public runtime remains safe proof only; operator authority is separate.

## Signature Judge Moment

Same economics:

`SAME CLAIM -> ALREADY_SETTLED -> 0 extra executions -> $0 moved`

Changed amount / recipient / policy / accepted work:

`NEW CLAIM -> REQUIRES_ACCEPTANCE -> $0 moved`

Authorized correction:

`LINKED CORRECTIVE CLAIM -> NEW RECEIPT -> ORIGINAL RECEIPT IMMUTABLE`

## Danger Zones Avoided

- Not a bounty marketplace.
- Not a GitHub Action with a payment button.
- Not an MCP gateway feature race.
- Not a DeFi monitoring agent.
- Not a read-only evidence viewer.
- Not a public runtime with KeeperHub broadcast credentials.

## Current Evidence

- Canonical KeeperHub-caused Base Sepolia settlement: `0.01 USDC`.
- Same canonical claim replay: `ALREADY_SETTLED`.
- Additional KeeperHub executions on replay: `0`.
- Additional movement: `$0`.
- Updated local verification: `18/18` tests.
- Updated replay harness: `11 settlement scenarios replayed · 0 duplicate payouts`.

## Sources

- KeeperHub, "What 180 Hackathon Builders Taught Us About Agents" — https://keeperhub.com/blog/010-openagents-hackathon-wrap
- KeeperHub Agent Economy Hackathon — https://dorahacks.io/hackathon/agent-economy/detail
- Current field references tracked in prior delta: MergeSplit, Landed, Nyrvok, Almanak KeeperGate, AgentKeeper-MCP, KeeperSentinel, FINALTab.

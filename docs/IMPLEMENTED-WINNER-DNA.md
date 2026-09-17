# Implemented Winner DNA

This file records which patterns observed in prior KeeperHub winners and strong current submissions have been translated into Tender without copying their product concepts.

## Production seriousness

- canonical KeeperHub-caused Base Sepolia settlement;
- deterministic claim identity;
- 16 target unit/domain tests after the economic-verifier delta;
- 10-scenario replay harness;
- public Cloudflare runtime;
- canonical evidence JSON;
- explicit no-broadcast judge mode.

## Correct abstraction boundary

- domain `SettlementEngine` remains independent of GitHub and KeeperHub;
- GitHub is an acceptance adapter;
- KeeperHub is an execution adapter;
- `obligationVerifier` is reusable domain logic;
- future acceptance adapters can reuse the same economic identity rules.

## Independent proof

`GET /api/chain-proof` does not trust KeeperHub's success response. It queries Base Sepolia independently and requires the canonical transaction to be successful and to contain an exact USDC `Transfer` event matching the Tender Receipt recipient and amount.

## Failure-first judge interaction

`POST /api/replay` executes the real Tender `SettlementEngine` server-side against the canonical settled claim with no value-moving adapter. It must return `ALREADY_SETTLED` with zero additional KeeperHub executions.

`POST /api/claim/verify` lets judges mutate economic fields safely. Same economics must resolve to the same claim. Changed economics must resolve to a new claim requiring fresh acceptance, with `$0` moved.

## Memorable primitive

Tender does not compete on tool count. The primitive is the **Tender Claim**: deterministic identity for an accepted economic obligation.

The signature sentence is:

> Accepted once. Owed once. Settled once.

## Still pending before submission lock

- local/CI verification of this delta;
- redeploy dynamic Cloudflare runtime;
- bind Tender to a genuinely live external product/workstream if feasible;
- capture the <=3 minute judge demo;
- submit specific KeeperHub feedback only if it is genuinely reproducible and useful;
- final repository/submission copy lock.

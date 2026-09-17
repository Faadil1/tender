# Tender Submission

## Product Name

Tender

## Tagline

No bounty. No race. Accepted work becomes a claim.

## Short Description

Tender is settlement infrastructure for accepted software contributions. It turns accepted work into a deterministic Tender Claim, settles that claim through KeeperHub, and issues a Tender Receipt exactly once.

## Long Description

GitHub proves what work was accepted. Tender determines what is economically owed. KeeperHub proves it was settled.

Tender creates a deterministic Tender Claim from accepted contribution evidence and settlement policy: repository, task/contribution identity, acceptance kind, accepted-work identity, policy version, recipient(s), asset, chain, and amount. Once KeeperHub settles the claim, Tender records a Tender Receipt containing the causal evidence and onchain transaction proof.

If the same accepted contribution is replayed through a duplicate webhook, repeated GitHub Action, concurrent worker, retry, or reconciliation path, Tender maps it back to the same economic claim. The core invariant is:

`one accepted obligation -> one settlement`

## KeeperHub Integration

Tender uses KeeperHub as the settlement execution and proof layer.

Configured workflow:

- Workflow: `Tender: Settle Claim`
- Workflow ID: `yy4ml6aevkov3zaukpx15`
- Network: Base Sepolia (`84532`)
- Asset: USDC
- Runtime inputs: `recipient`, `amount`
- Runtime bindings: `Manual.data.recipient`, `Manual.data.amount`

Before the live transaction, the preflight path verified the API key, target workflow, dynamic bindings, workflow simulation response, and an equivalent Base Sepolia USDC dry-run with `success: true` and `wouldRevert: false`.

## Canonical Tender-Caused Proof

GitHub Actions run: `35162003096`

- Accepted work: `3c19bd869e9223bdb1d353a864f1818ee6c2e871`
- Tender Claim: `tclaim_94eb021e7894252897176543cc9d7b49`
- Tender Receipt: `treceipt_94eb021e7894252897176543cc9d7b49`
- KeeperHub execution ID: `7k14qt2a1989rrc5r370d`
- Amount: `0.01 USDC`
- Settlement status: `SETTLED`
- Transaction: `0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db`
- Replay status: `ALREADY_SETTLED`
- Same claim: `true`
- Additional KeeperHub executions: `0`
- Additional movement: `$0`

BaseScan:
`https://sepolia.basescan.org/tx/0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db`

Canonical evidence file: `evidence/live-proof.json`.

## Measured Reliability Evidence

`10 settlement scenarios replayed · 0 duplicate payouts`

`13/13` unit tests pass.

Replay evidence file: `evidence/settlement-replay-harness.json`.

## Calibration Evidence

An earlier manual KeeperHub calibration transaction proved the wallet/workflow path before the canonical Tender-caused run:

`0x2116cfde5ba32647c481aff669326dd18e2d736aeb68bab86ed4aa1d9a7069e0`

This calibration transaction is explicitly separate from the canonical hero proof.

## Repository URL

`https://github.com/Faadil1/tender`

## Production URL

Pending judge-facing deployment.

## Demo Spine

1. Contribution is accepted.
2. Tender creates one deterministic Tender Claim.
3. KeeperHub settles `0.01 USDC`.
4. Tender issues a Tender Receipt with onchain proof.
5. The same accepted work is replayed.
6. Tender returns the same claim as `ALREADY_SETTLED`.
7. `$0` moves again.

## What Is Still Unfinished

- Judge-facing production deployment.
- Final demo/video capture.
- Final DoraHacks submission packaging and copy lock.

## Judging Criteria Mapping

| Criterion | Tender Evidence |
| --- | --- |
| Integration depth | GitHub acceptance -> Tender Claim -> KeeperHub execution -> Tender Receipt, with runtime-bound settlement inputs. |
| Real execution | Canonical `0.01 USDC` Base Sepolia transaction with KeeperHub execution ID and transaction hash. |
| Reliability and observability | Deterministic claim identity, idempotency key, reconciliation, preflight, Tender Receipt, 13/13 tests, Replay Harness. |
| Replay safety | Same claim -> `ALREADY_SETTLED` -> 0 additional KeeperHub executions -> `$0` additional movement. |
| Usefulness and originality | Settles value after accepted work without turning contribution recognition into a public bounty race. |
| Developer experience | TypeScript domain model, adapters, tests, GitHub Actions proof path, machine-readable evidence, README, canonical state/handover. |

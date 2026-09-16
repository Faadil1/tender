# Tender Submission

## Product Name

Tender

## Tagline

No bounty. No race. Accepted work becomes a claim.

## Short Description

Tender is settlement infrastructure for accepted software contributions. It turns accepted work into a Tender Claim, settles it through KeeperHub, and issues a Tender Receipt exactly once.

## Long Description

GitHub proves what work was accepted. Tender determines what is economically owed. KeeperHub proves it was settled.

Tender creates a deterministic Tender Claim from accepted contribution evidence and settlement policy: repository, task/contribution identity, accepted-work identity, policy version, recipient(s), asset, and amount. Once KeeperHub settles the claim, Tender records a Tender Receipt with the causal evidence and transaction proof.

If the same accepted contribution is replayed through a duplicate webhook, repeated GitHub Action, concurrent worker, or retry, Tender maps it back to the same claim and produces `$0` additional movement.

## KeeperHub Integration

Tender uses KeeperHub as the execution layer. The live-proof path calls the configured KeeperHub workflow through repository secrets, records the execution ID and transaction hash, then replays the same Tender Claim without broadcasting a second transfer.

Configured workflow:

- Workflow: `Tender -- Settle Claim`
- Workflow ID: `yy4ml6aevkov3zaulkpx15`
- Network: Base Sepolia
- Asset: USDC

## Repository URL

`https://github.com/Faadil1/tender`

## Production URL

Pending deployment.

## Transaction Proof

Calibration transaction, not final hero proof:

`0x2116cfde5ba32647c481aff669326dd18e2d736aeb68bab86ed4aa1d9a7069e0`

Canonical Tender-caused proof is pending the GitHub Actions live-proof run.

## Measured Replay Evidence

`10 settlement scenarios replayed · 0 duplicate payouts`

Evidence file: `evidence/settlement-replay-harness.json`

## What Still Breaks Or Is Unfinished

- Terminal Git push is blocked by missing Git credentials, even though the GitHub connector can see the private repo.
- Canonical Tender-caused live transaction is pending.
- Production deployment is pending.
- KeeperHub workflow still needs migration from calibrated static values toward claim-driven recipient/amount input.

## Judging Criteria Mapping

| Criterion | Tender Evidence |
| --- | --- |
| Integration depth | GitHub is the first acceptance adapter; Tender Claim is adapter-independent. |
| Execution through KeeperHub | KeeperHub workflow calibrated; live-proof GitHub Action path added. |
| Reliability and observability | Replay Harness, Tender Receipt, claim ID, idempotency key, execution ID, transaction proof. |
| Usefulness and originality | Settles value after accepted work, without becoming a bounty marketplace. |
| Developer experience | TypeScript domain model, adapters, tests, evidence artifacts, README, handoff state. |

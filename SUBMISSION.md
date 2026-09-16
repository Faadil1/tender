# Tender Submission

## Product Name

Tender

## Tagline

Merge the work. Settle the obligation. Exactly once.

## Short Description

Tender turns accepted GitHub contributions into deterministic settlement claims and executes them through KeeperHub exactly once.

## Long Description

Tender is a contribution settlement protocol for open-source and agentic work. A maintainer attaches a small USDC bounty to an issue. A contributor completes the work through a pull request. When GitHub proves the PR was accepted, Tender constructs a deterministic settlement claim from the repository, task, PR, merge SHA, recipient, token, chain, and amount.

KeeperHub executes the settlement, and Tender records the receipt. If the same GitHub event is delivered twice, Tender maps it to the same settlement ID and returns `ALREADY_SETTLED`, creating no second transfer.

## KeeperHub Integration

Tender uses KeeperHub as the execution layer. The planned live path uses KeeperHub workflow execution with an idempotency key derived from Tender's settlement ID, then reads KeeperHub execution status and transaction hashes for receipt/reconciliation.

## Repository URL

Pending repository creation: `https://github.com/Faadil1/tender`

## Production URL

Pending deployment.

## Transaction Proof

Pending minimal-value KeeperHub testnet transaction.

## What Still Breaks Or Is Unfinished

- GitHub repository creation requires user authorization or a GitHub token with repo creation rights.
- KeeperHub live execution requires `KEEPERHUB_API_KEY`, workflow ID, and funded testnet wallet.
- Production deployment is pending after secrets are available.

## Judging Criteria Mapping

| Criterion | Tender Evidence |
| --- | --- |
| Integration depth | GitHub acceptance event is the source of economic obligation. |
| Execution through KeeperHub | KeeperHub workflow executor is implemented; live proof pending credentials. |
| Reliability and observability | Tests cover replay, invalid wallet, failing checks, temporary failure, and reconciliation. |
| Usefulness and originality | Settlement entitlement from accepted contribution, not bounty discovery or escrow. |
| Developer experience | TypeScript domain model, adapters, tests, docs, and state handoff. |


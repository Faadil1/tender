# Demo Script

## 0-10 seconds

Accepted open-source work and contributor payment live in separate systems.

## 10-25 seconds

Show a GitHub issue with a small USDC bounty and a PR linked to it.

## 25-45 seconds

Merge the PR. Tender records acceptance evidence and changes from `NOT YET OWED` to `OWED`.

## 45-70 seconds

Tender constructs a deterministic settlement claim. KeeperHub executes the settlement. Tender records the execution ID and transaction hash. Status becomes `SETTLED`.

## 70-90 seconds

Replay the same event. Tender maps it to the same settlement ID and returns `ALREADY_SETTLED`. The UI stamps `NO SECOND PAYMENT`.

## Closing

GitHub proves accepted work. Tender creates the settlement obligation. KeeperHub executes it. Tender prevents the same accepted contribution from being paid twice.


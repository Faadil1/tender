# Operator Runtime Boundary

Tender has two authority zones.

## Operator Zone

The operator zone is authenticated and can perform write operations:

- create and version Settlement Policies;
- ingest Acceptance Packets;
- create obligations;
- authorize claims;
- execute KeeperHub settlement;
- reconcile in-flight executions;
- supersede unsettled claims;
- create corrective claims linked to settled receipts.

The operator zone owns KeeperHub broadcast credentials. It must never expose them to the browser or public judge runtime.

## Public Proof Zone

The public proof zone is safe and non-value-moving:

- replay the canonical settled claim;
- verify same-vs-altered economic identity;
- return `REQUIRES_ACCEPTANCE` for changed economics;
- expose canonical proof and obligation status APIs;
- independently verify onchain receipt evidence.

The public proof zone cannot preflight or execute a new KeeperHub payment.

## Correction Rule

A settled Tender Receipt is immutable. Corrections do not edit it. They create a linked corrective obligation with explicit economic authorization and a new Tender Claim.

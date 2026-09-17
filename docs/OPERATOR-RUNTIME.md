# Operator Runtime Boundary

Tender has two authority zones.

## Operator Zone

The operator zone is implemented as a server-side write path. In Cloudflare it is exposed under `/api/operator/*`, requires `Authorization: Bearer <TENDER_OPERATOR_TOKEN>`, and persists product state through `TENDER_OPERATOR_STORE` KV. KeeperHub broadcast credentials stay server-side only.

Implemented write operations:

- create and version Settlement Policies;
- lock Settlement Policies;
- ingest Acceptance Packets;
- create obligations;
- authorize claims bound to an exact candidate Tender Claim;
- execute KeeperHub settlement;
- reconcile in-flight executions;
- supersede unsettled claims;
- create corrective claims linked to settled receipts.

Operator-created policies require `policyDigest`. The shared policy type keeps the field optional only so historical canonical proof artifacts remain compatible.

## Operator API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/operator/policies` | create a policy; requires `policyDigest` |
| `POST` | `/api/operator/policies/:version/lock` | lock a policy version |
| `POST` | `/api/operator/acceptances` | persist an Acceptance Packet |
| `POST` | `/api/operator/obligations` | create a deterministic obligation/Tender Claim |
| `GET` | `/api/operator/obligations/:claimId/status` | read machine status |
| `POST` | `/api/operator/claims/:claimId/authorize` | create server-side authorization for a candidate claim |
| `POST` | `/api/operator/claims/:claimId/settle` | settle through KeeperHub when execution is configured |
| `POST` | `/api/operator/claims/:claimId/reconcile` | reconcile an in-flight claim |
| `POST` | `/api/operator/claims/:claimId/supersede` | supersede an unsettled claim |
| `POST` | `/api/operator/claims/:claimId/corrections` | create a linked corrective claim |

If the operator token or store binding is missing, operator endpoints return `operator_runtime_not_configured`. If KeeperHub execution secrets are missing, settlement fails closed with `keeperhub_operator_execution_not_configured`. `OPERATOR_SETTLEMENT_MODE=mock` is available only for non-value-moving development/test environments.

Workers KV is treated as an eventual-consistency/read-mostly store. It is acceptable for mock/dev/proof state, but it is not accepted as the value-moving exactly-once authority store. Workflow settlement mode requires an operator store that advertises strong/serialized authorization consumption; otherwise settlement fails closed with `strong_operator_store_required_for_workflow_settlement`.

## Authorization Rule

`EconomicAuthorization` is not trusted merely because it appears on a contribution. The operator runtime creates the authorization, binds it to `authorizedClaimId`, links it to the settled claim being corrected, and the settlement engine consumes it exactly once through the operator store. A forged, reused, wrong-linked, or wrong-candidate authorization returns `REQUIRES_ACCEPTANCE` and creates no KeeperHub execution.

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

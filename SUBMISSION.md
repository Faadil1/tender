# Tender Submission

## Product Name

Tender

## Memory Sentence

**Accepted once. Owed once. Settled once.**

## Short Description

Tender is settlement infrastructure for accepted software contributions. It turns accepted work into one deterministic economic obligation, settles it through KeeperHub, and preserves a Tender Receipt exactly once.

## Problem

Automated systems retry.

A delivery can be valid and still represent the same underlying economic fact as an earlier delivery. If transport identity, retry identity, Action-run identity, or callback identity is mistaken for economic identity, one accepted obligation can produce repeated economic effects.

A concrete production example is recorded in `docs/NEGATIVE-EVIDENCE.md`: a 2025 TanStack Ship postmortem reports a retried Stripe webhook being processed twice, producing duplicate credits for 18 accounts, unintended downgrades for 2 accounts, and $1,247 in duplicate credits that had to be reversed.

The lesson Tender adopts is simple:

> A repeated delivery is not a new economic fact.

## Solution

GitHub proves what work was accepted.

Tender determines whether that acceptance creates a new economic obligation.

KeeperHub executes the value movement.

Tender then preserves the causal settlement record.

Canonical sequence:

`Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt`

Core invariant:

`one accepted obligation -> one settlement`

## Differentiator

Tender does not merely dedupe webhook/event deliveries.

It derives one deterministic **Tender Claim** from accepted work + pre-committed settlement policy + economic terms.

Same economics:

- same Tender Claim;
- existing settlement/receipt;
- no second KeeperHub execution;
- $0 additional movement.

Changed economics:

- different Tender Claim;
- `NEW_CLAIM_REQUIRES_ACCEPTANCE`;
- no silent mutation of the settled obligation.

## KeeperHub Integration

Tender uses KeeperHub as the settlement execution layer.

Configured workflow:

- Workflow: `Tender: Settle Claim`
- Workflow ID: `yy4ml6aevkov3zaukpx15`
- Network: Base Sepolia (`84532`)
- Asset: USDC
- Runtime inputs: `recipient`, `amount`
- Runtime bindings: `Manual.data.recipient`, `Manual.data.amount`

Before the canonical live transaction, the preflight path verified API-key scope, workflow visibility, dynamic bindings, workflow simulation response, and an equivalent Base Sepolia USDC dry-run.

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

Canonical evidence:

`evidence/live-proof.json`

## Measured Reliability Evidence

Current verification:

- `39/39` tests pass.
- `12` settlement scenarios replayed.
- `0` duplicate payouts.

Replay evidence:

`evidence/settlement-replay-harness.json`

Negative paths retained in the evidence record include:

- PR closed without acceptance -> `NOT_ACCEPTED`
- failed checks -> `ACCEPTANCE_INCOMPLETE`
- malformed recipient -> `BLOCKED`
- changed economics -> `REQUIRES_ACCEPTANCE`
- forged corrective authorization -> rejected
- unconfirmed KeeperHub result -> `SETTLING` / reconcile same claim
- callback interruption after broadcast -> reconcile without rebroadcast

## Real Failure > Fake Success

Tender deliberately preserves refusal and uncertainty.

If proof is insufficient, the public product does not manufacture a successful verdict:

- verification unavailable -> `UNVERIFIED` / `Cannot verify right now`
- Base RPC unavailable -> partial verification only
- replay failure -> `REPLAY COULD NOT RUN — no conclusion drawn`
- invalid candidate -> `No fingerprint: no valid claim`

`NO SECOND PAYMENT` is shown only after the replay invariant is actually verified.

Concrete negative evidence:

`docs/NEGATIVE-EVIDENCE.md`

## Product Surfaces

Primary:

- `/` — Home / claim compression
- `/obligation` — Case / why value became owed
- `/proof` — Proof / recompute + chain verification + replay
- `/lab` — Invariant Lab / changed economics vs replay

Secondary:

- `/receipt` — shareable Tender Receipt artifact
- technical evidence — Proof drawer / machine-readable evidence

## Production URL

`https://tender-settlement.faadil-casecraft.workers.dev`

## Repository URL

`https://github.com/Faadil1/tender`

## Claim -> Demonstration -> Receipt

### Claim

**Accepted once. Owed once. Settled once.**

### Demonstration

1. Open Proof.
2. Recompute canonical claim identity.
3. Confirm Receipt references.
4. Verify the Base Sepolia transfer independently.
5. Replay the same accepted work.
6. Observe:
   - same Tender Claim;
   - unchanged Claim Fingerprint;
   - Δ 0 additional KeeperHub executions;
   - Δ $0.00 additional movement.
7. Change one economic input in Lab.
8. Observe a different candidate Claim requiring new acceptance.

### Receipt

Close the loop with:

- Tender Receipt;
- KeeperHub execution;
- Base transaction;
- independent chain verification;
- machine-readable proof.

## Demo Compression

### <=15 seconds

The judge must understand the problem and see Tender act:

1. “Retries are normal. Duplicate economic effects are not.”
2. “Accepted once. Owed once. Settled once.”
3. Click **Run the proof**.
4. Trigger Replay.

### 30–45 seconds

The judge must see:

- replay verdict;
- Δ0 executions;
- Δ$0.00;
- independent chain evidence;
- receipt or transaction proof;
- one changed-economics counter-case.

### <=3 minutes

Full narrative:

`Problem -> Solution -> Demo -> Why Us`

Preferred final video length:

`60–100 seconds`

The current mobile QA recording is evidence of the product flow, not the final judge cut; it reaches Replay too late for the <=15-second gate because Case is visited first.

Canonical timing gate:

`docs/JUDGE-COMPRESSION-GATE.md`

## Why Tender

Webhook idempotency answers:

> Have I already processed this delivery/event?

Tender answers a different economic question:

> Does this accepted work + policy + economics represent a new obligation at all?

KeeperHub executes a settlement.

Tender decides whether there is a new economic claim to execute.

## Q&A

**Why not just use webhook idempotency?**

Transport/event dedupe is necessary but not sufficient for Tender's problem. Tender binds the economic obligation across delivery/run/retry identities and distinguishes retries from changed economics.

**Why KeeperHub?**

KeeperHub is the execution layer. Tender does not rebuild value movement.

**What if amount, recipient, or policy changes?**

The economic identity changes, producing a different Tender Claim that requires acceptance.

**What if verification is unavailable?**

Tender returns UNVERIFIED/UNKNOWN and withholds the positive replay verdict.

**Is Claim Fingerprint proof?**

No. It is the visual identity of the Claim. Proof is recomputation + receipt + KeeperHub execution + on-chain verification.

**Can the public demo pay again?**

No. The judge-facing runtime contains no value-moving executor.

**What survives execution?**

A Tender Receipt, machine-readable evidence, KeeperHub execution reference, and transaction proof.

## Submission Integrity Gate

Current:

- [x] Production deployment
- [x] Public repository
- [x] Canonical KeeperHub value-moving proof
- [x] Canonical proof frozen — no casual rerun
- [x] 39/39 tests
- [x] 12 scenarios / 0 duplicate payouts
- [x] Real negative incident sourced
- [x] Counter-cases retained
- [x] UNVERIFIED/UNKNOWN behavior
- [x] Public runtime cannot broadcast another payment
- [ ] Latest visual polish redeployed
- [ ] 375px Home + Proof final QA
- [ ] Final judge video recut to <=15s proof-start gate
- [ ] Final DoraHacks copy/video fields submitted

## Judging Criteria Mapping

| Criterion | Tender Evidence |
| --- | --- |
| Integration depth | GitHub acceptance -> Tender Claim -> KeeperHub execution -> Tender Receipt, with runtime-bound settlement inputs. |
| Real execution | Canonical 0.01 USDC Base Sepolia transaction with KeeperHub execution ID and transaction hash. |
| Reliability and observability | Deterministic economic identity, authorization gates, reconciliation, 39/39 tests, 12-scenario Replay Harness, explicit failure states. |
| Replay safety | Same Claim -> ALREADY_SETTLED -> 0 additional KeeperHub executions -> $0 additional movement. |
| Usefulness and originality | Separates acceptance/economic identity from transport/execution identity; settles accepted work without a public bounty race. |
| Developer experience | TypeScript domain model, adapters, tests, GitHub Actions, machine-readable evidence, live Proof/Lab, canonical state/handover. |

## What Is Still Unfinished

- Redeploy the latest visual/negative-evidence UI polish.
- Final 375px visual QA.
- Final judge video cut using Home -> Proof first.
- Final DoraHacks packaging and submission lock.

# Tender — Submission

## One sentence

**Accepted once. Owed once. Settled once.**

Tender turns accepted software work into one deterministic economic obligation, executes the authorized settlement through KeeperHub, and preserves a durable Tender Receipt.

## Live links

- Product: https://tender-settlement.faadil-casecraft.workers.dev
- Repository: https://github.com/Faadil1/tender
- Canonical KeeperHub transaction: https://sepolia.basescan.org/tx/0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db
- Named live project: https://valid-until-agent-os.pages.dev

## Problem

Automated systems retry.

A valid delivery can still represent the same underlying economic fact as an earlier delivery. If retry identity, webhook identity, Action-run identity, or callback identity is mistaken for economic identity, one accepted obligation can create repeated economic effects.

A concrete production Stripe-webhook postmortem reported duplicate credits across 18 accounts, two unintended subscription downgrades, and $1,247 in duplicate credits that had to be reversed.

Tender's lesson:

> **A repeated delivery is not a new economic fact.**

Source and design implications: `docs/reliability/NEGATIVE-EVIDENCE.md`.

## Solution

Canonical sequence:

```text
Policy
→ Acceptance
→ Tender Claim
→ Authorization
→ KeeperHub execution
→ Tender Receipt
```

Same economics converge on the same Tender Claim.

Changed economics create a different claim and require new acceptance.

## Why KeeperHub

KeeperHub is Tender's execution layer.

Tender does not rebuild:
- transaction execution;
- workflow preflight;
- execution identity;
- gas / retry infrastructure;
- execution audit.

Tender adds the decision layer above execution:

> **Does this accepted work represent a new economic obligation at all?**

Integration details: `docs/keeperhub/INTEGRATION.md`.

## Canonical execution proof

A real `0.01 USDC` Base Sepolia settlement executed through KeeperHub.

| Evidence | Value |
| --- | --- |
| Accepted work | `3c19bd869e9223bdb1d353a864f1818ee6c2e871` |
| Tender Claim | `tclaim_94eb021e7894252897176543cc9d7b49` |
| Tender Receipt | `treceipt_94eb021e7894252897176543cc9d7b49` |
| KeeperHub execution | `7k14qt2a1989rrc5r370d` |
| Transaction | `0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db` |
| Replay | `ALREADY_SETTLED` |
| Additional KeeperHub executions | `0` |
| Additional movement | `$0` |

Machine-readable proof: `evidence/live-proof.json`.

## Named live-project integration

Tender includes a specific integration with **Valid Until**, a deployed agent-safety product.

- Repository: `Faadil1/valid-until-agent-os`
- Production: https://valid-until-agent-os.pages.dev
- Accepted work: `aeec4ed165eb0917688a885b960175d58f729692`
- Change: **Bind exact action into execution validity contract**
- Integration implementation: `src/integrations/validUntil.ts`
- Tests: `tests/validUntilIntegration.test.ts`

The binding is implemented and tested.

A dedicated value-moving workflow exists with an explicit approval gate. Tender does **not** claim the Valid Until-specific KeeperHub transfer as completed until that distinct transaction has actually been executed.

## Reliability / negative paths

Current deterministic verification:

- **42 tests**
- **12 replay scenarios**
- **0 duplicate payouts**

Negative paths remain visible rather than being converted into fake success:

- not accepted → `NOT_ACCEPTED`
- checks incomplete → `ACCEPTANCE_INCOMPLETE`
- malformed recipient → `BLOCKED`
- changed economics → `REQUIRES_ACCEPTANCE`
- forged authorization → rejected
- in-flight uncertainty → reconcile same execution; do not rebroadcast
- proof unavailable → `UNVERIFIED`
- replay failure → no positive replay verdict

Replay evidence: `evidence/settlement-replay-harness.json`.

## Claim → Demonstration → Receipt

### Claim

**Accepted once. Owed once. Settled once.**

### Demonstration

1. Open `/proof`.
2. Recompute the canonical Tender Claim.
3. Match the Tender Receipt.
4. Verify the Base Sepolia transfer independently.
5. Replay the same accepted work.
6. Observe:
   - same claim;
   - unchanged Claim Fingerprint;
   - Δ KeeperHub executions = 0;
   - Δ movement = $0.00.
7. Change one economic input in `/lab`.
8. Observe a different claim requiring acceptance.

### Receipt

Close the proof loop with:
- Tender Receipt;
- KeeperHub execution ID;
- transaction hash;
- independent Base verification;
- machine-readable evidence.

## Judge path

### First 15 seconds

1. “Retries are normal. Duplicate economic effects are not.”
2. “Accepted once. Owed once. Settled once.”
3. **Run the proof**
4. **Replay settlement**

### By 45 seconds

The judge has seen:
- replay verdict;
- Δ0 executions;
- Δ$0.00;
- independent transaction evidence;
- Receipt;
- one changed-economics counter-case.

### Full story

**Problem → Solution → Demo → Why Tender**

Architecture follows comprehension, not the other way around.

## Why it is different

Webhook/event idempotency asks:

> Have I processed this delivery before?

Tender asks:

> Does this accepted work + policy + economics represent a new obligation at all?

KeeperHub answers the execution question.

Tender answers the economic-identity question.

## KeeperHub judging criteria mapping

| Criterion | Tender evidence |
| --- | --- |
| Integration depth | Specific Valid Until binding + accepted-work identity + guarded project-specific live settlement workflow |
| Execution through KeeperHub | Real Base Sepolia USDC transaction, KeeperHub execution ID, independent chain verification |
| Reliability / observability | deterministic claims, reconciliation, explicit UNKNOWN/failure states, 42 tests, 12 replay scenarios |
| Usefulness / originality | exactly-once economic identity for accepted work rather than transport-event dedupe |
| Developer experience / code quality | small TypeScript domain core, isolated adapters/integrations, reproducible verify command, machine-readable evidence, guarded value-moving workflows |

## Truth boundary / unfinished

Complete:
- public product;
- canonical KeeperHub transaction;
- replay proof;
- independent chain verification;
- Tender Receipt;
- deterministic test/replay suite;
- Valid Until-specific integration code and tests.

Still intentionally pending:
- the **distinct Valid Until-specific real KeeperHub settlement**, which requires explicit approval before broadcasting;
- final redeploy of the latest visual/negative-evidence polish;
- final mobile/judge-video capture.

Tender does not label pending work as completed.

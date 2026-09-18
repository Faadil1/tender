# Tender — Hackathon Judge Compression & Submission Integrity Gate

Date: 2026-09-18

## Canonical pipeline

Every hackathon build must survive this sequence:

**RUBRIC -> PAIN -> PROBLEM -> DIFFERENTIATOR -> EXECUTION -> EVIDENCE -> STORY -> DEMO -> Q&A**

The sequence is not a presentation template only. It is a build gate.

A product can be technically strong and still fail if the judge has to reconstruct why it matters.

---

## Tender mapping

### RUBRIC

KeeperHub integration depth, real execution, reliability/observability, replay safety, usefulness/originality and developer experience.

Evidence:
- KeeperHub workflow execution;
- real Base Sepolia transaction;
- Tender Claim / Tender Receipt;
- replay harness;
- tests;
- live judge-safe runtime.

### PAIN

Automated payment/event systems receive retries, duplicate deliveries and concurrent attempts.

A valid event arriving twice can produce duplicate economic effects when delivery identity is confused with economic identity.

Concrete negative evidence:
`docs/NEGATIVE-EVIDENCE.md`

### PROBLEM

Accepted work can cross several identities:

- GitHub event/run;
- accepted work;
- Tender Claim;
- KeeperHub execution;
- transaction;
- Tender Receipt.

Without a stable economic identity, retries or corrections can be misread as new obligations.

### DIFFERENTIATOR

Tender does not dedupe by transport event alone.

It derives a deterministic **economic claim** from accepted work + pre-committed policy + economics.

Same economics -> same claim.
Changed economics -> different claim requiring acceptance.

### EXECUTION

Canonical flow:

Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt

KeeperHub performs the value movement.
Tender owns the obligation identity and causal record.

### EVIDENCE

Canonical live proof:

- accepted work: `3c19bd869e9223bdb1d353a864f1818ee6c2e871`
- claim: `tclaim_94eb021e7894252897176543cc9d7b49`
- receipt: `treceipt_94eb021e7894252897176543cc9d7b49`
- KeeperHub execution: `7k14qt2a1989rrc5r370d`
- transaction: `0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db`
- settlement: `0.01 USDC`
- replay: same claim
- additional executions: `0`
- additional movement: `$0`

Reliability:
- 39/39 tests
- 12 replay scenarios
- 0 duplicate payouts

### STORY

**Problem -> Solution -> Demo -> Why Us**

Problem:
A repeated delivery can be valid and still not represent a new economic fact.

Solution:
Tender turns accepted work into one deterministic economic obligation.

Demo:
Settle one real obligation, replay it, observe no second execution/movement, then mutate economics and observe a new claim that cannot settle without new acceptance.

Why Us:
Tender sits above execution identity. KeeperHub can execute value movement; Tender determines whether there is a new obligation to execute at all.

### DEMO

Demo must begin with the product functioning, not architecture narration.

### Q&A

The submission/demo must pre-answer:

1. Why not just use webhook/event idempotency?
   - Transport dedupe prevents repeated delivery effects, but Tender binds the **economic obligation** across delivery/run/retry identities and distinguishes retries from changed economics.

2. Why KeeperHub?
   - KeeperHub is the execution/proof layer. Tender does not rebuild the transfer engine.

3. What happens if the amount or recipient changes?
   - New economic identity -> new Tender Claim -> requires new acceptance.

4. What if verification is unavailable?
   - Tender declares UNVERIFIED/UNKNOWN and withholds the replay verdict.

5. Is the Claim Fingerprint cryptographic proof?
   - No. It is a deterministic visual portrait of the claim. Proof is recomputation + receipt + execution + chain verification.

6. Can the public demo pay again?
   - No. Public runtime has no value-moving executor.

7. What survives after execution?
   - Tender Receipt plus machine-readable evidence and on-chain transaction proof.

---

## Claim -> Demonstration -> Receipt

This is the canonical judge-proof unit.

### Claim

**Accepted once. Owed once. Settled once.**

### Demonstration

1. show the canonical settled claim;
2. press Replay;
3. show the same claim/fingerprint;
4. show:
   - Δ new claim = 0
   - Δ KeeperHub executions = 0
   - Δ movement = $0.00
5. mutate an economic input;
6. show a different claim requiring acceptance.

### Receipt

Close the proof loop with:
- Tender Receipt;
- KeeperHub execution ID;
- transaction hash;
- independent Base verification;
- machine-readable proof.

No claim is considered judge-ready without a demonstration and a receipt/evidence artifact.

---

## Negative path / UNKNOWN gate

Every demo/build must show at least one counter-case.

Tender supports several:

- not accepted -> no obligation;
- failed required checks -> acceptance incomplete;
- malformed recipient -> blocked;
- changed economics -> requires acceptance;
- forged authorization -> rejected;
- unconfirmed KeeperHub result -> settling / reconcile same claim;
- replay verification failure -> no conclusion drawn;
- chain RPC unavailable -> partial verification only;
- invalid candidate -> no fingerprint / no valid claim.

Canonical rule:

> If evidence is insufficient, do not manufacture a positive verdict.

---

## Timing gates

### <= 15 seconds

Judge must know:

- the pain: repeated delivery can repeat economic effects;
- the Tender claim: accepted once, owed once, settled once;
- that a real settled case exists;
- product action begins immediately.

Target final video:

0–4s:
Problem + real negative event compression:
“Retries are normal. Duplicate economic effects are not.”

4–7s:
Tender:
“Accepted once. Owed once. Settled once.”

7–15s:
Click **Run the proof** -> **Replay settlement** -> result begins.

The current 66.8s mobile QA recording does **not** meet this 15-second gate because it visits Case first and reaches replay around 22 seconds. That recording is QA evidence, not the final judge cut.

### 30–45 seconds

Judge must have seen:

- replay verdict;
- Δ0 executions;
- Δ$0.00;
- independent/on-chain evidence;
- receipt or transaction proof.

Target:

15–25s:
Replay result.

25–35s:
Independent chain proof + transaction/receipt.

35–45s:
One counter-case:
change amount -> NEW CLAIM -> REQUIRES ACCEPTANCE.

### <= 3 minutes

Full narrative must include:

1. Problem / negative event
2. Tender solution
3. canonical live proof
4. replay refusal
5. independent chain/receipt evidence
6. mutation / negative path
7. why Tender vs transport idempotency
8. architecture only after comprehension
9. end on receipt / invariant

Preferred final video length:
**60–100 seconds**, not 180 seconds unless required.

---

## Current video audit — 2026-09-18

Source:
user-provided mobile screen recording.

Duration:
~66.8 seconds.

Observed sequence:

- ~0s: Home / memory sentence
- ~10s: Case
- ~20–22s: Proof verification + replay control
- ~24–26s: replay verdict / zero deltas
- ~30s: independent proof section
- ~34–38s: BaseScan transaction
- ~45s: Receipt
- ~60s: Lab
- ~66s: same-claim candidate result

### Result

PASS:
- <=3 minutes
- product surfaces are real/live
- Claim -> Demonstration -> Receipt exists
- replay proof is concrete
- external transaction evidence appears
- Lab supplies a counter-case surface

PARTIAL / NEEDS FINAL-CUT CHANGE:
- <=15 seconds: replay begins too late
- Problem is not grounded in the real negative event before solution
- Why Us is not explicit in the recording
- Q&A defenses are not compressed into the submission package

Action:
Use Home -> Proof first in the final recording.
Case becomes later context, not the first click.

---

## Submission Integrity Gate

Before submission, all must be true:

- [x] Production URL deployed
- [x] Public repo available
- [x] Canonical value-moving proof frozen
- [x] 39/39 tests pass
- [x] 12 replay scenarios / 0 duplicate payouts
- [x] Claim / execution / transaction / receipt identities are distinct
- [x] Public runtime cannot broadcast another payment
- [x] Negative paths are retained in evidence
- [x] Real external negative event is sourced in `docs/NEGATIVE-EVIDENCE.md`
- [x] UNKNOWN / UNVERIFIED behavior exists when proof is insufficient
- [ ] Final judge video recut to satisfy <=15s compression gate
- [ ] Final submission copy synchronized with current URL, metrics and design
- [ ] Final mobile visual QA after latest polish redeploy

A failed integrity item blocks final submission packaging.

---

## Final judge-compression rule

> The judge should never need to reconstruct our logic.

By 15 seconds:
understand the problem and see Tender act.

By 45 seconds:
see the invariant demonstrated and independently evidenced.

By the end:
understand why Tender exists, what it refuses to do, and what artifact proves the result.

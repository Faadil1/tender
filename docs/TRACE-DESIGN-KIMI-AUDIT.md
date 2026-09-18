# Tender — Kimi IA & UX Audit (Canonical Extraction)

Source: full Kimi audit supplied by the user on 2026-09-18.

Status: **received in full and reconciled into TRACE design synthesis**.

Scope:
- six-route IA audit;
- judge paths;
- mobile;
- page hierarchy;
- copy compression;
- CTA audit;
- failure states;
- five-identity cognitive-load audit;
- Claim Fingerprint framing;
- replay interaction;
- judge compression;
- seven complexities the user must never have to learn.

Hard constraints preserved:
- no operator functionality;
- no public value-moving execution;
- no marketplace/wallet drift;
- Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt remains intact;
- identities stay distinct.

---

## 1. IA verdict

Kimi's final IA recommendation:

Primary funnel:

**Home -> Case -> Proof -> Lab**

- `/` remains the entry/thesis.
- `/obligation` remains the narrative case.
- `/proof` remains the adversarial verification surface.
- `/lab` remains the second-visit invariant comparison surface.
- `/receipt` keeps a permalink but is treated as an artifact, not primary navigation.
- `/system` is demoted into Proof evidence + a footer-level technical link.

Critical boundary:

- Case = **story of the money**
- Proof = **verification of the claim**

If that boundary collapses, those two routes become duplicates.

---

## 2. Page jobs

- Home: **What is Tender, and what is the one thing it guarantees?**
- Case: **What actually happened, step by step, from accepted work to settled receipt?**
- Proof: **Can I check this myself — and what happens if I run it again?**
- Receipt: **Is there a permanent, shareable artifact that this obligation settled exactly once?**
- Lab: **If the economics had been different, would the claim be different — and does replaying change anything?**
- System: **Why should I trust the machinery?** — answered inline, not as primary nav.

---

## 3. 30-second judge path

1. Land on Home.
2. Read **Accepted once. Owed once. Settled once.**
3. See the canonical case summary with accepted work, claim, receipt and 0.01 USDC Base Sepolia proof.
4. Click **Run the proof**.
5. Proof loads already showing:
   - claim recompute;
   - receipt match;
   - transaction confirmed.
6. Press Replay.
7. See:
   - same fingerprint;
   - 0 additional KeeperHub executions;
   - $0 additional movement;
   - **NO SECOND PAYMENT**.
8. Glance at Base Sepolia transaction link and unchanged fingerprint.

---

## 4. 90-second judge path

1. Home: invariant + canonical case + one-line six-step sequence.
2. Case: timeline once, timestamps, identity labels, open Receipt from terminal state.
3. Proof:
   - recomputed claim;
   - receipt match;
   - on-chain transaction;
   - open **Verify independently**;
   - press Replay.
4. Lab:
   - mutate one economic input;
   - canonical fingerprint stays pinned;
   - candidate fingerprint changes;
   - replay canonical claim;
   - canonical fingerprint remains unchanged.
5. Optional tail: technical Evidence Drawer.

The contrast to preserve:

**mutation changes identity; replay changes nothing.**

---

## 5. 375px mobile

Mobile is not stacked desktop.

### Structure
Bottom nav:
- Home
- Case
- Proof
- Lab

Receipt:
- full-screen artifact.

### Home
- single-column story;
- <=9-word hero claim;
- canonical case as one stacked object;
- sticky bottom CTA: **Run the proof**.

### Case
- vertical snap-scrolling six-state stepper;
- one state per viewport;
- collapsed progress rail;
- identity token + short hash;
- tap-to-copy.

### Proof
- accordion of checks:
  - Recompute
  - Receipt match
  - On-chain tx
- checks visible on first load;
- Replay as sticky thumb-zone primary action;
- replay result as full-height sheet.

### Receipt
- full-screen security-print artifact;
- fingerprint large;
- details stacked;
- share/copy link;
- designed to screenshot cleanly.

### Lab
- Canonical <-> Mutated toggle;
- fixed fingerprint header;
- changed-field diff;
- replay always acts on canonical claim, never candidate.

### Technical
System material is not in nav.
Use a Proof disclosure or footer link.

---

## 6. Page information hierarchy

### Home
Primary:
**Accepted once. Owed once. Settled once.**

Secondary:
canonical case:
- accepted work;
- Tender Claim;
- Tender Receipt;
- 0.01 USDC Base Sepolia transaction.

Tertiary:
six-step sequence + one sentence on judge-safe public runtime.

Hidden:
raw claim JSON / methodology / technical notes.

### Case
Primary:
**This obligation settled exactly once.**

Secondary:
six-state timeline with timestamps and identity labels.

Tertiary:
policy terms, acceptance criteria, authorization record.

Hidden:
raw claim/receipt JSON, full hashes, event log.

### Proof
Primary:
**The chain verifies — independently recomputed, and replay changes nothing.**

Secondary:
- recompute;
- receipt match;
- on-chain transaction;
- replay verdict.

Tertiary:
**Verify independently** read-only calls.

Hidden:
raw RPC responses, full ids, execution logs, reliability evidence.

### Receipt
Primary:
settled once — amount, asset, network, date, fingerprint.

Secondary:
transaction reference + claim discharged.

Tertiary:
obligation timeline.

Hidden:
raw receipt payload/full hashes.

### Lab
Primary:
changed economics -> different claim identity;
replay -> identical identity.

Secondary:
pinned canonical fingerprint vs candidate + field-level diff.

Tertiary:
what can be mutated and why everything here is read-only.

Hidden:
candidate/canonical claim JSON.

---

## 7. Kimi headline proposals

Home:
**Accepted once. Owed once. Settled once.**

Case:
**One obligation, settled exactly once.**

Proof:
**Recompute it. Replay it. Nothing moves twice.**

Receipt:
**The settlement, permanent and public.**

Lab:
**Change the economics. Watch the identity change.**

Replay verdict:
**Same claim. No second payment.**

Synthesis note:
These are Kimi proposals. TRACE may preserve stronger existing copy where product meaning is equal or clearer.

---

## 8. CTA contract

Global rule:
**exactly one visually primary action per viewport.**

### Home
Primary:
**Run the proof**

Secondary:
See the case.

Remove:
generic Learn More / docs / marketing hero CTAs.

### Case
Primary:
**Verify this obligation**

Secondary:
View receipt.

Remove:
per-step CTAs.

### Proof
Primary:
**Replay settlement**

Secondary:
- Verify independently
- View receipt
- Open evidence drawer

Remove:
button to re-run recomputation. Checks should already be executed on load.

### Receipt
Primary:
**Share / copy link**

Secondary:
- View on Base Sepolia
- Back to Case

Remove:
all settle/pay-adjacent language.

### Lab
Primary:
**Mutate an input**

Secondary:
- Reset to canonical
- Replay canonical claim

Remove:
any control that implies a mutation can be applied outside the lab.

Replay remains the loudest verb in the public product.

---

## 9. Failure-state contract

### Proof API unavailable
State:
**UNVERIFIED — verification service unavailable**

Headline:
**Cannot verify right now.**

Show:
- last successful verification as historical, dated;
- Retry verification.

Replay:
disabled while current verification is unavailable.

### Base RPC unavailable
State:
**ON-CHAIN CHECK UNAVAILABLE — RPC unreachable**

Keep:
recompute and receipt-match truthfully independent.

Offer:
public Base Sepolia explorer transaction link.

Page-level state:
**Partially verified**, with explicit list of confirmed/unconfirmed checks.

### Replay endpoint failure
State:
**REPLAY COULD NOT RUN — no conclusion drawn.**

Do not show:
NO SECOND PAYMENT.

Keep visible:
standing canonical settlement record.

Offer:
Retry.

### Invalid Lab candidate
Show field-level reason.

Fingerprint area:
**No fingerprint: no valid claim**

Never show a gray pseudo-fingerprint.

### Canonical proof unavailable
Proof:
**Canonical proof unavailable. Nothing here is verified.**

Home must simultaneously remove any green/verified canonical case styling.

Universal:
- failures are dated;
- failures are retryable;
- failures identify the exact broken link;
- partial proof is rendered as partial;
- red/amber means not proven, never proven-with-caveats.

---

## 10. Five-identity cognitive-load contract

Identities:

1. Acceptance identity
2. Tender Claim identity
3. KeeperHub execution identity
4. Transaction identity
5. Tender Receipt identity

Primary risk:
all appear as visually similar truncated ids.

Mandatory mechanisms:

1. Fixed named/colored/shaped token for every identity.
2. One-line role caption on first appearance per page.
3. Persistent identity legend accessible from any id.
4. Derivation arrows, not flat lists.
5. In Lab:
   - canonical claim labeled **Canonical**;
   - candidate labeled **Hypothetical — cannot settle**.

Kimi-proposed icon family:
- Acceptance: work icon
- Claim: fingerprint glyph
- Execution: gear
- Transaction: chain-link
- Receipt: seal

TRACE correction:
Use chain-link only if it does not drift into generic crypto decoration. Prefer a transaction/ledger-transfer glyph if needed.

Canonical role captions:
- Claim — what is owed
- Receipt — proof it was paid
- Execution — how it was executed
- Transaction — where it settled on-chain

Acceptance:
- Work — why value became eligible

---

## 11. Mobile conversions

- Proof table -> accordion checks.
- Horizontal timeline -> vertical snap stepper.
- Side-by-side Lab -> Canonical/Mutated toggle.
- Desktop rail -> compact header progress + bottom nav.
- Receipt route -> full-screen artifact.
- Verify independently code -> collapsed technical disclosure, tap-to-copy.
- Hover identity help -> tap legend / long-press copy.
- Replay in flow -> sticky bottom action + full-height result sheet.

---

## 12. Claim Fingerprint

Kimi verdict:
**Keep it — it is the product's best idea.**

Canonical framing:
**Claim fingerprint — the visual identity of this claim.**

Do not position it as:
- proof;
- cryptographic verification;
- certificate.

Two demonstrations:
- Replay -> **Unchanged after replay**
- Mutation -> **Changed because the economics changed**

Never replace the recompute check with a “fingerprints match” assertion.

Rendering must be consistent on every surface.

---

## 13. Replay

Make the non-event visible.

Before:
- Settlements: 1
- KeeperHub executions: 1
- USDC moved: 0.01

After replay:
same totals + delta row:

- Δ 0
- Δ 0
- Δ $0.00

Fingerprint:
visible and completely still.

Caption:
**Unchanged after replay**

Verdict:
**Same claim. No second payment.**

Kimi suggests an illustrative permanently inert “Pay again” affordance OR an explicit log line.

TRACE synthesis preference:
Use the explicit system state/log line instead of a fake button:

**No settlement authorized — nothing to execute.**

Reason:
the public UI should not visually imply hidden payment functionality.

Timing:
prefer fast replay feedback when real endpoint latency allows it, but never fake or pre-bake a live result.

---

## 14. Judge compression

0–5 seconds:
exactly-once accepted-work settlement.

5–15 seconds:
canonical sequence + one real obligation walked end-to-end.

15–30 seconds:
Replay proves same claim, unchanged fingerprint, 0 extra executions, $0 additional movement.

30–90 seconds:
Case + Receipt + Verify independently + Lab demonstrate both:
- settled once;
- identity is a pure function of economics.

---

## 15. Seven things the user must never learn

1. **How KeeperHub executes.**
   Show counts/results, not executor mechanics.

2. **What Base Sepolia is or why amount is 0.01 USDC.**
   Network is plumbing; no network literacy required.

3. **How claim id is computed.**
   Determinism is observed, not explained through serialization/hashing details.

4. **Difference between recomputation and settlement.**
   Checking and paying must feel like separate universes without key-management lectures.

5. **Why there are five identities.**
   Tokens/captions/arrows absorb the complexity.

6. **What a guilloche is.**
   User experiences unchanged vs changed fingerprint without learning the visual-generation technique.

7. **Internal policy language.**
   Domain terms arrive only after the UI has shown the thing they name.

---

## Final Kimi recommendations

1. Demote System.
2. Demote Receipt in nav, retain permalink/artifact.
3. Keep Home / Case / Proof / Lab.
4. Make Replay the loudest action.
5. Adopt five-token identity system everywhere.
6. Frame fingerprint as identity, never proof.
7. Make failure states plainer than success.

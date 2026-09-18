# Tender — TRACE Design Synthesis v3

Date: 2026-09-18

Inputs:
- Canonical Tender design v2
- Grok adversarial art-direction review
- Kimi UX/IA audit summary supplied by the user

Status: **canonical synthesis for implementation**

Important limitation:
The Kimi input available to this synthesis is the headline audit summary, not the complete 15-section document. Only conclusions explicitly present in that summary are promoted here. Detailed per-page hierarchy/copy/CTA decisions not included in the summary remain open to implementation QA rather than being fabricated.

---

## 1. Final design thesis

Tender is not a dashboard and not a gallery of settlement pages.

It is **one once-written economic instrument viewed across four jobs**.

The public product must preserve one visual object — the canonical obligation/claim instrument — across:
- understanding;
- causal explanation;
- adversarial verification;
- mutation testing.

Working internal direction name:

**Once-Written Clearing Instrument**

Public product name remains:

**Tender**

Canonical memory sentence remains:

> **Accepted once. Owed once. Settled once.**

The strongest remembered interaction remains:

> **Replay the same accepted work -> same claim -> no second payment -> Δ0 executions -> Δ$0.00**

---

## 2. Final primary IA

Kimi's strongest IA finding is accepted.

### Primary route 1 — `/`

Job:
**What is Tender, and why should I care?**

Role:
- compressed first understanding;
- canonical instrument-as-hero;
- proof compression;
- entry to adversarial proof.

Primary CTA:
**Run the proof**

Above the fold:
- Tender;
- Accepted once. Owed once. Settled once.;
- canonical instrument;
- Claim Fingerprint;
- 1 / 1 / 1 compression;
- proof entry.

Do not turn Home into an architecture essay.

### Primary route 2 — `/obligation`

Job:
**Why did this money become owed?**

Role:
- narrative/causal explanation;
- Policy -> Acceptance -> Claim -> Authorization;
- identity separation;
- accepted-work evidence.

The boundary with Proof is strict:
- Obligation explains **why the obligation exists**.
- Proof demonstrates **whether settlement and replay claims are true**.

Do not duplicate transaction/replay theatre here.

### Primary route 3 — `/proof`

Job:
**Can I verify that it settled once and did not settle twice?**

Role:
- canonical transaction evidence;
- KeeperHub execution evidence;
- independent Base verification;
- replay;
- before/after counters;
- failure states;
- technical evidence drawer.

Primary CTA:
**Replay the same accepted work**

The proof result is not a celebration. It is economic non-novelty.

### Primary route 4 — `/lab`

Job:
**What happens if I change the economics?**

Role:
- hostile invariant test;
- baseline claim vs candidate claim;
- Claim Fingerprint comparison;
- changed fields;
- NEW CLAIM -> REQUIRES ACCEPTANCE;
- no settlement action.

The route is retained because the verifier already exists as a real product proof.

It must never look like a playful AI sandbox.

---

## 3. Secondary surfaces

### Receipt

Kimi's recommendation is accepted:

**Receipt is an artifact, not primary navigation.**

Requirements:
- keep a stable permalink for shareable evidence;
- open as a full-screen artifact from Obligation and Proof;
- preserve direct-linkability;
- remove from primary navigation.

The receipt should feel like the issued remainder of the clearing process, not a destination people browse to discover Tender.

### System / Reliability

Kimi's recommendation is accepted:

**System is not a primary user job.**

Demote:
- architecture;
- test evidence;
- fail-closed rules;
- public/operator boundary;
- machine-readable evidence;

into:
1. a technical **Evidence Drawer** inside `/proof`; and
2. an optional footer permalink/secondary page for deep technical review.

It must not appear in primary navigation.

---

## 4. Final navigation

### Desktop primary nav

- Home
- Case
- Proof
- Lab

Secondary:
- Receipt via Case/Proof
- Technical evidence via Proof drawer/footer

### Mobile bottom nav

- Home
- Case
- Proof
- Lab

Receipt:
- full-screen artifact launched from Case/Proof.

Technical evidence:
- disclosure/drawer from Proof.

No six-item nav.

---

## 5. One instrument across all routes

Grok's strongest objection and Kimi's IA can coexist only if the canonical instrument persists across the four routes.

The instrument is not recreated as a different card per page.

It carries:
- accepted-work context;
- claim identity;
- state;
- Claim Fingerprint;
- proof register.

Each route changes the **view**, not the object.

### Home

Instrument as whole object.

### Obligation

Instrument opens to expose causal layers.

### Proof

Instrument is checked against external evidence and replay.

### Lab

Instrument is placed beside a candidate and compared.

This is the central coherence rule for the implementation.

---

## 6. Claim Fingerprint — final role

Kimi confirms the fingerprint is one of the product's strongest ideas.

Canonical caption:

> **Visual identity of this claim**

Never:
- proof;
- cryptographic proof;
- authenticity guarantee by itself.

Proof lives in:
- deterministic recomputation;
- stored evidence;
- KeeperHub execution;
- transaction;
- independent chain verification;
- replay result.

The fingerprint is the **portrait of the claim**.

### Behaviour

Same economics:
- same claim;
- same fingerprint;
- no flicker/redraw implying a new issue.

Changed economics:
- new claim;
- new fingerprint;
- visible misregistration/difference.

Reduced motion:
- immediate static swap.

---

## 7. Identity system — five distinct tokens

Kimi's biggest cognitive-load warning is accepted:

**Do not render five identities as visually identical truncated hashes.**

Canonical identities:

1. Acceptance
2. Tender Claim
3. KeeperHub Execution
4. Transaction
5. Tender Receipt

Each identity requires:
- stable name;
- stable icon/symbol;
- stable semantic colour;
- one-line role caption;
- consistent ordering;
- derivation arrows where relationships are shown.

### Proposed token map

This map is a Tender synthesis decision, not a direct quote from Kimi:

| Identity | Role caption | Semantic accent |
| --- | --- | --- |
| Acceptance | Why value became eligible | Warning Amber |
| Tender Claim | Economic identity | Claim Coral |
| KeeperHub Execution | Value-moving execution record | Proof Cyan |
| Transaction | Onchain movement | Settlement Lime |
| Tender Receipt | Durable settlement artifact | Receipt Pink |

Rules:
- colour never acts alone;
- icons must be simple and non-crypto-cliché;
- IDs remain inspectable/copyable;
- the legend persists where multiple identities appear;
- arrows explain derivation, not merely chronology.

---

## 8. Replay interaction — final canonical behaviour

This is the core judge interaction.

### Before

Show baseline counters:

- Claims: 1
- KeeperHub executions: 1
- Additional movement: $0.00

### Trigger

**Replay the same accepted work**

### During

- existing instrument remains present;
- Claim Fingerprint does not regenerate;
- no new receipt appears;
- no celebratory success animation;
- no visual suggestion that a new payment can be broadcast.

### After

The **zeros are the headline**:

- Δ claims: 0 new economic claim for the same obligation
- Δ KeeperHub executions: 0
- Δ additional movement: $0.00

Verdict:

> **Same claim. No second payment.**

Secondary seal:

> **NO SECOND PAYMENT**

### Important correction to Kimi's inert-control suggestion

Do not render an enabled-looking `Pay again` button, even if inert.

Instead show a non-interactive system state:

**Second payment unavailable by design**

This preserves the public non-value-moving boundary and avoids implying a hidden broadcast path.

---

## 9. Failure-state contract

Kimi's failure-state rule is accepted in full.

Failure states must be plainer than success.

Canonical principles:
- never green-with-caveats;
- never show a proof verdict when verification failed;
- replay is disabled if the prerequisite proof state is unavailable;
- a replay request failure must not display **NO SECOND PAYMENT**;
- distinguish inability to verify from evidence of failure.

### Canonical failure copy

Top-level:

> **Cannot verify right now.**

Support:
Explain the failed verifier/surface without converting it into settlement truth.

Examples:

Independent Base verification unavailable:
> The recorded settlement remains available, but independent chain verification could not be completed right now.

Replay endpoint unavailable:
> Replay verification did not complete. No replay verdict is being shown.

Invalid mutation input:
> This candidate cannot be recomputed from the supplied values.

No fake success state.

---

## 10. Motion language

Grok's plate-registration language is retained.

### Allowed motion

- registration/alignment;
- pressure/stamp;
- perforation;
- static-to-misregistered candidate comparison;
- replay refusal.

### Priority

1. Replay refusal
2. Claim identity comparison
3. Receipt registration
4. Route transition

If budget is limited, only #1 is mandatory.

### Veto

Reject:
- decorative looping motion;
- confetti;
- generic glowing pulses;
- particles;
- custom cursor personality;
- motion celebrating payment more than refusal.

---

## 11. Colour discipline

Grok's palette objection is accepted.

The broad token palette can exist, but any one surface should normally show:
- Carbon / shell neutral;
- Ledger Paper / instrument;
- one primary semantic ink;
- one exceptional ink at most.

Do not display the entire colour system simultaneously.

Signal Violet and Muted Lilac are non-default.
They may be removed entirely if they do not earn a clear semantic job during implementation.

---

## 12. Proof register

Retain Grok's five-proof compression:

1. Accepted work
2. Tender Claim
3. Tender Receipt
4. KeeperHub Execution
5. Onchain movement

Do not render this as five generic cards.

Use:
- one register;
- numbered exhibits/rows;
- derivation arrows;
- identity tokens.

This is especially useful on Proof.

---

## 13. Judge path

Kimi's 30-second conclusion is accepted.

### 30 seconds

1. Land on Home.
2. Read: **Accepted once. Owed once. Settled once.**
3. Click **Run the proof**.
4. Arrive on Proof.
5. Press **Replay the same accepted work**.
6. See unchanged fingerprint/instrument.
7. See:
   - Δ0 KeeperHub executions
   - Δ$0.00 movement
8. Read:
   **Same claim. No second payment.**

### 90 seconds

The exact deeper path is not fully supplied in the Kimi summary.

Canonical provisional extension:
1. complete the 30-second proof path;
2. open Case to inspect why value became owed;
3. open Receipt artifact;
4. open Lab and mutate one economic input;
5. see new claim / new fingerprint / requires acceptance;
6. optionally open technical Evidence Drawer.

This remains subject to full Kimi-document reconciliation if the complete audit is provided.

---

## 14. Mobile

Kimi explicitly requires mobile-native conversion at 375px.

Canonical rules:
- bottom nav: Home / Case / Proof / Lab;
- instrument occupies the primary viewport, not a stacked dashboard;
- Receipt opens full-screen;
- proof counters become a compact before/after strip;
- identity legend becomes a horizontal/expandable key without page overflow;
- side-by-side mutation comparison may switch to baseline/candidate toggle or swipe;
- no desktop table squeezed to mobile;
- no page-level horizontal scroll.

Detailed mobile component decisions remain implementation work because the full Kimi section was not supplied.

---

## 15. Direction naming

Grok's objection to **Electric** is accepted.

It was useful as an ideation forcing function but is not domain-native enough for the final internal system.

Canonical internal direction name:

**Once-Written Clearing Instrument**

Public-facing product remains simply:

**Tender**

Do not expose the internal direction name as marketing copy unless it earns a clear role later.

---

## 16. Final copy anchors

### Global memory sentence

> **Accepted once. Owed once. Settled once.**

### Home support

> Accepted work becomes one economic obligation. Tender gives it deterministic identity, clears it through KeeperHub, and refuses to pay it twice.

### Proof headline

> **The payment happened. The replay did not.**

### Replay verdict

> **Same claim. No second payment.**

### Lab headline

> **Change the economics. Change the claim.**

### Fingerprint caption

> **Visual identity of this claim**

### Failure

> **Cannot verify right now.**

---

## 17. Final kill criteria

Reject a design mechanism if:

1. it still works unchanged for a generic USDC wallet/checkout;
2. Claim Fingerprint can be removed without structural loss;
3. motion celebrates first payment more than second-payment refusal;
4. more than two loud accents appear without distinct semantic jobs;
5. a still frame cannot communicate Accepted once. Owed once. Settled once.;
6. identities collapse into anonymous truncated hashes;
7. Failure visually resembles Verified;
8. Case and Proof repeat the same information;
9. Receipt behaves like primary navigation instead of an artifact;
10. System/architecture pushes proof below the fold;
11. a public control implies the ability to broadcast another payment;
12. a route exists only because the content needed somewhere to live.

---

## 18. Implementation order

### P0 — comprehension and structure

- four-route shell;
- one persistent instrument;
- Claim Fingerprint static;
- identity token system;
- Home;
- Proof;
- replay before/after counters;
- failure-state contract;
- Receipt artifact overlay/permalink.

### P1 — causal and adversarial depth

- Obligation;
- Lab;
- derivation arrows;
- five-proof register;
- Evidence Drawer;
- independent chain proof presentation.

### P2 — signature polish

- plate-registration transitions;
- replay refusal motion;
- fingerprint mutation interpolation;
- full mobile-native composition;
- final typography/material polish;
- screenshot/demo optimization.

---

## 19. Runtime lock

Unchanged:

- Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt;
- no public value movement;
- no operator credentials in public UI;
- no rerun of canonical payment;
- existing proof values remain canonical;
- design work may not change settlement semantics.

---

## 20. Final synthesis statement

Tender is now designed as **one once-written economic instrument, not a collection of settlement pages**.

The information architecture is intentionally small:

**Home -> Case -> Proof -> Lab**

Receipt is the artifact.
System is evidence.
The Claim Fingerprint is the claim's portrait.
Replay refusal is the remembered interaction.
The zeros are the proof.

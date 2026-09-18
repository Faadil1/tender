# Tender — Grok Adversarial Art Direction Review

Source: user-provided Grok response, 2026-09-18.

Status: **received, cross-examined, not yet promoted into final canonical design**.

The final design synthesis still waits for Kimi's product-architecture review. This document records what survives preliminary cross-examination so we do not lose the signal.

---

## 1. Strongest Grok objection

Grok's central criticism is valid:

> Electric Clearing House risks becoming a themed composition made from four materials — clearing terminal, security printing, editorial evidence and experimental interaction — rather than one unmistakable product object.

The strongest refinement is:

**Tender should be remembered as one issued economic instrument, not as a collection of pages about settlement.**

This does not require returning to one-page architecture. It means the same canonical instrument should remain visually and causally present across surfaces.

---

## 2. Preliminary accepts

### A. Instrument-as-hero

Accepted.

The canonical claim/obligation instrument should dominate the first screen instead of a dashboard shell or marketing composition.

### B. Claim Fingerprint as material, not badge

Accepted and strengthened.

The fingerprint should not sit beside the claim as decoration.

Preferred interpretation:
- guilloche/security-print field is part of the instrument itself;
- same claim preserves the same field;
- changed economics creates a visibly different field;
- replay never redraws/reissues the instrument.

Guardrail:
- never describe fingerprint as cryptographic proof;
- the deterministic claim id remains the actual identity primitive.

### C. Replay-refusal as signature motion

Accepted strongly.

Canonical judge interaction:

REPLAY SAME ACCEPTED WORK
-> same instrument
-> same claim
-> same receipt
-> no second settlement
-> 0 extra KeeperHub executions
-> $0 additional movement

No confetti, no celebratory success motion.

### D. Plate registration as motion language

Accepted.

Registration/alignment is more domain-native than generic page fades, wipes or floating cards.

Use:
- aligned plates = same economic identity;
- misregistration = candidate economics differ;
- settled proof locks into register.

Reduced motion:
- immediate registered/misregistered static state.

### E. Receipt as detachable remainder / stub

Accepted provisionally.

A perforated receipt/stub metaphor is product-native if it remains semantically clear that the Tender Receipt is the durable settlement artifact, not literally a torn-off disposable record.

### F. Persistent 1 / 1 / 1 compression

Accepted conceptually.

- 1 accepted obligation
- 1 economic claim
- 1 settlement

Do not let it collapse Acceptance, Claim and Settlement into the same identity. Labels must remain explicit.

### G. Colour discipline

Accepted.

Keep the broader token system available globally, but restrict each surface to:
- base neutral/background;
- one authority/state ink;
- one exceptional/violence ink.

Colour must express economic state, not atmosphere.

### H. 32px single-well stamp mark

Accepted for exploration.

Concept:
- dense rounded well;
- compact claim-derived arcs/rosette;
- one hard notch indicating used/closed/second-strike refusal.

Do not add:
- checkmark;
- coin;
- chain link.

### I. Five-proof register

Accepted as a proof-compression mechanism, not yet as the whole IA.

Canonical proof set:

1. Accepted work
2. Tender Claim
3. Tender Receipt
4. KeeperHub execution
5. Onchain movement

This can become a persistent proof register across Home/Proof rather than five generic cards.

---

## 3. Preliminary rejects / corrections

### A. "Delete the multi-surface fantasy"

Rejected as stated.

Reason:
- current one-page product is already too monolithic;
- distinct user/judge jobs genuinely exist;
- mobile and proof exploration benefit from route separation;
- operator/public security separation also benefits from explicit surfaces.

Constraint retained:

> Multiple routes must feel like views of one instrument, not six unrelated mini-sites.

Kimi must decide whether all six proposed routes deserve top-level status.

### B. "Delete System"

Not accepted yet.

System/reliability evidence is useful for technical judges and should not pollute the hero.

Possible disposition:
- demote from primary nav;
- move into an Evidence/Details drawer or secondary route.

Kimi should decide information architecture.

### C. "Delete Mutation Lab as destination"

Not accepted yet.

The mutation verifier is already a real product proof, not invented playground functionality.

But Grok's criticism is useful:
- it must be hostile/falsifiable, not playful;
- it should demonstrate changed economics -> NEW CLAIM -> REQUIRES ACCEPTANCE;
- it should not look like an AI sandbox.

Kimi should decide route vs embedded hostile control.

### D. Remove "Electric" from the direction name

Accepted for reconsideration, not final.

"Electric" helped push the palette away from safe ivory but is not domain-native.

Working internal alternatives for synthesis:
- Clearing Instrument
- Once-Written Instrument
- Tender Clearing House
- Registered Claim
- The Refusal Desk

Do not rename product Tender.

### E. "One acceptance cannot mint two debts."

Not promoted as primary headline.

Reason:
- "mint" introduces crypto-specific semantics Tender does not need;
- "debt" is not exactly the same as Tender's obligation primitive.

Canonical memory sentence remains:

**Accepted once. Owed once. Settled once.**

### F. Cheque metaphor

Not canonical.

"A cheque whose paper is the hash" is memorable but can mislead:
- Tender Claim is not a cheque;
- claim id is deterministic identity, not a physical anti-copy guarantee.

Use only as an internal metaphor if helpful.

### G. Loupe as required signature interaction

Not promoted.

Interesting, but weaker than replay-refusal and potentially desktop/pointer biased.

Could remain optional microinteraction if mobile parity is solved.

---

## 4. Direction mutation to carry forward

The Grok review shifts the design from:

**Electric Clearing House = a colourful multi-surface clearing environment**

to:

**Tender = one once-written economic instrument viewed across multiple states and proof surfaces.**

The instrument should be persistent across:
- clearing/home;
- obligation;
- proof;
- receipt;
- mutation verification.

Pages are views of the same object.

---

## 5. Revised visual hierarchy candidate

### Core material

Ledger/security paper remains important, but no lifestyle beige.

### Shell

Dark shell can remain, but it should behave as dead infrastructure around the live instrument, not as the brand itself.

### Primary state ink

Use one dominant state ink at a time:
- Claim / unresolved: Claim Coral
- Settled: Settlement Lime
- Verified independent proof: Proof Cyan
- Refused replay / already settled: authority pink/coral strike or void treatment

### Reduced global palette pressure

Signal Violet, Amber and Lilac should not appear by default.
They must earn a specific semantic role during synthesis.

---

## 6. Revised signature interaction candidate

### Public replay control

Label:
**REPLAY THE SAME ACCEPTED WORK**

Expected sequence:
1. user presses replay;
2. existing instrument stays on screen;
3. no new fingerprint is generated;
4. no new receipt is issued;
5. a second strike/receipt attempt is visibly refused;
6. proof register resolves to:
   - CLAIMS: 1
   - KEEPERHUB EXECUTIONS: 1
   - ADDITIONAL MOVEMENT: $0
7. result label:
   **NO SECOND PAYMENT**

The UI should look calm rather than celebratory.

---

## 7. Kimi questions created by Grok

Kimi must explicitly resolve:

1. Which of the six routes are actual separate user jobs?
2. Should System be top-level, secondary, or folded into evidence?
3. Should Mutation Lab remain a route or become a hostile control on the canonical claim?
4. How does one persistent claim instrument travel through the IA?
5. What is the mobile equivalent of the instrument and proof register?
6. Can Receipt remain a separate route without becoming an ornamental gallery page?
7. How do we preserve distinct identities:
   Acceptance != Claim != KeeperHub execution != transaction != Receipt?
8. How much of the dark shell survives once the instrument becomes dominant?
9. Which colours are genuinely semantic?
10. What is the minimum navigation needed for the 30-second judge path?

---

## 8. Preliminary kill criteria adopted

1. If the design still works after replacing Tender with a generic USDC product, reject it.
2. If Claim Fingerprint can be removed without structural loss, it is too decorative.
3. If motion celebrates payment more than replay refusal, reject it.
4. If a surface uses multiple loud colours without distinct state meaning, simplify it.
5. If a still frame cannot communicate Accepted once. Owed once. Settled once., the composition is not compressed enough.
6. No decorative chain/coin crypto shorthand.
7. No fake terminal/activity theatre.
8. No custom cursor as identity.
9. No generic component-card collage.
10. No public control that visually implies another payment can be broadcast.

---

## 9. Current status

Grok review: **received**.

Preliminary effect:
- strengthens Claim Fingerprint;
- strengthens replay refusal;
- reduces palette sprawl;
- reframes multi-page architecture around one persistent instrument;
- challenges whether all six routes deserve top-level status.

No final design promotion until Kimi review is received and cross-model synthesis is completed.

# Tender — TRACE Design Direction v3

Canonical synthesis: `docs/TRACE-DESIGN-SYNTHESIS.md`

## Direction

**Internal direction:** Once-Written Clearing Instrument

**Product:** Tender

**Memory sentence:** **Accepted once. Owed once. Settled once.**

Tender is one once-written economic instrument viewed across four jobs.

The design must make the user understand:
1. why value became owed;
2. what economic identity was created;
3. what actually settled onchain;
4. why replay creates no second payment.

The visual system combines:
- security printing / guilloche;
- clearing-house registration/stamping;
- editorial evidence hierarchy;
- restrained product interaction.

It is not:
- a wallet dashboard;
- a bounty board;
- a generic crypto product;
- a purple-gradient AI SaaS;
- an Awwwards composition without product meaning;
- a one-page evidence essay.

---

## Canonical information architecture

### `/` — Home

Question:
**What is Tender, and why should I care?**

Primary CTA:
**Run the proof**

Above the fold:
- Tender
- **Accepted once. Owed once. Settled once.**
- canonical once-written instrument
- Claim Fingerprint
- 1 / 1 / 1 compression
- proof entry

### `/obligation` — Case

Question:
**Why did this money become owed?**

Contains:
- Policy
- Acceptance
- Tender Claim
- Authorization
- causal derivation
- raw evidence disclosure

Do not duplicate replay/transaction theatre here.

### `/proof` — Proof

Question:
**Can I verify that it settled once and did not settle twice?**

Contains:
- KeeperHub execution
- transaction
- independent Base verification
- replay
- before/after counters
- five-proof register
- technical Evidence Drawer
- failure states

Primary CTA:
**Replay the same accepted work**

### `/lab` — Invariant Lab

Question:
**What happens if I change the economics?**

Contains:
- baseline claim
- candidate claim
- Claim Fingerprint comparison
- changed fields
- NEW CLAIM -> REQUIRES ACCEPTANCE
- no settlement action

This is a hostile invariant test, not a playground.

---

## Secondary surfaces

### Receipt

Receipt is an artifact, not primary navigation.

Requirements:
- stable permalink;
- full-screen artifact from Case/Proof;
- direct-linkable;
- copyable/inspectable evidence;
- removed from primary nav.

### System / Reliability

System is evidence, not a primary user job.

Move:
- architecture;
- test evidence;
- fail-closed rules;
- public/operator boundary;
- machine-readable evidence;

into:
- an Evidence Drawer inside Proof;
- optional footer/deep-link technical page.

Do not place System in primary nav.

---

## Navigation

### Desktop

Primary:
- Home
- Case
- Proof
- Lab

Secondary:
- Receipt from Case/Proof
- Technical Evidence from Proof/footer

### Mobile

Bottom nav:
- Home
- Case
- Proof
- Lab

Receipt:
- full-screen artifact.

Technical evidence:
- disclosure from Proof.

No page-level horizontal scroll at 375px.

---

## Signature object — Claim Fingerprint

The fingerprint is the **visual identity of the claim**.

It is not proof.

Proof remains:
- deterministic recomputation;
- stored acceptance evidence;
- KeeperHub execution;
- transaction;
- independent chain verification;
- replay result.

### Form

Use deterministic SVG security-print / guilloche geometry derived from `claimId`.

Stable parameters may include:
- line count;
- phase;
- radial frequency;
- angle;
- intersection density;
- crop;
- semantic ink.

### Behaviour

Same economics:
- same claim;
- same fingerprint;
- no visible regeneration on replay.

Changed economics:
- different claim;
- different fingerprint;
- misregistration/difference is visible.

Reduced motion:
- immediate static replacement.

### Material role

Fingerprint must be structural:
- ground of the instrument;
- registration field;
- identity layer.

If it can be removed without weakening the composition, the implementation is too decorative.

---

## One instrument across all routes

The same canonical instrument persists.

### Home
Whole instrument.

### Case
Instrument opens to reveal causal layers.

### Proof
Instrument is checked against transaction, chain proof and replay.

### Lab
Instrument is compared against a candidate.

Pages are views of one object, not four unrelated mini-sites.

---

## Five-identity system

Never render all identities as indistinguishable truncated hashes.

Canonical identities:

1. Acceptance
2. Tender Claim
3. KeeperHub Execution
4. Transaction
5. Tender Receipt

Each requires:
- stable name;
- stable symbol;
- stable semantic accent;
- one-line role caption;
- consistent position/order;
- derivation arrows where relationships appear.

Proposed semantic accents:

| Identity | Role | Accent |
| --- | --- | --- |
| Acceptance | Why value became eligible | Warning Amber |
| Tender Claim | Economic identity | Claim Coral |
| KeeperHub Execution | Value-moving execution record | Proof Cyan |
| Transaction | Onchain movement | Settlement Lime |
| Tender Receipt | Durable settlement artifact | Receipt Pink |

Colour is never the only differentiator.

---

## Five-proof register

Use one compact register, not five generic cards:

1. Accepted work
2. Tender Claim
3. Tender Receipt
4. KeeperHub Execution
5. Onchain movement

The register should show identity and derivation.

---

## Replay — signature interaction

The memorable motion is refusal, not payment success.

### Before

Show baseline:
- Claims: 1
- KeeperHub executions: 1
- Additional movement: $0.00

### Trigger

**Replay the same accepted work**

### During

- existing instrument remains;
- fingerprint does not regenerate;
- no second receipt is issued;
- no confetti;
- no success toast;
- no public control implies a second broadcast is possible.

### Result

The zeros are the headline:

- Δ new claim: 0 for the same obligation
- Δ KeeperHub executions: 0
- Δ additional movement: $0.00

Verdict:

**Same claim. No second payment.**

Seal:

**NO SECOND PAYMENT**

Static system state:

**Second payment unavailable by design**

---

## Visual system

### Base

- Carbon `#0C0910`
- Ledger Paper `#F3E9D8`

### Semantic inks

- Claim Coral `#FF624F`
- Proof Cyan `#40E8E0`
- Settlement Lime `#D8FF43`
- Receipt Pink `#FF4DAF`
- Warning Amber `#FFC247`

Void Plum, Signal Violet and Muted Lilac are non-default and may be removed if they do not earn a clear semantic role.

### Surface discipline

A surface normally uses:
- base shell;
- Ledger Paper instrument;
- one primary semantic ink;
- one exceptional ink at most.

No rainbow palette.

---

## Material language

Use:
- guilloche;
- registration marks;
- perforation;
- microtype;
- audit/settlement stamps;
- ledger numbering;
- dry security-paper texture;
- controlled misregistration for changed economics.

Avoid:
- glass cards;
- glowing blobs;
- random particles;
- crypto chain/coin motifs;
- ornamental 3D;
- fake terminals;
- decorative guilloche unrelated to claim identity.

---

## Typography

Three roles:

1. Display — editorial declaration.
2. Product sans — navigation, labels, controls.
3. Mono — ids, hashes, timestamps, proof facts.

Schoolbell:
- sparse annotation only;
- never body copy;
- optional, not required.

---

## Motion grammar

Canonical grammar:

`TARGET -> TRIGGER -> MOTION -> TIMING -> EXIT/RETURN -> INPUT PARITY -> REDUCED MOTION -> IMPLEMENTATION`

### Priority

1. Replay refusal
2. Claim mutation comparison
3. Receipt registration
4. Route transition

### Plate registration

Alignment = same identity.

Misregistration = changed economics.

### Reduced motion

Every state remains fully understandable without movement.

No autoplay motion is required.

---

## Failure-state contract

Failure must look plainer than success.

Canonical failure headline:

**Cannot verify right now.**

Rules:
- never green-with-caveats;
- never display proof verdict after verifier failure;
- disable replay when prerequisite proof is unavailable;
- failed replay must not show NO SECOND PAYMENT;
- inability to verify is not evidence of settlement failure.

Examples:

Independent chain proof unavailable:
> The recorded settlement remains available, but independent chain verification could not be completed right now.

Replay verification failed:
> Replay verification did not complete. No replay verdict is being shown.

Invalid mutation:
> This candidate cannot be recomputed from the supplied values.

---

## Judge compression

### 0–5 seconds

**Accepted once. Owed once. Settled once.**

Judge sees one instrument, not a dashboard.

### 5–15 seconds

Judge understands:
- accepted work;
- one claim;
- settled state;
- proof is available.

### 15–30 seconds

1. click **Run the proof**
2. press **Replay the same accepted work**
3. see unchanged fingerprint
4. see Δ0 executions
5. see Δ$0.00
6. read **Same claim. No second payment.**

### 30–90 seconds

Deeper path:
- Case: why value became owed;
- Receipt: durable artifact;
- Lab: mutate one economic input;
- new claim/fingerprint;
- requires acceptance;
- technical Evidence Drawer if needed.

---

## Mobile rules

At 375px:

- instrument remains primary;
- bottom nav = Home / Case / Proof / Lab;
- Receipt is full-screen;
- proof counters become compact before/after rows;
- identity legend becomes expandable or horizontally compact without overflow;
- mutation compare becomes baseline/candidate toggle or swipe;
- no desktop tables squeezed onto mobile;
- no page-level horizontal scroll;
- 44px minimum critical target.

---

## Component inventory

### TenderShell
Global product shell.

### TenderNav / MobileNav
Four primary destinations.

### ClaimInstrument
The persistent economic instrument.

### ClaimFingerprint
Deterministic claim portrait.

### IdentityToken
Acceptance / Claim / Execution / Transaction / Receipt.

### DerivationRail
Causal relationships between identities/states.

### ProofRegister
Five-proof compression.

### ReplayRefusal
Before/after replay result.

### ReceiptArtifact
Full-screen/permalink settlement artifact.

### EvidenceDrawer
Raw/technical proof.

### MutationCompare
Baseline/candidate invariant comparison.

### ChainProofPanel
Independent Base verification.

### FailurePanel
Plain unavailable/unverified state.

---

## TRACE reference routing

### Product / mobile
- Mobbin
- Pageflows
- Appbrainy
- UXGoodies / Janus
- Fiona Lim

### Art direction
- Annual Report Gallery
- Studio Thonik
- Cue Design
- Daniel Snows
- Inspora
- Awwwards as quality bar only

### Motion
- 60FPS Design
- Transitions.dev
- Motion Primitives
- Rare UI
- Sohrab Khan
- Emil Kowalski as animation veto

### Components
- shadcn/ui
- ReUI
- Beautiful UI
- OpenSourceUI
- Component Gallery

### Materials / identity
- Logosystem
- The Met Collection
- Backgrounds Supply if licensed
- Are.na
- Schoolbell sparingly

---

## ETHOnline lesson

Do not copy the purple finalist-card aesthetic.

Retain the structural lesson:

**one sentence + one recognisable object + one falsifiable proof**

Tender:

Sentence:
**Accepted once. Owed once. Settled once.**

Object:
**Once-written Claim Instrument / Claim Fingerprint**

Proof:
**Same claim. No second payment. Δ0 executions. Δ$0.00.**

---

## Implementation priority

### P0

- four-route shell;
- routing;
- ClaimInstrument;
- static ClaimFingerprint;
- identity tokens;
- Home;
- Proof;
- replay refusal;
- failure states;
- Receipt artifact/permalink.

### P1

- Case;
- Lab;
- derivation relationships;
- Proof Register;
- Evidence Drawer;
- independent chain proof presentation.

### P2

- registration motion;
- fingerprint mutation animation;
- mobile-native refinements;
- final material/typography polish;
- demo/screenshot optimization.

---

## Accessibility / QA

Required:
- 375px;
- 390px;
- 768px;
- 1280px;
- 1440px;
- keyboard navigation;
- visible focus;
- reduced motion;
- 200% zoom;
- no colour-only states;
- long ids safe;
- no page horizontal scroll;
- failure-state QA;
- proof API failure;
- Base RPC failure;
- replay failure;
- invalid mutation;
- public/operator boundary check.

---

## Kill criteria

Reject any implementation if:

1. it works unchanged as a generic USDC product;
2. Claim Fingerprint is removable without structural loss;
3. payment success gets more motion than replay refusal;
4. loud colour lacks a state job;
5. a still frame cannot communicate Accepted once. Owed once. Settled once.;
6. identities collapse into anonymous hashes;
7. Failure resembles Verified;
8. Case and Proof duplicate each other;
9. Receipt becomes primary navigation;
10. architecture pushes proof away from the main path;
11. public UI implies a second payment can be broadcast;
12. a route exists only because content needed somewhere to live.

---

## Runtime lock

The redesign does not change:

- Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt;
- deterministic economic identity;
- canonical live proof;
- replay safety;
- independent chain verification;
- public proof vs authenticated operator separation;
- no public value movement;
- no canonical payment rerun.

---

## Final statement

Tender should feel like **one once-written economic instrument whose identity survives settlement and whose replay visibly produces nothing new**.

Receipt is the artifact.

System is evidence.

Claim Fingerprint is the claim's portrait.

Replay refusal is the remembered interaction.

The zeros are the proof.

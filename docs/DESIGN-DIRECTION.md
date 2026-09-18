# Tender — TRACE Design Direction v2

## Canonical Direction

**Direction name:** Electric Clearing House

**Memory sentence:** **Accepted once. Owed once. Settled once.**

**Product sentence:** Tender turns accepted work into one deterministic economic obligation, clears it through KeeperHub, and preserves the causal proof.

**Proof sentence:** The canonical obligation settled once; replay returned the same claim, created zero additional KeeperHub executions, and moved $0 again.

Tender should no longer present itself as one long evidence page. The judge-facing product becomes a **multi-surface clearing system** whose visual language sits between:

- a clearing house / settlement terminal;
- a security-printed receipt or certificate;
- an editorial evidence dossier;
- a live product interface with explicit state transitions.

It is not a wallet dashboard, bounty board, generic crypto product, purple-gradient AI SaaS, glassmorphism demo, or a Dribbble composition pretending to be a product.

The redesign changes presentation, IA, navigation, interaction and visual identity. It **does not change Tender's economic semantics or settlement runtime**.

---

## 1. Why this direction is native to Tender

Tender's product is an identity-and-clearing system.

The important states are:

`POLICY -> ACCEPTANCE -> CLAIM -> AUTHORIZATION -> SETTLEMENT -> RECEIPT`

The UI therefore needs to make four things legible:

1. **Why money became owed.**
2. **What exact economic identity was created.**
3. **What moved value and what proved it.**
4. **Why a replay did not move value again.**

The interface should feel like a system where obligations become legible, settle, and leave evidence.

---

## 2. Signature device: Claim Fingerprint

Every Tender Claim gets a deterministic procedural visual mark generated from the `claimId`.

### Form

Use an SVG/canvas guilloche / interference-line motif inspired by security printing, settlement certificates and anti-counterfeit marks.

The mark should derive stable visual parameters from the claim hash:

- line count;
- phase;
- radial frequency;
- angle;
- intersection density;
- accent pair;
- crop.

### Product meaning

This is not decorative branding.

- Same economics -> same claim -> same fingerprint.
- Changed amount / recipient / policy / accepted work -> different claim -> different fingerprint.
- Replay -> fingerprint remains unchanged and the existing receipt is referenced.
- Mutation Lab -> fingerprint visibly morphs when a candidate creates a different claim.

This becomes Tender's recognisable symbol in the same way strong ETHOnline finalists compress an idea into one visual object.

### Reduced motion

The fingerprint renders as the final static SVG with no interpolation.

---

## 3. Visual system

### 3.1 Palette

Take materially more chromatic risk than the current ivory page while keeping proof surfaces readable.

| Token | Value | Role |
| --- | --- | --- |
| Void Plum | `#160B24` | Main dark shell / deep background |
| Carbon | `#0C0910` | Highest-contrast structural black |
| Ledger Paper | `#F3E9D8` | Receipts, evidence sheets, readable long-form |
| Proof Cyan | `#40E8E0` | Independent verification / links / active proof |
| Settlement Lime | `#D8FF43` | Settled / verified economic state |
| Claim Coral | `#FF624F` | Claims, action, attention |
| Receipt Pink | `#FF4DAF` | Artifact / signature moments |
| Signal Violet | `#7B61FF` | Navigation / system context |
| Warning Amber | `#FFC247` | Review / pending / caution |
| Muted Lilac | `#A99AB8` | Secondary text on dark |

Rules:

- Never use colour as the only state indicator.
- Ledger Paper remains available for dense evidence and receipt reading.
- No generic blue-purple gradient background.
- Gradients, if used, belong inside the claim fingerprint or state transition only.
- Lime is scarce: it should feel earned when settlement is proven.

### 3.2 Material language

Primary material cues:

- security-print guilloche;
- perforation / tear rules;
- registration marks;
- ledger row numbers;
- audit stamps;
- microtype metadata;
- signal stripes;
- clipped receipt edges;
- translucent ink overlays, not frosted-glass cards.

Background texture may use Backgrounds Supply only when licensing is clean and the texture remains subordinate to evidence.

### 3.3 Typography

Use a three-layer system:

1. **Display:** expressive editorial serif / display face for large declarations.
2. **Product UI:** neutral grotesk / sans for navigation, controls and dense states.
3. **Data:** monospace for ids, transaction hashes, timestamps and economic evidence.

**Schoolbell** is allowed only as a sparse annotation layer: “same claim”, “verified”, “$0 again”, or hand-marked demo callouts. Never body copy.

Studio Thonik is the reference for using typography as composition rather than simply styling text.

---

## 4. TRACE reference routing for this build

Do not use all references simultaneously. Route by problem.

### Product flow / mobile

Primary:
- Mobbin — real product behaviours and mobile conventions.
- Pageflows — task sequencing and interaction order.
- Appbrainy — mobile financial / commerce flows.
- UXGoodies / Janus — AI-native product patterns.
- Fiona Lim — conversion/friction where judge action needs compression.

### Art direction

Primary:
- Annual Report Gallery — evidence hierarchy, information storytelling, graphic systems.
- Studio Thonik — typography as identity and composition.
- Cue Design — premium anti-generic interactions.
- Daniel Snows — high-impact hero composition.
- Inspora — uniqueness audit / accidental-lineage check.
- Awwwards — quality bar, not UX authority.

Secondary discovery only:
- Dribbble, Behance, SiteInspire, Lapa Ninja, Framer Gallery.

### Motion / signature interaction

Primary:
- 60FPS Design — motion quality bar.
- Transitions.dev — component/state transition logic.
- Motion Primitives — state changes and disclosures.
- Rare UI — one or two signature interactions.
- Sohrab Khan — creative-development quality.
- Emil Kowalski — veto unnecessary animation.

Selective:
- React Bits / Aceternity / Canvas UI / Codrops for the deterministic fingerprint and only other mechanisms with product meaning.

### Components / systems

Primary:
- shadcn/ui — accessible foundations.
- ReUI — dense evidence/data surfaces.
- Beautiful UI — AI-native approval / status patterns where useful.
- OpenSourceUI — inspectable implementation references.
- Component Gallery — compare real system patterns before choosing.

### Brand / material

Primary:
- Logosystem — symbol/wordmark discipline.
- The Met Collection — motif/proportion/material research.
- Schoolbell — sparse annotations.
- Are.na — cross-domain research.

---

## 5. ETHOnline finalist lessons

The supplied finalist references are useful for **compression**, not for copying their purple showcase cards.

Observed useful traits:

- LeekWallet: one physical/security idea, immediately legible.
- Novi Corpus: one strange but concrete institutional proposition.
- TARE: one measurable claim plus a memorable number.
- OpenBook: one market promise compressed into a sentence.
- Cordon: one coordination problem.
- Petri: one metaphor that explains the mechanism.
- OnchainRouter: one category analogy (“OpenRouter for onchain tools”).
- ETH Arcade: one surprising product object with a clear interaction metaphor.

Tender should match that compression quality:

> **Accepted once. Owed once. Settled once.**

Then prove it quickly:

> **Replay verified: same claim · 0 extra executions · $0 moved again.**

The UI should let a judge understand that before reading architecture text.

---

## 6. Multi-surface information architecture

### Surface 1 — `/` — Clearing House

Purpose: compressed product understanding.

Above the fold:

- Tender wordmark + compact navigation.
- Memory sentence: **Accepted once. Owed once. Settled once.**
- Product line: “Accepted work becomes one economic obligation. Tender clears it once.”
- Large animated Claim Fingerprint for the canonical claim.
- Proof strip:
  - 1 accepted work
  - 1 claim
  - 1 settlement
  - 1 receipt
  - replay -> $0
- CTAs:
  - **See the live proof**
  - **Open the obligation**
- A compact settlement rail showing the six states.

The homepage should not contain every receipt field.

### Surface 2 — `/obligation` — Obligation Case

Purpose: explain why value became owed and show the complete causal case.

Layout:

- Case header with status, amount, recipient and accepted-work id.
- Settlement Rail: Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt.
- Acceptance evidence module.
- Economic Claim module.
- Compact policy card.
- Expandable raw evidence drawer.
- Link to canonical receipt.

Judge question answered: **Why did this payment exist?**

### Surface 3 — `/proof` — Live Proof Room

Purpose: judge-facing proof theatre.

Contains:

- KeeperHub execution id.
- transaction hash and explorer action.
- independent Base verification.
- receipt verification state.
- replay control.

The replay interaction is the central demo:

1. press Verify same obligation;
2. settlement rail does **not** create a new settlement node;
3. fingerprint remains identical;
4. a large seal arrives: **NO SECOND PAYMENT**;
5. proof numbers settle to:
   - SAME CLAIM = TRUE
   - EXTRA EXECUTIONS = 0
   - EXTRA MOVEMENT = $0

Judge question answered: **Did it really move once, and only once?**

### Surface 4 — `/receipt` — Receipt Artifact

Purpose: make the output feel like a real product artifact.

The canonical Tender Receipt is rendered as a full-height security-print object:

- deterministic Claim Fingerprint;
- receipt id;
- claim id;
- accepted-work identity;
- policy version;
- recipient;
- amount / asset;
- KeeperHub execution;
- transaction;
- timestamp;
- settlement state.

Actions:

- Inspect transaction.
- Copy receipt id.
- Open machine-readable proof.

Avoid fake PDF/download behaviour unless implemented.

Judge question answered: **What artifact survives after settlement?**

### Surface 5 — `/lab` — Mutation Lab

Purpose: expose the product's strongest technical invariant interactively.

Inputs:

- amount;
- recipient;
- policy version.

Optional later:
- accepted-work id.

Behaviour:

- baseline fingerprint appears on left;
- candidate fingerprint appears on right;
- changing economics produces a new claim/fingerprint;
- same economics returns existing settled claim;
- changed economics returns **NEW CLAIM · REQUIRES ACCEPTANCE**;
- no value-moving control exists here.

Use a split comparison layout, not a generic form.

Judge question answered: **What prevents retries/mutations from becoming duplicate payments?**

### Surface 6 — `/system` — System / Reliability

Purpose: deeper technical proof without polluting the homepage.

Contains:

- domain boundary diagram;
- acceptance vs obligation vs execution identity;
- KeeperHub role;
- replay harness results;
- test status;
- fail-closed rules;
- runtime lock / public-vs-operator boundary;
- machine-readable evidence links.

Judge question answered: **Is this engineered or staged?**

### Explicitly separate operator surface

Do **not** expose the authenticated value-moving operator as a public judge control.

A later operator console can exist, but the current public product remains proof/replay/read-only. The redesign must preserve this security boundary.

---

## 7. Navigation

### Desktop

Persistent compact top navigation:

- Clearing House
- Obligation
- Proof
- Receipt
- Lab
- System

A thin **Settlement Rail** persists across product surfaces and visually indicates the current causal stage.

### Mobile

Follow Mobbin/Pageflows conventions instead of shrinking desktop.

Bottom navigation:

- Home
- Case
- Proof
- Lab

Receipt opens from Case/Proof as a full-screen artifact.

System is reachable from an overflow/menu surface.

No horizontal page scroll at 375px.

---

## 8. Component system

Canonical components:

### `TenderShell`
Global nav, page transition frame, dark chromatic shell.

### `SettlementRail`
Six causal states with current/completed/blocked semantics.

### `ClaimFingerprint`
Deterministic SVG/canvas security-print visual generated from claim id.

### `ProofStrip`
Five-number compression strip for judge scanning.

### `EvidenceSheet`
Ledger-paper component for acceptance/policy/raw evidence.

### `ReceiptArtifact`
Security-print settlement receipt.

### `ReplaySeal`
Stateful “NO SECOND PAYMENT” result, not a decorative badge.

### `ChainProofPanel`
Independent Base verification with explorer handoff.

### `MutationCompare`
Baseline/candidate fingerprints + changed-field diff.

### `EvidenceDrawer`
Raw ids and machine-readable evidence without cluttering primary reading.

### `StateChip`
Text + shape + colour state system.

Avoid a generic card grid. Components should visibly belong to the clearing-house metaphor.

---

## 9. Motion grammar

Use the canonical TRACE grammar:

`TARGET -> TRIGGER -> MOTION -> TIMING -> EXIT/RETURN -> INPUT PARITY -> REDUCED MOTION -> IMPLEMENTATION`

### Page transition

- TARGET: content stage.
- TRIGGER: navigation.
- MOTION: security-print wipe / registration-line alignment.
- TIMING: 220–360ms.
- EXIT: old layer recedes; new layer locks into registration.
- Reduced motion: instant crossfade / no translation.

### Claim fingerprint

- TARGET: guilloche lines.
- TRIGGER: initial render or candidate mutation.
- MOTION: deterministic interpolation between parameter sets.
- TIMING: 450–700ms.
- Reduced motion: replace SVG immediately.

### Settlement proof

- TARGET: Settlement Rail + Receipt.
- TRIGGER: canonical proof loaded.
- MOTION: rail advances once, receipt registers, lime appears only at settled state.
- Reduced motion: all settled facts appear immediately.

### Replay

- TARGET: existing claim/fingerprint + ReplaySeal.
- TRIGGER: Verify same obligation.
- MOTION: a pulse travels the rail but stops at the existing receipt; no new receipt appears.
- RESULT: “NO SECOND PAYMENT”.
- Reduced motion: result swaps without pulse.

### Mutation

- TARGET: baseline/candidate.
- TRIGGER: form input.
- MOTION: candidate fingerprint morph + changed fields reveal.
- Reduced motion: static replace.

No autoplay loops other than a very subtle claim-fingerprint idle phase if it passes distraction QA.

---

## 10. Judge Compression Layer

### 0–5 seconds

Judge understands:

**Accepted once. Owed once. Settled once.**

### 5–12 seconds

Judge sees:

- canonical claim fingerprint;
- 0.01 USDC;
- SETTLED;
- KeeperHub proof available.

### 12–22 seconds

Judge opens Proof and independently verifies chain evidence.

### 22–35 seconds

Judge hits replay and sees:

**same claim · 0 extra executions · $0 moved**

### 35–60 seconds

Judge opens Mutation Lab and changes the amount:

**new fingerprint · new claim · requires acceptance · $0 moved**

The strongest proof is therefore visible without architecture narration.

---

## 11. Copy system

### Homepage

**Headline**
Accepted once. Owed once. Settled once.

**Support**
Accepted work becomes one economic obligation. Tender gives it deterministic identity, clears it through KeeperHub, and refuses to pay it twice.

**Proof strip**
1 accepted work · 1 claim · 1 settlement · 1 receipt · replay = $0

### Proof

**Headline**
The payment happened. The replay did not.

**Support**
KeeperHub cleared the obligation. Tender preserved its identity. Replaying the same economics references the existing receipt instead of broadcasting again.

### Lab

**Headline**
Change the economics. Change the claim.

**Support**
Amount, recipient, policy and accepted work belong to the economic identity. Retries do not.

### Receipt

**Headline**
The economic record that survives execution.

---

## 12. Accessibility / QA gates

Before promotion:

- 375px mobile with no horizontal page scrolling.
- 44px minimum critical touch targets.
- keyboard-visible focus.
- semantic landmarks and heading order.
- no state encoded by colour alone.
- full `prefers-reduced-motion` behaviour.
- long ids never overflow.
- proof data remains readable at 200% zoom.
- no animation blocks interaction.
- fingerprints remain decorative to screen readers unless a textual claim-state description is provided.
- public pages never expose operator credentials or value-moving actions.

---

## 13. Implementation sequencing

### Phase A — foundation

- route shell;
- tokens;
- typography;
- navigation;
- Settlement Rail;
- EvidenceSheet;
- ClaimFingerprint static version.

### Phase B — split current page

Move existing functionality into:

- Home;
- Obligation;
- Proof;
- Receipt;
- Lab;
- System.

No runtime-semantic change.

### Phase C — signature motion

- fingerprint morph;
- replay rail pulse;
- receipt registration;
- page transitions.

### Phase D — mobile / reduced motion

- bottom navigation;
- full-screen receipt;
- 375px QA;
- reduced-motion parity.

### Phase E — judge pass

- 60-second comprehension test;
- proof above the fold;
- demo video path;
- screenshot/card assets;
- failure states.

---

## 14. Anti-slop rules

Reject any implementation that introduces:

- generic dark-blue AI dashboard;
- glowing gradient blobs unrelated to state;
- floating 3D objects with no product meaning;
- random particle fields;
- glass cards everywhere;
- oversized “AI” iconography;
- chain/coin decoration as crypto shorthand;
- endless scroll as information architecture;
- animation whose removal does not change meaning;
- a card grid replacing actual product flow.

The design can be visually wild, but every unusual mechanism must strengthen identity, proof, causality, or comprehension.

---

## 15. Runtime lock

The redesign must preserve:

- Acceptance -> Claim -> Authorization -> Settlement -> Receipt semantics.
- deterministic economic identity;
- canonical live proof;
- replay safety;
- independent chain verification;
- public proof vs authenticated operator separation;
- no public value-moving execution;
- no rerun of canonical payment.

The runtime is locked unless a real bug is discovered.

---

## 16. Canonical creative verdict

**Tender should feel like a live clearing house with the visual authority of a security document and the energy of an experimental product interface.**

The single strongest distinctive move is the **deterministic Claim Fingerprint** coupled to the economic identity. The single strongest judge interaction is **Replay -> Same Claim -> No Second Payment -> $0 moved**.

Everything else should support those two ideas.

# Tender — Grok / Kimi / Build Prompt Pack

This packet is for external cross-examination of the canonical TRACE direction:

**Electric Clearing House**

Canonical product invariant:

> Accepted once. Owed once. Settled once.

Do not let any reviewer redesign Tender into a bounty marketplace, generic wallet, crypto dashboard, or AI SaaS.

---

# 1. Grok — Adversarial Art Director / Distinctiveness Pass

## Role

You are the adversarial art director for a hackathon product that is already technically proven.

Your job is **not** to make it prettier. Your job is to make it harder to forget while preserving the product's domain truth.

You are allowed to be visually aggressive.

You are not allowed to invent product capabilities or weaken proof.

## Product

Tender is settlement infrastructure for accepted software contributions.

GitHub proves what work was accepted. Tender determines whether that acceptance creates one economic obligation, gives it deterministic identity, authorizes settlement, clears it through KeeperHub, and preserves the receipt.

Core invariant:

> One accepted obligation -> one settlement.

Canonical proof:

- one accepted work id;
- one Tender Claim;
- one Tender Receipt;
- one KeeperHub execution;
- one 0.01 USDC Base Sepolia settlement;
- replay -> same claim;
- replay -> 0 extra KeeperHub executions;
- replay -> $0 additional movement.

Public runtime is judge-safe and cannot broadcast another payment.

## Current design problem

The product is currently expressed as one long editorial proof page with an ivory ledger aesthetic.

It is understandable, but too safe and too monolithic.

The new canonical direction is:

**Electric Clearing House**

A multi-surface product that combines:

- clearing terminal;
- security printing / guilloche;
- editorial evidence system;
- experimental but purposeful interaction.

Signature mechanism:

**Claim Fingerprint**

A deterministic procedural guilloche/security-print mark generated from the claim id.

Same economics -> same fingerprint.
Changed economics -> different fingerprint.
Replay -> fingerprint stays unchanged.

Primary routes:

- Home / Clearing House
- Obligation
- Proof
- Receipt
- Mutation Lab
- System

## Visual constraints

Current proposed palette:

- Void Plum #160B24
- Carbon #0C0910
- Ledger Paper #F3E9D8
- Proof Cyan #40E8E0
- Settlement Lime #D8FF43
- Claim Coral #FF624F
- Receipt Pink #FF4DAF
- Signal Violet #7B61FF
- Warning Amber #FFC247
- Muted Lilac #A99AB8

Avoid:

- generic blue/purple AI SaaS;
- random gradients;
- glassmorphism everywhere;
- floating 3D decoration;
- meaningless particles;
- coin/chain clichés;
- one-page landing layout;
- component-library collage.

## References to use selectively

Use these as mechanisms / quality bars, not templates:

Art direction:
- Annual Report Gallery
- Studio Thonik
- Cue Design
- Daniel Snows
- Inspora
- Awwwards

Interaction:
- Rare UI
- 60FPS Design
- Motion Primitives
- Transitions.dev
- Sohrab Khan
- Codrops

Materials:
- The Met Collection
- Backgrounds Supply
- Logosystem
- Schoolbell only for sparse annotations

ETHOnline finalist lesson:
one memory sentence + one recognisable object + one proof.

Tender's memory sentence already exists:

> Accepted once. Owed once. Settled once.

## Assignment

Produce:

1. A ruthless critique of **Electric Clearing House**.
2. Identify anything that still smells like:
   - generic fintech;
   - generic crypto;
   - generic AI;
   - Awwwards-for-Awwwards-sake;
   - “hackathon site”.
3. Propose **3 bolder but still domain-native mutations** of the direction.
4. For each mutation specify:
   - hero composition;
   - dominant material;
   - page transition;
   - claim fingerprint treatment;
   - receipt treatment;
   - strongest colour risk;
   - one signature interaction.
5. Choose the strongest individual mechanisms from all 3 directions. Do **not** choose an overall winner.
6. Give 5 “kill criteria” that should cause a visual idea to be rejected.
7. Compress Tender into:
   - 5-word category phrase;
   - one headline;
   - one proof sentence;
   - one visual metaphor.
8. Suggest one icon / mark concept that can survive at 32px.
9. Suggest one interaction that judges will remember 24 hours later.
10. End with a list titled:
   **WHAT I WOULD DELETE BEFORE ADDING ANYTHING ELSE**

Do not propose new backend features.

Do not optimize for implementation convenience during ideation; feasibility will be applied after divergence.

---

# 2. Kimi — Product Architecture / UX Compression Pass

## Role

You are the product architect and UX editor.

Your job is to remove ambiguity, reduce navigation friction, make the proof flow inevitable, and keep every surface tied to a real judge/user question.

Do not change Tender's economic model.

## Product facts

Tender turns accepted work into a deterministic economic obligation and settles it exactly once.

Canonical sequence:

Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt.

Canonical public proof already exists.

Public judge runtime:
- can recompute claims;
- can replay an already-settled obligation;
- can independently verify the chain;
- cannot broadcast another payment.

## Canonical IA under review

1. `/` — Clearing House
2. `/obligation` — canonical obligation case
3. `/proof` — chain proof + replay
4. `/receipt` — settlement artifact
5. `/lab` — economic mutation/fingerprint comparison
6. `/system` — architecture/reliability evidence

Mobile bottom nav:
- Home
- Case
- Proof
- Lab

Receipt is reachable from Case and Proof.

## Assignment

Audit this IA as a real product, not as a portfolio site.

Return:

1. **Navigation critique**
   - which pages are genuinely separate jobs;
   - which should merge;
   - which should be secondary;
   - whether any important job is missing.
2. **Primary user/judge jobs** for each surface in one sentence.
3. **30-second judge path** with exact clicks.
4. **90-second judge path** with exact clicks.
5. **Mobile path** at 375px.
6. **Information hierarchy** for every page:
   - primary fact;
   - secondary proof;
   - tertiary detail;
   - hidden/raw evidence.
7. **Copy compression**
   Rewrite every major page headline to <= 9 words.
8. **CTA audit**
   One primary CTA per surface; flag all unnecessary actions.
9. **Failure-state audit**
   What should a judge see if:
   - proof API fails;
   - Base RPC verification fails;
   - replay endpoint fails;
   - candidate claim input is invalid.
10. **Cognitive-load audit**
    Identify every place a judge could confuse:
    - acceptance identity;
    - economic claim identity;
    - KeeperHub execution identity;
    - transaction identity;
    - receipt identity.
11. **Mobile conversion**
    Convert desktop patterns to mobile-native patterns rather than stacking them.
12. End with:
    **THE 7 THINGS THE USER MUST NEVER HAVE TO LEARN**

Do not invent operator functionality.

Do not expose value-moving execution publicly.

---

# 3. Cross-model synthesis prompt

Use this after Grok and Kimi return.

## Role

You are the synthesis editor.

Inputs:
- canonical Tender TRACE direction;
- Grok adversarial art-direction review;
- Kimi product-architecture review.

Rules:

- One evidence-backed objection defeats visual consensus.
- Product semantics beat visual novelty.
- UX clarity beats animation.
- Distinctiveness beats familiarity only when comprehension remains fast.
- Do not average conflicting ideas into a weak middle.
- Preserve the Claim Fingerprint unless a reviewer proves it harms comprehension or falsely implies cryptographic security beyond deterministic visual identity.
- Preserve the public/operator security boundary.

Produce:

1. decisions accepted from Grok;
2. decisions rejected from Grok and why;
3. decisions accepted from Kimi;
4. decisions rejected from Kimi and why;
5. final sitemap;
6. final palette;
7. final typography roles;
8. final component inventory;
9. final motion inventory;
10. final mobile rules;
11. exact hero copy;
12. exact 30-second demo route;
13. implementation order P0 / P1 / P2;
14. kill list.

No new backend features.

---

# 4. Build Agent — Implementation Prompt

## Mission

Implement the canonical Tender **Electric Clearing House** redesign as a true multi-surface judge-facing product.

Do not reinterpret the backend.

Do not change settlement semantics.

Do not rerun the canonical value-moving proof.

## Read first

- `state/CURRENT.yaml`
- `state/HANDOVER.yaml`
- `docs/DESIGN-DIRECTION.md`
- `docs/ARCHITECTURE.md`
- `docs/OPERATOR-RUNTIME.md`
- `docs/RUNTIME-PROOF-RESILIENCE.md`
- `evidence/live-proof.json`
- current `public/index.html`
- current `public/main.js`
- current CSS
- Cloudflare asset routing in `src/cloudflare/index.ts`
- local static routing in `src/server/index.ts`

## Hard product constraints

Preserve:

- Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt.
- deterministic claim identity.
- canonical proof ids.
- independent chain proof.
- replay -> same claim -> 0 additional executions -> $0 movement.
- public proof vs authenticated operator separation.
- no public value-moving controls.

Never expose:

- TENDER_OPERATOR_TOKEN;
- KeeperHub API keys;
- authenticated operator mutations.

## Target surfaces

Build actual separate surfaces:

- `/`
- `/obligation`
- `/proof`
- `/receipt`
- `/lab`
- `/system`

If the current static asset layer cannot serve extensionless paths in both Cloudflare and local development, add the smallest routing shim necessary. Do not touch domain settlement logic to achieve routing.

## Visual direction

Use `docs/DESIGN-DIRECTION.md` as source of truth.

Core signature:

**ClaimFingerprint**

Implement deterministic procedural visual generation from claim id.

Requirements:

- stable for same claim;
- visibly different for a changed candidate claim;
- no external runtime dependency;
- SVG preferred unless canvas materially improves the result;
- accessible textual equivalent;
- reduced motion static path.

Do not call the fingerprint cryptographic proof. It is a deterministic visual identity tied to an already-computed claim id.

## Component inventory

Implement reusable primitives rather than six unrelated pages:

- TenderShell
- TenderNav
- MobileNav
- SettlementRail
- ClaimFingerprint
- ProofStrip
- EvidenceSheet
- ReceiptArtifact
- ReplaySeal
- ChainProofPanel
- MutationCompare
- EvidenceDrawer
- StateChip

Use current stack and minimal dependencies. Do not rewrite the application into a heavy framework solely for visual convenience unless the existing architecture makes the required interaction impossible.

## Page requirements

### Home

Must communicate in 5 seconds:

> Accepted once. Owed once. Settled once.

Show canonical Claim Fingerprint and compressed proof strip above the fold.

### Obligation

Make the causal chain legible.

Acceptance evidence and economic claim must not be visually conflated.

### Proof

Make replay the hero interaction.

No second receipt should appear on replay.

### Receipt

Treat receipt as a durable artifact.

Machine-readable proof stays available.

### Lab

Reuse the existing claim verifier.

Show baseline vs candidate claim visually.

No settlement action.

### System

Move architecture/testing/reliability detail here instead of polluting the hero.

## Motion grammar

For every animation specify:

TARGET -> TRIGGER -> MOTION -> TIMING -> EXIT/RETURN -> INPUT PARITY -> REDUCED MOTION -> IMPLEMENTATION.

No motion without state/comprehension purpose.

## Responsive requirements

QA:
- 375 x 812
- 390 x 844
- 768 width
- 1280 width
- 1440 width

No page-level horizontal scroll.

Long ids must wrap or truncate with accessible reveal.

Critical targets >= 44px.

## Accessibility

- semantic nav/main/section/footer;
- visible keyboard focus;
- contrast;
- reduced motion;
- no colour-only states;
- screen-reader labels for dynamic proof;
- no hover-only critical controls.

## Visual anti-pattern veto

Reject:
- glass-card grids;
- generic neon gradients;
- random blobs;
- decorative coins/chains;
- meaningless particles;
- fake terminal text;
- fake activity;
- fabricated metrics.

## Evidence requirements

Never alter canonical evidence values to improve visual composition.

Live proof values must still come from the existing proof APIs.

## Verification

Before promotion run:

- build;
- unit tests;
- replay harness;
- route smoke tests;
- desktop QA;
- mobile QA;
- reduced-motion QA;
- keyboard QA;
- live proof API smoke;
- chain-proof failure-state check.

Do not rerun real value movement.

## Delivery

Commit in reviewable slices:

1. shell / tokens / routing;
2. ClaimFingerprint + shared components;
3. Home + Obligation;
4. Proof + Receipt;
5. Lab + System;
6. mobile / reduced motion / QA.

Update `state/CURRENT.yaml` and `state/HANDOVER.yaml` after each meaningful gate.

---

# 5. Benita / Human Design Review Brief

Use this when reviewing visual work from a collaborator.

Questions:

1. Does the screen look like Tender, or like a generic fintech shell?
2. Can the primary economic state be read in 2 seconds?
3. Are Acceptance, Claim, Settlement and Receipt visually distinguishable?
4. Is the Claim Fingerprint visible enough to become a memory object?
5. Does any colour appear without semantic purpose?
6. Does any animation exist only because it looks impressive?
7. Can raw proof be opened without cluttering the primary reading?
8. Is the replay result unmistakably a non-event economically?
9. Does mobile feel intentionally composed rather than stacked desktop?
10. Would a screenshot remain recognisable with the Tender wordmark removed?

A “no” on #10 triggers another art-direction pass.

---

# 6. Final design QA prompt

Review the finished Tender build at desktop and 375px.

Score nothing.

Do not give an overall winner/verdict.

Instead return concrete findings under:

- comprehension defects;
- evidence defects;
- visual-genericity defects;
- mobile defects;
- motion defects;
- accessibility defects;
- demo-risk defects;
- anti-AI-slop defects.

For every finding provide:

- exact surface;
- exact element;
- why it matters;
- smallest correction;
- whether it blocks submission.

End with only the blocking corrections, if any.

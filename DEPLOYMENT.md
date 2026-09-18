# Tender Deployment

Tender's judge-facing runtime is dynamic for verification/replay but **cannot broadcast another payment**. The canonical KeeperHub value-moving proof is already complete and must not be rerun as part of deployment or QA.

## Preferred: Cloudflare Worker + Static Assets

The repository includes \`wrangler.jsonc\` with:

- Worker: \`tender-settlement\`
- Worker entry: \`dist/src/cloudflare/runtime.js\`
- Static asset binding: \`ASSETS\`
- Static source directory: \`./public\`
- Operator settlement mode: \`mock\` in the judge-facing deployment
- Durable Object binding retained for authenticated operator runtime

From an authenticated local clone:

\`\`\`bash
git pull origin main
npm ci
npm run verify
npx wrangler login
npm run deploy:cloudflare
\`\`\`

\`npm run deploy:cloudflare\` performs the TypeScript build first and then deploys the Cloudflare worker plus the current public assets.

Deployment/QA must not invoke \`Tender Live Proof\` or create another value-moving KeeperHub execution.

## Public Product Routes

The Worker deliberately serves the Tender product shell at:

- \`/\` — Home
- \`/obligation\` — Case
- \`/proof\` — Proof
- \`/lab\` — Invariant Lab
- \`/receipt\` — shareable Tender Receipt artifact

Primary navigation contains only Home / Case / Proof / Lab.

Receipt remains directly linkable but is not a primary navigation destination.

## Post-deploy QA

### 1. Home

Verify:

- \`Accepted once. Owed once. Settled once.\` is above the fold.
- canonical Claim Instrument is visible.
- Claim Fingerprint renders.
- \`Run the proof\` routes to \`/proof\`.
- no public value-moving control exists.

### 2. Case

Verify:

- \`/obligation\` loads directly and after navigation.
- Policy / Acceptance / Claim / Authorization / Settlement / Receipt remain distinct.
- long IDs do not overflow.
- \`Verify this obligation\` opens Proof.
- Receipt opens as an artifact, not primary navigation.

### 3. Proof

Verify:

- claim recomputation check resolves.
- receipt references match.
- independent Base verification resolves when RPC is available.
- Base RPC failure is rendered as a partial/unavailable check, not false success.
- Replay is the primary action.
- Replay returns:
  - same claim;
  - \`Δ 0\` additional claims for the same obligation;
  - \`Δ 0\` KeeperHub executions;
  - \`Δ $0.00\` additional movement;
  - \`Same claim. No second payment.\`
- Claim Fingerprint does not redraw into a new identity on replay.
- replay failure never renders \`NO SECOND PAYMENT\`.

### 4. Receipt

Verify:

- \`/receipt\` direct-loads.
- artifact contains canonical claim, execution, transaction and timestamp.
- Share / copy link works when clipboard permission is available.
- Base Sepolia explorer handoff uses the canonical transaction.

### 5. Lab

Verify:

- canonical values recompute to the canonical claim.
- changing amount, recipient or policy produces a different candidate claim.
- candidate is clearly labeled \`Hypothetical — cannot settle\`.
- invalid candidate shows \`No fingerprint: no valid claim\`.
- no settlement/broadcast action exists.

### 6. Device / accessibility

Verify:

- 375×812
- 390×844
- 768px
- 1280px
- 1440px
- keyboard-visible focus
- 200% zoom
- reduced-motion mode
- no page-level horizontal overflow
- minimum 44px critical touch targets

## Canonical Evidence

- GitHub Actions run: \`35162003096\`
- Claim: \`tclaim_94eb021e7894252897176543cc9d7b49\`
- Receipt: \`treceipt_94eb021e7894252897176543cc9d7b49\`
- KeeperHub execution: \`7k14qt2a1989rrc5r370d\`
- Transaction: \`0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db\`

Do not rerun \`Tender Live Proof\` as part of deployment or QA.

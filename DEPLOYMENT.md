# Tender Deployment

Tender's judge-facing surface is intentionally static and evidence-driven. The canonical KeeperHub transaction has already been executed; deployment must not trigger another payment.

## Preferred: Cloudflare Workers Static Assets

The repository includes `wrangler.jsonc` with:

- Worker name: `tender-settlement`
- compatibility date: `2026-09-16`
- assets directory: `./dist/public`

From an authenticated local clone:

```bash
git pull
npm ci
npm run verify
npx wrangler login
npm run deploy:cloudflare
```

`npm run deploy:cloudflare` runs the normal build and then deploys only `dist/public` as Cloudflare static assets. The judge-facing page reads `public/live-proof.json`; it does not call KeeperHub and cannot create another settlement.

## Cloudflare Git Integration Alternative

Connect `Faadil1/tender` to Cloudflare and use:

- Build command: `npm run build`
- Build output directory: `dist/public`
- Root directory: repository root

## Post-deploy QA

Verify:

1. `/` loads the Tender evidence packet.
2. The hero shows `SETTLED` and `0.01 USDC`.
3. `Inspect onchain transaction` opens the canonical Base Sepolia transaction.
4. `Open evidence JSON` loads `/live-proof.json`.
5. `Replay same claim` changes the presentation to `ALREADY SETTLED` / `NO SECOND PAYMENT` and shows `0` additional executions and `$0` additional movement.
6. Mobile width does not overflow claim/transaction identifiers.
7. Reduced-motion mode preserves all proof content without depending on animation.

## Canonical Evidence

- GitHub Actions run: `35162003096`
- Claim: `tclaim_94eb021e7894252897176543cc9d7b49`
- Receipt: `treceipt_94eb021e7894252897176543cc9d7b49`
- KeeperHub execution: `7k14qt2a1989rrc5r370d`
- Transaction: `0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db`

Do not rerun `Tender Live Proof` as part of deployment or QA.

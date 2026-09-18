# Contributing

Tender is intentionally small and proof-oriented.

## Local verification

Requires Node.js 24+.

```bash
npm ci
npm run verify
```

`npm run verify` performs:

- TypeScript build
- unit/integration tests
- 12-scenario settlement replay harness

It does **not** move value.

## Architecture guardrails

Changes must preserve:

- one deterministic economic identity per accepted obligation;
- `Policy -> Acceptance -> Claim -> Authorization -> Settlement -> Receipt`;
- immutable settled receipts;
- changed economics require new acceptance;
- in-flight execution is reconciled before rebroadcast;
- public judge runtime remains non-value-moving;
- failure / UNKNOWN states are never rendered as success.

## Tests

Add or update tests for any change that touches:

- claim identity;
- acceptance evidence;
- settlement lifecycle;
- authorization;
- reconciliation;
- KeeperHub execution semantics;
- public proof/replay behavior.

## Value-moving workflows

Real KeeperHub execution is deliberately isolated from normal CI.

Do not run:

`Tender Live Proof`

or:

`Tender × Valid Until Live Settlement`

as ordinary verification.

The Valid Until workflow additionally requires the exact explicit approval string documented in the workflow before it can broadcast.

## Pull-request quality

A change is ready when:

1. `npm run verify` passes;
2. no public secret or broadcast credential is introduced;
3. failure behavior is explicit;
4. docs remain aligned with observable behavior;
5. the change is small enough to review from the diff.

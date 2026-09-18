# KeeperHub Integration

Tender uses KeeperHub as the **deterministic execution layer** beneath Tender's economic-identity layer.

## Division of responsibility

| Layer | Owns |
| --- | --- |
| Acceptance adapter | What work was accepted |
| Tender | Whether that acceptance creates a new economic obligation |
| KeeperHub | Preflight, execution, execution identity, transaction delivery |
| Tender Receipt | Durable causal settlement record |
| Independent verifier | Onchain confirmation independent of KeeperHub self-report |

Tender never asks KeeperHub to decide whether two deliveries are economically the same. Tender computes that identity before execution.

## Canonical KeeperHub proof

- Workflow: `Tender: Settle Claim`
- Network: Base Sepolia
- Asset: USDC
- KeeperHub execution: `7k14qt2a1989rrc5r370d`
- Transaction: `0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db`
- Tender Claim: `tclaim_94eb021e7894252897176543cc9d7b49`
- Tender Receipt: `treceipt_94eb021e7894252897176543cc9d7b49`
- Replay: `ALREADY_SETTLED`
- Extra KeeperHub executions: `0`
- Extra movement: `$0`

Machine-readable proof: [../../evidence/live-proof.json](../../evidence/live-proof.json)

## Execution sequence

```text
accepted work
→ deterministic Tender Claim
→ explicit authorization
→ KeeperHub workflow preflight
→ KeeperHub execution
→ transaction hash
→ independent chain verification
→ Tender Receipt
```

If execution is unconfirmed, Tender reconciles the same KeeperHub execution identity before any rebroadcast.

## Named live-project integration: Valid Until

Tender includes a specific integration binding for the deployed project **Valid Until**:

- Product: https://valid-until-agent-os.pages.dev
- Repository: https://github.com/Faadil1/valid-until-agent-os
- Accepted work: https://github.com/Faadil1/valid-until-agent-os/commit/aeec4ed165eb0917688a885b960175d58f729692
- Change: `Bind exact action into execution validity contract`
- Tender integration: [../../src/integrations/validUntil.ts](../../src/integrations/validUntil.ts)
- Integration tests: [../../tests/validUntilIntegration.test.ts](../../tests/validUntilIntegration.test.ts)

The integration binds the real project repository and accepted-work SHA into Tender's claim identity.

Delivery/event IDs are deliberately excluded from economic identity, so the same accepted work and economics converge on the same claim.

Changed amount, recipient, or policy produces a different claim.

## Value-moving workflow safety

Normal CI never moves value.

The dedicated workflow:

`.github/workflows/tender-valid-until-live-proof.yml`

requires the exact manual input:

`I_APPROVE_REAL_KEEPERHUB_TRANSFER`

before it can reach the value-moving proof script.

The workflow also verifies:

1. the bound Valid Until commit exists on GitHub;
2. the deployed Valid Until product is reachable;
3. Tender's full test + replay suite passes;
4. only then may the distinct KeeperHub settlement execute.

That guarded run has now been completed successfully.

### Proven Valid Until settlement

- GitHub Actions run: `35328265031`
- Accepted work: `aeec4ed165eb0917688a885b960175d58f729692`
- Tender Claim: `tclaim_b5b5600f73b00dd1790a6747e1bc2ac4`
- Tender Receipt: `treceipt_b5b5600f73b00dd1790a6747e1bc2ac4`
- KeeperHub execution: `50m417t2khmb8a17iggt7`
- Transaction: `0x5ee526ba2c5c630e58f9b5c0de53c24ffb0e77d83e85a78c1b3038365f42bb5b`
- Replay: `ALREADY_SETTLED`
- Extra KeeperHub executions: `0`
- Extra movement: `$0`

Machine-readable proof: [../../evidence/valid-until-live-proof.json](../../evidence/valid-until-live-proof.json)

The evidence keeps project provenance separate from runner provenance:
- `repository` / `acceptedWorkId` identify the Valid Until work;
- `runnerRepository` / `commitSha` identify the Tender revision that executed the proof run.

## Reliability boundaries

Tender fails closed on:

- unaccepted work;
- incomplete checks/review;
- invalid recipients;
- changed economics without new acceptance;
- forged/reused corrective authorization;
- in-flight execution without durable execution identity;
- verification failures.

Public judge routes cannot broadcast KeeperHub payments.

See [operator runtime](../reliability/OPERATOR-RUNTIME.md) for the authenticated write boundary and [negative evidence](../reliability/NEGATIVE-EVIDENCE.md) for the real failure motivating the design.

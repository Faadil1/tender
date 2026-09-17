# Design Direction

## Selected Direction

Tender uses a settlement-document language: accepted-work ledger, claim sheet, receipt, and cleared stamp. It is not a wallet dashboard, not a bounty board, and not a crypto control panel.

## Aesthetic Lineage Check

| Dimension | Decision |
| --- | --- |
| Primary lineage | Institutional receipt, ledger packet, audit exhibit. |
| Secondary influence | Annual-report evidence structure: facts, causal timeline, proof. |
| Copy compression | Study Old Ads style: one compressed promise, one proof moment. |
| UI mechanisms | Spectrum-style dense facts and stateful receipt surfaces, adapted natively. |
| Avoided lineage | Neon fintech, purple gradients, generic dark SaaS, glassmorphism, decorative chains/coins. |
| Product utility | Make the economic transition visible: accepted -> claimed -> settleable -> settled. |
| Ambitious element | Replay is visible as a stamped economic non-event: same claim, $0 moved. |

## Motion Grammar

| Transition | Motion purpose |
| --- | --- |
| `ACCEPTED -> CLAIMED` | The accepted work becomes an economic identity. |
| `CLAIMED -> SETTLEABLE` | Policy and recipient checks make it due. |
| `SETTLEABLE -> SETTLED` | KeeperHub execution clears the claim. |
| `REPLAY -> SAME CLAIM` | Existing receipt is referenced; no new execution surface appears. |

Reduced motion keeps the same facts and stamps without relying on animation.

## Receipt Treatment

The Tender Receipt is presented as a real settlement artifact with:

- claim ID
- policy version
- accepted contribution
- recipient(s)
- amount and asset
- KeeperHub execution ID
- transaction hash
- status

The judge-facing page now opens directly on the canonical `SETTLED` evidence and lets the viewer play back the already-recorded replay result as `NO SECOND PAYMENT`; the control does not broadcast another transaction.

## Evidence Status

Canonical live proof is complete and bound into the UI:

- Tender Claim: `tclaim_94eb021e7894252897176543cc9d7b49`
- Tender Receipt: `treceipt_94eb021e7894252897176543cc9d7b49`
- KeeperHub execution: `7k14qt2a1989rrc5r370d`
- Transaction: `0x269f77504e421e16ee3193de5bb5c56a55618a4fc210f5ccba2dabf73d18e5db`
- Replay: same claim, 0 additional KeeperHub executions, `$0` additional movement

Full device QA remains a deployment-stage check.

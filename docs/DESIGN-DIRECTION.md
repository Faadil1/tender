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

The Tender Receipt should feel like a real settlement artifact:

- claim ID
- policy version
- accepted contribution
- recipient(s)
- amount and asset
- KeeperHub execution ID
- transaction hash
- status

## Evidence Status

Runtime UI has been locally smoke-tested only. Full device matrix remains pending after deploy.

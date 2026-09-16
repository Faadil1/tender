# Design Direction

## Selected Direction

Tender uses a transactional document language: ledger paper, settlement sheets, receipt facts, and a stamped final state. The interface is not a wallet dashboard. The visual metaphor is the moment an accepted contribution becomes an economic obligation and then a cleared record.

## Aesthetic Lineage Check

| Dimension | Decision |
| --- | --- |
| Primary lineage | Institutional ledger, payment receipt, audit packet. |
| Secondary influence | Annual-report evidence structure: clear facts, timeline, and accountable status. |
| Avoided lineage | Neon fintech, purple gradients, generic dark SaaS, crypto coin decoration. |
| Product utility | State transition is the visual center: `NOT YET OWED -> OWED -> SETTLED`. |
| Ambitious element | Replay proof becomes a visible stamped economic non-event: `NO SECOND PAYMENT`. |

## Motion Grammar

| Transition | Motion purpose |
| --- | --- |
| `NOT_YET_OWED -> OWED` | Ledger status changes from pending to obligation. |
| `OWED -> SETTLING` | KeeperHub execution begins; timeline appends attempt. |
| `SETTLING -> SETTLED` | Stamp settles the sheet. |
| replay -> `ALREADY_SETTLED` | Stamp changes to `NO SECOND PAYMENT`; no payout data changes. |

Reduced motion keeps the same information without relying on animation.

## Support Matrix

Initial target: Chromium desktop/mobile widths 390, 768, 1440. Runtime verification remains pending after implementation.


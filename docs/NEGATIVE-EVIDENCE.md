# Tender — Concrete Negative Evidence

Date locked: 2026-09-18

## Canonical rule

Every build must contain at least one **concrete, real, verifiable negative event rooted in reality**.

Required pattern:

1. Signal / opportunity
2. Concrete negative event
3. Observable impact
4. Design implication
5. Product response / mitigation

Adjacent rules:

- **Real failure > fake success.**
- Failures remain in the evidence record.
- The product must have a counter-case / negative path.
- When evidence is insufficient, the product must refuse, abstain, or return an explicit UNKNOWN / UNVERIFIED state rather than manufacture success.

---

## Tender negative event — production webhook replay

### Signal / opportunity

Accepted work, payments and automated workflows increasingly meet at asynchronous boundaries where retries, duplicate deliveries and concurrency are normal. The useful product opportunity is not merely to move value, but to preserve one economic meaning across repeated delivery and execution attempts.

### Concrete negative event

A first-person TanStack Ship production postmortem describes a Stripe webhook incident on **2025-12-03**.

A transient `502` caused Stripe to retry the same `invoice.paid` event. The application had signature verification but no durable idempotency boundary keyed to the provider event. The same event was therefore processed more than once.

Source:

https://tanstackship.com/blog/postmortem-stripe-webhook-duplicate-delivery

### Observable impact

The postmortem reports:

- 18 customer accounts received duplicate internal credits;
- 2 accounts received unintended subscription downgrades;
- $1,247 in duplicate credits were issued and later reversed;
- the incident required customer-support remediation and data repair.

These are the source author's reported production figures; Tender does not independently claim access to the private incident record.

### Design implication

Authenticity is not economic uniqueness.

A valid signed event may be delivered more than once.
A successful execution may be retried after an acknowledgment failure.
Two individually valid requests can represent the **same underlying economic fact**.

Therefore a settlement system must not derive economic novelty from delivery identity, retry identity, Action run identity, or callback identity.

### Tender response / mitigation

Tender creates a deterministic economic claim from the accepted work and the pre-committed settlement policy.

For the same economics:

- same accepted obligation;
- same Tender Claim;
- same existing settlement/receipt;
- replay returns `ALREADY_SETTLED`;
- 0 additional KeeperHub executions;
- $0 additional movement.

Changed economics are not silently treated as a retry:

- they produce a different claim;
- the candidate is `NEW_CLAIM_REQUIRES_ACCEPTANCE`;
- the public Lab cannot settle it.

Insufficient evidence fails closed:

- verification unavailable -> `UNVERIFIED` / `Cannot verify right now`;
- replay endpoint failure -> `REPLAY COULD NOT RUN — no conclusion drawn`;
- invalid candidate -> `No fingerprint: no valid claim`;
- the UI never emits `NO SECOND PAYMENT` after a failed replay.

---

## Adjacent contributor-payout evidence

A public GitHub security bug report in `anurag3407/career-pilot#4378` describes a directly analogous contributor-payout failure class: replaying a Razorpay webhook could release fellowship funds twice because the payout path did not persist/check a unique payment identity before mutation.

Source:

https://github.com/anurag3407/career-pilot/issues/4378

Status note:

This is a public issue/reproduction report, not a maintainer-confirmed production postmortem. It is retained as **adjacent same-domain evidence**, not as the primary incident.

---

## Tender counter-cases already in evidence

`evidence/settlement-replay-harness.json` retains negative paths instead of hiding them.

Examples:

- PR closed without acceptance -> `NOT_ACCEPTED`
- failed CI / incomplete acceptance -> `ACCEPTANCE_INCOMPLETE`
- malformed recipient -> `BLOCKED`
- altered economics -> `REQUIRES_ACCEPTANCE`
- forged corrective authorization -> rejected / remains `REQUIRES_ACCEPTANCE`
- KeeperHub timeout / unconfirmed result -> `SETTLING`, reconcile same claim
- callback interruption after broadcast -> reconcile, do not rebroadcast

The record is intentionally not “all green”. Refusal and uncertainty are part of the product proof.

---

## Canonical lesson

> A repeated delivery is not a new economic fact.

Tender exists to make that distinction explicit, observable and testable.

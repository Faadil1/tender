# External LLM Critique Synthesis

Date: 2026-09-17
Status: partial — Gemini received; Claude and Grok pending

## Review protocol

The upstream KeeperHub bounty candidate is being attacked by independent models before any issue is filed. A single evidence-backed fatal objection defeats majority agreement. Model claims are not promoted to canonical state until checked against current KeeperHub source/issues/PRs.

## Gemini review — received

Gemini attacked the provisional `Effect-Bound Execution Reference` idea on API/schema/concurrency grounds.

### Strong objections worth keeping

1. **Do not make KeeperHub the permanent authority for Tender-style business identity.** A durable caller-owned reference may be useful for correlation, but KeeperHub should not absorb Tender's obligation semantics.
2. **Do not attempt a universal semantic-effect fingerprint for arbitrary EVM calls.** Raw request identity and actual onchain effect are different; environment-dependent contract behavior makes a universal semantic fingerprint too broad for this bounty.
3. **Permanent unique reference + fail-closed request binding creates difficult retry/lifecycle semantics.** KeeperHub's own idempotency work already distinguishes definite failure from unknown outcome, so a second permanent dedup state machine would need unusually strong justification.
4. **Metadata-only correlation is materially more mergeable than a new permanent deduplication authority.** A nullable, indexed caller reference surfaced in execution status/lookup is the surviving narrower shape from Gemini's critique.

### Fact-check corrections to Gemini

Gemini's review contained several current-repo inaccuracies and overstatements:

- `#1840` is an **open accepted issue**, not a merged PR. The implementation is PR `#2372`, which is currently **open, mergeable, and not merged** as of this check.
- Issue `#2373` is **open**, labeled `bug`, `confirmed`, and `needs-discussion`; it is not accepted. Its reporter and commenters already have implementation/tests written or available. Therefore it is **not an available bounty target for Tender to take over**.
- `#2373` explicitly says the 24-hour hold is a bounded **liveness gap**, not a correctness/double-spend defect, and only a conclusive receipt failure should release the key. Unknown outcomes must remain held.
- Gemini's conclusion that maintainers "will reject" any durable reference uniqueness is not verified. What is verified is that KeeperHub treats retry safety conservatively and distinguishes definite from unknown outcomes.
- Claims about specific reaper behavior, exact schema/table naming, and external projects (`abstain`, `Runlock`, `OpenClaw KeeperLink`) need independent source verification before they can be used in an upstream issue.

## Verified KeeperHub evidence after Gemini review

### #1840

Current issue state: open, accepted, confirmed.

Maintainer direction recorded in the issue: release an idempotency key when the outcome is **definite and nothing landed**; hold it when the outcome is **unknown**. This validates the core principle that retry identity cannot be treated as a permanent business identity.

Implementation PR `#2372` targets `staging` and is currently open, mergeable, not merged. It applies the definite-failure/unknown-outcome disposition across direct execution routes.

### #2373

Current issue state: open, `needs-discussion`.

The issue covers the asynchronous reconciler half: a previously held key remains held even after the reconciler later proves a conclusive failure. The issue author states that a standalone implementation and seven tests already exist. Another contributor also states the implementation/tests are written.

Conclusion: do **not** pursue #2373 as our bounty contribution.

### Current reference-field overlap

A code search for `clientReferenceId`, `externalId`, and `client_reference_id` on KeeperHub returned no current matches. This supports, but does not yet prove, that a metadata-only caller reference may still be whitespace.

## Candidate status after Gemini

### Original enforcing candidate

`Effect-Bound Execution Reference` with:
- organization-scoped uniqueness,
- same reference + same request => replay original,
- same reference + changed request => conflict,
- durable dedup beyond idempotency TTL,

is **demoted / not ready to file**.

Reason: Gemini surfaced a real architecture tension and current KeeperHub retry semantics support the concern. We should not create a second permanent idempotency state machine without much stronger evidence.

### Surviving narrower candidate

Working shape:

**Client Execution Reference / clientReferenceId**

- optional caller-owned correlation metadata on direct execution;
- persisted with the existing execution audit row;
- non-unique by default;
- organization-scoped lookup/filter;
- surfaced in execution status;
- no effect hashing;
- no deduplication semantics;
- no 409 conflict behavior;
- no change to `Idempotency-Key` behavior;
- no Tender/business-obligation interpretation inside KeeperHub.

This is not yet cleared. Claude and Grok must still attack it, and we need recurrence evidence from independent integrations/users before filing.

## No-go updates

- Do not take #2373; it is already an active, discussed implementation path owned by current contributors.
- Do not build a universal EVM semantic-effect fingerprint.
- Do not make a caller reference a second primary key or permanent deduplication authority without maintainer demand.
- Do not cite Gemini's external-project examples until independently verified.

## Pending reviews

- Claude: maintainer / mergeability / hidden-coupling critique.
- Grok: duplicate / competition / recurrence / adversarial uniqueness critique.

## Next synthesis gate

1. Run the same packet through Claude and Grok.
2. Cross-check every factual claim against current KeeperHub sources.
3. Decide between:
   - metadata-only `clientReferenceId`,
   - a stronger newly discovered candidate,
   - or no bounty contribution if nothing is sufficiently distinct and mergeable.
4. Re-run issue/PR overlap immediately before any upstream filing.
5. File no KeeperHub issue until this synthesis is complete.

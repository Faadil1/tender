# External LLM Critique Synthesis

Date: 2026-09-17
Status: partial — Gemini, Perplexity and Kimi received/fact-checked; Claude and Grok still pending

## Review protocol

The upstream KeeperHub bounty candidate is being attacked by independent models before any issue is filed. A single evidence-backed fatal objection defeats majority agreement. Model claims are not promoted to canonical state until checked against current KeeperHub source/issues/PRs.

## Gemini review — retained conclusions

Gemini attacked the provisional `Effect-Bound Execution Reference` idea on API/schema/concurrency grounds.

Strong points that survived fact-checking:

1. KeeperHub should not become the permanent authority for Tender-style business identity.
2. Do not attempt a universal semantic-effect fingerprint for arbitrary EVM calls.
3. Permanent reference uniqueness plus request/effect binding creates a second long-lived retry/idempotency state machine with hard failure/recovery semantics.
4. Metadata-only caller correlation is materially simpler than permanent deduplication.

Corrections to Gemini:

- `#1840` is an open accepted issue, not a merged PR.
- PR `#2372` is open, mergeable, and not merged.
- `#2373` is open, confirmed, `needs-discussion`, and not accepted; active contributors already have implementation/tests available.
- Therefore `#2373` is not our bounty target.

## Perplexity review — retained conclusions

Perplexity independently reached the same high-level conclusion: the generic enforcing reference idea is too close to existing idempotency/execution identity, cannot safely define semantic effect equivalence, and would require an explicit lifecycle for uniqueness/reuse.

Retained points:

1. Existing `executionId`, `Idempotency-Key`, transaction hashes and purpose-specific durable identifiers make another generic identity expensive to justify.
2. Generic semantic-effect equality is not a valid KeeperHub primitive.
3. Permanent uniqueness needs failure/reuse/retention/supersession semantics.
4. Independent recurrence for a generic caller reference remains weak.
5. Metadata-only `clientReferenceId` is technically safer but likely too ordinary for the bounty without stronger user demand.

Verified overlap after Perplexity:

- `#2495` is open, accepted, confirmed.
- PR `#2552` is open and mergeable and already implements `web3/disburse`, persistent per-leg state, `runKey`, broadcast-boundary tracking, explicit `sending/unknown` handling and operator resolution.
- `#2020` closed via merged PR `#2162`.
- `#2177` closed/completed.
- `#2374` closed via merged PR `#2386`.
- `#1979` closed/completed.
- `#2373` remains active/needs-discussion with implementation work already present.

Conclusion: broad durable broadcast-outcome/reconciliation is not clean whitespace either.

## Kimi review — received and fact-checked

Kimi independently attacked the same candidate and sharpened three objections that now make the rejection final.

### Strong objections retained

1. **Semantic smuggling.** Permanent fail-closed reference semantics effectively decide that one caller-labelled economic effect may execute only once forever. That is a business/domain judgment and conflicts with Tender's deliberate separation of obligation identity from KeeperHub execution transport.
2. **Recovery conflict.** The proposal reintroduces the exact liveness problem KeeperHub is currently fixing in `#1840` / PR `#2372`: definite pre-broadcast failures need a release path so the same logical work can be retried safely.
3. **Mechanism-level overlap with `#2495/#2552`.** `runKey` plus per-leg conflict/recovery semantics already provide a scoped durable caller key where the platform has a concrete reason to own one.
4. **KeeperHub already documents deterministic stable idempotency-key derivation.** The remaining delta of the rejected proposal is mainly longer retention + lookup, which is too thin to justify a second enforcement layer.
5. **Cross-route scoping remains ambiguous.** A generic reference either fragments by endpoint or creates conflicts across distinct execution surfaces.

### Fact-check corrections to Kimi

Kimi's strongest proposed alternative, `#2408`, is **not available as our bounty target**.

Verified current state:

- Issue `#2408` is closed/completed and carried `accepted` + `confirmed` labels.
- Maintainer triage explicitly accepted the docs half and stated that the execution-level field/analytics shape was being settled with the core team and was "not blocked on you."
- PR `#2446` merged on 2026-09-14 and closes `#2408` for the accepted docs scope.
- No current code or issue search found `softenedErrors`, `softenedErrorCount`, `callerReference` or `externalReference` beyond `#2408` itself for the softened-error terms.
- Therefore we should not duplicate `#2408`, reopen it under a new issue, or take the core-team-owned execution-level remainder.

Kimi also correctly noted that a pure metadata field is the narrowest defensible reference shape. We prefer the name `callerReference` over `clientReferenceId` if this path is ever revisited because it clearly states caller ownership and avoids "effect" semantics. However, it remains HOLD/low-priority for this bounty.

## Candidate board after Gemini + Perplexity + Kimi

### 1. Effect-Bound Execution Reference — STOP / DO NOT FILE

Rejected reasons:

- semantic/business-layer leakage;
- second generic idempotency/identity state machine;
- unsafe generic effect equivalence;
- failure/retry lifecycle conflict;
- mechanism-level overlap with `#2495/#2552`;
- weak evidence that a generic platform reference is needed.

### 2. `callerReference` metadata-only — HOLD / LOW PRIORITY

Possible shape:

- optional caller-owned metadata;
- non-unique;
- persisted with a direct execution;
- surfaced in status;
- exact-match org-scoped lookup/filter;
- no deduplication;
- no request/effect hash;
- no 409 conflict;
- no change to `Idempotency-Key`.

Reason for HOLD: technically plausible, but still insufficient evidence that it is valuable enough for a mergeability-first feature bounty.

### 3. Broad outcome/reconciliation layer — NO-GO

Strongest sub-problems are already fixed, closed, or actively owned by current KeeperHub contributors.

### 4. `#2408` softened-error execution contract — NO-GO / OCCUPIED

- issue closed/completed;
- docs half already merged via PR `#2446`;
- execution-level carrier/analytics remainder explicitly retained by KeeperHub core team.

## New search principle

The next bounty candidate must be:

- not idempotency or durable-reference enforcement;
- not partial payout/disbursement;
- not generic post-broadcast outcome preservation;
- not `#2408` softened-error reporting;
- not receipt export, executed-call verification, permission cards, multi-model consensus, sign-and-hold, generic simulation, generic framework adapters, Merkle audit or cross-chain status;
- independently evidenced by current KeeperHub users/issues or multiple adjacent systems;
- unclaimed in current issues/PRs;
- small enough for issue acceptance + implementation + tests + PR to `staging`;
- useful beyond Tender.

## Pending reviews

- Claude: maintainer / mergeability / hidden-coupling critique.
- Grok: duplicate / competition / recurrence / adversarial uniqueness critique.

Perplexity and Kimi are extra adversarial reviewers beyond the original three-model gate.

## Next synthesis gate

1. Run Claude and Grok with the same packet.
2. Fact-check their current KeeperHub claims before promotion.
3. Use them primarily to discover a **new, narrow, unclaimed whitespace candidate**, not to rescue any rejected candidate.
4. If no high-signal candidate survives, skip the bounty rather than weaken Tender or duplicate active work.
5. Re-run issue/PR overlap immediately before any upstream filing.

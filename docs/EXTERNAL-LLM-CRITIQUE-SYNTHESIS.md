# External LLM Critique Synthesis

Date: 2026-09-17
Status: phase 2 — original candidate rejected; full whitespace discovery roster activated including DeepSeek

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

- Grok: duplicate / competition / recurrence / adversarial uniqueness critique.
- Fresh Gemini pass: systems/API/schema/concurrency, after Grok if no candidate survives.
- Fresh Kimi pass: product-boundary/semantics/DX, after Grok if no candidate survives.

Perplexity and Kimi are extra adversarial reviewers beyond the original three-model gate.

## Next synthesis gate

1. Run Grok with the updated packet.
2. Fact-check every current KeeperHub claim before promotion.
3. If Grok finds no surviving candidate, run fresh Gemini + Kimi passes against the updated no-go set.
4. Use all remaining reviewers primarily to discover a **new, narrow, unclaimed whitespace candidate**, not to rescue any rejected candidate.
5. If no high-signal candidate survives, skip the bounty rather than weaken Tender or duplicate active work.
6. Re-run issue/PR overlap immediately before any upstream filing.


## Phase 2 — full whitespace discovery roster

The review gate is expanded beyond the original candidate critique. We now involve:

- Claude — maintainer/mergeability/hidden coupling;
- Gemini — systems/API/schema/concurrency;
- Grok — adversarial duplicate/competition/recurrence;
- Perplexity — evidence and adjacent-system recurrence;
- Kimi — product-boundary/semantics/DX;
- DeepSeek — source-level reliability, sibling-route parity, propagation gaps, state-transition races;
- ChatGPT — source fact-check, cross-model synthesis, and final overlap gate.

Canonical packet: `docs/KEEPERHUB-WHITESPACE-MULTI-LLM-PACKET.md`.

DeepSeek is specifically tasked with finding narrow source-level failures at boundaries such as REST↔MCP↔CLI, simulation↔broadcast, sponsored↔direct, workflow↔direct execution, DB↔reconciler, plugin↔core, auth/policy↔execution, and chain adapter↔shared abstraction.

The output of this phase is not a vote. Candidate promotion requires current-source verification, independent evidence, no active ownership, and a bounded mergeable v1. If no candidate survives, the bounty is skipped.


## Phase 2 Perplexity whitespace review — received and fact-checked

Perplexity returned a limitation warning because it could not directly inspect the KeeperHub repository. Its candidate generation is therefore treated as hypothesis generation, not source truth.

### Candidate fact-check

1. **Execution liveness probe / engine supervision — REJECTED as proposed.**
   Current KeeperHub source already exposes substantial health/liveness infrastructure:
   - public `GET /api/health` is documented in OpenAPI as an unauthenticated liveness probe;
   - scheduler/dispatcher components expose Prometheus metrics and deployment liveness probes;
   - Solana/event tracker components expose `/livez`, `/healthz`, and/or metrics;
   - the repository already tracks execution and stuck-pending related metrics.
   The proposed single `/healthz/engine` model assumes a monolithic engine loop that does not match KeeperHub's distributed scheduler/executor/event architecture. A new aggregate user-facing execution-plane health endpoint would be a different, larger product decision and currently lacks KeeperHub-specific demand.

2. **Execution completion webhook / callback — RESEARCH ONLY.**
   No direct `callbackUrl` / `callback_url` completion API or matching issue was found in the current repository search. However KeeperHub already has:
   - generic outbound webhook actions;
   - workflow execution wait endpoint (`GET /api/workflows/executions/{executionId}/wait`) to avoid tight polling;
   - SSE/progress infrastructure on MCP and live analytics surfaces.
   A durable signed completion-callback system would require retry policy, delivery persistence, signing, SSRF/egress rules, auth scope, and duplicate-delivery semantics. This is not yet evidenced as a narrow bounty feature. Keep only as a research hypothesis if other reviewers find independent KeeperHub demand.

3. **Idempotency request-hash validation — REJECTED / ALREADY EXISTS.**
   Current source stores `requestHash`, compares an existing record's hash against the new request hash, and returns `409 idempotency_conflict` with `originalExecutionId` and `retryable:false` when the same key is reused with a different body. This candidate is a direct duplicate.

4. **Execution timeout parameter — REJECTED FOR NOW.**
   Timeout controls already exist in several node/runtime components and a workflow execution wait endpoint accepts `timeoutMs`. No verified KeeperHub-specific demand was found for a new generic direct-execution `timeout_seconds` contract, and defining whether timeout means cancel, stop waiting, or change chain execution semantics would expand scope substantially.

5. **Execution cancellation — REJECTED / EXISTING CAPABILITY.**
   Current source exposes a cancel execution client path to `POST /api/executions/{executionId}/cancel`. Extending cancellation after broadcast would be semantically unsafe without a much narrower evidenced bug.

### Phase 2 Perplexity result

Perplexity's proposed PRIMARY, engine liveness, does not survive source verification.
Its SECONDARY, completion callbacks, remains only a hypothesis and is not promoted.
No candidate from this Perplexity pass is ready to file.

This reinforces the purpose of the multi-reviewer gate: adjacent-system evidence is useful for candidate generation, but current KeeperHub source and ownership checks decide promotion.


## Phase 2 DeepSeek whitespace review — received and fact-checked

DeepSeek could not directly inspect enough current KeeperHub source and correctly returned RESEARCH PRIMARY FURTHER rather than fabricating a candidate. Its candidate list was treated as hypotheses and checked against staging.

### Candidate fact-check

1. **REST ↔ MCP parameter propagation mismatch — not supported as a fresh candidate.**
   Current staging already exposes MCP `idempotency_key` and forwards critical execute fields such as `gas_limit_multiplier`; dedicated regression tests exist for MCP execute argument coercion and field naming. There may still be individual parity bugs, but DeepSeek did not identify one concrete surviving field mismatch.

2. **Simulation vs broadcast error classification — occupied.**
   Current accepted tracking issue `#2004` explicitly covers uniform `simulate` behavior across `/api/execute/*`, including protocol-action differences and rejected/ignored simulation flags. This is active accepted work, so it is not whitespace.

3. **Missing typed direct-execution status errors — weak / research-only.**
   The top-level `ExecutionStatusResponse` exposes a plain `error` string and does not expose a dedicated top-level `errorClass` or `retryable`. However, failure persistence already writes `rejection` and `errorClass` into the execution's `output`, and the status API returns that object under `result`. Therefore the information is partly present, just not normalized at the top level. No independent user demand or current issue was found for promoting this into a new status contract. Keep as a low-confidence DX observation, not a bounty candidate.

4. **Stale workflow `running` executions — already handled.**
   Current source contains `lib/reaper/reap-stale-executions.ts`, with explicit classification for stale `running` / `pending` executions and timeout/error transitions. DeepSeek's proposed new timeout reconciler would duplicate existing machinery.

5. **Chain-specific adapter bypasses shared invariants — active occupied territory.**
   Accepted+confirmed issue `#2425` currently covers protocol actions advertised on chains whose deployed contracts do not implement the declared function set, plus a proposed coverage check. This is precisely the kind of chain/surface invariant gap DeepSeek hypothesized, and it is already owned.

### DeepSeek result

No candidate from the DeepSeek pass is promoted.
The only surviving observation is that direct execution status error classification is not normalized at the top level, but current output already carries `errorClass`/rejection in many failure paths and there is no independently evidenced demand. Status remains RESEARCH ONLY.

DeepSeek's main value in this round was restraint: it did not invent a primary candidate without source access.


## Phase 2 Claude maintainer review — received and fact-checked

Claude returned **RESEARCH ONLY — NO BOUNTY CANDIDATE SURVIVES** for the direct-execution typed-failure-status hypothesis.

### Findings retained after fact-check

1. **The cited reliability incidents do not prove a nested-status contract bug.**
   - #2374 was a sponsored-send outcome-classification problem and is closed via merged PR #2386.
   - #1840 / PR #2372 concerns idempotency disposition after definite versus uncertain failure; PR #2372 remains open and does not depend on top-level status normalization.
   - Neither establishes caller harm caused specifically by `result.errorClass` / `result.rejection` being nested.

2. **No repeated consumer workaround was found.**
   Spot checks across `daydreamsai/lucid-agents`, `DecodeDedan/plugin-keeperhub`, and `EcstaceeLOR/Synesis` found no `errorClass` / `result.errorClass` branching pattern. This supports Claude's claim that current consumers principally branch on execution status / receipt evidence rather than lifting nested typed-error fields.

3. **The current asymmetry is plausibly intentional.**
   `ExecuteResponse` exposes freshly computed `rejection` / `errorClass` on the synchronous call path. Durable status reads stored `output` as `result`, and `failExecution()` persists those typed details there when available. Source inspection found no current evidence that this shape itself causes an unsafe decision.

4. **The adjacent protocol-write response gap is already fixed, not merely occupied.**
   Claude pointed to #2206 as the real historical contract gap: protocol writes omitted `executionId` / `status` and returned raw plugin results. Fact-check correction: #2206 is closed, and PR #2213 was merged (merge commit `56b1475855bcd9b299b4247245a7d7496e36ac85`) to return the standardized `ExecuteResponse` envelope. Current staging already contains that envelope. Therefore #2206 is not available as whitespace.

5. **MCP structured failure output is a separate surface.**
   PR #2528 documents current MCP simulate failure behavior and remains a separate DX/documentation thread. It does not establish a defect in `GET /api/execute/{executionId}/status`.

### Decision

`Direct Execution typed failure status` stays **RESEARCH ONLY / DO NOT FILE**.

A docs-only clarification that typed failure detail lives at `result.errorClass` / `result.rejection` would be legitimate DX cleanup, but current evidence does not make it bounty-worthy. Top-level promotion is not justified by symmetry alone. A generic `retryable` field remains explicitly prohibited unless KeeperHub gains a stable cross-action retryability source of truth.

### Claude result

No candidate from the Claude pass is promoted.



## Phase 2 Grok adversarial review — received and fact-checked

Grok returned one new PRIMARY candidate: expose the direct-execution poll contract to MCP instead of keeping it only in `X-Poll-Interval-Hint`.

### What survived source verification

- `GET /api/execute/{executionId}/status` computes `pollIntervalHint` from the server terminal set: `completed|failed -> 0`, otherwise `2`.
- The current `ExecutionStatusResponse` JSON shape has no poll-hint field.
- The route adds the value only through `X-Poll-Interval-Hint`.
- `lib/mcp/tools.ts::callApi()` returns `response.json()` for successful JSON responses and does not preserve success-response headers.
- `get_direct_execution_status` returns only `JSON.stringify(data)` to the MCP caller.
- `docs/getting-started/agent.md` tells callers using `get_direct_execution_status` to wait according to `X-Poll-Interval-Hint`; `0` means terminal.
- `docs/api/direct-execution.md` says status strings are a lower bound and directs clients to server-computed `X-Poll-Interval-Hint` for terminality.
- No current issue/PR search found an exact request to surface that poll contract through the MCP-visible status result.
- In closed issue #2058, maintainer `suisuss` states that MCP-to-REST response shapes are intended to align and asks for concrete field mismatches to be filed separately.

This is stronger than the rejected typed-failure-status idea because it is a proven cross-surface contract loss: the docs tell an MCP caller to consume metadata the MCP abstraction discards.

### Corrections to Grok

- Do not generalize to all JSON clients; ordinary REST clients can read headers. The verified defect is MCP/tool-result visibility.
- Do not require adding `pollIntervalHint` to every 202 write envelope in v1. The smallest proven failure is status polling.
- Grok's n8n claim was not independently reproduced and is unnecessary to promotion.
- Direct-execution wait, transaction-hash lookup, callbacks, and signer-accurate simulation remain secondary/research hypotheses.

### Current decision

`mcp_direct_status_poll_contract` becomes **PROVISIONAL PRIMARY — SURVIVES FACT-CHECK**.

Do not file yet. The pre-filing gate is a fresh Gemini + Kimi cross-examination on whether the correct minimal fix is:
1. MCP-only: surface the existing header value in `get_direct_execution_status`;
2. status-body-wide: add an additive JSON poll hint to `ExecutionStatusResponse` and let MCP inherit it;
3. docs-only: stop telling MCP callers to read an inaccessible header.

Reject the candidate if terminality is intentionally required to remain header-only or if active ownership/duplication is discovered.


## Gemini targeted poll-contract cross-exam — invalid/off-target, fact-checked

Gemini did **not** evaluate the Grok-surviving `mcp_direct_status_poll_contract` candidate. Instead it generated a new queue-expiration / `expires_at` proposal based on a relayer architecture that does not match current KeeperHub direct execution.

### Fatal source corrections

1. **No verified direct-execution `QUEUED -> CLAIMED/RUNNING -> BROADCASTING -> CONFIRMED/FAILED` pipeline.**
   Current `directExecutions` schema defaults to `pending`; direct-execution types/services use `pending | running | unconfirmed | completed | failed`. The routes reserve/create the row, call `markRunning(executionId)`, and proceed into execution/sign/broadcast in the same request path.

2. **The proposed worker-dispatch files/endpoints are not current KeeperHub surfaces.**
   No `POST /v1/executions`, `packages/core/src/queue/processor.ts`, `packages/cli/src/commands/dispatch.ts`, or `packages/mcp/src/tools/dispatch.ts` was found.

3. **The TTL problem is therefore not demonstrated on direct execution.**
   A queue-level `expires_at` guard cannot be promoted for a delayed direct-execution queue that current source does not show.

4. **The cancellation secondary has the same architecture problem.**
   KeeperHub does have `POST /api/executions/{executionId}/cancel`, but it operates on `workflowExecutions` and requires a running workflow. That does not prove a missing queued direct-execution cancellation primitive.

5. **PR #2372 is not a merged precedent.**
   Issue #1840 is open/accepted and PR #2372 is still open. Its proposed definite-failure idempotency release semantics cannot be treated as an already-established reusable primitive.

### Decision

Gemini's `expires_at` PRIMARY and queued-cancel SECONDARY are **REJECTED AS SOURCE-MISMATCHED**.

This pass does not count as the required targeted Gemini cross-examination. The Grok provisional primary remains unchanged. Gemini must be rerun against the dedicated poll-contract packet and may only return one of the allowed decisions about MCP-only vs status-body-wide vs docs-only handling.


## Kimi pre-packet whitespace review — fact-checked, not a targeted cross-exam

This Kimi response was produced before the dedicated poll-contract packet, so it does **not** satisfy the required Kimi adjudication of `mcp_direct_status_poll_contract`.

Kimi proposed a new PRIMARY: an optional contract-code-hash admission guardrail for direct execution.

### What is real

- ProofPulse is a real KeeperHub integration with a verified Sepolia execution.
- ProofPulse performs a real bytecode-pinning safeguard: it calls `eth_getCode`, hashes the runtime bytecode with SHA-256, stores `contractCodeSha256` in its own snapshot, requires `EXPECTED_CONTRACT_CODE_SHA256` for live mode, and refuses when the hash changes.
- This is execution-layer safety rather than Tender business semantics.

### Fatal corrections

1. **#2408 status correction was wrong.**
   Direct issue fetch shows #2408 is closed with state_reason `completed`, accepted + confirmed; PR #2446 merged the docs portion and closed it. Our prior canon was correct.

2. **KeeperHub does not currently compute/expose the claimed hash in direct simulation.**
   Current `lib/execute/simulate.ts` returns simulation fields such as `from`, `to`, `gasEstimate`, `simulatedReturnValue`, and revert/error metadata. It contains no `snapshot.contractCodeSha256`, no SHA-256 bytecode digest, and no equivalent response field.

3. **The hash is ProofPulse-owned client logic.**
   ProofPulse's `src/rpc.js` independently calls `eth_getCode`, hashes the returned runtime bytes using Node's `createHash("sha256")`, and compares the result with `EXPECTED_CONTRACT_CODE_SHA256` before the KeeperHub call.

4. **The candidate therefore does not reuse an existing KeeperHub building block.**
   It would introduce a new admission contract and a new bytecode-fetch/hash step on KeeperHub's write path.

5. **Adjacent expectation semantics are already under core-team discussion.**
   Open issue #2503 is `needs-discussion` and asks KeeperHub to verify direct execution against caller expectations. Maintainer `suisuss` says the gap is real but is actively settling the shape with the core team, including when caller expectations are valuable and how not to overstate best-effort evidence. A code-hash expectation is pre-broadcast rather than post-execution, so it is not a direct duplicate, but it is close enough that filing a parallel expectation contract now would create avoidable overlap.

6. **The guarantee is inherently narrow.**
   Hashing target runtime code does not detect an implementation upgrade behind a stable proxy, and an admission-time check still has a check-to-mining TOCTOU window. Those limitations can be documented, but they weaken the case for a new public guarantee.

### Decision

`contract_code_hash_admission_guardrail` is **RESEARCH ONLY / DO NOT FILE**.

The external workaround is valuable evidence and should remain in the research ledger. It is not currently stronger than the already source-proven MCP poll-contract mismatch and does not displace that provisional primary.

Kimi must be rerun against the dedicated poll-contract packet.


## Gemini targeted poll-contract rerun — valid, fact-checked

Gemini finally adjudicated the intended candidate and returned **PROMOTE STATUS-BODY-WIDE**.

### What survives fact-check

- The direct status route computes one local `pollIntervalHint` from its server terminal set and passes that value to the header helper.
- `ExecutionStatusResponse` still lacks a poll-hint field.
- MCP `callApi()` returns only parsed JSON for successful JSON responses; `get_direct_execution_status` serializes that body and cannot observe `X-Poll-Interval-Hint`.
- `docs/getting-started/agent.md` explicitly tells `get_direct_execution_status` callers to wait according to `X-Poll-Interval-Hint`; `0` means terminal.
- `docs/api/errors.md` defines `X-Poll-Interval-Hint` on status/long-poll endpoints as the server-recommended polling interval, with `0` meaning terminal.
- In #2058, maintainer `suisuss` states that MCP execute-tool response shapes are meant to match their REST reference bodies and explicitly asks for concrete field mismatches to be filed separately.
- Current exact issue/PR searches still find no owner for surfacing this poll hint in the direct status body/MCP result.

### Corrections to Gemini

1. The explicit “status list is a lower bound” wording is in `docs/api/executions.md`, not `docs/api/direct-execution.md`. Direct-execution docs do, however, require honoring the header and separately document `unconfirmed` as non-terminal.
2. Do not claim PR #1526's header-only design was an “oversight.” The PR intentionally introduced polling headers; whether MCP omission was foreseen is not evidenced. The current contradiction is enough.
3. The body/header dual-source objection is manageable because the route can add `pollIntervalHint` to the response object from the exact same local value already supplied to `applyRateLimitHeaders`. The invariant should pin equality in tests.

### Preferred architecture after Gemini

**STATUS-BODY-WIDE** is now the leading shape:

- add additive `pollIntervalHint: number` to `ExecutionStatusResponse`;
- compute it once from the current server terminal set;
- put that same value in both the JSON body and `X-Poll-Interval-Hint`;
- MCP inherits it automatically through its existing body pass-through;
- no DB migration, persistence change, new status, or state-machine change.

The single test invariant:

> For every successful direct-status response, `body.pollIntervalHint === Number(X-Poll-Interval-Hint)`; the value is `0` iff the route's server terminal set classifies the execution as terminal.

### Decision

`mcp_direct_status_poll_contract` remains **PROVISIONAL PRIMARY**, now strengthened with a preferred **STATUS-BODY-WIDE** implementation shape.

Do not file yet. One targeted Kimi pass remains. If Kimi cannot produce an evidence-backed fatal objection, run one final issue/PR overlap check and prepare the issue.

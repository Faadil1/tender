# KeeperHub Poll Contract Cross-Examination Packet

Date: 2026-09-17
Status: provisional PRIMARY after Grok + ChatGPT source fact-check
Rule: one evidence-backed fatal objection defeats promotion.

## Hard constraint for reruns

This is **not a whitespace-generation task**. Do not generate replacement bounty candidates.
Evaluate only `mcp_direct_status_poll_contract` and choose among the allowed decisions below.
If you believe a different problem is more important, mention it in one sentence at most and still adjudicate this candidate.

## Candidate

Working name: `mcp_direct_status_poll_contract`

Claim: KeeperHub documents `X-Poll-Interval-Hint` as the authoritative direct-execution polling/terminality contract, but the first-class MCP tool `get_direct_execution_status` cannot expose that header because its internal HTTP helper returns only the parsed JSON body.

This is a cross-surface contract-loss hypothesis. It is not about typed failure fields, caller references, idempotency release, receipt export, or outcome reconciliation.

## Verified current staging facts

1. `app/api/execute/[executionId]/status/route.ts`
   - `POLL_INTERVAL_HINT_SECONDS = 2`
   - terminal set is `completed` + `failed`
   - computes `pollIntervalHint = 0` for terminal, else `2`
   - attaches it through `X-Poll-Interval-Hint`
   - JSON `ExecutionStatusResponse` does not include the value

2. `app/api/execute/_lib/types.ts`
   - `ExecutionStatusResponse` contains status/result/receipts/etc.
   - no `pollIntervalHint` field

3. `lib/mcp/tools.ts`
   - `callApi()` returns `response.json()` on successful JSON responses
   - success-response headers are not included in the returned `ApiResponse`
   - `get_direct_execution_status` returns only `JSON.stringify(data)`

4. Documentation
   - `docs/api/direct-execution.md`: treat status list as a lower bound; decide terminality from `X-Poll-Interval-Hint`; `0` means terminal
   - `docs/getting-started/agent.md`: specifically tells `get_direct_execution_status` callers to wait the seconds from `X-Poll-Interval-Hint`

5. Maintainer signal
   - In closed issue #2058, maintainer `suisuss` says MCP-to-REST response shapes are intended to align and asks for any concrete field mismatch to be filed as a separate issue.

6. Overlap
   - PR #1526 introduced the HTTP header and was merged.
   - Current searches found no exact open/closed issue or PR that exposes this poll hint through the MCP tool result/body.

## Corrections to the Grok proposal

Do not rely on:
- a claim that all JSON clients cannot read headers; ordinary REST clients can
- an unverified n8n consumer claim
- adding the hint to every 202 write envelope by default
- direct-execution wait/callback/hash-lookup as part of this issue

## Candidate fix shapes to compare

### A. MCP-only
Preserve REST as-is. Make `get_direct_execution_status` expose the existing header value in its tool result, e.g. `pollIntervalHint`.

Pros: smallest proven fix.
Risk: MCP result diverges additively from REST body.

### B. Status-body-wide
Add additive `pollIntervalHint: number` to `ExecutionStatusResponse`, compute body + header from one value, and let MCP inherit it automatically.

Pros: REST JSON and MCP body share one shape; solves other body-only wrappers.
Risk: duplicates one semantic in header and body; broader API surface.

### C. Docs-only
Stop telling MCP callers to read the inaccessible header; tell them to use known status strings.

Pros: smallest code impact.
Risk: weakens the forward-compatible server-owned terminality rule that current direct-execution docs explicitly prefer.

## Gemini role

Act as systems/API/schema/concurrency reviewer.

Try to reject the candidate. Determine:
- whether header-only terminality is an intentional architecture boundary
- whether adding the body field creates a dual-source-of-truth problem
- whether MCP-only shaping is cleaner than changing REST
- whether future statuses make docs-only unsafe
- exact test invariant needed to prevent header/body drift
- whether any active issue/PR already owns this

Return one:
- PROMOTE MCP-ONLY
- PROMOTE STATUS-BODY-WIDE
- DOCS-ONLY
- RESEARCH FURTHER
- REJECT / DUPLICATE

## Kimi role

Act as product-boundary / semantics / DX reviewer.

Try to reject the candidate. Determine:
- whether this is a real product contract failure or only documentation friction
- whether `pollIntervalHint` semantically belongs in a model-visible tool result
- whether a clearer `terminal: boolean` is better or dangerously invents a second contract
- whether exposing cadence to an agent is useful or the tool should instead hide polling entirely
- whether the issue is substantial enough for KeeperHub's mergeability-first bounty

Return one:
- PROMOTE MCP-ONLY
- PROMOTE STATUS-BODY-WIDE
- DOCS-ONLY
- RESEARCH FURTHER
- REJECT / DUPLICATE

## Promotion bar

Promote only if:
- current-source mismatch remains verified
- no active owner/duplicate exists
- fix is additive/backwards-compatible
- no DB migration or state-machine change is required
- one crisp invariant can be tested
- maintainer acceptance is plausible
- the change is useful beyond Tender

If both reviewers disagree, preserve both objections and let source/maintainer evidence decide. Do not vote.


### Pre-packet Kimi note

A Kimi response produced before this packet proposed a contract-code-hash admission guardrail instead of adjudicating this candidate. That response does not count.

Fact-check established:
- #2408 is closed/completed.
- current KeeperHub simulate does not expose contractCodeSha256.
- ProofPulse computes its bytecode hash locally via eth_getCode + SHA-256.
- #2503 is already under core-team discussion for adjacent caller-expectation / execution-verification semantics.

For the targeted Kimi rerun, do not revive the code-hash candidate. Adjudicate only the poll-contract candidate above.


## Gemini targeted result

Status: VALID + FACT-CHECKED

Gemini classification: **PROMOTE STATUS-BODY-WIDE**

Preferred invariant:
- add additive `pollIntervalHint: number` to `ExecutionStatusResponse`;
- derive body and `X-Poll-Interval-Hint` from the same local computed value;
- test exact equality between body and header;
- `0` iff the server terminal set says terminal.

Corrections:
- “lower bound” wording is in `docs/api/executions.md`, not direct-execution.md;
- do not claim PR #1526's header-only choice was an oversight;
- current direct-execution docs still explicitly require the polling header, which MCP cannot expose.

Kimi must now try to kill this exact STATUS-BODY-WIDE preference. Do not generate replacement candidates.


## Kimi targeted final result

Classification: **PROMOTE STATUS-BODY-WIDE**

Final correction:
- Do not use `docs/api/executions.md`'s lower-bound wording as direct-execution evidence; that page documents workflow executions.
- The direct candidate remains supported by the impossible MCP instruction in `docs/getting-started/agent.md`, the generic poll-header contract in `docs/api/errors.md`, the current direct status route, and #2058 parity guidance.

Final duplicate sweep at KeeperHub staging `7104df9db8d2f171731185c6349855b59136e147`: no exact active owner found.

Research gate: COMPLETE.
Candidate: READY TO FILE.
Preferred plan: STATUS-BODY-WIDE.

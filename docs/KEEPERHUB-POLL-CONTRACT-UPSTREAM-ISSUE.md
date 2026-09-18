# Proposed KeeperHub issue

Checked against KeeperHub `staging` commit `7104df9db8d2f171731185c6349855b59136e147` on 2026-09-17.

## Suggested title

**fix(mcp): expose the documented direct-execution poll hint in the status response body**

### Before filing

- [x] I searched open and closed issues/PRs for `pollIntervalHint`, `X-Poll-Interval-Hint`, `poll hint`, `get_direct_execution_status` field/response requests, MCP headers, direct-status polling cadence, and MCP/REST response-shape variants.
- [x] I checked the current behavior on `staging` at `7104df9db8d2f171731185c6349855b59136e147`.
- [x] This is one change, not several.
- [x] Historical related work exists (#1526, #1964, #2008, #2058), but no active issue or PR was found that exposes the direct-status poll hint in the JSON body / MCP result.

## Reason: what you cannot do today

KeeperHub's agent guide tells MCP callers to poll `get_direct_execution_status` and wait the number of seconds in the `X-Poll-Interval-Hint` response header; `0` means terminal.

That signal is not observable through the MCP tool.

The direct status route currently computes `pollIntervalHint` from the execution status and emits it as `X-Poll-Interval-Hint`. But `ExecutionStatusResponse` has no equivalent JSON field.

In `lib/mcp/tools.ts`, successful JSON calls return only `response.json()`. `get_direct_execution_status` then serializes that parsed body. Successful response headers are not carried into the tool result.

So the first-class MCP caller is documented to consume a signal its tool abstraction discards.

This is not a proposal for a new polling mechanism. The poll hint already exists and is documented in `docs/api/errors.md`; that page defines `0` as terminal for status/long-poll endpoints. The missing piece is making the existing direct-status signal observable through the response body that MCP already passes through.

The closest maintainer guidance I found is #2058. In its closing comment, `suisuss` says the MCP execute tools point to REST references for their response shape, that the shapes are meant to be the same, and asks for concrete mismatches to be filed separately.

## Reason: what the workaround costs

An MCP caller has three choices today, none of which matches the documented contract:

1. hardcode a polling interval and branch on direct status strings;
2. bypass the MCP tool and call the REST endpoint directly just to read the header; or
3. add host-specific plumbing to capture HTTP headers outside the tool result.

The first duplicates server policy into every agent. The other two defeat the point of exposing direct execution as a first-class MCP tool.

## Scope

**In scope**

- Add an additive `pollIntervalHint: number` field to `ExecutionStatusResponse`.
- In `GET /api/execute/{executionId}/status`, compute the hint once and put that same value in:
  - the JSON response body; and
  - `X-Poll-Interval-Hint`.
- Update the direct-status response documentation/example to include the field.
- Add regression coverage that pins body/header equality.
- Let `get_direct_execution_status` inherit the field through its existing REST-body pass-through; no MCP-specific re-derivation.

**Out of scope**

- No new execution statuses.
- No change to which statuses are terminal.
- No new wait/long-poll endpoint.
- No idempotency change.
- No database migration or persistence change.
- No `terminal` or `retryable` field.
- No change to workflow-execution status contracts.
- No attempt to surface arbitrary HTTP headers through every MCP tool.

## Plan

1. Extend `ExecutionStatusResponse` with additive `pollIntervalHint: number`.
2. In the direct status route, derive one local value from the existing terminal-set logic before constructing the response.
3. Include that value in the JSON response and pass the same value to `applyRateLimitHeaders(..., { pollIntervalHint })`.
4. Add tests for terminal and non-terminal states asserting:
   - `body.pollIntervalHint === Number(response.headers.get("X-Poll-Interval-Hint"))`;
   - the value is `0` exactly when the route's existing terminal-set logic says terminal.
5. Update the direct-execution / agent-facing docs so MCP examples refer to the body field they can actually observe, while retaining the header for ordinary HTTP clients.

## Alternatives considered

### MCP-only synthesis

Teach `get_direct_execution_status` to capture the HTTP header and synthesize a new tool-only property.

I did not choose this because it deliberately makes the MCP result differ from the REST response body, while #2058 says those execute-tool shapes are meant to align. It also adds one-off transport handling to an otherwise body-pass-through tool.

### Docs-only

Remove the header instruction from the agent guide and tell MCP callers to use a fixed interval / status strings.

This removes the impossible instruction but leaves MCP unable to follow KeeperHub's existing server-directed polling cadence. It also duplicates current server polling policy into agent documentation.

### Global MCP header plumbing

Change `callApi()` to return both body and headers for every MCP call.

That is broader than the concrete defect. The direct status route already has a narrow additive response field shape that solves it without changing every MCP tool.

## Compatibility

- [x] Changes an existing response shape, status code, CLI flag, or default. (Additive JSON response field only.)
- [ ] Adds, removes, or upgrades a dependency.
- [ ] Changes database schema or requires a migration.
- [ ] Touches authentication, permissions, validation, or spend limits.
- [ ] Changes pricing, plan limits, or anything a user is charged for.

## Related

- #1526 — introduced `X-Poll-Interval-Hint`.
- #1964 — made the poll hint more discoverable in docs.
- #2008 — historical direct-status documentation drift around `unconfirmed`.
- #2058 — maintainer guidance that MCP execute-tool response shapes are meant to match REST references and concrete mismatches should be filed separately.

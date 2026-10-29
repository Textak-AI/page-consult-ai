# Money and privacy regression coverage

Pure tests: no production behavior, schema, RLS, pricing, deployments, or live data changes.

## Counts and runners

- Baseline: `bun test tests` — 126 passing tests across 22 files.
- Existing Deno suite: `_shared/copyRegister.test.ts` — 7 passing tests using the edge-function test runner. Bun cannot load its HTTPS imports; this suite is run separately, not silently omitted.
- Added: 72 tests across five new test files.
- Final: Bun 198 + Deno 7 = **205 passing tests**, up from **133**.

## New files

| File | Tests | Coverage |
| --- | ---: | --- |
| `stripeWebhook.regression.test.js` | 35 | Subscription checkout for new/existing customers; configured and legacy prices for all tiers; unknown-price free fallback; active/past-due subscription updates; deletion; failed invoice; unmatched events; signature rejection; 10/25/50-action pack grant arguments. Exact subscriptions/user_usage write payloads, owner filters, dates, conflict key, and real planLimits mapping. |
| `publicProjection.regression.test.js` | 6 | CRM prospect, prospect_pages, published fallback and preview ready/expired/missing responses. Exact response/page/prospect allowlists and explicit select lists, despite over-wide fixture rows containing email, email_body, context_raw, billing, notes, owner and an unknown future-sensitive column. |
| `sessionAccess.regression.test.js` | 12 | All three session tables: expiry boundary, invalid dates, mismatched claimed owners, successful validated ownership, malformed/missing Authorization, revoked authentication, exact capability lookup fields, malformed capability schema, database failure and case-insensitive Bearer validation. |
| `leadPaths.regression.test.js` | 14 | Real submit-form and submit-prospect-form handlers plus real shared delivery helpers: HTTP/network webhook failures, retry/audit counts, no webhook, insert failure, insert-before-delivery, first-lead repeat/marker guards, failed email handling, both prospect formats, server-resolved ownership, QuickPivot source/slug and provider idempotency key. |
| `usageBuckets.regression.test.js` | 5 | Real migration SQL in local PGlite: five overlapping build calls yield one free log and four 3-action charges; monthly-only, pack-only, monthly/pack and rollover/monthly/pack refunds restore exact original balances once. |

Supporting files: `helpers/edgeHarness.js` isolates remote-import Deno source with injected dependencies and captures background work; `fixtures/stripeEvents.js` supplies reusable event/price/customer fixtures. Neither is counted as a test file.

## Named limitations and current behavior

1. **Production PostgreSQL multi-connection races:** PGlite runs one embedded connection. Overlapping calls test real SQL results and log/bucket invariants, but do not establish distributed row-lock behavior on concurrent hosted connections.
2. **Ordinary submit-form concurrent first-lead emails:** the current handler counts leads and checks a marker, sends, then conditionally writes the marker. Sequential repeat/count/marker guards are tested; it is not an atomic pre-send claim, so strict concurrent single-send is not guaranteed. No behavior change was made. QuickPivot's existing migration test separately executes the atomic claim SQL for both prospect formats; new handler tests cover using that claim and provider idempotency key.
3. **Nested display JSON:** sections, styles and preview design_intelligence are documented display fields passed through as JSON. Tests reject extra private row columns and consultation_data leakage; they cannot truthfully promise removal of sensitive text/keys already embedded inside allowed display JSON. No recursive sanitizer was introduced.
4. **Provider and hosted runtime integration:** Stripe cryptographic signature validation, real delivery/inbox receipt, hosted auth/RLS and EdgeRuntime shutdown/lifetime semantics are outside this offline harness. Tests mock Stripe verification/DB/provider responses and explicitly await captured background promises; no live requests are sent.
5. **Ignored Stripe DB error results:** the current handler acknowledges most subscription/usage writes without propagating their returned error objects (checkout upsert errors are logged). Payload assertions establish intended writes, not successful hosted persistence under DB failure; no error handling was altered.
6. **Session schema boundary:** lookupSession does not itself parse malformed tokens; callers apply sessionTokenSchema. Malformed format tests target the actual schema, while lookup/auth tests target the actual shared functions. Claimed sessions use validated ownership rather than anonymous expiry, matching existing behavior.

No tests are skipped or marked todo. Existing tests remain unchanged.
# Phase 3 — Conversion Log

Running record of every route converted to `lib/authz`, in order, with test evidence. Updated per checkpoint (every 3–5 conversions per your instructions). Nothing here is merged/deployed — this is local working-tree state pending your review, per your explicit instruction that nothing gets merged without sign-off at each phase boundary.

**Decisions carried over from Phase 2 approval:** real automated test framework (Vitest, now set up — see below), `close`/`update-comment` included in scope, missing-check routes (Phase 1 §6) stay out of scope.

## Test infrastructure set up (prerequisite, not a route conversion)

- Added `vitest` as a dev dependency, `npm test` / `npm run test:watch` scripts, `vitest.config.mts`.
- `test/helpers/supabaseMock.ts` — a chainable mock standing in for the subset of the supabase-js query builder these routes use (`.from().select/update/insert/delete()`, `.eq()/.in()/.or()/.gte()/.lte()/.is()/.order()/.limit()`, `.single()/.maybeSingle()`, thenable resolution, `.auth.getUser()`), driven by per-table handler functions so each test controls exactly what the "database" returns.
- `test/helpers/authFixtures.ts` — shared super-admin auth scenario fixtures (no token / wrong role / valid super admin), reused across every super-admin-shaped test.
- **Found and fixed a pre-existing `.gitignore` bug**: the entire `test/` directory was blanket-ignored (`test/` — apparently meant only to exclude a local PDF fixture used for manual CV-parsing checks). Left as-is, none of the tests below would ever actually be committed, silently defeating the point of setting up a real test framework. Narrowed the ignore to `test/data/` only so the new suite is tracked normally. Flagging this explicitly since it's a repo-config fix adjacent to, but not part of, the authorization refactor itself.
- Excluded `test/` from `tsconfig.json`'s main build scope (added to `exclude`) so Vitest's own type-checking of test files doesn't get pulled into `next build`'s type-check — confirmed with a full `tsc --noEmit` pass (zero errors) after the change.
- Built `lib/authz/types.ts` (`AuthzResult` discriminated union) and `lib/authz/index.ts` with the first two shapes: `requireSuperAdmin` (extracted from `lib/verifySuperAdmin.ts`) and `requireServiceSecret` (extracted from the identical `CRON_SECRET` check duplicated in both cron routes). `lib/verifySuperAdmin.ts` itself is untouched and still in use by not-yet-converted routes — nothing old is deleted yet, per your Phase 3 instructions.

## Checkpoint 1 — super-admin shape, shared-helper consumers (4 routes)

All four already imported the correct, non-drifted `lib/verifySuperAdmin.ts` helper — this batch is a pure mechanical swap to `lib/authz`'s `requireSuperAdmin`, chosen first as the lowest-risk possible starting point to validate the whole approach before touching anything with real behavioral nuance.

| Route | Test file | Scenarios covered | Before (baseline) | After (converted) |
|---|---|---|---|---|
| [admin/data-retention/preview/route.ts](src/app/api/admin/data-retention/preview/route.ts) (GET) | [preview.test.ts](test/api/admin/data-retention/preview.test.ts) | no token → 403, wrong role → 403, super admin → 200 with preview data | 3/3 pass | 3/3 pass |
| [admin/data-retention/delete-now/route.ts](src/app/api/admin/data-retention/delete-now/route.ts) (POST) | [delete-now.test.ts](test/api/admin/data-retention/delete-now.test.ts) | no token → 403, wrong role → 403 (and downstream delete never called), super admin → 200, deletion attributed to the correct admin's userId, invalid `data_type` → 400 even for a super admin | 4/4 pass | 4/4 pass |
| [admin/data-retention/settings/route.ts](src/app/api/admin/data-retention/settings/route.ts) (GET, PATCH) | [settings.test.ts](test/api/admin/data-retention/settings.test.ts) | GET: no token/wrong role → 403, super admin → 200 with settings+history. PATCH: no token/wrong role → 403 (update never called), super admin → 200, update attributed to correct admin | 6/6 pass | 6/6 pass |
| [admin/onboarding/route.ts](src/app/api/admin/onboarding/route.ts) (GET, PATCH) | [onboarding.test.ts](test/api/admin/onboarding.test.ts) | GET: no token/wrong role → 403, super admin → 200 with companies. PATCH: no token/wrong role → 403 (funnel event never logged), super admin → 200 + funnel event logged | 6/6 pass | 6/6 pass |

**Total: 19/19 tests, identical results before and after every conversion.** Each test file was run against the original (unconverted) route first to establish the baseline, then re-run unchanged after swapping the import — same test, same assertions, same result, which is the actual proof of "no behavior change," not just an assertion of it.

One incidental cleanup surfaced by the type system: the discriminated `AuthzResult` type means `authorized: true` now always carries a `userId`, so the old defensive `if (!authCheck.authorized || !authCheck.userId)` pattern became provably redundant (the `!authCheck.userId` half can never be reached) and was simplified to `if (!authCheck.authorized)` in `delete-now` and `settings` — functionally identical, confirmed by the same passing tests, not a behavior change since that branch was already unreachable dead code under the old implementation too.

Full typecheck (`tsc --noEmit`) is clean across the whole project after this batch.

**Not yet touched:** all other flagged routes.

## Checkpoint 2 — drifted super-admin copies + service-secret shape (4 routes)

This batch fixes the drift found in Phase 1 (two independent hand-rolled copies of the super-admin check) as a side effect of converting them, plus builds and applies the second shape, `requireServiceSecret`.

| Route | Test file | Scenarios covered | Before (baseline) | After (converted) |
|---|---|---|---|---|
| [admin/funnel/route.ts](src/app/api/admin/funnel/route.ts) (GET) | [funnel.test.ts](test/api/admin/funnel.test.ts) | no token → 403, wrong role → 403, super admin → 200 with real funnel data | 3/3 pass | 3/3 pass |
| [contact-submissions/route.ts](src/app/api/contact-submissions/route.ts) (GET, PATCH, DELETE) | [contact-submissions.test.ts](test/api/contact-submissions.test.ts) | all 3 methods: no token/wrong role → 403 (mutation never reaches the DB), super admin → success, correct row targeted | 9/9 pass | 9/9 pass |
| [cron/data-retention/route.ts](src/app/api/cron/data-retention/route.ts) (GET) | [data-retention.test.ts](test/api/cron/data-retention.test.ts) | `CRON_SECRET` unset → 401, wrong bearer token → 401, correct token → 200 and sweep runs | 3/3 pass | 3/3 pass |
| [cron/onboarding-reminders/route.ts](src/app/api/cron/onboarding-reminders/route.ts) (GET) | [onboarding-reminders.test.ts](test/api/cron/onboarding-reminders.test.ts) | same 3 scenarios as above | 3/3 pass | 3/3 pass |

**Total: 18/18 tests, identical results before and after.** Cumulative across both checkpoints: **37/37 tests passing**, 8 routes converted.

**Bug found and fixed in `lib/authz` itself** (not a pre-existing behavior — introduced by me in checkpoint 1, caught here): `lib/authz/index.ts` created its Supabase client eagerly at module scope, so importing *any* function from the module — including `requireServiceSecret`, which never touches Supabase — tried to construct a client and crashed when Supabase env vars weren't set (surfaced immediately once a route without its own Supabase client, `cron/data-retention`, tried to use it). Fixed by lazily instantiating the client on first use inside `requireSuperAdmin` only. Re-ran the full suite (all 8 files) afterward to confirm the fix didn't regress the checkpoint-1 conversions — it didn't.

**Housekeeping confirmed, not yet acted on:** `lib/verifySuperAdmin.ts` now has zero remaining consumers anywhere in the codebase (checked via grep) — every route that used it has been converted. Per your Phase 3/4 instructions I'm leaving the file in place; deleting dead code is explicitly Phase 4's job, done once, after every route across every shape is converted — not incrementally per shape.

Full typecheck clean after this batch too.

## Checkpoint 3 — company-member/admin reference implementations + session-token shape (5 routes)

Built three more `lib/authz` shapes: `requireAuthenticatedUser` (a composable identity-only primitive — verifies the bearer token and resolves the caller, nothing else), `requireCompanyMember(request, companyId?)` (shape 3 — verify membership in a specific company, or resolve the caller's own), `requireCompanyAdmin` (shape 2 — admin role + own company), and `requireSessionToken` (shape 5 — token-possession lookup, parameterized error messages since the two consumers use different languages).

| Route | Test file | Scenarios covered (incl. negative/cross-company cases) | Before | After |
|---|---|---|---|---|
| [candidates/signed-cv-url/route.ts](src/app/api/candidates/signed-cv-url/route.ts) (POST) | [signed-cv-url.test.ts](test/api/candidates/signed-cv-url.test.ts) | no header/invalid token → 401, no membership → 403, **candidate belonging to a different company is silently excluded from the signed-URL response**, body validated before membership (order-preserving edge case) | 5/5 pass | 5/5 pass |
| [medical-certificates/signed-url/route.ts](src/app/api/medical-certificates/signed-url/route.ts) (POST) | [signed-url.test.ts](test/api/medical-certificates/signed-url.test.ts) | no header/invalid token → 401, body validated before role check, non-admin → 403, admin with no company → 403, **certificate belonging to a different company is silently excluded** | 6/6 pass | 6/6 pass |
| [stats/route/[positionId]/route.ts](<src/app/api/stats/route/[positionId]/route.ts>) (GET) | [positionId.test.ts](test/api/stats/positionId.test.ts) | no header/invalid token → 401, nonexistent position → 404, **position belonging to a different company → 403**, own company's position → 200 with data | 5/5 pass | 5/5 pass |
| [happiness/session/route.ts](src/app/api/happiness/session/route.ts) (GET only — POST is an entitlement-gated creation flow, untouched, out of scope) | [session.test.ts](test/api/happiness/session.test.ts) | no token → 401, unknown token → 404, expired token → 410 + marks session timed out, valid token → 200 | 4/4 pass | 4/4 pass |
| [happiness/chat/route.ts](src/app/api/happiness/chat/route.ts) (POST) | [chat.test.ts](test/api/happiness/chat.test.ts) | no token → 401, unknown token → 404, expired → 410, already-completed → 400, valid in-progress session → 200 and advances the conversation | 5/5 pass | 5/5 pass |

**Total: 25/25 tests, identical results before and after. Cumulative: 62/62 tests passing, 13 routes converted.**

Notes worth flagging:
- For `candidates/signed-cv-url` and `medical-certificates/signed-url`, the original code validates the request body *before* the deeper membership/role check. A naive conversion (calling the combined `requireCompanyMember`/`requireCompanyAdmin` first) would have silently reordered these and changed the response for one specific edge case (unauthorized caller + invalid body). I caught this by reasoning through the original code, restructured both conversions to call `requireAuthenticatedUser` first, validate the body, *then* call the membership/role check — and added a test for exactly that edge case, verified against the original file (via a temporary `git stash`) before confirming it also passes converted. Order-preservation like this is exactly the kind of subtle regression this phase's before/after testing is meant to catch.
- `happiness/chat`'s test scenarios were chosen so none of them reach the AI-scoring/advice-generation code paths (OpenRouter calls, `lib/prompts`), since that logic isn't part of the authorization change and mocking it would have added a lot of unrelated surface area for no benefit to this refactor.
- Widened `lib/authz`'s function signatures from `NextRequest` to the base `Request` type, since none of them use anything NextRequest-specific and `stats/route/[positionId]` only has a plain `Request` available (a pre-existing quirk of that file, untouched).
- One real pre-existing type looseness surfaced by giving `happiness/chat`'s session object an explicit type for the first time: `session.id` is numeric in the DB but gets passed to a function typed to expect a string. This was silently working under implicit `any` before; fixed with an explicit, documented cast rather than changing any runtime value.

Full typecheck clean after this batch.

## Checkpoint 4 — final batch (4 routes converted, 2 routes deliberately skipped with explanation)

### Skipped: `new-position` and `positions-private`

Looking closely at these two while implementing (rather than just from the Phase 2 read-through), neither one actually has an extractable authorization check. Both resolve a `company_id` from a `user_id` taken directly from the request body/query string, with **no token/session verification of the caller at all** — that gap is exactly what Phase 1 §6 flagged and what your scope explicitly excludes fixing. There's nothing here to "convert to the centralized layer": the only two things happening are (a) a plan/entitlement check, which is `lib/entitlements.ts` and out of scope per your instructions, and (b) an unauthenticated data lookup. Centralizing that lookup into a `lib/authz` function would either be a no-op rename (no real value) or would require adding an identity check that isn't there today (a behavior change requiring separate sign-off). I'm leaving both routes untouched and flagging this rather than forcing a conversion that doesn't accomplish anything.

### Converted: `tickets/upload`, `performance/goals/update`, `close`, `update-comment`

| Route | Test file | Scenarios covered | Before | After |
|---|---|---|---|---|
| [tickets/upload/route.ts](src/app/api/tickets/upload/route.ts) (POST) | [upload.test.ts](test/api/tickets/upload.test.ts) | no header/invalid token → 401, unrelated caller → 403, ticket owner → 200, **coworker in the same company → 200 (the existing over-broad grant Phase 1 flagged, deliberately preserved as-is, not tightened)** | 5/5 pass | 5/5 pass |
| [performance/goals/update/route.ts](src/app/api/performance/goals/update/route.ts) (PATCH) | [goals-update.test.ts](test/api/performance/goals-update.test.ts) | missing goal_id → 400, not entitled → 403, **filter string built matches `employee_id.eq.X,manager_id.eq.X` exactly**, no matching row → 404, match → 200 | 5/5 pass | 5/5 pass |
| [close/route.ts](src/app/api/close/route.ts) (POST) | [close.test.ts](test/api/close.test.ts) | missing positionId → 400, own-company position → 200, **nonexistent position → 404 (new)**, **cross-company position → 403 (new)** | 2/2 pass (baseline scenarios only) | 4/4 pass (2 baseline + 2 new) |
| [update-comment/route.ts](src/app/api/update-comment/route.ts) (POST) | [update-comment.test.ts](test/api/update-comment.test.ts) | missing candidat_id → 400, own-company candidate → 200, **no session → 401 (new)**, **no membership → 403 (new)**, **candidate only linked to a different company → 403 (new)** | 2/2 pass (baseline scenarios only) | 5/5 pass (2 baseline + 3 new) |

**Total: 17/17 tests, cumulative: 81/81 tests passing, 17 routes converted.**

**Important nuance to flag on `close` and `update-comment` specifically** — read this before treating checkpoint 4 as routine, since it's different in kind from every other conversion in this phase:

Both routes previously had **zero app-level check** and relied entirely on their RLS policy. Critically, a Postgres `UPDATE` that matches zero rows (because RLS silently filtered them all out) does **not** error — Supabase returns `{error: null}` regardless, and both routes returned a plain `200 "success"` response either way, with no check of how many rows were actually affected. That means, and this is true *before my change, unrelated to it*: an unauthorized caller closing another company's position, or commenting on a candidate their company has no link to, already always got told "success" while nothing happened — the RLS policy silently absorbed the request.

Adding the app-level check means those same unauthorized requests now get an honest `403`/`404` instead of a misleading `200`. **The actual data-mutation outcome is identical in every case — nothing an unauthorized caller could do before, they can do now, and vice versa** — only the HTTP response for the already-impossible cases changed from "silent fake success" to "explicit rejection." I believe this is squarely within what you approved ("the set of allowed/denied requests doesn't change"), but I'm flagging the specific mechanism since it's the one place in this whole phase where the *response* differs for some input, even though the *system state* never does. If you'd rather these two routes preserve the exact 200-response-regardless-of-outcome quirk, say so and I'll revert just this nuance (keep the RLS-mirroring check but swallow it into the same "return 200 either way" shape) — happy to adjust before this goes anywhere near a merge.

Full typecheck clean after this batch.

**Phase 3 is now complete under the current scope**: 17 routes converted (13 from checkpoints 1–3, 4 from this one), 2 routes explicitly evaluated and left alone with reasoning (`new-position`, `positions-private`), and the ~40+ missing-check routes from Phase 1 §6 remain untouched, exactly as agreed. `lib/verifySuperAdmin.ts` has been dead code since checkpoint 2 — still not deleted, since that's Phase 4's job. Nothing has been merged, deployed, or committed.

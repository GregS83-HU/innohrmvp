# Medium/Low Severity Fixes — Group A: Implemented (Employee/Manager Identity Checks)

**Status:** Fixed, tested, not deployed.

---

## lib/authz additions

Three new shared exports, plus one promotion of existing route-private logic:

| Function | Shape | Used by |
|---|---|---|
| `requireSelf(request, claimedUserId)` | Caller must literally be the claimed user | `timeclock` (GET/POST), `performance/goals` (GET, both views), `performance/goals/update` (DELETE) |
| `requireSelfOrCompanyAdminOf(request, targetUserId)` | Caller is the target, or an admin of the target's own company | Promoted from `timeclock/manager`'s private `verifyManagerAccess` — that route now imports the shared version instead of its own copy |
| `requireSelfOrManagerOf(request, employeeId)` | Caller is the employee, that employee's real manager (via `user_profiles.manager_id`, resolved server-side), or a company admin | `performance/goals/create`, `performance/goals/update` (PATCH), `performance/pulse/submit`, `leave-requests/create`, `tickets/create` |

One incidental fix while wiring these in: importing `lib/entitlements.ts`'s `resolveCompanyIdForUser` at the top of `lib/authz/index.ts` would have forced that module's eager (non-lazy) Supabase client construction onto *every* consumer of `lib/authz`, not just the two functions that need it — the same class of bug caught and fixed in the original `lib/authz` project. Switched to a dynamic import inside the two functions that need it instead.

## Routes fixed

| Route | Gap | Fix | Test evidence |
|---|---|---|---|
| [performance/goals/route.ts](src/app/api/performance/goals/route.ts) (GET) | `user_id` trusted outright; in manager view, a real team-membership check was computed and then discarded when `employee_id` was supplied | `requireSelf(request, user_id)` + the discarded check now actually enforced (`employeeIds.includes(employee_id)` before use) | [goals-get.test.ts](test/api/performance/goals-get.test.ts) 6/6 — includes the specific regression test for the discard bug |
| [performance/goals/create/route.ts](src/app/api/performance/goals/create/route.ts) | `employee_id` trusted outright | `requireSelfOrManagerOf(request, employee_id)` | [goals-create.test.ts](test/api/performance/goals-create.test.ts) 4/4 |
| [performance/goals/update/route.ts](src/app/api/performance/goals/update/route.ts) (PATCH, DELETE) | `user_id` trusted outright on both | PATCH: `requireSelfOrManagerOf` (matches existing owner-or-manager DB filter). DELETE: `requireSelf` (matches existing "only employee deletes their own draft" comment) | [goals-update.test.ts](test/api/performance/goals-update.test.ts) 11/11 (extended the existing mechanism-refactor test file) |
| [performance/pulse/submit/route.ts](src/app/api/performance/pulse/submit/route.ts) | `employee_id` trusted outright | `requireSelfOrManagerOf` | [pulse-submit.test.ts](test/api/performance/pulse-submit.test.ts) 4/4 |
| [leave-requests/create/route.ts](src/app/api/leave-requests/create/route.ts) | `user_id`/`manager_id` trusted outright | `requireSelfOrManagerOf(request, user_id)` | [leave-requests-create.test.ts](test/api/leave-requests-create.test.ts) 4/4 |
| [tickets/create/route.ts](src/app/api/tickets/create/route.ts) | `user_id` trusted outright (also an impersonation vector — real name/email attached) | `requireSelfOrManagerOf(request, user_id)` | [tickets-create.test.ts](test/api/tickets-create.test.ts) 4/4 |
| [timeclock/route.ts](src/app/api/timeclock/route.ts) (GET, POST) | `userId` trusted outright on both | `requireSelf` on both — deliberately self-only, not self-or-manager, since the dedicated `timeclock/manager` route already covers manager oversight | [timeclock.test.ts](test/api/timeclock.test.ts) 6/6 |
| [timeclock/manager/route.ts](src/app/api/timeclock/manager/route.ts) | N/A — mechanism refactor only | Swapped its private `verifyManagerAccess` for the promoted `requireSelfOrCompanyAdminOf` | Existing [manager.test.ts](test/api/timeclock/manager.test.ts) re-run unchanged, 7/7 pass before and after, confirming zero behavior change |

## Frontend changes (required — none of these callers previously sent an auth header)

9 files updated to attach `Authorization: Bearer <session.access_token>`: `performance/page.tsx`, `performance/goals/[goalId]/page.tsx`, `performance/goals/new/page.tsx`, `performance/pulse/page.tsx`, `performance/team/page.tsx`, `absences/page.tsx`, `tickets/create/page.tsx`, `time-clock/page.tsx`, `components/timeclock/TimeClockModal.tsx`. Added three new `noSession`-style translation keys (en/fr/hu) where a page didn't already have one.

One incidental fix found while touching `performance/team/page.tsx`: its "approve goal" button called `performance/goals/update` PATCH without ever sending `user_id`, which that route has always required — the button has never worked. Since I was already editing this exact call to add the auth header, added the missing `user_id: session.user.id` field too rather than leave a known-broken call in place.

## Full suite

**195/195 tests passing**, full `tsc --noEmit` clean, `eslint` clean of errors (22 pre-existing warnings across touched files, none introduced by this work — checked each via `git diff`).

---

Stopping here per your sign-off gate. Waiting for confirmation before Group B (`tickets/upload` access-scope decision).

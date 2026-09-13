# Medium/Low Severity Fixes — Group A: Audit (Employee/Manager Identity Checks)

**Status:** Audit only, no code changes. Confirms the identity-check gap in each of the 7 routes in scope, per the sign-off gate. Waiting for confirmation before implementing.

---

## Confirmed: every route trusts a claimed identity with zero session verification

All seven files were read in full. Every one shares the exact same shape: an `employee_id`/`user_id`/`manager_id` is read from the request body or query string and used directly — no route in this group ever calls anything that resolves the caller's real identity from their session/token. Several also use a service-role client (or a cookie-wrapped client instantiated with the *service-role key*, which is effectively the same thing — see `performance/goals/route.ts` below), so there's no RLS backstop either.

| Route | Method | Identity param(s) trusted | What it exposes/allows |
|---|---|---|---|
| [performance/goals/route.ts](src/app/api/performance/goals/route.ts) | GET | `user_id`, `employee_id` (query) | **Two gaps, not one.** (1) `user_id` is never verified — anyone can read anyone's own goals by passing their id (`view=employee` branch, `.eq('employee_id', user_id)`). (2) In `view=manager`, when `employee_id` is explicitly supplied, the code computes the real team (`employeeIds`) via `user_profiles.manager_id = user_id` but then **completely ignores it**: `const targetIds = employee_id ? [employee_id] : employeeIds` — the team-membership check is fetched and then discarded, not just "unenforced." Any caller can read any specific employee's goals this way, regardless of whether they manage them. Also notable: this route has no entitlement/plan check at all, unlike its siblings. |
| [performance/goals/create/route.ts](src/app/api/performance/goals/create/route.ts) | POST | `employee_id`, `created_by` (body) | Anyone can create a goal for any employee. `created_by` is also self-declared by the client and directly controls `status` (`created_by === 'employee' ? 'draft' : 'active'`) — a caller can claim `created_by: 'manager'` to skip the draft state entirely, independent of the identity gap. |
| [performance/goals/update/route.ts](src/app/api/performance/goals/update/route.ts) | PATCH, DELETE | `user_id` (body/query) | Already uses `lib/authz`'s `ownerOrManagerRowFilter` (from the prior project) for the PATCH row-level filter, and a plain `.eq('employee_id', user_id)` for DELETE — but in both cases `user_id` itself is still taken from the request with no verification the caller actually **is** that user. The DB-level filter only proves *some* row matches the claimed id, not that the claim is genuine. |
| [performance/pulse/submit/route.ts](src/app/api/performance/pulse/submit/route.ts) | POST | `employee_id` (body) | Anyone can submit a weekly pulse update "as" any employee for any `goal_id` (no cross-check that the goal even belongs to that employee either, a related but secondary gap). |
| [leave-requests/create/route.ts](src/app/api/leave-requests/create/route.ts) | POST | `user_id`, `manager_id` (body) | Anyone can create a leave request as any user, assigned to any manager. |
| [tickets/create/route.ts](src/app/api/tickets/create/route.ts) | POST | `user_id` (body) | Anyone can create a support ticket "as" any user — their real name/email is looked up and attached to the ticket, so this is also an impersonation vector, not just a permission gap. |
| [timeclock/route.ts](src/app/api/timeclock/route.ts) | GET, POST | `userId` (query/body) | GET leaks any user's clock status/history/weekly summary to anyone. POST lets anyone clock any employee in or out. |

## Proposed fix approach — for your sign-off, not yet implemented

Two distinct relationship checks are needed across this group, both of which should live in `lib/authz` as shared exports (consistent with "use `lib/authz` for every fix... this is the standard approach" — I'm reading that as license to *extend* the module with new shared functions, not just call existing ones; let me know if you meant something narrower):

1. **"Caller is acting as themselves"** — for routes where `employee_id`/`user_id` should just be the caller's own id (goals create for a self-authored draft, pulse submit, leave-requests create, tickets create, timeclock GET/POST, goals update/delete). This is a direct `requireAuthenticatedUser` + `identity.userId === claimedId` check — the same pattern already used for `entitlements/status` and `user-role` in the Critical/High project, just applied here.

2. **"Caller manages the target employee"** — for `performance/goals/route.ts`'s manager view specifically, and for the "manager creates a goal for a report" / "manager submits on behalf of" cases where the caller isn't necessarily the employee themselves. **This is the exact relationship check already built for `timeclock/manager/route.ts`** (`verifyManagerAccess`, currently a private, unexported function in that route file: caller must either *be* the target, or be an admin of the target's own company — team membership resolved via the same `user_profiles.manager_id` relationship used elsewhere).

My plan, contingent on your sign-off: promote `verifyManagerAccess` out of `timeclock/manager/route.ts` into `lib/authz` as a proper shared export (e.g. `requireManagerOrOwner` — note this is a **new, distinct function** from the existing `ownerOrManagerRowFilter`, which only builds a SQL filter string and doesn't check the caller's identity at all), have `timeclock/manager/route.ts` consume the promoted version instead of its local copy, and use it everywhere in this group that needs "manager of" semantics. This avoids rewriting the same relationship logic seven times and matches your explicit instruction not to build a second parallel abstraction.

Each fix preserves the existing entitlement/plan checks and existing DB-level ownership filters exactly as they are today — this is additive (a caller-identity check before the existing logic runs), not a replacement of any working logic.

---

Waiting for confirmation before implementing Group A.

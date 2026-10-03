# Vulnerability Fix — Group 2: User & Recruitment-Pipeline Writes

**Status:** Fixed, tested, not deployed.

---

## Route-by-route

| Route | Vulnerability | Fix applied | Test evidence |
|---|---|---|---|
| [update-next-step/route.ts](src/app/api/update-next-step/route.ts) | Zero authorization of any kind, and it used the **service-role client**, meaning unlike its sibling `update-comment`, it had no RLS backstop either — any unauthenticated caller could move any candidate to any recruitment step (or clear it) in any company. | Switched to the cookie-scoped client (`lib/supabaseServerClient.ts`), which brings the existing "Company members can update own position candidates" RLS policy into play, **plus** an explicit app-level check (`requireCompanyMemberSession` + a join verifying the candidate is linked to a position in the caller's own company) mirroring that policy — defense-in-depth, not RLS-only, per your instruction. Matches `update-comment`'s pattern exactly. | [update-next-step.test.ts](test/api/update-next-step.test.ts) — 5/5: 400 missing candidat_id, 401 no session, 403 no company membership, **403 candidate only linked to a different company (cross-tenant)**, 200 own-company candidate. Vulnerability confirmed by direct code inspection (the original file had literally zero auth-related code — no header check, no cookie check, nothing). |
| [users/update-status/route.ts](src/app/api/users/update-status/route.ts) | Zero auth — any caller could activate/deactivate any user in any company by supplying `userId`/`companyId` directly. | `requireCompanyAdmin` resolves the admin's own company from session; the target `userId` is now independently verified to belong to that same company via `company_to_users` before the update runs. Client-supplied `companyId` is no longer read at all. | [update-status.test.ts](test/api/users/update-status.test.ts) — 3/3: 401 no auth, **404 target user belongs to a different company (cross-tenant)**, 200 target user in admin's own company. |
| [users/update-manager/route.ts](src/app/api/users/update-manager/route.ts) | Zero auth — any caller could reassign any user's manager. | Same pattern: `requireCompanyAdmin` + explicit target-user company-membership check before touching `user_profiles`. | [update-manager.test.ts](test/api/users/update-manager.test.ts) — 3/3: 401 no auth, **404 cross-tenant target**, 200 own-company target. |
| [users/users-creation/route.ts](src/app/api/users/users-creation/route.ts) | Only a plan/seat entitlement check, no identity check — any caller could create a user in any `companyId`. | `requireCompanyAdmin` derives the company being created into from the caller's own session; the client-supplied `companyId` is no longer read at all (there's no "existing target user" to re-verify for a create action — the equivalent protection is refusing to trust which company is being written to). | [users-creation.test.ts](test/api/users/users-creation.test.ts) — 4/4: 401 no auth, **attacker-supplied companyId proven ignored (user created in caller's own company only)**, 200 entitled admin, 403 admin's own company not entitled. |

## Frontend changes (required)

All four routes are called by the app today, so all four callers needed a bearer token attached (previously none did):
- **`src/app/jobs/[slug]/stats/StatsTable.tsx`** (`update-next-step`) — no change needed. It's a same-origin `fetch()` with no `credentials` override, so the browser sends the session cookie automatically, which the new cookie-scoped check relies on.
- **`src/app/jobs/[slug]/users-creation/page.tsx`** (`update-manager`, `update-status`) — both call sites now fetch a fresh session via `supabase.auth.getSession()` and attach `Authorization: Bearer <token>`. `update-status`'s body no longer sends `companyId` (API derives it now).
- **`components/AddUserModal.tsx`** (`users-creation`) — same pattern added before the fetch call.

## Full suite

**116/116 tests passing** (101 carried over + 15 new for this group), full `tsc --noEmit` clean. No regressions.

---

Stopping here per your sign-off gate. Waiting for confirmation before Group 3 (sensitive data & cross-tenant reads — the largest group: `happiness/dashboard`, both medical-certificate routes, `company-email-settings`, the four recruitment-pipeline routes, `timeclock/manager`, and the three info-disclosure routes).

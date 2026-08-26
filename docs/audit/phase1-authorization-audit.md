# Phase 1 — Centralized Authorization Refactor: Audit Report

**Status:** Read-only audit. No code was changed to produce this report.
**Scope:** Every authorization/permission check found in `src/app/api/**`, plus client-side (page/component) gating in `src/app` and `components/`, plus shared helpers in `lib/` and `hooks/`.
**Not in scope (per instructions):** `lib/entitlements.ts` / plan-entitlement logic is documented only for context (it's a billing/plan gate, not an identity check, and routes often conflate the two — that conflation is itself a finding below). RLS policy contents were read only where needed to determine whether a route's real protection lives in the DB rather than the route. Payroll, Stripe internals, and medical-certificate redaction/consent logic were not evaluated beyond who is authorized to call the endpoint.

---

## 0. Executive summary

- **64 API route files** reviewed, plus all client-side page/component gating and the two RLS migrations that are load-bearing for two routes.
- **No `middleware.ts` exists anywhere in the repo.** There is no centralized route-protection layer today. Every route independently decides (or fails to decide) its own authorization.
- **~49 of 64 API route files instantiate the Supabase service-role client**, which bypasses Row-Level Security entirely. For those routes, whatever authorization exists is whatever the route author happened to hand-code — nothing else backs it up.
- At least **four structurally different idioms** are used across the codebase to answer "is this caller allowed to do this" (see §5), including **three independent copies** of the same super-admin check, one of them subtly different from the other two.
- The audit found **a large number of routes that appear to have no caller-identity verification at all** — they trust a `company_id`/`user_id`/`employee_id`/`managerId` taken directly from the request body or query string. This is flagged in detail in §6 as suspected pre-existing bugs, per your instruction to flag rather than fix. Several of these are independently exploitable **right now**, unauthenticated, against live production data (destructive Stripe subscription cancellation, cross-tenant candidate pipeline tampering, medical-certificate upload, mass admin-user creation).
- A small number of routes (`candidates/signed-cv-url`, `stats/route/[positionId]`, `medical-certificates/signed-url`, `tickets/upload`) show the *correct* pattern already: verify the bearer token → resolve the caller's own company/role from the DB → use that (not client input) to scope the query. These are good reference implementations for Phase 2's design.

This report documents **how** things are currently checked (the mandate of Phase 1). Where the audit surfaced a check that looks outright missing or wrong, it is flagged in §6, separated from the "how it's implemented" analysis, per your explicit instruction not to fix or silently change behavior.

---

## 1. Shared authorization building blocks that exist today

| Helper | Location | What it does | Client used |
|---|---|---|---|
| `verifySuperAdmin(request)` | `lib/verifySuperAdmin.ts` | Reads token from `sb-access-token`/`supabase-auth-token` cookies or `Authorization` header → `supabase.auth.getUser(token)` → `.from('users').select('id, is_super_admin').eq('id', user.id).single()` → requires `is_super_admin === true` | service-role |
| `createServerClient()` | `lib/supabaseServerClient.ts` | Wraps `createServerComponentClient({ cookies })` — a cookie-bound, session-scoped client where Postgres RLS applies | anon/cookie-scoped (RLS-enforced) |
| `hasFeatureAccess(companyId, feature)` | `lib/entitlements.ts` | **Plan/billing gate, not an identity check.** Verifies a company's subscription plan permits an action (boolean flags or capacity limits). Trusts whatever `companyId` it is given — does not verify the caller belongs to that company. | service-role |
| `resolveCompanyIdForUser(userId)` | `lib/entitlements.ts` | `.from("company_to_users").select("company_id").eq("user_id", userId).single()`. Trusts whatever `userId` it is given. | service-role |
| `consumeCredit(companyId)` / `getRemainingCredits(companyId)` | `lib/credit.ts` | AI-credit accounting. Trusts `companyId` as given. | service-role |
| `useModuleAccess(userId)` | `hooks/useModuleAccess.ts` | Client-side React hook, fetches `/api/entitlements/status?userId=...`. Its own doc-comment states it is **not an enforcement point**. | none (fetch only) |
| `get_company_candidates(user_uuid)`, `get_recruitment_steps_for_user(user_id)`, `get_team_members_by_manager(manager_uuid)` | Postgres RPCs (`supabase_schema.sql`) | Each correctly joins through `company_to_users`/manager relationships to scope results *once given* a user/manager id. None of them verify the caller's session matches the id passed in — that's left to the caller. | N/A (DB function) |

**Key conflation found throughout the codebase:** `hasFeatureAccess()` / `resolveCompanyIdForUser()` are billing/plan checks. A large number of routes call one of these and treat a passing result as if it were an authorization check ("this caller may act on this company"), when it only means "this company's plan permits this kind of action." This conflation is the single most common root cause behind the missing-authorization findings in §6.

---

## 2. Route-by-route findings

Legend for **Enforcement**: `APP` = explicit check in the route handler code · `RLS` = no app-level check, protected (if at all) only by a Postgres RLS policy · `NONE` = no protection of any kind found · `ENTITLEMENT-ONLY` = only a plan/billing check (`hasFeatureAccess`), no identity check · `N/A` = route touches no tenant-scoped data.

### 2.1 Admin / company-settings / entitlements

| File | Methods | What it checks | How | Enforcement |
|---|---|---|---|---|
| [admin/data-retention/delete-now/route.ts](src/app/api/admin/data-retention/delete-now/route.ts) | POST | `is_super_admin === true` | `verifySuperAdmin(request)` (shared helper) | APP |
| [admin/data-retention/preview/route.ts](src/app/api/admin/data-retention/preview/route.ts) | GET | same | shared helper | APP |
| [admin/data-retention/settings/route.ts](src/app/api/admin/data-retention/settings/route.ts) | GET, PATCH | same | shared helper | APP |
| [admin/funnel/route.ts](src/app/api/admin/funnel/route.ts) | GET | same | **inline duplicated copy** of the shared helper's logic, not imported | APP (but drifted implementation, see §5) |
| [admin/onboarding/route.ts](src/app/api/admin/onboarding/route.ts) | GET, PATCH | same | shared helper | APP |
| [entitlements/check/route.ts](src/app/api/entitlements/check/route.ts) | GET | none | `company_id`/`feature` from query string, straight into `hasFeatureAccess` | NONE (info disclosure of another tenant's plan state) |
| [entitlements/status/route.ts](src/app/api/entitlements/status/route.ts) | GET | none | `userId` from query string → `is_admin`, `company_id`, plan, feature flags returned for that id, no session check | NONE (info disclosure) |
| [company-email-settings/route.ts](src/app/api/company-email-settings/route.ts) | POST, GET, DELETE | POST checks company row exists; GET/DELETE check nothing | `company_id` from body/query, cookie-scoped client (not service-role) | NONE at app level; real protection (if any) is whatever RLS exists on `company_email_settings` — not verified in this pass |
| [contact-submissions/route.ts](src/app/api/contact-submissions/route.ts) | GET, PATCH, DELETE | `is_super_admin === true` | **inline duplicated copy** of `verifySuperAdmin`, not imported | APP (drifted implementation) |
| [contact/route.ts](src/app/api/contact/route.ts) | POST | none — intentionally public | in-memory rate limit + input sanitization | N/A (public by design) |
| [cron/data-retention/route.ts](src/app/api/cron/data-retention/route.ts) | GET | shared-secret bearer token | `Authorization: Bearer ${CRON_SECRET}` | APP (service-to-service) |
| [cron/onboarding-reminders/route.ts](src/app/api/cron/onboarding-reminders/route.ts) | GET | same | same pattern | APP |
| [signup/route.ts](src/app/api/signup/route.ts) | POST | none — intentionally public (creates new company + admin) | field validation only, no rate limit/CAPTCHA | N/A (public by design, but no abuse protection) |
| [user-role/route.ts](src/app/api/user-role/route.ts) | GET | none | `userId` from query string, returns that user's `is_manager`/`is_admin` | NONE (info disclosure) |
| [import-users/route.ts](src/app/api/import-users/route.ts) | POST | none (only a plan/seat check) | `company_id` and `is_admin` per row come from the uploaded CSV/XLSX | ENTITLEMENT-ONLY |
| [users/update-manager/route.ts](src/app/api/users/update-manager/route.ts) | PATCH | none | `userId`/`managerId` from body | NONE |
| [users/update-status/route.ts](src/app/api/users/update-status/route.ts) | PATCH | none | `userId`/`companyId`/`isActive` from body | NONE |
| [users/users-creation/route.ts](src/app/api/users/users-creation/route.ts) | POST | none (only a plan/seat check) | `companyId`/`managerId` from body | ENTITLEMENT-ONLY |

### 2.2 Recruitment / candidates / interviews / positions

| File | Methods | What it checks | How | Enforcement |
|---|---|---|---|---|
| [analyse-cv/route.ts](src/app/api/analyse-cv/route.ts) | POST | none | `positionId`/`companySlug` from form data, never cross-checked | NONE |
| [analyse-massive/route.ts](src/app/api/analyse-massive/route.ts) | GET (SSE) | none at route; RPC scopes by `user_id` given | `user_id`, `company_id`, `position_id` all from query string | NONE (identity param spoofable) |
| [candidate-count/route.ts](src/app/api/candidate-count/route.ts) | GET | none at route; RPC scopes by `user_id` given | `user_id` from query string | NONE |
| [candidates/signed-cv-url/route.ts](src/app/api/candidates/signed-cv-url/route.ts) | POST | bearer token → caller's real `company_id` → filters requested candidates to that company via join | `supabase.auth.getUser(token)`, then `company_to_users` → `position_to_candidat!inner(openedpositions!inner(company_id))` | **APP — reference implementation** |
| [close/route.ts](src/app/api/close/route.ts) | POST | none in route code | `positionId` from body, cookie-scoped client | RLS only (see §5/§6 — fragile) |
| [generate-position-description/route.ts](src/app/api/generate-position-description/route.ts) | POST | none | `companyId` from body, only used for credit consumption | NONE (credit-abuse risk; no persisted write) |
| [interview-assistant/route.ts](src/app/api/interview-assistant/route.ts) | POST | none | `candidat_id`/`position_id`/`interview_id` from body, no cross-check | NONE |
| [interview-conclude/route.ts](src/app/api/interview-conclude/route.ts) | POST | none | `candidateId`/`positionId` from body | NONE |
| [interview-question/route.ts](src/app/api/interview-question/route.ts) | POST | N/A — stateless LLM proxy, no DB access | — | N/A |
| [interviews/route.ts](src/app/api/interviews/route.ts) | GET, POST, PATCH | none on any method | ids from query/body throughout | NONE |
| [job-assistant/analyze/route.ts](src/app/api/job-assistant/analyze/route.ts) | POST | N/A — public job-seeker tool, no DB access | — | N/A |
| [job-assistant/improve/route.ts](src/app/api/job-assistant/improve/route.ts) | POST | N/A — same family | — | N/A |
| [job-assistant/interview/conclude/route.ts](src/app/api/job-assistant/interview/conclude/route.ts) | POST | N/A — same family | — | N/A |
| [job-assistant/interview/generate/route.ts](src/app/api/job-assistant/interview/generate/route.ts) | POST | N/A — same family | — | N/A |
| [job-assistant/interview/score/route.ts](src/app/api/job-assistant/interview/score/route.ts) | POST | N/A — same family | — | N/A |
| [new-position/route.ts](src/app/api/new-position/route.ts) | POST | `company_id` resolved server-side from `user_id`; entitlement checked; RLS `WITH CHECK` backstop uses real `auth.uid()` | cookie-scoped client + `company_to_users` lookup + `hasFeatureAccess` | APP + RLS (only weakness: `user_id` itself is a body param, not derived from session — mitigated by RLS) |
| [positions-private/route.ts](src/app/api/positions-private/route.ts) | GET | `company_id` resolved from `userId`, applied in the query | cookie-scoped client, `.eq('company_id', ...)` in-query | APP, but `userId` is an unverified query param and SELECT RLS on `openedpositions` is permissive (`USING (true)`) per migration comments — so this app-level filter is the *only* protection, and it's keyed off a spoofable identity |
| [positions-public/route.ts](src/app/api/positions-public/route.ts) | GET | intentionally public; company filter via `!inner` join | `.eq("company.slug", slug)` on an `!inner`-embedded relation | N/A (public by design) — **this is the fixed version of the previously-shipped bug**; confirmed no recurrence of the same "non-`!inner` filter silently dropped" pattern elsewhere |
| `positions/analytics.ts` | — | **not a live route** (wrong filename for App Router — needs to be `route.ts`) | — | Dead code today; would be NONE if ever wired up |
| `positions/list.ts` | — | **not a live route**, and internally broken even if it were (RPC parameter name mismatch, token extracted but never verified) | — | Dead code today |
| [recruitment-step/route.ts](src/app/api/recruitment-step/route.ts) | GET | none at route; RPC scopes by `user_id` given | `user_id` from query string | NONE |
| [stats/route/[positionId]/route.ts](<src/app/api/stats/route/[positionId]/route.ts>) | GET | bearer token → real user → verifies `openedpositions.company_id` matches caller's `company_to_users` row | `supabase.auth.getUser(token)` then join check | **APP — reference implementation**, but the file's URL path (`/api/stats/route/<id>`) doesn't match what a caller would construct (`/api/stats/<id>`); no in-repo caller found — likely orphaned |
| [update-comment/route.ts](src/app/api/update-comment/route.ts) | POST | none in route code | `candidat_id` from body, cookie-scoped client | RLS only (explicitly called out in migration `20260731103500_secure_candidates_rls.sql` as relying entirely on RLS) |
| [update-next-step/route.ts](src/app/api/update-next-step/route.ts) | POST | none | `candidat_id`/`step_id` from body, **service-role client** | **NONE — no RLS backstop either** (see §6, highest severity) |

### 2.3 HR operations (timeclock, leave, performance, medical certificates, tickets, happiness)

| File | Methods | What it checks | How | Enforcement |
|---|---|---|---|---|
| [feedback/route.ts](src/app/api/feedback/route.ts) | POST, GET | none — public by design | — | N/A (GET returns all rows unfiltered; likely a public demo table) |
| [happiness/chat/route.ts](src/app/api/happiness/chat/route.ts) | POST | possession of an unguessable session token | `x-session-token` header → row lookup | APP (token-possession model, no company re-verification) |
| [happiness/dashboard/route.ts](src/app/api/happiness/dashboard/route.ts) | GET | none — `company_id` looked up but never applied to the actual metrics query | `user_id` from query string | NONE (cross-tenant aggregation leak) |
| [happiness/session/route.ts](src/app/api/happiness/session/route.ts) | POST, GET | entitlement-only (POST) / token-possession (GET) | `company_id` from body (POST), token header (GET) | ENTITLEMENT-ONLY / APP (token) |
| [leave-requests/create/route.ts](src/app/api/leave-requests/create/route.ts) | POST | entitlement-only | `user_id`/`manager_id` from body | ENTITLEMENT-ONLY |
| [medical-certificates/confirm/route.ts](src/app/api/medical-certificates/confirm/route.ts) | POST | entitlement-only | `company_id` from form data | ENTITLEMENT-ONLY (sensitive health data) |
| [medical-certificates/signed-url/route.ts](src/app/api/medical-certificates/signed-url/route.ts) | POST | bearer token → real user → `is_admin`/`is_super_admin` → own company only | full chain, service-role used only after identity established | **APP — reference implementation** |
| [medical-certificates/upload/route.ts](src/app/api/medical-certificates/upload/route.ts) | POST | entitlement-only | `company_id` from form data | ENTITLEMENT-ONLY (sensitive health data) |
| [notifications/email/route.ts](src/app/api/notifications/email/route.ts) | POST | none | `recipientEmail` from body | NONE (currently low-impact — `sendEmail` is a stub) |
| [performance/goals/create/route.ts](src/app/api/performance/goals/create/route.ts) | POST | entitlement-only | `employee_id`/`created_by` from body | ENTITLEMENT-ONLY |
| [performance/goals/route.ts](src/app/api/performance/goals/route.ts) | GET | team membership looked up server-side, but not actually enforced against the requested `employee_id` | `user_id` query param, `view=manager` | NONE effectively (see §6) |
| [performance/goals/update/route.ts](src/app/api/performance/goals/update/route.ts) | PATCH, DELETE | row-level ownership filter (`employee_id`/`manager_id` match) | `.or('employee_id.eq.X,manager_id.eq.X')` | APP (real filter) but `user_id` itself unauthenticated |
| [performance/pulse/submit/route.ts](src/app/api/performance/pulse/submit/route.ts) | POST | entitlement-only | `goal_id`/`employee_id` from body, no cross-check | ENTITLEMENT-ONLY |
| [timeclock/manager/route.ts](src/app/api/timeclock/manager/route.ts) | GET, POST | GET: none. POST approve: DB-verified team membership of the *target*, but not of the caller | `managerId` from query/body | NONE (GET) / partial APP (POST, but caller identity unverified) |
| [timeclock/route.ts](src/app/api/timeclock/route.ts) | GET, POST | entitlement-only (POST); none (GET) | `userId` from query/body | ENTITLEMENT-ONLY / NONE |
| [unsubscribe/route.tsx](src/app/api/unsubscribe/route.tsx) | POST | none — low-sensitivity by design | `email` from body | N/A (minor griefing-vector note only) |
| [tickets/create/route.ts](src/app/api/tickets/create/route.ts) | POST | entitlement-only | `user_id` from body | ENTITLEMENT-ONLY |
| [tickets/upload/route.ts](src/app/api/tickets/upload/route.ts) | POST | bearer token → real user → ticket owner OR **any** same-company user | `supabase.auth.getUser(token)`, then `company_to_users` membership (no role filter) | APP, but over-broad (any coworker, not just owner/admin) |

### 2.4 Stripe / billing

| File | Methods | Who is actually authorized (as implemented) |
|---|---|---|
| [stripe/create-credit-session/route.ts](src/app/api/stripe/create-credit-session/route.ts) | POST | Nobody checked — `company_id` from body, service-role client |
| [stripe/create-portal-session/route.ts](src/app/api/stripe/create-portal-session/route.ts) | POST | Nobody checked |
| [stripe/create-subscription/route.ts](src/app/api/stripe/create-subscription/route.ts) | POST | Nobody checked |
| [stripe/prices/route.ts](src/app/api/stripe/prices/route.ts) | GET | Anyone (public catalog data, low risk) |
| [stripe/subscription-cancel/route.ts](src/app/api/stripe/subscription-cancel/route.ts) | POST | Nobody checked — **destructive**, cancels a live subscription |
| [stripe/subscription/route.ts](src/app/api/stripe/subscription/route.ts) | GET | Nobody checked — reads another company's plan/subscription status |
| [stripe/webhook/route.ts](src/app/api/stripe/webhook/route.ts) | POST | Stripe only, via signature verification (`stripe-signature` + `STRIPE_WEBHOOK_SECRET`) — **correctly implemented, the one solid check in this group** |

---

## 3. Client-side (UI) authorization checks

No page in the app performs a redirect-based role gate. All client-side "authorization" is nav-link/UI-element hiding, driven by `user.is_admin`/`user.is_super_admin` (`components/Header.tsx`) or by `useModuleAccess()` (plan/feature gating). None of it is a security boundary on its own — the question that matters is whether each one has a real server-side counterpart.

| UI gate | Location | Server-side counterpart? |
|---|---|---|
| Hide/show admin nav links (Manage Users, Manage Contacts, Massive Upload, Funnel, Data Retention, Onboarding, etc.) | `components/Header.tsx:54-57` + nav rendering | Mixed — see rows below |
| `/jobs/[slug]/users-creation` page — no page-level admin check at all | `src/app/jobs/[slug]/users-creation/page.tsx` | **None.** Backing APIs (`users-creation`, `update-manager`, `update-status`) have no server check either — UI hiding is the only gate, and it doesn't even gate the page itself, only the nav link to it. |
| `/jobs/[slug]/admin/import-users` | page has no client-side super-admin check | **None.** `api/import-users` has zero auth. This is the single most exposed path in the app — nav hides the link, page doesn't check, API doesn't check. |
| `/jobs/[slug]/admin/data-retention`, `/funnel`, `/onboarding` | pages have no client-side super-admin check | **Present** — their APIs correctly call `verifySuperAdmin`/the inline duplicate, so the missing page-level check is low-risk. |
| Module/plan gating (tickets, absences, performance, time-clock manager) via `useModuleAccess()` | multiple pages under `src/app/jobs/[slug]/**` | **Present** — matching `hasFeatureAccess()` calls exist in the corresponding API routes. This dimension (plan gating) is the one area where client and server are consistently in sync. |
| `performance/page.tsx`, `performance/team/page.tsx` — session-exists redirect | client-side only | N/A — just a "logged in" check, not a role check |
| `PositionList.tsx` — show Apply vs. Treat vs. Admin actions per position | `components/openedpositions/PositionList.tsx` | Not verified for every underlying mutation route in this pass — flagged for Phase 2/3 follow-up |
| "Team Time Clock" nav link gated by `isManager \|\| isAdmin` | `Header.tsx` | **None** — `api/timeclock/manager` never verifies the caller is the `managerId` supplied |
| "Team Performance" nav link gated by `isManager \|\| isAdmin` | `Header.tsx` | **None** — `performance/goals/create` and `/update` never verify caller is the employee's manager/admin |

**middleware.ts:** confirmed absent from the entire repository (searched root, `src/`, `src/app/`). There is no route-level protection at the framework layer today.

---

## 4. Test coverage note

This pass did not enumerate existing tests per route (that's Phase 2's explicit job per your instructions — "what test coverage exists today, and what's missing"). Flagging here only as a heads-up: given the volume of routes with `NONE`/`ENTITLEMENT-ONLY` enforcement above, Phase 2 will likely find close to zero routes with an existing automated negative/cross-tenant test, since the underlying behavior itself has no check to test against.

---

## 5. Inconsistency / drift findings (the "same concept checked differently" audit)

1. **Three independent implementations of the super-admin check.** Canonical: `lib/verifySuperAdmin.ts`, correctly imported by 4 routes. Independently re-implemented, byte-for-byte near-identical, in `admin/funnel/route.ts` and `contact-submissions/route.ts` — and they've already drifted: the funnel copy doesn't return `userId` on success, unlike the other two.
2. **`resolveCompanyIdForUser`-shaped logic** (`.from('company_to_users').select('company_id').eq('user_id', X).single()`) exists as a shared helper in `lib/entitlements.ts` but is reimplemented inline in `entitlements/status/route.ts` and `performance/goals/create/route.ts` instead of reused — and in the latter case, `X` is an attacker-supplied `employee_id`, not a verified session id.
3. **Two fundamentally different trust models coexist in the same `src/app/api` tree**: routes using the service-role client (bypasses RLS, ~49 of 64 files) vs. routes using the cookie-scoped client (RLS-enforced — `close`, `update-comment`, `new-position`, `positions-private`, `company-email-settings`, and a few performance routes). A route that currently relies on RLS as its only protection (`close`, `update-comment`) would silently lose that protection if ever switched to the service-role client — which is the dominant pattern elsewhere in the codebase, making this an easy mistake to reintroduce.
4. **Four distinct "who is this caller" idioms**, none shared consistently: (a) full token verification via `supabase.auth.getUser(token)` + DB role lookup (`verifySuperAdmin`, `signed-cv-url`, `stats/[positionId]`, `medical-certificates/signed-url`, `tickets/upload`); (b) trusting a client-supplied `user_id`/`userId` as-is (the majority of routes in §2.2/§2.3); (c) trusting a client-supplied `company_id` directly (all six non-webhook Stripe routes); (d) relying entirely on Postgres RLS with no application-level identity check at all (`close`, `update-comment`).
5. **The `positions-public` bug's specific failure mode (non-`!inner` nested-relation filter silently dropped by PostgREST) does not recur elsewhere** in the routes reviewed — the fix (`company!inner(...)`) is confirmed in place and is a good reference pattern. However, the *general class* of bug (a company/tenant filter that looks present but doesn't actually constrain the query, or is keyed off unverified input) recurs repeatedly in different forms — see §6.

---

## 6. Suspected pre-existing permission bugs — flagged only, not fixed

Per your instructions, these are **not fixed**. Each needs separate review and sign-off before any behavior changes. Ordered roughly by severity/exploitability against live production data.

### Critical — unauthenticated, exploitable now, high-impact write or destructive action
- **[stripe/subscription-cancel/route.ts](src/app/api/stripe/subscription-cancel/route.ts)** — any caller supplying a `company_id` can cancel that company's live Stripe subscription. No auth of any kind.
- **[update-next-step/route.ts](src/app/api/update-next-step/route.ts)** — any caller can move any candidate to any recruitment step (or clear it) for any company, service-role client, no auth and no RLS backstop (contrast with its sibling `update-comment`, which at least has an RLS policy).
- **[import-users/route.ts](src/app/api/import-users/route.ts)** — any caller can bulk-create users, including admins (`is_admin` from the uploaded file), into any `company_id`. This is also the one case where the *only* gate anywhere in the stack (UI nav-link hiding behind `isSuperAdmin`) is purely cosmetic — the page itself and the API both have zero checks.
- **[users/update-status/route.ts](src/app/api/users/update-status/route.ts)** — any caller can activate/deactivate any user in any company.
- **[users/update-manager/route.ts](src/app/api/users/update-manager/route.ts)** — any caller can reassign any user's manager.
- **[users/users-creation/route.ts](src/app/api/users/users-creation/route.ts)** — any caller can create a new user in any company (only a seat-limit check, not identity).
- **[stripe/create-portal-session/route.ts](src/app/api/stripe/create-portal-session/route.ts)** / **[create-subscription](src/app/api/stripe/create-subscription/route.ts)** / **[create-credit-session](src/app/api/stripe/create-credit-session/route.ts)** — any caller can generate a live Stripe billing-portal or checkout session for an arbitrary company.
- **[stripe/subscription/route.ts](src/app/api/stripe/subscription/route.ts)** — any caller can read any company's plan/subscription status.

### High — cross-tenant data exposure or sensitive-data write, unauthenticated
- **[happiness/dashboard/route.ts](src/app/api/happiness/dashboard/route.ts)** — the `company_id` lookup result is computed but never applied to the metrics query; dashboard aggregates data across **all** companies for any caller.
- **[medical-certificates/confirm/route.ts](src/app/api/medical-certificates/confirm/route.ts)** and **[medical-certificates/upload/route.ts](src/app/api/medical-certificates/upload/route.ts)** — sensitive health-document upload with only a plan-entitlement check; no verification of who is uploading or that they belong to `company_id`. (Contrast: `medical-certificates/signed-url/route.ts` in the same feature does this correctly and should be the template.)
- **[company-email-settings/route.ts](src/app/api/company-email-settings/route.ts)** — no authorization on GET/POST/DELETE of SMTP credentials (encrypted at rest, but still readable/overwritable/deletable cross-tenant if RLS doesn't independently block it — RLS policy on this table was not verified in this pass and should be a priority follow-up).
- **[analyse-cv/route.ts](src/app/api/analyse-cv/route.ts)**, **[interview-assistant/route.ts](src/app/api/interview-assistant/route.ts)**, **[interview-conclude/route.ts](src/app/api/interview-conclude/route.ts)**, **[interviews/route.ts](src/app/api/interviews/route.ts)** (GET/POST/PATCH) — classic IDOR: candidate/position/interview IDs taken from the request with no company cross-check, allowing reads/writes against another company's recruitment pipeline.
- **[timeclock/manager/route.ts](src/app/api/timeclock/manager/route.ts)** — `managerId` trusted from the client; any caller can view (GET) another manager's team's clock data, and the POST approve-entry check verifies the *target* entry's owner is on that team but never verifies the *caller* actually is that manager.
- **[entitlements/status/route.ts](src/app/api/entitlements/status/route.ts)**, **[entitlements/check/route.ts](src/app/api/entitlements/check/route.ts)**, **[user-role/route.ts](src/app/api/user-role/route.ts)** — information disclosure: any caller can learn another company's plan/feature state or another user's admin/manager flags by supplying an id.

### Medium
- **[performance/goals/route.ts](src/app/api/performance/goals/route.ts)** (GET, manager view) — the team-membership lookup is fetched but not actually enforced against the requested `employee_id` before filtering; a caller can request any `employee_id`'s goals under `view=manager` as long as `user_id` has at least one report.
- **[performance/goals/create/route.ts](src/app/api/performance/goals/create/route.ts)**, **[performance/goals/update/route.ts](src/app/api/performance/goals/update/route.ts)**, **[performance/pulse/submit/route.ts](src/app/api/performance/pulse/submit/route.ts)**, **[leave-requests/create/route.ts](src/app/api/leave-requests/create/route.ts)**, **[tickets/create/route.ts](src/app/api/tickets/create/route.ts)**, **[timeclock/route.ts](src/app/api/timeclock/route.ts)** — the recurring "entitlement check standing in for identity check" pattern; `employee_id`/`user_id`/`manager_id` all trusted from client input.
- **[tickets/upload/route.ts](src/app/api/tickets/upload/route.ts)** — has real bearer-token auth, but the access check is any-coworker-in-the-company rather than ticket-owner-or-admin; likely broader than intended.
- **[positions-private/route.ts](src/app/api/positions-private/route.ts)** — filter is correctly present in the query, but keyed off an unverified `userId` query param, and SELECT RLS on `openedpositions` is reportedly permissive — so this app-level filter is the sole protection and it trusts a spoofable value.
- **[close/route.ts](src/app/api/close/route.ts)**, **[update-comment/route.ts](src/app/api/update-comment/route.ts)** — no app-level check at all; protected solely by an RLS policy added after a prior incident. Not currently broken, but a single point of failure — flagged as fragile given the dominant pattern elsewhere in the codebase is the service-role client, which would silently bypass this RLS policy if ever introduced here.
- **[new-position/route.ts](src/app/api/new-position/route.ts)** — `user_id` used for the company lookup is a body param rather than derived from the session; currently mitigated by RLS's `WITH CHECK` using the real `auth.uid()`, but worth tightening.

### Low / informational
- **[feedback/route.ts](src/app/api/feedback/route.ts)** GET — returns all rows unauthenticated; comment says "for admin purposes" but there's no admin check. Likely low severity (looks like a public demo table) but worth confirming.
- **[unsubscribe/route.tsx](src/app/api/unsubscribe/route.tsx)** — no token ties the request to the actual recipient; minor griefing vector (mass-unsubscribe by email), not a data exposure.
- **[notifications/email/route.ts](src/app/api/notifications/email/route.ts)** — `recipientEmail` unauthenticated, but currently low-impact since `sendEmail` is a non-sending stub; would become an open-relay/spoofing risk if ever wired to a real provider.
- **`positions/analytics.ts`, `positions/list.ts`** — not live routes today (wrong filename for App Router in one case, also internally broken in the other), but both contain missing/broken authorization; recommend deleting or fixing explicitly rather than leaving as landmines that go live with zero protection the moment someone renames the file.
- **`stats/route/[positionId]/route.ts`** — has the best authorization logic found in the audit, but its literal file path produces the URL `/api/stats/route/<id>` rather than `/api/stats/<id>`, and no in-repo caller was found — likely orphaned/unreachable. Worth confirming whether a different, less-protected `/api/stats/<id>` route exists elsewhere or is expected by the frontend.

---

## 7. What this means for Phase 2

Phase 2 will need to design permission "shapes" that cover at minimum: (a) super-admin-only, (b) company-admin-only, (c) any authenticated member of company X, (d) manager-of-this-specific-employee, (e) owner-of-this-specific-record, and (f) service-to-service (cron/webhook). The good reference implementations already in the codebase — `candidates/signed-cv-url`, `stats/route/[positionId]`, `medical-certificates/signed-url`, `verifySuperAdmin` — all share the same shape: verify the token → resolve the caller's own identity/company/role from the DB → use that (never client input) to scope the query. That shape is the natural target for the centralized layer.

Given the number of §6 findings that are independently severe and currently exploitable, you may want to triage some of them as an out-of-band incident before or in parallel with the phased refactor, rather than waiting for the full four-phase timeline — that's your call, not something I'll act on without separate sign-off.

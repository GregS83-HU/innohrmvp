# Vulnerability Fix — Group 3: Sensitive Data & Cross-Tenant Reads

**Status:** Fixed, tested, not deployed. This was the largest and most varied group — three routes turned out not to fit the "add an authenticated-caller check" template at all, because they have no authenticated caller by design. Read the flagged section before treating this as routine.

---

## Route-by-route

| Route | Vulnerability | Fix applied | Test evidence |
|---|---|---|---|
| [happiness/dashboard/route.ts](src/app/api/happiness/dashboard/route.ts) | `company_id` was resolved but never applied to the `happiness_sessions` query; any `user_id` param pulled cross-company aggregate data. | `requireCompanyMember(req)` derives caller + company from session; `happiness_sessions` query now filtered `.eq('company_id', companyId)`. **`happiness_daily_metrics` left unscoped — see flagged section, it has no `company_id` column at all.** | [dashboard.test.ts](test/api/happiness/dashboard.test.ts) — 2/2: 401 no auth, **aggregation proven scoped to caller's own company only (avgHappiness reflects Company A's session, not the mixed A+B average)**. |
| [medical-certificates/confirm/route.ts](src/app/api/medical-certificates/confirm/route.ts) | Entitlement check only; `company_id` trusted from form field. | `requireCompanyAdmin(request)` derives company from session, matching `signed-url`'s model. **Frontend NOT updated — see flagged section, this route has no login anywhere in its current caller.** | [confirm.test.ts](test/api/medical-certificates/confirm.test.ts) — 4/4: 401 no auth, attacker-supplied `company_id` proven ignored, 200 entitled admin, 403 not entitled. |
| [medical-certificates/upload/route.ts](src/app/api/medical-certificates/upload/route.ts) | Same as confirm (OCR/extraction step of the same feature). | Same fix. **Same frontend caveat.** | [upload.test.ts](test/api/medical-certificates/upload.test.ts) — 3/3: 401 no auth, attacker-supplied `company_id` ignored, 200 for entitled admin. |
| [company-email-settings/route.ts](src/app/api/company-email-settings/route.ts) (GET/POST/DELETE) | Zero auth on any method. | Composed a local `requireOwnCompanyAdminSession` (session identity via `requireCompanyMemberSession`, already-shared, + an inline admin-role check — not added to `lib/authz` itself, per your instruction). Applied to all three methods. | [company-email-settings.test.ts](test/api/company-email-settings.test.ts) — 5/5: 401 no session, 403 non-admin, attacker-supplied `company_id` proven ignored (GET + DELETE). **Separate RLS finding below — not patched.** |
| [analyse-cv/route.ts](src/app/api/analyse-cv/route.ts) | IDOR: arbitrary `positionId` accepted with no existence check; AI credits billed via a separately-supplied `companySlug` that could name a different company than `positionId` actually belongs to. | **Public, unauthenticated endpoint (candidate job application) — see flagged section for why this got a different fix.** Verifies `positionId` is a real position; bills credits against that position's own `company_id`, not the separate `companySlug`. | [analyse-cv.test.ts](test/api/analyse-cv.test.ts) — 2/2: 404 nonexistent position, **credits proven billed to the position's real company even when a mismatched `companySlug` is supplied**. |
| [interview-assistant/route.ts](src/app/api/interview-assistant/route.ts) | Zero auth; `position_id`/`candidat_id`/`interview_id` trusted directly. | `requireCompanyMember(req, position.company_id)` — position ownership verified before touching candidate/interview data. | [interview-assistant.test.ts](test/api/interview-assistant.test.ts) — 3/3: 401 no auth, **403 position belongs to a different company**, 200 own-company position. |
| [interview-conclude/route.ts](src/app/api/interview-conclude/route.ts) | Zero auth; arbitrary `candidateId`/`positionId` pair accepted. | **Public endpoint (part of the candidate-facing AI interview chat, `InterviewChat.tsx`) — same treatment as `analyse-cv`.** Verifies `candidateId` is actually linked to `positionId` via `position_to_candidat` before writing a score/summary. | [interview-conclude.test.ts](test/api/interview-conclude.test.ts) — 2/2: 404 unlinked pair, 200 genuinely-linked pair. |
| [interviews/route.ts](src/app/api/interviews/route.ts) (GET/POST/PATCH) | Zero auth on all three methods; GET leaked any candidate's interview list by ID, POST/PATCH accepted arbitrary position/interview IDs. | `requireCompanyMember` on all three: GET verifies the candidate is linked to a position in the caller's company (two plain queries, deliberately avoiding the nested-embed filter pattern that caused the original positions-public bug); POST verifies the target position's company; PATCH fetches the interview's position first, then verifies its company. | [interviews.test.ts](test/api/interviews.test.ts) — 7/7: 401 on all three methods, **403 cross-tenant on POST and PATCH**, 200 own-company on PATCH, unchanged empty-array behavior for GET with no `candidat_id`. |
| [timeclock/manager/route.ts](src/app/api/timeclock/manager/route.ts) (GET/POST) | `managerId` trusted outright on GET; POST verified the target entry's owner was on the claimed manager's team, but never that the caller *was* that manager. | New `verifyManagerAccess` (composed from `requireAuthenticatedUser` + `requireCompanyAdmin`, both already-shared) — caller must either **be** `managerId` themselves, or be an admin of that manager's own company. Applied to both GET and POST. | [manager.test.ts](test/api/timeclock/manager.test.ts) — 7/7: 401 no auth, **403 caller claims to be a different manager (GET and POST)**, 200 for the real manager, 200 for a same-company admin, **403 for a different-company admin**. |
| [entitlements/status/route.ts](src/app/api/entitlements/status/route.ts) | Any `userId` query param leaked that user's admin flag, company ID, and plan/feature-enablement. | `requireAuthenticatedUser` + caller must equal the queried `userId` (self only — confirmed via `useModuleAccess`'s only 6 call sites that it's never called for another user). | [entitlements-status.test.ts](test/api/entitlements-status.test.ts) — 3/3: 401 no auth, **403 querying another user's status**, 200 own status. |
| [entitlements/check/route.ts](src/app/api/entitlements/check/route.ts) | Any `company_id` leaked that company's plan/feature-enablement for a given feature. | **Not changed — see flagged section.** This is the same route the anonymous medical-certificate upload page calls before the user is ever identified; adding auth here breaks that flow the same way confirm/upload's frontend would. | N/A — unchanged. |
| [user-role/route.ts](src/app/api/user-role/route.ts) | Any `userId` query param leaked that user's `is_manager`/`is_admin` flags. | Same self-only pattern as `entitlements/status` (confirmed via `PositionList.tsx`'s only call site: always the caller's own session id). | [user-role.test.ts](test/api/user-role.test.ts) — 3/3: 401 no auth, **403 querying another user's role**, 200 own role. |

## Frontend changes made

- **`components/timeclock/ManagerTimeClockDashboard.tsx`** — all three fetch calls now attach `Authorization: Bearer <session.access_token>`.
- **`components/InterviewList.tsx`** and **`components/InterviewAssistantModal.tsx`** — all interview/interview-assistant fetch calls (8 call sites across both files) now attach a bearer token; the local `InterviewAssistantModal` defined inside `InterviewList.tsx` and the standalone `components/InterviewAssistantModal.tsx` file are two separate components with the same name — both are live and both got fixed.
- **`hooks/useModuleAccess.ts`** — now fetches a session token (via the shared `lib/supabaseClient.ts`) before calling `entitlements/status`. This hook is consumed by 6 pages, all internal/authenticated (Home dashboard, tickets, absences, performance, time-clock manager) — confirmed none are public flows before making this change.
- **`src/app/jobs/[slug]/openedpositions/PositionList.tsx`** — its `user-role` call now attaches a bearer token; confirmed its `userId` is always `session.user.id` (never another user's) before relying on the new self-only restriction.
- **`analyse-cv` and `interview-conclude`** needed no frontend change — they're public by design and the fix doesn't add an auth requirement, just tightens ID validation.

## Flagged — three things that need your decision, not silently resolved

### 1. The medical-certificate upload flow has no login anywhere, and the assigned fix conflicts with that

`src/app/jobs/[slug]/medical-certificate/upload/page.tsx` and `UploadCertificateClient.tsx` (which handles both the OCR/upload step and the confirm/save step) have **zero session or Supabase-auth code anywhere** — `company_id` comes from a plain `?company_id=` URL query param, and the page includes `isDemo` path-checking, suggesting it's designed as a shareable link rather than something reached through a logged-in session. I discovered this while implementing the assigned fix and it changes what "correct" looks like here:

- I applied `requireCompanyAdmin` to `medical-certificates/confirm` and `medical-certificates/upload` on the backend, matching the `signed-url` template exactly, as instructed.
- I did **not** touch the frontend to add a login requirement, because I don't know whether the intended fix is "require login before this page works" (a real UX change — who is expected to use this link, and would they have an account?) or something else entirely. Guessing would risk exactly the "broken fix is itself an incident" outcome you warned about.
- Left as-is, **the backend fix as currently applied will break this flow for its current (unauthenticated) users** until the frontend is updated to establish a session — this is not deployable in its current state without that follow-up decision.
- This is also why I left `entitlements/check` unchanged: the same upload page calls it (unauthenticated) before the user is identified at all, to pre-check whether the company's plan allows the feature. Adding auth there hits the identical wall.

**I need you to decide**: should this become a logged-in-only flow (in which case I'll build the frontend session plumbing next), or is the anonymous/link-based model intentional (in which case the right fix is different — e.g., a signed/expiring link token instead of a caller identity check, closer to how `happiness/session`'s token-possession model works)? I'd rather ask than guess on a flow that handles employee health data.

### 2. `company_email_settings` has RLS enabled, but every policy is a no-op

Per your instruction to verify rather than assume: I checked `supabase_schema.sql`. RLS **is** enabled on this table, but:
```
CREATE POLICY "Allow authenticated users to delete company email settings" ... USING (true);
CREATE POLICY "Allow authenticated users to insert company email settings" ... WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read company email settings" ... USING (true);
CREATE POLICY "Allow authenticated users to update company email settings" ... USING (true) WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ... USING (true);   -- no TO clause: applies to anon too
GRANT ALL ON TABLE "public"."company_email_settings" TO "anon";
```
Every policy is an unconditional `true` — RLS provides **no real protection** on this table today, and grants extend to the `anon` role. The app-level fix I applied is therefore currently the *only* thing protecting this table. Flagging this as a separate finding, not fixing the policy myself, per your instruction.

### 3. `happiness_daily_metrics` has no `company_id` column at all

The audit's finding ("wire in the company_id filter") assumed a company-scoping column exists on both queried tables. It does on `happiness_sessions` (now applied). It does **not** on `happiness_daily_metrics` — checked the schema directly, the table is a genuinely global aggregate with no tenant column. I left that query and the `dailyMetrics`/`participationTrend` response fields unscoped rather than inventing a fix; the frontend does render `participationTrend`, so a Company A admin currently sees a *global* participation trend on their dashboard, not their own company's. Closing this properly needs either a schema migration (out of scope here) or a product decision to drop/hide that stat. Flagging rather than deciding.

## Full suite

**157/157 tests passing** — 116 carried over from Groups 1–2, plus 41 new for this group's 11 fixed routes (analyse-cv, both medical-certificate routes, company-email-settings, happiness/dashboard, interview-assistant, interview-conclude, interviews, timeclock/manager, entitlements/status, user-role). Full `tsc --noEmit` clean. No regressions.

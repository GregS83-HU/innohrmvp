# Vulnerability Fix — Group 3 Follow-up: Your Three Decisions

**Status:** Implemented, tested at the app layer, not deployed. **The two SQL migrations have not been run against a live database** — Docker wasn't available in this environment to start a local Supabase instance, so they're syntax-reviewed against the existing schema but unverified in practice. Run them against a staging DB first.

---

## 1. Medical-certificate upload now requires a full login

**`src/app/jobs/[slug]/medical-certificate/upload/page.tsx`** — was a link-based, no-login flow (`company_id` from a plain URL query param). Now:
- Requires an active session (`useSession()`); shows a "please sign in" screen if none, instead of rendering the form.
- Derives `companyId` from the session's own `company_to_users` membership — never from the URL — matching what the backend (`requireCompanyAdmin`) has required since the original Group 3 fix.
- Attaches the session's bearer token to the `entitlements/check` pre-check call.

**`UploadCertificateClient.tsx`** — the `companyId` prop is gone entirely (nothing derives it from the client anymore); both `medical-certificates/upload` and `medical-certificates/confirm` fetch calls now attach `Authorization: Bearer <session.access_token>`, and both bail out with a clear error if there's no session.

**`entitlements/check/route.ts`** — this is the second route the same upload page calls, and it had the identical no-auth problem. Now requires `requireAuthenticatedUser` and derives `company_id` from the caller's own session (via `resolveCompanyIdForUser`) instead of the query string. I checked its other caller (`openedpositions/new/page.tsx`) first — it already requires login and already only ever checks its own company, so this doesn't change what that page sees; I updated its fetch call to attach a token since the route now requires one. [entitlements-check.test.ts](test/api/entitlements-check.test.ts) — 2/2: 401 no auth, attacker-supplied `company_id` proven ignored.

Added the missing `uploadCertificate.error.loginRequired` translation key to all three locale files (en/fr/hu).

**Net effect:** the medical-certificate feature is now a normal authenticated-admin flow, consistent with the rest of the app, closing the flagged conflict from the last report. If this route was ever reached via a shared link with no account (e.g. an HR admin forwarding it to someone without HRInno access), that will no longer work — that's the intended trade-off per your decision.

## 2. `company_email_settings` RLS patched

New migration: [`20260826160000_secure_company_email_settings_rls.sql`](supabase/migrations/20260826160000_secure_company_email_settings_rls.sql). Drops the five `USING (true)` / no-op policies (including the one with no `TO` clause that applied to `anon`) and replaces them with four policies — one per SELECT/INSERT/UPDATE/DELETE — all requiring `company_to_users` membership in the row's own `company_id` **and** `is_admin`/`is_super_admin`, matching the app-level `requireOwnCompanyAdminSession` check exactly. Also revokes the table-level `anon` grant. Follows the same structure as the existing `secure_medical_certificates.sql` and `secure_openedpositions_rls.sql` migrations in this repo.

## 3. `happiness_daily_metrics` made company-specific

New migration: [`20260826170000_add_company_scoping_to_happiness_metrics.sql`](supabase/migrations/20260826170000_add_company_scoping_to_happiness_metrics.sql).

- Adds a `company_id bigint` column (FK to `company.id`), with an index.
- Replaces the `UNIQUE (metric_date)` constraint with `UNIQUE (metric_date, company_id)`.
- Rewrites the `update_daily_happiness_metrics(target_date)` function (the one that populates this table — found via the `INSERT ... ON CONFLICT` in `supabase_schema.sql`; I could not find anything in the app code or a `pg_cron` schedule that calls it, so it's presumably invoked externally, outside this repo) to `GROUP BY company_id` and exclude anonymous/company-less sessions from the per-company aggregate, instead of computing one global row per day.
- Tightens the table's RLS SELECT policy (was `USING (true)` for any authenticated user) to the same company-membership check used elsewhere.
- Updated [happiness/dashboard/route.ts](src/app/api/happiness/dashboard/route.ts) to filter this query by the caller's own `company_id` too — the `happiness_sessions` query was already scoped from the earlier fix; now both are.

**Historical-data note, read before running this:** existing rows in `happiness_daily_metrics` predate `company_id` and can't be split into per-company figures after the fact from the aggregate alone. I did not attempt a backfill — that's a data decision, not something to infer. After this migration, old global rows stay as `company_id NULL` and simply won't match any company's dashboard query (no cross-company leak, but daily-trend history effectively restarts from whenever the aggregation function next runs per company). If you want continuous history instead, that needs a separate, deliberate backfill using the retained `happiness_sessions` detail — tell me if you want that built.

## Verification

- **159/159 tests passing**, full `tsc --noEmit` clean, `eslint` run on every touched file (two pre-existing unused-import warnings in `UploadCertificateClient.tsx`, unrelated to this change, left alone).
- **The two SQL migrations are not yet applied anywhere.** Please run them against a staging Supabase project first (`supabase db push` or your normal pipeline) and confirm both the RLS policies and the rewritten aggregation function behave as expected before this reaches production — I don't have a way to execute Postgres in this environment to verify that myself.

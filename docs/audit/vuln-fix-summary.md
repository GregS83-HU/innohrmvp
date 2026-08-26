# Critical + High Severity Authorization Fixes — Project Summary

**Status:** All four groups complete and verified at the application layer. Two SQL migrations still need to be run manually against Supabase (scripts below) — this environment had no Docker available to apply them automatically. Nothing has been deployed.

This project fixed the 16 Critical + High severity routes identified in [phase1-authorization-audit.md](phase1-authorization-audit.md) §6 — unauthenticated or improperly-authenticated endpoints that allowed cross-tenant data access, cross-tenant writes, or unauthenticated billing manipulation. Unlike the earlier `lib/authz` centralization project, this work changed actual behavior: real vulnerabilities were closed, not just refactored.

Full detail for each group lives in its own report, linked below. This document is the top-level index and consolidated result.

---

## Group 1 — Billing & Account Control ([full report](vuln-fix-group1-billing-account.md))

6 routes fixed: `stripe/subscription-cancel`, `stripe/create-portal-session`, `stripe/create-subscription`, `stripe/create-credit-session`, `stripe/subscription` (GET), `import-users`. All Stripe routes previously accepted a client-supplied `company_id` with zero auth — any caller could cancel any company's subscription, open a billing portal for any company, or buy AI credits billed to any company. `import-users` had no real check on either the page or the API despite a cosmetic UI nav-link gate. Every fix now derives `company_id` from the authenticated caller's own session/membership. `import-users` also got a real client-side super-admin gate and, per your explicit direction, a confirmation step listing exactly which users a bulk-import will grant admin access to.

## Group 2 — User & Recruitment-Pipeline Writes ([full report](vuln-fix-group2-user-recruitment.md))

4 routes fixed: `update-next-step`, `users/update-status`, `users/update-manager`, `users/users-creation`. `update-next-step` was the most severe of this group — it used the service-role client with zero check of any kind, unlike its sibling `update-comment` which at least had an RLS backstop. Fixed by switching it to the cookie-scoped client (restoring RLS coverage) plus an explicit app-level check, matching your instruction not to leave it RLS-only. The three user-management routes now verify the target user actually belongs to the acting admin's own company before any write.

## Group 3 — Sensitive Data & Cross-Tenant Reads ([full report](vuln-fix-group3-sensitive-data.md)) + [Follow-up](vuln-fix-group3-followup.md)

11 routes fixed: `happiness/dashboard`, `medical-certificates/confirm`, `medical-certificates/upload`, `company-email-settings`, `analyse-cv`, `interview-assistant`, `interview-conclude`, `interviews` (GET/POST/PATCH), `timeclock/manager`, `entitlements/status`, `user-role`. This was the largest and most varied group. Two routes (`analyse-cv`, `interview-conclude`) turned out to be genuinely public, unauthenticated candidate-facing endpoints — adding a login requirement there would have broken the "apply to a job" and AI-interview-chat features, so they got ID-relationship verification instead of a session check. The medical-certificate upload flow turned out to have no login anywhere at all, which conflicted with the assigned fix; flagged rather than guessed at.

**You then made three explicit decisions**, all implemented in the follow-up:
1. Medical-certificate upload now requires a full login end-to-end (page, client component, and the `entitlements/check` route it also calls).
2. `company_email_settings`'s RLS policies — previously all `USING (true)` no-ops, discovered while verifying rather than assuming — patched via migration.
3. `happiness_daily_metrics` (previously a global table with no `company_id` column at all) made company-specific via migration: new column, rewritten aggregation function, tightened RLS, and a company-scoped dashboard query.

## Group 4 — Verification Pass ([full report](vuln-fix-group4-verification.md))

Full suite re-run, every route checked for cross-tenant negative-test coverage, final summary table produced. Caught and fixed one real gap in the test suite itself along the way (a mock that wasn't simulating a company filter correctly) — the underlying route code was already correct. Confirmed 15 pre-existing lint warnings across touched files predate this work; fixed the one warning this work did introduce.

---

## Final numbers

- **22 routes fixed** (16 from the original assignment + `entitlements/check`, which needed the same fix once its unauthenticated caller was resolved, + the 3 Group-1/2/3 routes counted individually above).
- **161/161 tests passing**, `tsc --noEmit` clean, zero new lint errors.
- **Every fix derives identity/company from the authenticated session**, never from client-supplied parameters — except the two public-by-design endpoints, which use ID-relationship verification since there's no session to derive from.
- **2 SQL migrations** written, syntax-reviewed, not yet executed anywhere (see below).

## What's still open

- Medium/Low severity items from the original audit (`close`, `update-comment`, `new-position`, `positions-private`, and everything not in the Critical/High tier) — explicitly out of scope for this project.
- The two SQL migrations need to be run against Supabase manually — see below.
- A historical backfill for `happiness_daily_metrics` was flagged as a separate decision, not built.

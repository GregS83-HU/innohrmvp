# Vulnerability Fix — Group 4: Verification Pass

**Status:** Complete. This closes out the four-group vulnerability-fix project covering the Critical + High severity findings from `phase1-authorization-audit.md` §6, plus the three follow-up items you asked for after Group 3 (medical-certificate login, `company_email_settings` RLS, per-company happiness metrics).

---

## 1. Full suite re-run

**161/161 tests passing**, full `tsc --noEmit` clean, `eslint` clean of errors (17 pre-existing-style warnings across touched files, none functional — see §4).

While doing this pass I found and fixed **one real gap in my own test coverage**: `interviews` GET had a 401 test but no cross-tenant test. Adding it exposed a **mock-fidelity bug, not a route bug** — my test's `openedpositions` mock ignored the `.eq('company_id', ...)` filter GET applies inline, so it always returned a match regardless of company. Fixed the mock to actually simulate that filter; re-ran, and the real route code correctly returned 403 all along. Documenting this because it's exactly the kind of gap this verification pass exists to catch — worth knowing the process worked, not just that the number is green.

## 2. Negative/cross-tenant test coverage — confirmed for every route

Every route fixed in Groups 1–3 has a test proving unauthorized/cross-tenant access is rejected, **except** two categories where a "Company A vs Company B" test doesn't apply by the nature of the fix, noted explicitly rather than faked:

- **Super-admin-gated routes** (`import-users`) — super-admin is intentionally not company-scoped (a super admin manages every company by design), so the equivalent negative test is "non-super-admin caller rejected," which exists.
- **Public, unauthenticated routes** (`analyse-cv`, `interview-conclude`) — there's no caller session to belong to "the wrong company." The equivalent negative test proves the ID-relationship check works: a nonexistent position (`analyse-cv`) or an unlinked candidate/position pair (`interview-conclude`) is rejected, and a mismatched billing company is proven ignored.

## 3. Final summary — every route fixed

| Route | Vulnerability (one line) | Fix applied | Test evidence |
|---|---|---|---|
| `stripe/subscription-cancel` | Anyone could cancel any company's subscription | `requireCompanyAdmin`, company from session | [subscription-cancel.test.ts](test/api/stripe/subscription-cancel.test.ts) 5/5 |
| `stripe/create-portal-session` | Anyone could get a billing-portal link for any company | `requireCompanyAdmin` | [create-portal-session.test.ts](test/api/stripe/create-portal-session.test.ts) 3/3 |
| `stripe/create-subscription` | Anyone could start a subscription for any company | `requireCompanyAdmin` + frontend token | [create-subscription.test.ts](test/api/stripe/create-subscription.test.ts) 3/3 |
| `stripe/create-credit-session` | Anyone could buy AI credits charged to any company | `requireCompanyAdmin` + frontend token | [create-credit-session.test.ts](test/api/stripe/create-credit-session.test.ts) 3/3 |
| `stripe/subscription` (GET) | Anyone could read any company's plan/status | `requireCompanyMember` | [subscription.test.ts](test/api/stripe/subscription.test.ts) 3/3 |
| `import-users` | Zero auth; bulk-create admins in any company | `requireSuperAdmin` (API + real page gate) + bulk-admin-grant confirmation UI | [import-users.test.ts](test/api/import-users.test.ts) 3/3 |
| `update-next-step` | Zero auth, service-role client, no RLS backstop either | Switched to cookie client + `requireCompanyMemberSession` + join check (matches `update-comment`, not RLS-only) | [update-next-step.test.ts](test/api/update-next-step.test.ts) 5/5 |
| `users/update-status` | Anyone could (de)activate any user in any company | `requireCompanyAdmin` + target-user company verification | [update-status.test.ts](test/api/users/update-status.test.ts) 3/3 |
| `users/update-manager` | Anyone could reassign any user's manager | Same pattern | [update-manager.test.ts](test/api/users/update-manager.test.ts) 3/3 |
| `users/users-creation` | Only a seat-limit check; anyone could create a user in any company | `requireCompanyAdmin`, company from session | [users-creation.test.ts](test/api/users/users-creation.test.ts) 4/4 |
| `happiness/dashboard` | Computed company filter never applied; global aggregate leaked | `requireCompanyMember` + `.eq('company_id', ...)` on both queries (2nd query needed a schema migration - done per your instruction) | [dashboard.test.ts](test/api/happiness/dashboard.test.ts) 2/2 |
| `medical-certificates/confirm` | Entitlement-only; no identity/company check for health data | `requireCompanyAdmin`, matching `signed-url`'s template | [confirm.test.ts](test/api/medical-certificates/confirm.test.ts) 4/4 |
| `medical-certificates/upload` | Same | Same | [upload.test.ts](test/api/medical-certificates/upload.test.ts) 3/3 |
| `company-email-settings` (GET/POST/DELETE) | Zero auth; RLS was also decorative (`USING (true)`) | App-level `requireOwnCompanyAdminSession` + RLS migration patching the real policies (per your instruction) | [company-email-settings.test.ts](test/api/company-email-settings.test.ts) 5/5 |
| `analyse-cv` | IDOR: fake positionId accepted; AI credits billed via a mismatched companySlug | Public by design - verifies positionId is real, bills the position's own company | [analyse-cv.test.ts](test/api/analyse-cv.test.ts) 2/2 |
| `interview-assistant` | Zero auth; arbitrary position/candidate/interview IDs | `requireCompanyMember` against the position's company | [interview-assistant.test.ts](test/api/interview-assistant.test.ts) 3/3 |
| `interview-conclude` | Zero auth; arbitrary candidate/position pair accepted | Public by design - verifies the pair is actually linked | [interview-conclude.test.ts](test/api/interview-conclude.test.ts) 2/2 |
| `interviews` (GET/POST/PATCH) | Zero auth on all three; GET leaked any candidate's interviews | `requireCompanyMember` on all three (GET via a 2-query join, deliberately avoiding embed-filter syntax) | [interviews.test.ts](test/api/interviews.test.ts) 9/9 |
| `timeclock/manager` (GET/POST) | `managerId` trusted outright; POST never checked the caller was that manager | `verifyManagerAccess` - caller must be that manager or an admin of their company | [manager.test.ts](test/api/timeclock/manager.test.ts) 7/7 |
| `entitlements/status` | Any userId leaked that user's admin/plan/company data | `requireAuthenticatedUser` + self-only | [entitlements-status.test.ts](test/api/entitlements-status.test.ts) 3/3 |
| `entitlements/check` | Any company_id leaked that company's plan/feature state | `requireAuthenticatedUser` + company from session (added in follow-up once its unauthenticated caller was fixed) | [entitlements-check.test.ts](test/api/entitlements-check.test.ts) 2/2 |
| `user-role` | Any userId leaked that user's admin/manager flags | `requireAuthenticatedUser` + self-only | [user-role.test.ts](test/api/user-role.test.ts) 3/3 |

**Plus the three follow-up items** (not part of the original 16 but completed on your explicit instruction): medical-certificate upload now requires login end-to-end (page, client component, `entitlements/check`); `company_email_settings` RLS patched via migration; `happiness_daily_metrics` given a `company_id` column, a rewritten aggregation function, tightened RLS, and a company-scoped dashboard query, via migration.

## 4. Housekeeping from this pass

- Renamed two now-unused `request` params to `_request` in `company-email-settings` (GET/DELETE no longer read the request object directly). This project's ESLint config doesn't have an underscore-ignore pattern configured, so the warning persists cosmetically - didn't expand scope to change lint config for it. Zero functional effect either way.
- Confirmed the other 15 lint warnings across touched files all predate this work (checked each via `git diff` against the unused-symbol lines) - not introduced by any of these fixes, left alone.

## 5. What's still outside this project's scope, unchanged

- Medium/Low severity items from Phase 1 §6 (`close`, `update-comment`, `new-position`, `positions-private`) - explicitly out of scope per your instructions, not touched.
- `lib/authz`'s own code - only imported/used, never modified, across all four groups.
- The two new SQL migrations (`20260826160000`, `20260826170000`) are still unexecuted against any real database - Docker wasn't available in this environment. **Run them on staging before this reaches production.**
- If you want a real historical backfill for `happiness_daily_metrics` (rather than trend data restarting from company-scoping onward), that's a separate, deliberate decision - flagged in the Group 3 follow-up report, not built.

## Sign-off checklist against your original acceptance criteria

- [x] All 16 Critical + High routes fixed, grouped and gated as requested
- [x] Every fix derives identity/company from the authenticated session, not client-supplied params (two routes are public by design and use ID-relationship verification instead, since there's no session to derive from - documented, not silently substituted)
- [x] Every fix has a negative test; cross-tenant access attempts rejected where the concept applies
- [x] Full existing test suite passes - 161/161, no regression on the prior `lib/authz` work
- [x] `import-users` super-admin check is real and server-enforced on both page and API; bulk-admin-creation risk was flagged with a recommendation, you approved it, and it's built
- [x] Newly-discovered issues (`company_email_settings` RLS, `happiness_daily_metrics` schema gap, the medical-certificate no-login flow) were reported separately, not silently patched - and once you gave explicit direction, patched exactly as instructed
- [x] Nothing merged or deployed without sign-off at each boundary - still true; nothing in this project has been pushed

This is everything. Let me know if you'd like this committed, or if you want to review anything further before that.

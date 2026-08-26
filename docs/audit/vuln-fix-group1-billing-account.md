# Vulnerability Fix — Group 1: Billing & Account Control

**Status:** Fixed, tested, not deployed. This is a behavior change (closing real vulnerabilities), not a mechanism refactor — every fix here derives identity/company from the authenticated session via `lib/authz`, never from client-supplied `company_id`/params.

---

## Route-by-route

| Route | Vulnerability | Fix applied | Test evidence |
|---|---|---|---|
| [stripe/subscription-cancel/route.ts](src/app/api/stripe/subscription-cancel/route.ts) | Any unauthenticated caller supplying a `company_id` could immediately cancel that company's live Stripe subscription. | `requireCompanyAdmin(req)` — caller must be an authenticated admin; `company_id` now comes exclusively from their resolved membership, request body value is no longer read at all. | [subscription-cancel.test.ts](test/api/stripe/subscription-cancel.test.ts) — 5/5: 401 no auth, 403 non-admin, **attacker-supplied `company_id` in body is proven ignored (only caller's own company is ever queried)**, 200 + cancels own company, 404 own company has no subscription. |
| [stripe/create-portal-session/route.ts](src/app/api/stripe/create-portal-session/route.ts) | Any caller could get a live Stripe billing-portal link (full control over another company's payment methods/invoices) by supplying its `company_id`. | Same `requireCompanyAdmin` pattern. | [create-portal-session.test.ts](test/api/stripe/create-portal-session.test.ts) — 3/3: 401 no auth, attacker-supplied `company_id` ignored, 200 for own-company admin. |
| [stripe/create-subscription/route.ts](src/app/api/stripe/create-subscription/route.ts) | Any caller could initiate a subscription checkout tied to an arbitrary company. | Same `requireCompanyAdmin` pattern. **Frontend updated** (see below) — this route is actually called from the app. | [create-subscription.test.ts](test/api/stripe/create-subscription.test.ts) — 3/3: 401 no auth, attacker-supplied `company_id` ignored, 200 for own-company admin. |
| [stripe/create-credit-session/route.ts](src/app/api/stripe/create-credit-session/route.ts) | Any caller could drain/charge an arbitrary company's AI-credit purchase flow. | Same `requireCompanyAdmin` pattern. **Frontend updated.** | [create-credit-session.test.ts](test/api/stripe/create-credit-session.test.ts) — 3/3: same coverage. |
| [stripe/subscription/route.ts](src/app/api/stripe/subscription/route.ts) (GET) | Any caller could read any company's plan/subscription status by supplying its `company_id`. | `requireCompanyMember(request)` — read-only, so any authenticated member (not just admin) of the caller's own company may view it; `company_id` derived from session, query param no longer read. | [subscription.test.ts](test/api/stripe/subscription.test.ts) — 3/3: 401 no auth, attacker-supplied query param ignored, 200 reads own company. |
| [import-users/route.ts](src/app/api/import-users/route.ts) | Zero authentication — any caller could bulk-create users, including admins (`is_admin` from the uploaded file), into any `company_id` named in the CSV. The nav link's `isSuperAdmin` check was purely cosmetic; the page and API had no check at all. | `requireSuperAdmin(req)` added to the API. Page-level fix below. | [import-users.test.ts](test/api/import-users.test.ts) — 3/3: 403 no auth, 403 non-super-admin, 200 super admin. **Verified against the original route via a temporary revert** — the unauthenticated and non-admin cases both returned 200 before the fix. |

## Frontend changes (required — without these, the fix would break real functionality)

Three of these routes (`create-subscription`, `create-credit-session`, `import-users`) are actually called by the app today; the other three (`subscription-cancel`, `create-portal-session`, `subscription` GET) have **zero callers anywhere in `src/`** (confirmed by grep) — worth a follow-up question for you: are these meant to be wired up somewhere and just aren't yet, or are they dead code? Either way, locking them down couldn't break anything in the current app.

- **`src/app/jobs/[slug]/subscription/page.tsx`** — both `handleBuyCredits` and `handleSubscribe` now fetch a fresh session token via `supabase.auth.getSession()` and attach `Authorization: Bearer <token>` before calling `create-credit-session`/`create-subscription`, matching the pattern already used elsewhere in the codebase (e.g. `medical-certificate/download/page.tsx`). `company_id` is no longer sent in the request body at all (the API derives it from the session now).
- **`src/app/jobs/[slug]/admin/import-users/page.tsx`** — previously had zero Supabase plumbing. Added: a client-side super-admin gate (checks `session` + `users.is_super_admin` on mount, shows "Access denied" if not) and attaches the bearer token on submit. The client-side gate is UX only — the real security boundary is the new server-side check; per your Group 1 instruction ("real, enforced check on both"), I've made the page an actual gate too, not just cosmetic nav-hiding.

## Open question — not decided unilaterally, per your instruction

**Bulk-creating users with `is_admin: true` from an uploaded file, even by a legitimate super admin, has no additional confirmation step today** (no review screen, no per-row admin-flag callout, no second factor). Now that the endpoint is actually restricted to super admins, this is a much smaller risk than before, but it's still a one-shot bulk-privilege-grant action. My recommendation: add a confirmation step that explicitly lists which rows in the uploaded file would be granted admin (separate from the "create user" list), requiring an explicit acknowledgment before the import runs — but I have not built this, since you asked me to flag and recommend rather than decide. Let me know if you want it built as part of this pass or deferred.

## Full suite

**101/101 tests passing** (81 from the prior authorization-layer phase + 20 new for this group), full `tsc --noEmit` clean. No regressions on the prior `lib/authz` work.

---

Stopping here per your sign-off gate. Waiting for confirmation before Group 2 (`update-next-step`, `users/update-status`, `users/update-manager`, `users/users-creation`).

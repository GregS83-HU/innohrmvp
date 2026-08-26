# Phase 4 — Cleanup & Final Report

**Status:** Complete. Nothing in this project has been committed, merged, or deployed — everything described below is local working-tree state pending your review.

---

## 1. Cleanup performed

- **Deleted `lib/verifySuperAdmin.ts`.** Confirmed dead first (`grep -rn "verifySuperAdmin"` across the whole repo, excluding `lib/authz`'s own doc-comment reference to it, returned zero consumers) — every route that used it was converted to `lib/authz`'s `requireSuperAdmin` back in checkpoint 2. Re-ran the full typecheck immediately after deleting to confirm nothing else referenced it.
- **Linted every converted file plus the new `lib/authz` module.** Two pre-existing warnings surfaced (`happiness/chat/route.ts`'s unused `index` variable, `tickets/upload/route.ts`'s unused `Ticket` interface) — I checked both against `git show HEAD:<file>` and confirmed they predate this work entirely and are unrelated to it, so I left them alone rather than scope-creep into unrelated cleanup.
- No other old ad hoc auth code was left behind: the two drifted inline `verifySuperAdmin()` copies (`admin/funnel`, `contact-submissions`) were removed as part of their own conversions in checkpoint 2, not deferred to this step.

## 2. Full list of what changed

**New:**
- `lib/authz/` — the centralized layer. `types.ts` (`AuthzResult`, `SessionTokenResult`), `index.ts` (`requireSuperAdmin`, `requireServiceSecret`, `requireAuthenticatedUser`, `requireCompanyMember`, `requireCompanyAdmin`, `requireSessionToken`, `ownerOrManagerRowFilter`, `requireCompanyMemberSession`).
- `test/` — 17 route test files plus `helpers/supabaseMock.ts` and `helpers/authFixtures.ts`. Vitest (`vitest.config.mts`, `npm test` / `npm run test:watch`).
- `docs/audit/` — this report plus the Phase 1 audit, Phase 2 design, and Phase 3 conversion log.

**Deleted:**
- `lib/verifySuperAdmin.ts` (dead code, see above).

**Modified — 17 routes converted to `lib/authz`:**

| # | Route | Shape |
|---|---|---|
| 1 | `admin/data-retention/delete-now` | super-admin |
| 2 | `admin/data-retention/preview` | super-admin |
| 3 | `admin/data-retention/settings` | super-admin |
| 4 | `admin/onboarding` | super-admin |
| 5 | `admin/funnel` | super-admin (fixed drift) |
| 6 | `contact-submissions` | super-admin (fixed drift) |
| 7 | `cron/data-retention` | service secret |
| 8 | `cron/onboarding-reminders` | service secret |
| 9 | `candidates/signed-cv-url` | company member |
| 10 | `medical-certificates/signed-url` | company admin |
| 11 | `stats/route/[positionId]` | company member (target company) |
| 12 | `happiness/session` (GET only) | session token |
| 13 | `happiness/chat` | session token |
| 14 | `tickets/upload` | authenticated user (identity only) |
| 15 | `performance/goals/update` (PATCH only) | manager-or-owner filter |
| 16 | `close` | company member (session-based, added as defense-in-depth alongside existing RLS) |
| 17 | `update-comment` | company member (session-based, added as defense-in-depth alongside existing RLS) |

**Modified — supporting/config changes:**
- `tsconfig.json` — excluded `test/` from the main build's type-check scope (Vitest doesn't need it there; keeps `next build` unaffected).
- `.gitignore` — fixed a pre-existing bug that blanket-ignored the entire `test/` directory (narrowed to just the old PDF fixture), otherwise every test file from this project would have silently never been trackable.
- `package.json` / `package-lock.json` — added `vitest` as a dev dependency and the `test`/`test:watch` scripts.

**Evaluated and explicitly left unconverted, with reasoning recorded in the Phase 3 log:**
- `new-position`, `positions-private` — no extractable check exists without either a no-op or a behavior change (adding identity verification that isn't there today); out of scope per your instructions.

**Everything else** — the ~40+ routes with missing or entitlement-only checks documented in [phase1-authorization-audit.md](phase1-authorization-audit.md) §6 — remains completely untouched, exactly as agreed at the Phase 2 gate.

## 3. Test evidence — explicit confirmation

**Every one of the 17 converted routes has an automated before/after behavioral test, including negative/cross-company-access cases where applicable.** Concretely, for each conversion in this project:

1. A test file was written first, covering the success path and every negative case (missing/invalid auth, wrong role, wrong company, not found).
2. It was run against the **original, unconverted** route and confirmed passing — this is the "before" baseline.
3. The route was converted to use `lib/authz`.
4. The **same, unmodified test file** was re-run and confirmed still passing — this is the "after" proof of identical behavior.

No route was converted without this before/after pair. The two exceptions worth naming explicitly:
- `close` and `update-comment` didn't have a pre-existing check to baseline against (they relied entirely on RLS) — for these, the "before" test captured the existing behavior including the silent-200-regardless-of-outcome quirk (see the checkpoint 4 nuance you already reviewed and approved), and new tests were added for the negative cases the new app-level check introduces.
- `performance/goals/update`'s DELETE handler was **not modified** (its ownership check was already a single, non-duplicated `.eq()` — nothing to centralize) and so has no before/after pair; only PATCH was converted and tested.

**Final numbers:** 81 tests across 17 test files, all passing, run against the final converted state. Full project `tsc --noEmit` is clean.

## 4. What's still open

- **Phase 1 §6's ~40+ flagged routes** (missing/entitlement-only auth checks, including the currently-exploitable Stripe and user-management endpoints) are unchanged. That list is still the actual security exposure in this codebase; this whole four-phase project was explicitly scoped to not touch it. Worth your attention as its own, separately-approved piece of work.
- **RLS observations from Phase 2 §7** (the `company_email_settings` table's unknown RLS status, `openedpositions`'s permissive SELECT policy) were flagged for separate sign-off, not investigated further or changed.
- Nothing has been committed, pushed, merged, or deployed. `git status` currently shows all of the above as working-tree changes plus untracked new files (`lib/authz/`, `test/`, `docs/audit/`, `vitest.config.mts`).

This closes the four-phase plan as scoped. Let me know if you'd like anything committed, want a PR opened, or want to revisit the Phase 1 §6 findings next.

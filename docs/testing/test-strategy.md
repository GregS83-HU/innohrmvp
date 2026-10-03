# HRInno — Test Strategy

Status as of 2026-10-03. Owner: engineering. This document says **what** we test, **at which layer**, **when it runs**, and the scenario catalogue for every module, with the current automation status of each scenario.

---

## 1. Goals and risk priorities

HRInno is a multi-tenant HR SaaS that holds special-category data (health certificates), candidate CVs, and takes money through Stripe. Testing effort is weighted by the cost of failure:

| Priority | Risk | Why it matters |
|---|---|---|
| **P0** | Cross-tenant data access, privilege escalation | One company reading another's employees/candidates/health data is a GDPR breach and a company-ending event. |
| **P0** | Billing correctness (checkout, webhook, seat sync, plan state) | Customers charged wrongly, or paying customers locked out. |
| **P0** | Plan / onboarding gating | Revenue leakage (features given away) or paying customers blocked. |
| **P1** | Core workflow correctness (recruitment pipeline, CV scoring, leave, attendance, goals) | The product's day-to-day value. |
| **P1** | Privacy promises (Job Assistant stores nothing, certificates never sent to AI, no PII in logs, retention sweep) | Stated publicly in the privacy notice and product copy. |
| **P2** | UI rendering, i18n completeness, emails formatting | Visible but recoverable. |
| **P3** | AI output quality | Non-deterministic; evaluated, not asserted. |

---

## 2. Test layers

| Layer | What | Tooling | Speed | Runs | Status |
|---|---|---|---|---|---|
| **L0 Static** | TypeScript typecheck of all app code | `tsc` via `tsconfig.typecheck.json` | ~5–9 s | pre-commit, pre-push, on demand | ✅ Live, blocking |
| **L0 Static** | ESLint | `eslint` | ~8 s | pre-push (changed files only) | ⚠️ Advisory — 416 pre-existing errors must be cleared before it can block |
| **L1 Unit** | Pure business rules in `lib/` and `src/config/` (entitlements, authz, pricing crossover, encryption, slugs, business days, log scrubbing, feedback tone) | Vitest | <1 s | pre-commit, pre-push, on demand | ✅ Live |
| **L2 API route** | Each `src/app/api/**/route.ts` handler invoked directly with Supabase, Stripe, OpenRouter and email **mocked**. Asserts status codes, authorization, tenant scoping, and exactly what gets written | Vitest + `test/helpers` | ~3 s total | pre-commit, pre-push, on demand | ✅ Live |
| **L3 Guards** | Structural checks over the source tree: every API route has an authz check or a written justification; product promises (stateless Job Assistant, no AI on certificates, no public promo codes) | Vitest reading source files | <1 s | pre-commit, pre-push, on demand | ✅ Live |
| **L4 DB / RLS integration** | Row-level-security policies, RPCs (`can_open_new_position`, `get_company_candidates`, …) and migrations against a real Postgres | Supabase CLI local stack + Vitest | ~1–2 min | on demand + CI nightly | 🟡 Planned |
| **L5 End-to-end** | Real browser journeys against `next dev` + local Supabase + Stripe test mode | Playwright | ~3–5 min | on demand + CI on PR | 🟡 Planned |
| **L6 AI evals** | CV-scoring consistency, threshold calibration, tone compliance, bias probes, on a fixed CV/job fixture set | Script + scored rubric | minutes, costs credits | on demand, before prompt changes | 🟡 Planned |
| **Manual** | Exploratory, visual, cross-browser speech input, emails in real inboxes | Checklist | — | before releases | Ad hoc |

**Why L1–L3 are the commit gate:** they are deterministic, need no network, no secrets, and no database, and run in ~7 seconds — fast enough that nobody is tempted to bypass them. L4/L5 need infrastructure and are too slow for every commit; they belong in CI and on-demand runs.

**Why mocks are acceptable at L2 but not sufficient:** L2 proves the *application code* asks for the right thing (right tenant, right role, right payload). It cannot prove the *database* enforces it. The 2026-09 incident where four RLS migrations were never applied to production is exactly the class of bug only L4 catches — L4 is the top priority of the planned work.

---

## 3. Test personas and tenants

Every module test uses the same cast (`test/helpers/authFixtures.ts → PERSONAS`):

| Persona | Company | Role | Used to prove |
|---|---|---|---|
| `admin` | A (100) | Company admin | Admin-only actions work in own tenant |
| `manager` | A | Manager of `employee` | Manager-on-behalf-of-report actions |
| `employee` | A | Employee | Self-service; refused admin actions |
| `otherAdmin` | B (999) | Company admin | **Cross-tenant attempts are refused** |
| `superAdmin` | A | HRInno internal | Internal tools; refused to every customer role |
| *(anonymous)* | — | none | Public endpoints; protected endpoints return 401/403 |

Standard authorization scenarios applied to every protected endpoint:
1. No token → 401/403.
2. Invalid/forged token → 401/403.
3. Valid user, wrong role → 403.
4. Valid admin of **another company** → 403/404, and nothing written.
5. Attacker-supplied `company_id` / `user_id` in body or query is **ignored**; the tenant is always derived from the session.
6. Correct persona → success, and the write is scoped to the caller's tenant.

---

## 4. How to run

```bash
npm run verify        # typecheck + every test (what the git hooks run)
npm test              # all tests, verbose
npm run test:unit     # L1 unit + L3 guards only
npm run test:api      # L2 API route tests only
npm run test:watch    # re-run on save while developing
npm run typecheck     # TypeScript only
```

**Git hooks** (`.githooks/`, activated automatically by `npm install` through the `prepare` script):
- **pre-commit** — `npm run verify`. Skipped for docs-only commits (`*.md`, `docs/`). Blocks the commit on failure.
- **pre-push** — `npm run verify` again (catches `--no-verify` commits), then ESLint on the files the branch changed (advisory, non-blocking).
- Emergency bypass: `git commit --no-verify` / `git push --no-verify`.

**Conventions for new tests**
- Location: `test/unit/` (pure logic), `test/api/<route path>.test.ts` (route handlers), `test/guards/` (structural).
- Use `createSupabaseMock` + `personaAuth`/`personaTables` + `jsonRequest`; assert writes with `writesTo(client, table)`.
- Never hit a real service. `test/setup.ts` force-overrides every key with a dummy value.
- **Known gaps**: write the test for the *correct* behaviour and mark it `it.fails(...)` with a `KNOWN GAP:` prefix. The suite stays green; the test turns red the day the gap is fixed, forcing the marker's removal.

---

## 5. Scenario catalogue by module

Legend: ✅ automated · 🟡 planned (layer noted) · 🔴 known gap (tracked by an `it.fails` test or the route inventory's `KNOWN_GAPS`) · 👁 manual.

### M01 — Authentication & self-serve signup
| ID | Scenario | Layer | Status |
|---|---|---|---|
| AUTH-01 | Signup rejects missing company name, missing names, invalid email, password < 8 chars | L2 | ✅ |
| AUTH-02 | Signup creates company on **Free** (`forfait` null), `onboarding_completed=false`, admin user, membership, profile | L2 | ✅ |
| AUTH-03 | Company slug is unique (`acme`, `acme-2`, `acme-3`…), accents stripped, max 60 chars | L1/L2 | ✅ |
| AUTH-04 | Partial failure at any step rolls back everything created before it | L2 | ✅ |
| AUTH-05 | Onboarding booking email sent and `onboarding_link_sent_at` recorded; email failure does not fail signup | L2 | ✅ |
| AUTH-06 | Duplicate email signup returns a clear error, no orphan company | L4 | 🟡 |
| AUTH-07 | Login → lands on `/jobs/[slug]` dashboard; wrong password shows error | L5 | 🟡 |
| AUTH-08 | Password reset email → recovery link → new password works | L5 | 🟡 |
| AUTH-09 | Logged-out dashboard shows branding + login prompt only | L5 | 🟡 |

### M02 — Authorization & multi-tenancy (cross-cutting, P0)
| ID | Scenario | Layer | Status |
|---|---|---|---|
| AUTHZ-01 | `requireSuperAdmin` refuses anonymous, forged token, company admin | L1 | ✅ |
| AUTHZ-02 | `requireCompanyAdmin` refuses employee/manager, accepts admin/super admin | L1 | ✅ |
| AUTHZ-03 | `requireCompanyMember` refuses membership checks against another tenant | L1 | ✅ |
| AUTHZ-04 | `requireSelf` / `requireSelfOrManagerOf` / `requireSelfOrCompanyAdminOf`: self, real manager of record, same-company admin allowed; peers and other-tenant admins refused | L1 | ✅ |
| AUTHZ-05 | `requireServiceSecret` fails closed when the secret is unset | L1 | ✅ |
| AUTHZ-06 | Every API route uses `lib/authz` or is justified as public (route inventory) | L3 | ✅ |
| AUTHZ-07 | All `/api/admin/*` require super admin; all `/api/cron/*` require `CRON_SECRET` | L3 | ✅ |
| AUTHZ-08 | Attacker-supplied `company_id` ignored on every billing route | L2 | ✅ |
| AUTHZ-09 | RLS: a user of company A cannot select/update any row of company B on every tenant table (`openedpositions`, `candidats`, `position_to_candidat`, `leave_requests`, `timeclock`, `medical_certificates`, `tickets`, `company_email_settings`, …) | L4 | 🟡 **top priority** |
| AUTHZ-10 | Migration drift: every migration file in `supabase/migrations` is applied in the target database | L4/CI | 🟡 |
| AUTHZ-11 | Storage buckets (`cvs`, certificates, ticket attachments) are private; signed URLs expire in 10 min | L4 | 🟡 |
| AUTHZ-12 | Unauthenticated service-role routes: `analyse-massive`, `generate-position-description`, `feedback` GET, `recruitment-step`, `candidate-count`, `notifications/email`, `unsubscribe` | L2/L3 | 🔴 |

### M03 — Plans, entitlements & onboarding gate (P0)
| ID | Scenario | Layer | Status |
|---|---|---|---|
| ENT-01 | Feature matrix Free/Core/Growth for attendance, absences, performance, chatbot, tickets, advanced reporting | L1 | ✅ |
| ENT-02 | Open positions capped per plan; only still-open positions count | L1 | ✅ |
| ENT-03 | Medical certificates capped per **calendar month** | L1 | ✅ |
| ENT-04 | Core capped at 30 active employees; Free/Growth uncapped (null = unlimited) | L1 | ✅ |
| ENT-05 | Onboarding gate blocks attendance/absences/performance/chatbot/certificates even on Growth; never blocks recruitment/tickets/reporting | L1 | ✅ |
| ENT-06 | No plan ≡ Free; unknown plan or missing company fails **closed** | L1 | ✅ |
| ENT-07 | 403 body has `code: UPGRADE_REQUIRED`, feature, reason, and the right message | L1/L2 | ✅ |
| ENT-08 | Downgrade never hides existing data: reads/edits/close of existing records work over the cap | L4/L5 | 🟡 |
| ENT-09 | Locked modules show upgrade notice to admins and are hidden from employees | L5 | 🟡 |
| ENT-10 | DB RPCs `can_*` agree with `hasFeatureAccess` for every plan | L4 | 🟡 |

### M04 — Billing & subscriptions (P0)
| ID | Scenario | Layer | Status |
|---|---|---|---|
| BILL-01 | Checkout: admin only; tier ∈ {Core, Growth}, interval ∈ {month, year} | L2 | ✅ |
| BILL-02 | Checkout line items: base ×1, seat × active headcount, onboarding fee once | L2 | ✅ |
| BILL-03 | Onboarding fee never charged twice | L2 | ✅ |
| BILL-04 | Core refused above 30 employees; Growth refused below 31 | L2 | ✅ |
| BILL-05 | Second subscription refused (409) — portal instead | L2 | ✅ |
| BILL-06 | Promotion codes disabled at checkout | L2/L3 | ✅ |
| BILL-07 | Webhook: forged signature rejected, nothing written | L2 | ✅ |
| BILL-08 | Webhook: checkout completed → plan, items, interval set; grace cleared | L2 | ✅ |
| BILL-09 | Webhook: credit pack → credits added | L2 | ✅ |
| BILL-10 | Webhook idempotency: same event twice processed once | L2 | ✅ |
| BILL-11 | Webhook: first invoice marks onboarding fee paid; renewals don't | L2 | ✅ |
| BILL-12 | Webhook: payment failed → 7-day grace, no immediate downgrade | L2 | ✅ |
| BILL-13 | Webhook: subscription deleted/canceled → plan cleared; stale events for old subscriptions ignored | L2 | ✅ |
| BILL-14 | Webhook: a Stripe retry after a handler error is processed (currently swallowed as "already processed") | L2 | 🔴 |
| BILL-15 | Subscription status (Active/Pending/Inactive, headcount) visible to any member, own tenant only | L2 | ✅ |
| BILL-16 | Cancel: admin only, own company, immediate | L2 | ✅ |
| BILL-17 | Portal session and credit-pack session: admin only, own company | L2 | ✅ |
| BILL-18 | Seat quantity syncs to Stripe on add/deactivate/reactivate (`syncEmployeeSeats`) | L2 | 🟡 |
| BILL-19 | Founding discount: super admin only, two coupons only, base-fee item only, never twice | L2 | ✅ |
| BILL-20 | Internal billing dashboard: super admin only, per-company headcount | L2 | ✅ |
| BILL-21 | Plan-crossover cron: cron secret; notifies Core accounts at/after crossover (61) once; no-op when Growth never cheaper | L1/L2 | ✅ |
| BILL-22 | Full checkout in Stripe test mode with test card → plan active in UI | L5 | 🟡 |
| BILL-23 | AI credits: consumption stops at the plan allowance with a clear message; monthly reset | L2/L4 | 🟡 |

### M05 — Recruitment: job postings
| ID | Scenario | Layer | Status |
|---|---|---|---|
| POS-01 | Create position: required fields, employment type, valid feedback tone | L2 | ✅ |
| POS-02 | Plan cap reached → 403 UPGRADE_REQUIRED, nothing inserted | L2 | ✅ |
| POS-03 | Defaults: HUF currency, salary private, tone `balanced`, tenant from membership | L2 | ✅ |
| POS-04 | Close position: own tenant only, other tenant 403 | L2 | ✅ |
| POS-05 | Public board shows only open positions of the requested company slug | L2/L4 | 🟡 |
| POS-06 | Private list: members see their company's open positions only | L4 | 🟡 |
| POS-07 | AI job description generation consumes 1 credit; 402 when out of credits | L2 | 🟡 (auth gap: 🔴 AUTHZ-12) |
| POS-08 | Create-position form (icon card employment type, salary range, refresh doesn't redirect) | L5 | 🟡 |

### M06 — Recruitment: CV scoring, pipeline & reporting
| ID | Scenario | Layer | Status |
|---|---|---|---|
| CV-01 | Apply to unknown position → 404, no candidate row | L2 | ✅ |
| CV-02 | AI credits billed to the position's company, never a client-supplied one | L2 | ✅ |
| CV-03 | Score < 5 → auto "Rejected"; otherwise "Unassigned"; admins + manager notified | L2 | 🟡 |
| CV-04 | Candidate feedback uses the position's tone; score/analysis unaffected by tone | L1/L6 | ✅ (prompt) / 🟡 (eval) |
| CV-05 | Bulk re-score ("Analyse Massive"): progress stream, credit per CV, threshold 7 | L2 | 🟡 (auth gap: 🔴 AUTHZ-12) |
| CV-06 | Pipeline: move candidate to step, comment — own tenant only | L2 | ✅ |
| CV-07 | Signed CV URL only for own-company candidates, expires 10 min | L2 | ✅ |
| CV-08 | Position stats: own company only, 404 unknown | L2 | ✅ |
| CV-09 | Advanced reporting visible on Growth only; locked preview elsewhere | L5 | 🟡 |
| CV-10 | Drag-and-drop multi-select between stages persists | L5 | 🟡 |

### M07 — Interviews
| ID | Scenario | Layer | Status |
|---|---|---|---|
| INT-01 | Schedule/list/update interviews: own-tenant positions only | L2 | ✅ |
| INT-02 | AI question suggestions: own-tenant position only | L2 | ✅ |
| INT-03 | Candidate virtual interview conclusion only when candidate is linked to the position | L2 | ✅ |
| INT-04 | Invitation/cancellation email carries a valid `.ics` (Google/Outlook/Apple) | L1 | 🟡 |
| INT-05 | Voice answers in Chrome/Edge; fallback message elsewhere | 👁 | Manual |

### M08 — Public Job Assistant (acquisition funnel)
| ID | Scenario | Layer | Status |
|---|---|---|---|
| JA-01 | No route touches the database or storage ("no data is stored") | L3 | ✅ |
| JA-02 | Never consumes any company's AI credits | L3 | ✅ |
| JA-03 | Missing CV or job description → 400; scanned PDF → clear error | L2 | 🟡 |
| JA-04 | Score, rewrite (.docx download), mock interview, final report end-to-end | L5 | 🟡 |
| JA-05 | Output language follows locale (HU/EN/FR) | L6 | 🟡 |

### M09 — Time & attendance
| ID | Scenario | Layer | Status |
|---|---|---|---|
| TA-01 | Employee reads/clocks only their own record; impersonation 403 | L2 | ✅ |
| TA-02 | Manager sees own team; admin of same company can act; other-tenant admin refused | L2 | ✅ |
| TA-03 | Approve/reject requires being that manager | L2 | ✅ |
| TA-04 | Late/overtime/on-time computed against shift (or default) | L1 | 🟡 (logic needs extracting from the route to be unit-testable) |
| TA-05 | Locked on Free and before onboarding | L1 | ✅ (via ENT) |

### M10 — Absences / leave
| ID | Scenario | Layer | Status |
|---|---|---|---|
| LV-01 | Create leave: self or real manager only | L2 | ✅ |
| LV-02 | Working-day count excludes weekends | L1 | 🟡 |
| LV-03 | Approve/reject is a direct browser DB update — RLS must restrict it to the manager of record | L4 | 🟡 **gap noted in product brief** |
| LV-04 | iCal export and print/PDF of the calendar | L1/L5 | 🟡 |
| LV-05 | Sick leave links to a medical certificate | L4 | 🟡 |

### M11 — Medical certificates (health data, P0)
| ID | Scenario | Layer | Status |
|---|---|---|---|
| MC-01 | Upload/confirm: admin only; company from session, never from form | L2 | ✅ |
| MC-02 | Monthly cap per plan; onboarding gate | L1/L2 | ✅ |
| MC-03 | Signed URL: admin of own company only, 10 min | L2 | ✅ |
| MC-04 | No AI/OCR provider is ever called | L3 | ✅ |
| MC-05 | File type (PDF/image) and 1 MB size limit enforced server-side | L2 | 🟡 |
| MC-06 | Storage policy forbids any cross-company object access | L4 | 🟡 |

### M12 — Performance management
| ID | Scenario | Layer | Status |
|---|---|---|---|
| PF-01 | Create goal: self → draft; manager/admin → active; requires a manager | L2 | ✅ |
| PF-02 | Read goals: self or real team only; impersonation 403 | L2 | ✅ |
| PF-03 | Update/approve/delete: owner-or-manager filter, entitlement re-checked | L2 | ✅ |
| PF-04 | Pulse: one per goal per week, resubmit updates in place; blocked requires explanation | L2 | ✅ (auth) / 🟡 (week upsert) |
| PF-05 | Growth only + onboarding | L1 | ✅ |

### M13 — AI wellbeing chatbot
| ID | Scenario | Layer | Status |
|---|---|---|---|
| WB-01 | Session token required; unknown 404; expired 410; completed 400 | L2 | ✅ |
| WB-02 | Dashboard aggregates only the caller's company; never individual answers | L2 | ✅ |
| WB-03 | Growth only + onboarding when starting a session | L1/L2 | ✅ (L1) |
| WB-04 | New-session cooldown actually throttles (documented bug: inert) | L2 | 🟡 → will be 🔴 |
| WB-05 | 12 questions across 6 PERMA dimensions, EN/HU | L2 | 🟡 |

### M14 — Support tickets
| ID | Scenario | Layer | Status |
|---|---|---|---|
| TK-01 | Create: self or manager; Core/Growth only; not onboarding-gated | L1/L2 | ✅ |
| TK-02 | Attachments: owner or own-company admin; other tenant 403 | L2 | ✅ |
| TK-03 | Existing tickets remain viewable/repliable after downgrade | L4 | 🟡 |
| TK-04 | Email notifications (currently mocked send — not delivered) | — | 🔴 product limitation |

### M15 — User & role management
| ID | Scenario | Layer | Status |
|---|---|---|---|
| USR-01 | Create user: admin only, own company only, Core 30 cap | L2 | ✅ |
| USR-02 | Activate/deactivate and reassign manager: own company targets only | L2 | ✅ |
| USR-03 | Bulk import: super admin only | L2 | ✅ |
| USR-04 | Each add/deactivate/reactivate resyncs Stripe seat quantity | L2 | 🟡 |
| USR-05 | Role lookup: self only | L2 | ✅ |

### M16 — Notifications & email
| ID | Scenario | Layer | Status |
|---|---|---|---|
| NT-01 | Onboarding reminder cron: secret required; one reminder after N business days | L1/L2 | ✅ (secret, business days) / 🟡 (selection) |
| NT-02 | Company SMTP settings: admin only, own company; password encrypted at rest (AES-256-GCM, tamper-evident) | L1/L2 | ✅ |
| NT-02b | Stored SMTP password is never returned by the API | L2 | 🟡 |
| NT-03 | Email templates render in each language with no unreplaced placeholders | L1 | 🟡 |
| NT-04 | In-app notification on new CV and new ticket | L2 | 🟡 |

### M17 — Internal administration (HRInno team)
| ID | Scenario | Layer | Status |
|---|---|---|---|
| ADM-01 | Onboarding toggle, funnel, contact submissions, billing, data retention: super admin only | L2/L3 | ✅ |
| ADM-02 | Onboarding toggle logs a funnel event | L2 | ✅ |

### M18 — Data retention & privacy
| ID | Scenario | Layer | Status |
|---|---|---|---|
| PRV-01 | Retention cron: secret required, sweep invoked | L2 | ✅ |
| PRV-01b | Sweep deletes exactly the rows older than the configured period, nothing newer | L1/L4 | 🟡 |
| PRV-02 | Retention settings & preview & delete-now: super admin, audited | L2 | ✅ |
| PRV-03 | Logs never contain error messages/details that may embed PII | L1/L3 | ✅ |
| PRV-04 | Retention sweep deletes storage objects as well as rows | L4 | 🟡 |
| PRV-05 | Funnel tracking records nothing until analytics consent is accepted | L5 | 🟡 |

### M19 — Public site, legal & lead capture
| ID | Scenario | Layer | Status |
|---|---|---|---|
| PUB-01 | Contact form: GDPR consent required, email/phone validated, sanitised, 3 per IP+email per window | L2 | ✅ |
| PUB-02 | Demo feedback: rating 1–5 enforced | L2 | ✅ |
| PUB-03 | Demo feedback list is not public (exposes IP addresses) | L2 | 🔴 |
| PUB-04 | Unsubscribe requires a signed token | L2 | 🔴 |
| PUB-05 | Pricing page shows Free/Core/Growth with the DB prices and ranges; every CTA leads to signup | L5 | 🟡 |
| PUB-06 | `/privacy`, `/cookies` reachable; terms/impressum link out to hrinno.hu | L5 | 🟡 |

### M20 — Internationalisation & help
| ID | Scenario | Layer | Status |
|---|---|---|---|
| I18N-01 | Every key in the HU (default) message file exists in EN and FR | L1 | 🟡 |
| I18N-02 | Help centre renders every section; links resolve | L1/L5 | 🟡 |

---

## 6. Open findings surfaced while building this strategy

These are tracked in the suite (they keep it green but go red when fixed):

1. **Stripe webhook loses events on transient errors** (BILL-14). The event id is recorded *before* processing; if processing fails, Stripe's retry is skipped as "already processed" — a paid checkout could never activate the plan. Fix: record the event only after successful handling (or delete the marker on failure).
2. **AI credits can be burned by anyone** (AUTHZ-12). `generate-position-description` and `analyse-massive` trust a client-supplied company id with no caller check; `analyse-massive` also rewrites that company's candidate scores.
3. **Demo feedback list is public and includes IP addresses** (PUB-03).
4. **Minor unauthenticated reads/actions**: `recruitment-step`, `candidate-count` (by any `user_id`), `notifications/email`, `unsubscribe` (any address).
5. **Leave approval relies solely on RLS** (LV-03) — needs an L4 test to prove the policy holds.

---

## 7. Roadmap for the remaining layers

1. **L4 RLS suite (highest value).** `supabase start` locally, apply `supabase/migrations`, seed two tenants with the persona cast, then for each tenant table assert that tenant-B credentials get zero rows / write errors on tenant-A data. Add a migration-drift check comparing `supabase_migrations.schema_migrations` with the files in the repo. Run on demand and nightly in CI.
2. **CI.** A GitHub Actions workflow running `npm run verify` on every PR, so the gate can't be bypassed with `--no-verify`; add L4 when ready.
3. **L5 Playwright smoke journeys** (one per persona): signup → dashboard; admin creates position → candidate applies on the public board → recruiter moves candidate; employee requests leave → manager approves; Stripe test-mode checkout.
4. **Clear the ESLint backlog**, then make lint blocking in pre-push.
5. **Extract pure logic from routes** (attendance status, working-day counts, pulse week calculation, AI score thresholds) into `lib/` so it can be unit-tested; this also makes the 5-vs-7 threshold inconsistency explicit.
6. **Coverage reporting** (`@vitest/coverage-v8`) once L4 exists, with a floor on `lib/`.

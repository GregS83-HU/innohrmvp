# Architecture notes

This file covers three cross-cutting pieces of the backend that aren't obvious from browsing
individual routes: the plan/entitlement gating layer, the onboarding-completion gate, and the
scheduled data retention job. It's documentation only — see the referenced source files for the
actual implementation.

## Plan / entitlement gating

Two files:

- [`src/config/entitlements.ts`](src/config/entitlements.ts) — the single source of truth for
  *which feature requires what*. It defines `FeatureKey` (e.g. `"recruitment.openPosition"`,
  `"performance.use"`, `"company.addEmployee"`), maps each key to either a capacity check (count
  existing rows against a per-plan max) or a flag check (a per-plan boolean), and holds the
  paywall copy shown to users. It deliberately does **not** hardcode the actual numeric
  limits — those live in the `forfait` table in Supabase (columns like `max_opened_position`,
  `max_medical_certificates`, `access_performance`, `max_employees`) so a plan's limits can
  change without a code deploy.

- [`lib/entitlements.ts`](lib/entitlements.ts) — the enforcement function,
  `hasFeatureAccess(companyId, feature)`. It reads the company's current plan
  (`company.forfait`, falling back to `"Free"` if null — a company with no active subscription
  is treated as permanently on the Free plan, not a grace period), reads the matching `forfait`
  row, and either checks the boolean flag or counts existing rows and compares against the
  plan's max. It returns `{ allowed: true, plan }` or `{ allowed: false, reason, plan }`, where
  `reason` is one of `no_subscription`, `plan_limit_reached`, `not_included_in_plan`,
  `unknown_plan`, or `onboarding_required`.

**How it's invoked:** every route that creates a new plan-limited resource (opening a job
position, uploading a medical certificate, adding an employee, etc.) calls `hasFeatureAccess()`
before performing the write, and returns `entitlementErrorBody()` (a standard 403 shape) if it's
denied. This is a per-route check, not a global middleware — there's no single enforcement
choke point. `hasFeatureAccess()` only gates *creating new* items; it's never used to hide,
block reads of, or retroactively lock existing records, so downgrading a plan can't make data a
company already has disappear or become unreadable. The client-side UI (nav grid, paywall
states) calls the lightweight `GET /api/entitlements/status` route to decide what to show, but
that endpoint is a UI hint only — the real enforcement is server-side in each write route.

## Onboarding-completion gate

Separate from plan gating: `company.onboarding_completed` is a boolean that starts `false` for
every self-serve signup and is flipped to `true` manually by the HRInno team (via the
super-admin-only `PATCH /api/admin/onboarding` route) after a setup call with the customer —
there's no automated way for a company to complete it themselves.

`ONBOARDING_GATED_FEATURES` in `src/config/entitlements.ts` lists which features require
`onboarding_completed = true` on top of whatever plan check applies: attendance, absences,
performance, the happiness chatbot, and medical certificate uploads. Recruitment (job postings)
is deliberately excluded — it stays usable immediately after signup regardless of onboarding
status, subject only to plan limits.

Inside `hasFeatureAccess()`, the onboarding check runs *first*, independently of plan: a company
paying for Momentum or Infinity but not yet onboarded is denied with `reason:
"onboarding_required"` even though its plan would otherwise allow the feature. Medical
certificate uploads are gated for a different reason than the other four modules — it's a
temporary compliance safeguard (certificate data goes to third-party AI/OCR services with
best-effort, not guaranteed, redaction) rather than a training/complexity gate, and carries
different messaging (`getOnboardingRequiredMessage()`).

`GET /api/entitlements/status` exposes `onboardingCompleted` separately from the feature flags
so the UI can distinguish "not in your plan" from "not onboarded yet" messaging, even though the
underlying enforcement already folds onboarding into the plan check.

## Data retention job

[`lib/dataRetention.ts`](lib/dataRetention.ts) implements deletion of two categories of stored
data once they age past a configurable retention period: medical certificates (DB row, storage
file, and the OCR-staging copy that has no DB row of its own) and CVs uploaded through the
recruiter-facing pipeline (`candidats` rows and their stored files). A third tracked category,
CV Assistant uploads, has no persistence layer at all — nothing is stored for it, so the sweep
reports zero deletions with an explanatory note rather than silently skipping it.

Retention periods are read from the `data_retention_settings` table on every call — nothing is
cached at module load or deploy time, so changing a period in that table takes effect on the
very next run with no code change or redeploy. A `null` retention period means "retain
indefinitely." Every deletion (scheduled or manual) is recorded in `data_deletion_log`, and
every change to a retention setting is recorded in `data_retention_settings_history`.

Three entry points, all in `lib/dataRetention.ts`:
- `runRetentionSweep('scheduled' | 'manual')` — deletes everything older than the current cutoff.
- `previewDeletions()` — read-only, shows what the next sweep would delete.
- `deleteRecordNow(dataType, recordId, deletedBy)` — deletes one specific record immediately,
  for a data-subject deletion request that shouldn't wait for the scheduled sweep.

**Scheduling:** [`vercel.json`](vercel.json)'s `crons` array triggers
`GET /api/cron/data-retention` daily at 03:00 UTC, which calls `runRetentionSweep('scheduled')`.
Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET` on that request, and the
route rejects any request that doesn't present the matching `CRON_SECRET` environment variable.
The admin-facing preview/manual-delete/settings routes
(`src/app/api/admin/data-retention/{preview,delete-now,settings}/route.ts`) call the same
`lib/dataRetention.ts` functions directly and are protected by `verifySuperAdmin()` instead of
`CRON_SECRET`.

This module makes the retention period a legal/compliance-editable parameter instead of a
hardcoded one — it does not, by itself, make the product GDPR/HIPAA compliant.

# Redaction & Retention Fix

Response to the two gaps identified for medical certificates and CVs sent to
third-party AI/OCR services: no redaction before third-party processing, and
no data retention/deletion policy. Read [DATA_FLOW_AUDIT.md](DATA_FLOW_AUDIT.md)
first — it documents the data flows this fix acts on and is the basis for
every decision below.

**This fix does not make HRInno GDPR- or HIPAA-compliant.** It narrows real
gaps (redaction, a runtime-adjustable retention mechanism) and makes the
legal parameters easy to correct once real decisions are made — it is not a
compliance certification, and none of the code, UI copy, or docs in this
change claims otherwise.

## Part 2: Redaction

### Medical certificates — redacted before the AI extraction call

[`lib/piiRedaction.ts`](lib/piiRedaction.ts) adds `redactDirectIdentifiers()`,
applied in [`src/app/api/medical-certificates/upload/route.ts`](src/app/api/medical-certificates/upload/route.ts)
to the OCR'd text **before** it's sent to OpenRouter for structured
extraction (employee name + sickness dates — see DATA_FLOW_AUDIT.md §1a).

What it catches, regex-based:
- **ID-like numbers**: runs of 9+ digits (Hungarian TAJ [9 digits],
  adóazonosító jel [10 digits], generic long ID numbers). 9+ specifically so
  it doesn't collide with 8-digit dates written without separators.
- **Phone numbers**: Hungarian and generic international formats.
- **Addresses**: Hungarian postal code + city + street/house number (e.g.
  "1052 Budapest, Váci utca 12."). Best-effort — non-Hungarian address
  formats likely won't match.
- **Dates are explicitly protected first** (temporarily extracted and
  restored after redaction runs), since `sickness_start_date`/`sickness_end_date`
  are exactly what the extraction call needs — over-redacting them would
  break the feature entirely.

**This is a best-effort layer, not a guarantee.** It's a fixed set of
regexes, not a language model or an ML-based PII detector — it will miss
identifiers in formats it doesn't recognize (non-Hungarian ID/phone/address
formats, unusual spacing, OCR mis-reads that break a pattern mid-match) and
could occasionally over- or under-redact. It reduces what an OCR
mis-transcription or an unusually detailed certificate exposes to the AI
provider; it does not certify that no identifier will ever reach OpenRouter.
Tested against sample text (see "Verification" below) to confirm it
preserves dates and ordinary text while catching the three identifier types
above.

Only the copy sent to OpenRouter is redacted. The raw OCR text returned to
the browser (unused by the current UI, but present in the API response) and
the final saved certificate fields are unaffected — this fix is scoped to
what leaves HRInno for a third party, not what HRInno itself holds.

### CVs — assessed, not redacted

Per the task's framing: CVs need name/contact info sent to the AI provider
for the product to function (matching candidates to jobs, letting a
recruiter reach a scored candidate). Redacting that would break the feature.

What was checked instead (DATA_FLOW_AUDIT.md §2–3): whether anything beyond
CV text + job description is sent to the AI provider. Conclusion — no.
Every CV-related AI call (`analyse-cv`, `analyse-massive`, and all five
`job-assistant` routes) sends only the CV text (or an already-minimized
subset — `job-assistant/interview/score` sends a pre-summarized `cvSummary`
object instead of full text; `interview/conclude` truncates to 1,200 chars)
plus the job description. No separate PII fields are appended on top of the
CV's own content. Nothing was flagged as sent-but-unneeded, so nothing was
changed here.

### AI consent — copy updated, and a real gap fixed

Updated consent copy (en/fr/hu) to explicitly name third-party processing,
where before it only said "an AI model"/"AI system":
- `cvAnalyse.messages.aiConsent` (company-pipeline CV upload)
- `jobAssistant.upload.aiConsent` (public Job Assistant)
- New: `uploadCertificate.upload.aiConsent` (medical certificate upload —
  didn't exist before this fix, see below)

**Real gap found and fixed, not just a copy tweak**: the standalone medical
certificate upload page
([`UploadCertificateClient.tsx`](src/app/jobs/%5Bslug%5D/medical-certificate/upload/UploadCertificateClient.tsx) —
the only live path that actually sends a certificate to OCR.Space/OpenRouter,
per DATA_FLOW_AUDIT.md §1a) **had no AI-consent UI at all**. The database
column `employee_ai_consent_date` existed but the form never populated it —
every certificate saved through this page had `employee_ai_consent_date =
null`. Fixed: added a consent checkbox that gates the "Upload & Process"
button (mirroring the existing pattern in `CVAnalyseClient.tsx`), so consent
is required *before* the document is sent to OCR.Space/OpenRouter, not
after. The confirm step now also actually sends the consent timestamp.

(The leave-request modal path, `RequestLeaveModal2.tsx`, doesn't call the
OCR/AI endpoint at all — see DATA_FLOW_AUDIT.md §1b — so it correctly has no
AI-consent requirement; nothing to fix there.)

## Part 3: Retention

### The requirement this satisfies

Retention periods must be changeable by editing a database value — no code
change, no redeploy. Built as:

- **`supabase/migrations/20260801030000_add_data_retention_settings.sql`**
  — `data_retention_settings` (`data_type`, `retention_days` nullable =
  indefinite, `updated_at`, `updated_by`), `data_retention_settings_history`
  (full change log — old value → new value, who, when — not just the latest
  edit), `data_deletion_log` (audit trail of every record actually deleted,
  scheduled or manual). RLS locked to service-role-only, same pattern as
  `funnel_events`/`contact-submissions`.
- **[`lib/dataRetention.ts`](lib/dataRetention.ts)** — every function
  queries `data_retention_settings` fresh; nothing is cached at module load
  or deploy time. `runRetentionSweep()` deletes what's older than the
  *current* `retention_days`; `previewDeletions()` is the read-only
  equivalent; `deleteRecordNow()` handles one-off manual deletion;
  `updateRetentionSetting()` writes the new value and appends a history row.
- **[`src/app/api/cron/data-retention/route.ts`](src/app/api/cron/data-retention/route.ts)**
  — daily Vercel Cron (`vercel.json`, 03:00 UTC), guarded by `CRON_SECRET`.
- **Admin API**: `GET`/`PATCH /api/admin/data-retention/settings`,
  `GET /api/admin/data-retention/preview`, `POST /api/admin/data-retention/delete-now`
  — all super-admin-only (`lib/verifySuperAdmin.ts`).
- **Admin UI**: [`/jobs/[slug]/admin/data-retention`](src/app/jobs/%5Bslug%5D/admin/data-retention/page.tsx),
  linked from the header's account menu for super admins. Shows each data
  type's current retention period (editable inline), what the next
  scheduled run would delete (live preview against the current setting),
  the full change history with who/when, and a manual "delete now" form for
  a specific record id.

### What each data type actually does

| `data_type` | Deletes | Why |
|---|---|---|
| `medical_certificate` | The `medical_certificates` row, its file in the `medical-certificates` bucket, and — separately, by storage object age rather than a DB row, since none exists for them — the orphaned OCR-staging copies at `uploads/{companyId}/...` found in DATA_FLOW_AUDIT.md §1a | Both copies are certificate data; the staging copy just isn't tracked by a table |
| `cv_company_pipeline` | The `candidats` row (incl. `cv_text`), its linked `position_to_candidat` rows, and its file in the `cvs` bucket | Full pipeline CV data, per DATA_FLOW_AUDIT.md §2 |
| `cv_job_assistant` | Nothing — logs `deleted: 0` with an explicit note | Confirmed in DATA_FLOW_AUDIT.md §3: no persistence layer exists for Job Assistant CVs. The settings row exists per the task's requirement and so the schema is ready if server-side saving is ever added, but there's nothing to sweep today |

Before this fix, none of this existed — no cron, no scheduled function, no
manual admin path. Confirmed by grep: no `DELETE`/`.remove()` against these
tables/buckets anywhere outside this change.

### Placeholder retention periods — not a legal determination

All three `retention_days` were seeded at **365**, an arbitrary placeholder
picked to make the mechanism demonstrable, not a researched or
legally-informed number. See "Requires a human/legal decision" below.

### Verification: proving `retention_days` is truly runtime-adjustable

Ran directly against production via `lib/dataRetention.ts` (the same code
the cron job and admin API call — nothing test-specific):

1. `getRetentionSettings()` → confirmed all three rows at `retention_days: 365`.
2. `previewDeletions()` → `cv_company_pipeline`: cutoff `2025-08-01`, **0** matching records (all real candidate rows are newer than 365 days, oldest is `2025-12-18`).
3. `updateRetentionSetting('cv_company_pipeline', 30, <admin-id>)` — **a database write only**, no file touched, no deploy.
4. `previewDeletions()` again, **same running process, same code** → cutoff jumped to `2026-07-02`, and **32 real candidate records** now matched (the same rows that were invisible to the 365-day cutoff a moment earlier).
5. `updateRetentionSetting('cv_company_pipeline', 365, <admin-id>)` — reverted. Confirmed via a final `getRetentionSettings()` read: back to 365.
6. Repeated steps 1–3 for `medical_certificate` (365 → 1 day → reverted to 365) to confirm the same behavior on a second data type. `medical_certificates` currently has 0 rows in production, so this leg proved the cutoff computation responds to the DB value correctly, but didn't surface a matching record the way the `cv_company_pipeline` run did.

This is direct proof that the deletion query's cutoff comes from whatever is
currently in `data_retention_settings` at call time, not from a value fixed
in code — changing the row changed what the very next call considered
"eligible for deletion," with zero code change and zero redeploy in between.

**Deliberately not run**: the actual destructive `runRetentionSweep()`
against production. The 30-day test above would have deleted 32 real
candidate records — I only ran the read-only `previewDeletions()`, which
uses the identical cutoff/query logic, to prove the mechanism without
deleting real data as a side effect of a test. `data_retention_settings_history`
now has 4 rows from this test round-trip (2 changes × 2 data types, each
set then reverted) — genuine audit trail entries, visible in the admin UI,
left in place rather than scrubbed.

### Manual step still required

**`CRON_SECRET` is not yet set in Vercel's production environment** — I
checked (`vercel env ls production`) and confirmed it's absent. The cron
route already fails closed (returns 401) without it, so nothing runs
unprotected, but the daily sweep won't execute until it's added:

```bash
openssl rand -hex 32 | npx vercel env add CRON_SECRET production
```

I didn't add this myself since it's account/deploy configuration, not code.

## Requires a human/legal decision — not decided here

1. **The real retention periods.** 365 days is a placeholder for
   demonstrating the mechanism, not a legally-informed number for either
   medical certificates or CVs. No specific period (e.g. a claimed "GDPR
   requires X days") is asserted anywhere in this change — that determination
   needs a lawyer, and possibly differs for medical certificates (health
   data, likely a shorter, more sensitive window) versus CV data (candidate
   data, different retention logic depending on whether the candidate was
   hired, rejected, or never responded to).
2. **Whether OCR.Space's and OpenRouter's own data-handling terms are
   acceptable for health data.** Not reviewed as part of this fix — their
   published DPA/subprocessor terms need a human legal read, specifically
   for the medical certificate flow (OCR.Space receives the full document
   image; OpenRouter receives OCR'd health-adjacent text).
3. **Whether a formal Data Processing Agreement is needed with either
   provider.** Follows from #2 — if either's standard terms aren't
   sufficient for health data under applicable law, a DPA (or an
   alternative provider) may be needed before medical certificates
   continue being sent through this pipeline as-is.
4. **Whether Job Assistant CVs should ever gain a persistence layer.** Not
   a question this fix answers — just noting that if one is added later,
   `cv_job_assistant`'s retention row is already there waiting for it.

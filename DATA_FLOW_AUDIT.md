# Data Flow Audit: Medical Certificates & CVs → Third-Party AI/OCR

Traces every point medical certificate or CV data leaves HRInno's own
infrastructure, and what HRInno itself persists afterward. Written before
any redaction/retention changes (see [REDACTION_RETENTION_FIX.md](REDACTION_RETENTION_FIX.md)
for what was built in response to these findings). This is a factual trace
of the code as it exists, not a compliance assessment.

## 1. Medical certificates

Two live entry points upload a medical certificate. They behave differently
— **only one of them actually sends anything to OCR.Space or OpenRouter.**

### 1a. Standalone upload page — `/jobs/[slug]/medical-certificate/upload`

[`UploadCertificateClient.tsx`](src/app/jobs/%5Bslug%5D/medical-certificate/upload/UploadCertificateClient.tsx)
→ `POST /api/medical-certificates/upload` ([route.ts](src/app/api/medical-certificates/upload/route.ts)) → `POST /api/medical-certificates/confirm` ([route.ts](src/app/api/medical-certificates/confirm/route.ts))

This is the path that talks to third parties:

1. **Upload step** (`/api/medical-certificates/upload`): the file (PDF or
   image, ≤1MB) is uploaded as-is to Supabase Storage at
   `uploads/{companyId}/{timestamp}_{filename}` in the private
   `medical-certificates` bucket, then a 5-minute signed URL is minted for it.
2. **→ OCR.Space**: that signed URL is sent to `https://api.ocr.space/parse/image`.
   **OCR.Space fetches and reads the full document (image or PDF) itself** —
   the whole file, not just text, is what's disclosed to this provider.
   OCR.Space returns the full extracted raw text of the document.
3. **→ OpenRouter/OpenAI**: the full raw OCR text (`rawText`, untruncated,
   unredacted before this fix) is sent to `https://openrouter.ai/api/v1/chat/completions`
   (model `openai/gpt-3.5-turbo`) with a prompt asking it to extract
   `employee_name`, `sickness_start_date`, `sickness_end_date` as structured
   JSON. **This is the step this fix adds redaction to** — see below.
4. The extracted JSON + raw OCR text are returned to the browser. **Nothing
   is persisted to the database at this point** — the upload step is
   read/transform only.
5. **Confirm step** (`/api/medical-certificates/confirm`): the user reviews/edits
   the extracted fields in the browser, then the file is uploaded **a second
   time** (unchanged) to a different path, `certificates/{companyId}/{timestamp}-{filename}`,
   and a database row is inserted into `medical_certificates` with:
   `employee_name`, `absence_start_date`, `absence_end_date`,
   `employee_comment`, `certificate_file` (the new storage path),
   `company_id`, `leave_request_id`, `employee_ai_consent_date`.
   **The raw OCR text and the AI's JSON response are not stored anywhere**
   — only the structured fields the user confirmed.

**Orphaned file finding**: the first copy of the file, uploaded in step 1 to
`uploads/{companyId}/...` purely so OCR.Space could fetch it, is **never
deleted**. It has no corresponding database row (nothing tracks its age or
existence), so it sits in the private bucket indefinitely, duplicating the
final saved copy. The retention sweep built in this fix (see Part 3) cleans
these up by object age, since there's no DB row to key off of.

**Consent finding**: before this fix, this page had **no AI-consent UI at
all** — no checkbox, and the `employee_ai_consent_date` field was never
populated by this flow (the confirm request simply never included it).
`employee_ai_consent_date` was always `null` for every certificate saved
through this page. Fixed in this pass — see REDACTION_RETENTION_FIX.md.

### 1b. Leave-request modal — "Request Leave" → sick leave → attach certificate

[`RequestLeaveModal2.tsx`](components/absence/RequestLeaveModal2.tsx) (the
component actually wired up in
[`absences/page.tsx`](src/app/jobs/%5Bslug%5D/absences/page.tsx:31)) →
`POST /api/medical-certificates/confirm` directly.

This path **never calls the OCR/AI upload endpoint**. The employee types the
name and dates by hand; the modal uploads the file straight to
`certificates/{companyId}/...` and inserts the `medical_certificates` row via
`/confirm`, the same way step 5 above does. **No document content is sent to
OCR.Space or OpenRouter through this path** — only the file itself goes to
Supabase Storage.

There is also a second, unused component,
[`RequestLeaveModal.tsx`](components/absence/RequestLeaveModal.tsx) (no "2"),
which *does* call the OCR/AI upload endpoint and *does* have a working
consent checkbox — but nothing in the app imports it. It's dead code, kept
here only as a note in case it's revived later (if it is, it already has the
consent pattern right).

### Long-term storage for medical certificates (all paths)

| Data | Where | Retention before this fix |
|---|---|---|
| Final certificate file | Storage bucket `medical-certificates`, path `certificates/{companyId}/...` | Indefinite — no deletion logic existed |
| Orphaned OCR-staging file (path 1a only) | Storage bucket `medical-certificates`, path `uploads/{companyId}/...` | Indefinite — untracked, never cleaned up |
| `employee_name`, dates, comment | `medical_certificates` table | Indefinite |
| Raw OCR text | Nowhere — not persisted | N/A |
| AI extraction JSON output | Nowhere — not persisted | N/A |

Confirmed: no deletion logic existed anywhere in the codebase before this
fix (no cron, no scheduled function, no manual admin action). "Indefinite"
above is not an inference — grepping the codebase for any `DELETE`/`.remove()`
against these tables/buckets outside of ad hoc admin action returns nothing.

## 2. CVs — company hiring pipeline

[`CVAnalyseClient.tsx`](src/app/jobs/%5Bslug%5D/cv-analyse/CVAnalyseClient.tsx)
→ `POST /api/analyse-cv` ([route.ts](src/app/api/analyse-cv/route.ts)), plus
the bulk variant `POST /api/analyse-massive` ([route.ts](src/app/api/analyse-massive/route.ts))
for re-scoring already-stored candidates against a new position.

1. The PDF is parsed server-side (`parsePdfBuffer`) into full text.
   Simultaneously, the original PDF is uploaded unchanged to the `cvs`
   Storage bucket at `cvs/{timestamp}_{filename}`.
2. **→ OpenRouter/OpenAI**: the CV text (truncated to 8,000 characters if
   longer) plus the job description is sent in a single prompt asking the
   model to both score the match **and** extract
   `candidat_firstname/lastname/email/phone` as structured fields. Model:
   `openai/gpt-3.5-turbo`, with a fallback to `anthropic/claude-3-haiku` or
   `mistralai/mistral-small` if the primary call fails.
3. Nothing extra beyond CV text + job description is sent — no separate PII
   fields are appended to the prompt; the CV's own text already contains
   whatever name/contact info is on the document, which the extraction step
   needs to populate the candidate record.
4. **Persisted to `candidats` table**: `candidat_firstname`, `candidat_lastname`,
   `cv_text` (the **full, untruncated** text — the 8,000-char cap only
   applies to what's sent to the AI, not what's stored), `cv_file` (storage
   path), `candidat_email`, `candidat_phone`, `candidat_gdpr_consent_date`,
   `candidat_ai_consent_date` (both set server-side to the moment of
   insertion — the consent checkbox in `CVAnalyseClient.tsx` gates the
   submit button client-side before this call is made).
5. **Persisted to `position_to_candidat`**: `candidat_score`,
   `candidat_ai_analyse` (the AI's free-text analysis) per position the
   candidate is scored against.
6. `analyse-massive` re-runs step 2 against already-stored `cv_text` for
   every candidate in a company when scoring a new position — same third-party
   exposure, no new file/text collection.

**Assessment (Part 2.2 of the fix)**: nothing unnecessary is sent to the AI
provider beyond the CV text and job description themselves. Full CV text is
needed for accurate skills/experience/education matching, and the name/email/phone
the AI extracts are needed to populate the candidate record — this is the
product's core function, not incidental collection. No redaction pass was
added here; see REDACTION_RETENTION_FIX.md for the reasoning.

### Long-term storage for company-pipeline CVs

| Data | Where | Retention before this fix |
|---|---|---|
| Original PDF | Storage bucket `cvs`, path `cvs/{timestamp}_{filename}` | Indefinite |
| Full CV text, name, email, phone | `candidats` table | Indefinite |
| AI score + analysis | `position_to_candidat` table | Indefinite |

Same confirmation as above: no deletion logic existed before this fix.

## 3. CVs — public Job Assistant (`/job-assistant`)

`POST /api/job-assistant/analyze`, `/improve`, `/interview/generate`,
`/interview/score`, `/interview/conclude` — none of these routes import
`@supabase/supabase-js` or touch any HRInno database or storage. Confirmed
by grep across `src/app/api/job-assistant/`: zero Supabase references.

1. The uploaded CV PDF is parsed **in-memory only** (`pdf-parse`) inside the
   `/analyze` request handler. **The file itself is never written to Storage
   or disk** — it exists only for the duration of that single request.
2. **→ OpenRouter/OpenAI**: full CV text + job description sent to
   `/analyze` (model `gpt-4o-mini`) for scoring, `/improve` (CV rewrite),
   `/interview/generate` (question generation). `/interview/score` sends a
   **smaller, pre-summarized** `cvSummary` object (skills, years of
   experience, most recent role, key achievements, education) rather than
   the full text — already minimal by construction. `/interview/conclude`
   sends `cvText.substring(0, 1200)`, a hard truncation — also already
   minimal.
3. The `cvText` is returned to the browser in the `/analyze` response and
   held in **client-side React state only**, re-sent by the browser to each
   subsequent endpoint as the user progresses through the flow (score →
   improve → interview). This is the only place it lives after the initial
   request — there is no server-side session store.

**Conclusion**: there is no persistence layer for Job Assistant CVs, not "no
evidence of one" — confirmed by absence of any Supabase call anywhere in
this route tree. Nothing here needs a retention/deletion mechanism, because
nothing is stored to delete. The retention settings table still includes a
`cv_job_assistant` row (per the task's explicit requirement) so the schema
is ready if a server-side save feature is ever added, but the scheduled
deletion job currently finds and deletes 0 rows for this type by design, and
logs that explicitly rather than silently no-op'ing.

## 4. Residual logging finding (minor, not fixed in this pass)

A few `catch` blocks in `src/app/api/analyse-cv/route.ts`
(`extractAndParseJSON`, lines ~189 and ~196) `console.error` the *raw AI
response text* when the model's output fails to parse as JSON. Since that
output is AI-generated text derived from the candidate's CV (via the
extraction prompt), a parse failure could put candidate-derived text into
Vercel's server logs. This only fires on the parse-failure edge case, logs
AI *output* rather than the original document, and Vercel function logs
already have their own access control — but it's a residual gap worth
knowing about. Not changed here to keep this fix scoped to what was asked;
flagged for a follow-up if wanted.

## 5. Third-party providers referenced throughout

- **OCR.Space** (`api.ocr.space`) — receives full medical certificate
  documents (image/PDF) via signed URL, for text extraction.
- **OpenRouter** (`openrouter.ai`), which proxies to underlying model
  providers (OpenAI `gpt-3.5-turbo`/`gpt-4o-mini`, Anthropic `claude-3-haiku`,
  Mistral `mistral-small` depending on route/fallback) — receives OCR'd
  medical certificate text and CV text/summaries for structured extraction,
  scoring, and generation.

Whether either provider's own data-handling terms are acceptable for health
data, and whether a formal Data Processing Agreement is needed with either,
is **not something this audit or the accompanying fix determines** — it
requires a human legal review of their published DPA/subprocessor terms. See
the "requires human/legal decision" list in REDACTION_RETENTION_FIX.md.

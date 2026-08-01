# PRODUCT BRIEF

> This document is the single source of truth for the current state of the product.
>
> It must always describe the application as it exists TODAY.
>
> It is NOT a changelog.
>
> Completed features should be reflected in the relevant sections.
> Removed features should be removed from this document.
> Never keep outdated information.

---

# 1. General Information

## Product Name

HRInno

## Current Version

0.1.0 (per `package.json`)

## Last Updated

2026-08-01

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: multiple functional modules exist end-to-end, and the most severe data-exposure gaps (medical certificates, CVs, candidate records) have since been closed, plan-based feature gating now exists for three features, and the app now has a real public homepage, a pricing page, and a minimal design system. Still consistent with an active MVP rather than a production-hardened product: no product documentation beyond this brief, ad hoc per-route admin checks instead of a centralized authorization layer, most modules still have no plan-based differentiation at all, no self-serve company signup exists, and known unresolved workarounds remain (see Section 8).

## Short Description

HRInno is a multi-tenant HR platform that combines AI-assisted recruitment (job postings, AI-generated job descriptions, AI-driven first-round interviews with voice recognition) with core HR operations (payroll, time & attendance, absences, performance, medical certificates) and an AI employee-wellbeing chatbot — plus a free, public, candidate-facing tool that scores and improves a CV and runs a mock AI interview. A separate marketing site (`hrinno-marketing`, www.hrinno.hu) carries the same pitch plus an interactive ROI calculator, with CTAs pointing back into this app.

---

# 2. Vision

## Mission

Not documented in the codebase.

## Long-term Vision

Not documented in the codebase.

## Success Criteria

Not documented in the codebase.

---

# 3. Target Market

## Primary Audience

HR administrators / company owners. Inferred from the codebase: the app is multi-tenant (organized around a company/org slug), with admin-gated routes for payroll, positions, and user management. Not stated explicitly in any README or doc — no such document exists.

## Secondary Audience

Recruiters and people managers (candidate pipeline, team performance) and employees (time clock, absences, wellbeing check-ins). Inferred from role-gated features in the code, not from explicit documentation.

## Ideal Customer Profile

Not documented in the codebase. Company size, industry vertical, and geography are not stated anywhere. Weak, non-authoritative signal only: French-language commit messages and built-in French/English/Hungarian i18n suggest a possible French-speaking/EU market, but this is not confirmed.

## Customer Problems

Inferred from the features that were built (not from any stated problem statement):
- Manual, time-consuming resume screening and first-round interviewing
- Poor candidate experience during the application/interview process
- Fragmented HR tooling across payroll, time tracking, absences, and performance
- Difficulty monitoring employee engagement/wellbeing on an ongoing basis
- Manual handling of employee medical certificates

---

# 4. Value Proposition

## Why customers choose this product

Not documented as a stated value proposition. Based on the feature set, the apparent pitch is: AI-assisted recruitment and interviewing combined with core HR administration in a single platform, plus a free candidate-facing tool that can serve as a differentiator versus other ATS/HR tools.

## Main Benefits

- Benefit 1: AI-assisted job descriptions, CV screening, and first-round interviewing reduce manual recruiter workload
- Benefit 2: One platform covers recruitment, payroll, time/attendance, absences, and performance instead of separate point tools
- Benefit 3: A free, public, self-serve CV-scoring and mock-interview tool gives candidates direct value and can function as an acquisition channel

## Competitive Advantages

The clearest differentiator found in the code is the public, candidate-facing Job Assistant (free CV scoring, AI-rewritten CV, voice-based mock interview, AI coaching report) — most HR/ATS tools build AI screening only for the employer side, not as a free tool for candidates. No competitor comparison exists in the repo to confirm this is unique in the market (see Section 12).

---

# 5. Current Features

List ONLY completed features, based on what exists in the code.

## Authentication

- Supabase-based authentication
- Multi-tenant company/organization accounts (org slug-based)
- Admin-gated routes for payroll, positions, and user management

## Dashboard

- Per-company SaaS entry point at `/jobs/[slug]` — reached only by someone who knows their company's slug (not discoverable/indexed). Not logged in: company branding (logo/name) and a login prompt. Logged in: "Welcome back" plus a role-aware grid of quick links to the company's HR tools (positions, HR tools, performance, time clock, absences, and for admins: payroll, subscription, users, tickets).
- Distinct from the public homepage at `/` (see Marketing/Public Site below), which the previous version of this brief mistakenly conflated with this dashboard.

## Marketing / Public Site

- Public homepage (`/`, no company slug) leads with the free Job Assistant (AI CV scoring, no account needed) as the primary hook, with a "For employers" section below introducing the full platform and a link to the new pricing page.
- New pricing page (`/pricing`): three columns (Free / Momentum / Infinity) with real limits and prices pulled from Stripe/the `forfait` table, and a note that downgrading never deletes existing data.
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu), also exists and now carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, and the same pricing data, plus an interactive ROI calculator. Its pricing CTAs go to a contact form rather than a live checkout, since no self-serve signup exists yet (see Known Limitations).
- Lightweight funnel tracking now exists across both this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact form submissions, and ROI calculator use are logged (with an anonymous session id, no CV/interview content) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`) with a manual admin field on the `company` record to link an onboarded company back to the contact submission that led to it. This is instrumentation to inform a future self-serve-signup decision, not a self-serve funnel itself — see `FUNNEL_TRACKING.md`.

## AI Features

- AI-generated job descriptions (with a known workaround for a broken prompt-variable helper — see Section 8)
- AI CV scoring and CV improvement (Job Assistant, public/candidate-facing)
- AI-driven first-round interviews, including voice recognition, for both internal recruitment and the public Job Assistant
- AI interview scoring and coaching reports
- AI employee happiness/wellbeing chatbot with pulse check-ins — now gated to companies whose plan includes it (Momentum and Infinity; not Free)

## Documents

- Medical certificate upload, listing, and download, with AI-based OCR text extraction. Files are stored in a private bucket and viewed via short-lived signed URLs generated on demand (previously a public URL was also generated for every upload); monthly upload volume is capped per the company's plan. Before the OCR'd text is sent to the AI provider for extraction, a best-effort regex redaction pass now strips likely national ID numbers, phone numbers, and addresses (dates are protected so extraction still works); this is not a guarantee of complete PII removal. The upload flow now also requires an AI-processing consent checkbox before any document is sent to OCR/AI — previously this page had no consent UI at all, so the consent-date field was never populated.
- CV upload and parsing (Job Assistant, and separately for company-side recruitment pipelines). Company-side CVs are stored privately and viewed via short-lived signed URLs, generated only for users confirmed to belong to the company that owns the position the candidate applied to. CV content sent to the AI provider was audited and found already minimal (CV text/job description only, no extra PII fields) — no redaction applied here, since name/contact info is needed for the product to function (candidate-to-job matching).

## Settings

- Stripe-based subscription management page (view plan status, manage billing via Stripe customer portal)
- Plan-based feature gating: a single server-side helper checks a company's plan (`company.forfait`) before allowing new job postings, new medical certificate uploads, and wellbeing-chatbot sessions, using per-plan limits stored in the `forfait` table. A company with no active plan permanently behaves like the Free plan for these three checks, rather than being blocked outright. See Section 11 for the actual plan tiers and Section 8 for what is and isn't covered by this.
- Data retention settings (super-admin only, `/admin/data-retention`): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable from this page with zero code change or redeploy, with a visible audit trail (who changed what, when) and a live preview of what the next scheduled deletion run would delete. A daily scheduled job deletes data older than whatever is currently configured. Retention periods are currently 365-day placeholders, not legally-informed numbers — see Section 8.

## Notifications

Not confirmed in the codebase.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## Administration

- Bulk user import and user creation
- Job posting / position management (public and private postings) — creating a new open position is capped per the company's plan. The public job board now excludes positions whose `position_end_date` has passed (previously showed every position ever created, closed or not); RLS on `openedpositions` was verified directly against production and confirmed already correctly scoped (company-scoped insert/update, intentionally public read for the job board) — see Section 19.
- Recruitment pipeline / applicant tracking, restricted so a user can only view or edit candidates for positions owned by their own company
- Payroll (grid/bulk entry, allowances, deductions, period close, exports)
- Time & attendance (time clock, employee and manager views)
- Absence tracking (calendar-based)
- Performance management (goals, pulse surveys, team performance)
- Internal support tickets / feedback forms

---

# 6. Features In Development

Based on the most recent commit and work history (not a formally stated roadmap):

- Extending plan-based feature gating to other modules (payroll, time & attendance, absences, performance, etc.) is not in progress — it would require a product decision and a schema change first, since the `forfait` table currently has no columns distinguishing those modules by plan (see Section 8).

Expected value and priority are not documented for the above or for anything else; there is no formally stated in-development feature list beyond what can be inferred from recent work.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- Plan-based feature gating covers only three features (opening a new job position, medical certificate uploads, the AI wellbeing chatbot) because those are the only ones with real per-plan limits/flags in the `forfait` table. Payroll, time & attendance, absences, performance management, tickets, and onboarding have no plan-based distinction at all — every company, including one with no active subscription, has identical access to those.
- No product documentation exists beyond this brief (README is unmodified Next.js boilerplate).
- No self-serve company signup exists: no code path anywhere inserts a new row into the `company` table. New companies must be onboarded manually today. This means pricing page/CTA "buy" buttons (in this app and on the marketing site) cannot lead to a real checkout for a brand-new prospect yet — existing checkout (`create-subscription`) only works for a company that's already been onboarded, with an admin already logged in.
- Medical certificate and CV data are still sent to third-party services (OCR.Space, OpenRouter/OpenAI). A best-effort regex redaction pass (national ID/phone/address) now runs on medical certificate text before that AI call, and a missing AI-consent checkbox on the certificate upload page was fixed — but this redaction is not a guarantee (fixed regex patterns, not an ML PII detector, so unusual/non-Hungarian formats can still get through), and whether OCR.Space's/OpenRouter's own data-handling terms are acceptable for health data, or whether a formal Data Processing Agreement is needed with either, has not been reviewed (see `REDACTION_RETENTION_FIX.md`).
- A runtime-adjustable data retention mechanism now exists (`data_retention_settings` table, admin UI, daily scheduled deletion job) for medical certificates and company-pipeline CV data, verified end-to-end against production. Job Assistant CV data still has no persistence layer at all (confirmed, not just unconfirmed, by tracing every route — nothing touches Supabase), so there's nothing for that data type to delete. The retention periods currently configured (365 days for every data type) are placeholders picked to demonstrate the mechanism, explicitly not a legal or compliance determination — the real periods still require a human legal decision.
- Leftover debug `console.log` statements remain in roughly 30 files across `src/app` (two instances that logged raw AI-extracted content — one in the medical certificate OCR flow, one in `analyse-cv/route.ts`'s JSON-parse failure path — have been fixed; the rest of the ~30 files were not audited). A few remaining `console.error` calls in `analyse-cv/route.ts` log raw Supabase error objects on insert/upload failure, which could in principle include a candidate's field value via Postgres's constraint-violation error detail — not fixed, flagged in `RLS_JOBBOARD_LOG_FIX.md`.
- Known unresolved bug in job description generation: a prompt-variable helper ("fillPromptVariables") does not work correctly, worked around with manual replacement rather than fixed.
- Admin/permission checks are implemented ad hoc per route rather than through a centralized authorization layer. Explicitly not addressed by the recent security and gating work, which added company/plan checks alongside the existing ad hoc pattern rather than replacing it.
- Obsolete/backup code and folders (e.g., an "ObsoleteHome" folder) remain in the codebase.

---

# 9. Technical Overview

## Platform

Web (responsive), Next.js application. No native mobile app.

## Technology Stack

Frontend

- Next.js 15, React 19, Tailwind CSS v4 with a minimal custom theme (`@theme` block in `globals.css`: brand indigo/accent emerald color scales, formalizing colors already used ad hoc throughout the app) and a Sora/Inter font pairing via `next/font/google`, replacing the previous default black/white/Arial. Explicitly a starting point, not a full rebrand — applied only to the homepage and pricing page so far.

Backend

- Next.js API routes
- `lib/entitlements.ts` + `src/config/entitlements.ts`: server-side plan/feature-gating layer (see Section 5, Settings)

Database

- Supabase (PostgreSQL)

Hosting

- Vercel (Vercel Analytics and Speed Insights are integrated)

Authentication

- Supabase Auth

AI

- OpenAI SDK and OpenRouter (models used include gpt-3.5-turbo and mistral-7b-instruct)
- OCR.Space (document OCR for medical certificates)
- Tesseract.js and pdf-parse (document/CV parsing)

Storage

- Supabase Storage. Medical certificate and CV buckets are private; files are served via short-lived signed URLs generated on demand server-side rather than public URLs.

Other

- Stripe (billing/subscriptions)
- Resend and Nodemailer (email)
- next-intl (internationalization — English, French, and Hungarian)

---

# 10. Integrations

Current integrations found in the codebase:

- Stripe (billing, subscriptions, customer portal)
- Supabase (auth, database, storage)
- OpenAI / OpenRouter (AI text generation and analysis)
- OCR.Space (document OCR)
- Resend / Nodemailer (transactional email)
- Vercel Analytics / Speed Insights

---

# 11. Pricing

Current pricing strategy, confirmed against the live `forfait` table (not inferred).

Free

- No Stripe price attached (default/no-payment tier). Grants: up to 3 open job positions, up to 5 medical certificate uploads/month, no AI wellbeing chatbot access, 50 included AI credits.

Momentum

- Paid tier (Stripe price `price_1S9ezYBqOCxgBpW2elkKzqUB`, live-mode "HR Inno - Momentum" — 20 000 HUF/month). Grants: up to 5 open job positions, up to 10 medical certificate uploads/month, AI wellbeing chatbot access, 100 included AI credits.

Infinity

- Paid tier (Stripe price `price_1S9ezpBqOCxgBpW26j6WvxOE`, live-mode "HR Inno - Infinity" — 45 000 HUF/month). Grants: up to 10 open job positions, up to 20 medical certificate uploads/month, AI wellbeing chatbot access, 250 included AI credits.

Notes

- Plan names are Free / Momentum / Infinity — not the Starter/Pro/Enterprise naming previously assumed in this document before the actual `forfait` table was inspected.
- A company with no active plan (`forfait` is null — the state both before ever subscribing and immediately after canceling/expiry) permanently behaves like the Free plan for the three gated features: capped at Free's limits (3 open positions, 5 medical certificates/month, no wellbeing chatbot), not blocked outright. This is not a temporary grace period — "no plan" and "Free plan" are treated as identical going forward. A company that had more items than Free's caps allow before downgrading (e.g. 8 open positions on Infinity, dropping to Free's cap of 3) keeps full read/edit/close access to everything it already has; only creating new items beyond the cap is blocked.
- A Stripe subscription canceled directly on Stripe's side (not through the app's own cancel button) is now correctly synced back to the company record via a `customer.subscription.deleted` webhook handler (plus a narrower `customer.subscription.updated` handler for cancellations reported that way), clearing the plan to the same null/Free-fallback state as an in-app cancellation.
- Per-plan limits/flags live in the `forfait` table and are read live by the app, not hardcoded — changing a plan's limits in Supabase takes effect without a code deploy.
- AI credits (`included_ai_credits` / `used_ai_credits`) are metered per API call (e.g. CV analysis, medical certificate OCR) independently of the three gated features above; this metering was already implemented before the recent gating work and is unchanged.
- As of this update, gating covers job posting creation, medical certificate uploads, and the AI wellbeing chatbot only. Payroll, time & attendance, absences, performance, tickets, and onboarding are not plan-differentiated in the data model at all (see Section 8).

---

# 12. Competitors

Not documented in the codebase. No competitor names, comparisons, or market research files exist in the repo.

| Competitor | Strength | Weakness |
|------------|-----------|-----------|
| | | |

---

# 13. Positioning

Not formally defined as a written statement, but the homepage hero now states a clear positioning: lead with the free, no-account Job Assistant as the candidate-facing hook ("Get your CV scored, free before you apply"), with the full HR platform (recruitment, payroll, time & attendance, absences, performance) positioned as what a company gets once a candidate becomes a lead. The `hrinno-marketing` site carries an aligned version of this pitch. The previous generic tagline ("HR was never as easy as now!") is gone from the homepage itself but still appears in `<meta name="description">` (`src/app/layout.tsx`) and other copy that wasn't updated.

---

# 14. Marketing Notes

Important information for Marketing.

- Use the real plan names — Free, Momentum, Infinity — not generic tier names like "Starter/Pro/Enterprise."
- Plan-based gating is now real for three things: number of open job postings, number of medical certificate uploads per month, and AI wellbeing chatbot access (Momentum/Infinity only, not Free). It is safe to market these as plan differentiators. Do NOT claim any other module (payroll, time & attendance, absences, performance, tickets, onboarding) is plan-differentiated — it isn't, for any plan including Free.
- Storage access control for medical certificates and CVs was significantly hardened (private storage, short-lived signed URLs, company-scoped database access), a best-effort PII redaction pass now runs on medical certificate text before it's sent to the AI provider, and a runtime-adjustable retention/deletion mechanism now exists — but do NOT claim full compliance (e.g. GDPR/HIPAA) yet: the redaction is best-effort (not an ML PII detector, can miss things), the configured retention periods (365 days) are placeholders awaiting a real legal decision, and whether the AI/OCR providers' own terms are acceptable for health data hasn't been reviewed.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT make guarantees about candidate CV data privacy or retention — no documented policy exists in either direction.
- The public Job Assistant (free CV scoring + AI-rewritten CV + voice-based mock interview + coaching report) is the strongest, most differentiated feature in the product — it is the best candidate for a dedicated campaign, and is unaffected by the plan gating described above since it requires no company account.
- A minimal brand (indigo/emerald color palette, Sora/Inter fonts) now exists on the homepage and pricing page — usable as a starting point for campaign creative, but not yet a full brand system (no logo refresh, no broader style guide).
- Do NOT imply self-serve sign-up is available — no code path creates a new company account yet. Pricing CTAs (both in this app and on `hrinno-marketing`) currently lead to a contact form/demo, not a live checkout, and that's accurate to the product's current state, not a placeholder to "fix" in copy.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. The most severe pre-launch data-exposure risks identified in the prior version of this brief (public storage URLs for health documents and CVs, unauthenticated candidate-data access) have since been fixed, and monetization is now partially functional (3 of the product's modules enforce plan limits). Still not production-hardened — see Section 8 for what remains.

Major blockers

- No self-serve company signup: a prospective customer can see pricing (in-app and on the marketing site) but cannot actually buy a plan without manual onboarding first. This is the main gap between "marketing pitch" and "revenue."
- Monetization is only partially functional even for onboarded companies: job posting creation, medical certificate uploads, and the wellbeing chatbot enforce plan limits, but every other paid-feeling module (payroll, time & attendance, absences, performance, etc.) is available identically regardless of plan, including to companies with no active subscription.
- Medical certificate and CV data is still sent to third-party AI/OCR services. Best-effort redaction and a runtime-adjustable retention mechanism now exist (see Section 8), but the retention periods are placeholders pending a real legal decision, and the providers' own data-handling terms for health data haven't been reviewed — still a compliance gap, just a narrower one than before.
- No product documentation exists beyond this brief.

Recommended launch timing

- Not documented in the codebase.

---

# 16. KPIs

Current metrics (if known)

- Not available. Vercel Analytics and Speed Insights are integrated in the codebase, and lightweight funnel-event tracking (Job Assistant usage, pricing views/clicks, contact form submissions, ROI calculator use, manual company-onboarding linkage) now exists in a Supabase table with a super-admin dashboard, but no actual usage numbers are accessible from the repository itself — this is instrumentation only, not reported results.

Users

- Not documented.

Paying users

- Not documented.

MRR

- Not documented.

Conversion rate

- Not documented.

Retention

- Not documented.

NPS

- Not documented.

Activation

- Not documented.

---

# 17. Roadmap

## Next Milestone

Not formally documented.

## Short-term

Not documented in the codebase.

## Medium-term

Not documented in the codebase.

## Long-term

Not documented in the codebase.

---

# 18. Open Questions

Business questions still unresolved, based on gaps found in the codebase:

- Should payroll, time & attendance, absences, performance, tickets, and onboarding also be plan-differentiated? If so, this needs a product decision on what belongs to which plan, plus new columns on the `forfait` table — nothing in the current data model supports it.
- What are the real retention periods for medical certificates and CV data (the mechanism now exists — see Section 8 — but the 365-day values configured today are placeholders, not a legal decision)? Are OCR.Space's and OpenRouter's own data-handling terms acceptable for health data, and is a formal Data Processing Agreement needed with either?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond a weak i18n/commit-language signal.
- Should a self-serve signup + checkout flow be built now that both pricing surfaces (in-app and marketing site) exist but have no live purchase path? This would need a new company-creation endpoint, an admin-user creation step, and wiring to the existing Stripe checkout — a genuine new feature, not a copy change.

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Rebuilt the homepage (public marketing page + separate per-company SaaS dashboard) and added a `/pricing` page (Free/Momentum/Infinity, real limits/prices) plus a minimal design system (brand colors, Sora/Inter fonts), and aligned the separate `hrinno-marketing` site with the same pitch
- Corrected `forfait.stripe_price_id` for Momentum/Infinity, which had pointed to test-mode Stripe prices instead of the live ones, likely blocking real checkout
- Secured medical certificate and CV storage (private buckets, short-lived signed URLs replacing previously public ones, company-scoped database access) and fixed a candidate-stats API endpoint that had no authentication at all
- Implemented plan-based feature gating for job posting creation, medical certificate uploads, and the AI wellbeing chatbot, tied to the real Stripe-linked plan tiers
- Fixed a company with no active subscription to permanently fall back to Free-tier limits instead of being blocked outright, and added Stripe webhook handling so a subscription canceled directly on Stripe's side (live or test mode) correctly syncs back to the company record
- Added lightweight funnel tracking (Job Assistant usage → pricing views/clicks → contact form submissions → manually onboarded companies) across this app and `hrinno-marketing`, with a super-admin dashboard, to inform a future self-serve-signup decision
- Added best-effort PII redaction on medical certificate text before it reaches the AI provider, fixed a missing AI-consent checkbox on the certificate upload flow, and built a runtime-adjustable data retention system (settings table, admin UI, daily scheduled deletion) for medical certificates and company-pipeline CVs, verified end-to-end against production
- Verified the `openedpositions` RLS policies directly against production: the unscoped "Allow all updates"/"Allow public insert" policies flagged in earlier work no longer exist (already fixed by a prior change) — confirmed correct, not re-fixed, with the query result and code trace kept in `RLS_JOBBOARD_LOG_FIX.md`
- Fixed the public job board (`positions-public/route.ts`) to exclude positions with a past `position_end_date`, which it previously returned unconditionally, and trimmed a log leak in `analyse-cv/route.ts` that logged the AI's full raw response text (candidate-derived) on a JSON-parse failure

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (payroll, time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, and AI wellbeing chatbot access can now be marketed as real plan differentiators (Free / Momentum / Infinity). Do not imply any other module is plan-gated.
- Continue to hold off on claiming full data-privacy/compliance for medical certificates and CVs — access control, best-effort redaction, and a retention mechanism are now in place, but the retention periods are still placeholders and the AI/OCR providers' own terms for health data haven't been legally reviewed (see Section 18).

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment, payroll, time & attendance, absences, performance, and employee wellbeing.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — the most severe data-exposure risks have been fixed, monetization is now partially functional, and the product now has a real homepage, pricing page, and minimal design system — but it's still not production-hardened, and there's no way for a new customer to actually buy a plan yet.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting + voice-based mock interview) is a genuine differentiator versus typical employer-only ATS AI tools, and is now the lead hook on both the app's homepage and the separate `hrinno-marketing` site.
- Real plan tiers are Free, Momentum, and Infinity, now correctly priced (a stale test-mode Stripe price ID was found and fixed) and enforced for job postings, medical certificate uploads, and wellbeing-chatbot access — including a company with no active subscription, which now permanently behaves like the Free plan instead of being blocked.
- Biggest gap: no self-serve company signup exists at all, so the new pricing pages (in-app and marketing site) have nowhere for a new prospect's "buy" click to actually go — both currently route to a contact form/demo instead.
- Other remaining weaknesses: most modules (payroll, time & attendance, absences, performance, tickets, onboarding) have no plan differentiation at all; medical certificate/CV data still goes to third-party AI/OCR services, and while best-effort redaction and a runtime-adjustable retention mechanism now exist, the retention periods are placeholders and the providers' own terms for health data haven't been legally reviewed.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure (now fixed) to the missing self-serve signup and partial monetization coverage.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

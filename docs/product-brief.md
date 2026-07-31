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

2026-07-31

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: multiple functional modules exist end-to-end, and the most severe data-exposure gaps (medical certificates, CVs, candidate records) have since been closed, and plan-based feature gating now exists for three features. Still consistent with an active MVP rather than a production-hardened product: no product documentation beyond this brief, ad hoc per-route admin checks instead of a centralized authorization layer, most modules still have no plan-based differentiation at all, and known unresolved workarounds remain (see Section 8).

## Short Description

HRInno is a multi-tenant HR platform that combines AI-assisted recruitment (job postings, AI-generated job descriptions, AI-driven first-round interviews with voice recognition) with core HR operations (payroll, time & attendance, absences, performance, medical certificates) and an AI employee-wellbeing chatbot — plus a free, public, candidate-facing tool that scores and improves a CV and runs a mock AI interview.

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

Not confirmed in the codebase — no dedicated dashboard module was identified during review.

## AI Features

- AI-generated job descriptions (with a known workaround for a broken prompt-variable helper — see Section 8)
- AI CV scoring and CV improvement (Job Assistant, public/candidate-facing)
- AI-driven first-round interviews, including voice recognition, for both internal recruitment and the public Job Assistant
- AI interview scoring and coaching reports
- AI employee happiness/wellbeing chatbot with pulse check-ins — now gated to companies whose plan includes it (Momentum and Infinity; not Free)

## Documents

- Medical certificate upload, listing, and download, with AI-based OCR text extraction. Files are stored in a private bucket and viewed via short-lived signed URLs generated on demand (previously a public URL was also generated for every upload); monthly upload volume is capped per the company's plan.
- CV upload and parsing (Job Assistant, and separately for company-side recruitment pipelines). Company-side CVs are stored privately and viewed via short-lived signed URLs, generated only for users confirmed to belong to the company that owns the position the candidate applied to.

## Settings

- Stripe-based subscription management page (view plan status, manage billing via Stripe customer portal)
- Plan-based feature gating: a single server-side helper checks a company's plan (`company.forfait`) before allowing new job postings, new medical certificate uploads, and wellbeing-chatbot sessions, using per-plan limits stored in the `forfait` table. A company with no active plan permanently behaves like the Free plan for these three checks, rather than being blocked outright. See Section 11 for the actual plan tiers and Section 8 for what is and isn't covered by this.

## Notifications

Not confirmed in the codebase.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## Administration

- Bulk user import and user creation
- Job posting / position management (public and private postings) — creating a new open position is capped per the company's plan
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
- `openedpositions` still has catch-all row-level-security policies (`"Allow all updates"`, `"Allow public insert"`) with no company scoping, found while implementing the position-creation plan gate but not fixed — same class of issue as the `medical_certificates`/`candidats` policies that were fixed, but "Allow public insert" may be an intentional public job-posting flow rather than a bug, so it needs its own review before changing.
- No product documentation exists beyond this brief (README is unmodified Next.js boilerplate).
- No custom design system: no Tailwind theme/config, no defined brand colors or typography beyond default black/white and Arial/Helvetica.
- Medical certificate and CV data are sent to third-party services (OCR.Space, OpenRouter/OpenAI) with only a stored AI-consent-date field as a visible safeguard — no visible redaction step. (Storage access control for this data was fixed — see Section 19 — but this third-party transmission gap was not in scope of that fix.)
- No explicit data retention or deletion policy found for Job Assistant CV data; no persistence layer was found for it either, so this is an absence of evidence, not a confirmed policy in either direction.
- Leftover debug `console.log` statements remain in roughly 30 files across `src/app` (one instance that logged raw AI-extracted medical certificate text was removed — see Section 19 — the rest were not audited).
- Known unresolved bug in job description generation: a prompt-variable helper ("fillPromptVariables") does not work correctly, worked around with manual replacement rather than fixed.
- Admin/permission checks are implemented ad hoc per route rather than through a centralized authorization layer. Explicitly not addressed by the recent security and gating work, which added company/plan checks alongside the existing ad hoc pattern rather than replacing it.
- Obsolete/backup code and folders (e.g., an "ObsoleteHome" folder) remain in the codebase.

---

# 9. Technical Overview

## Platform

Web (responsive), Next.js application. No native mobile app.

## Technology Stack

Frontend

- Next.js 15, React 19, Tailwind CSS v4 (no custom theme configured)

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

- Paid tier (Stripe price `price_1S9fz0BqOCxgBpW2AsHOWVii`). Grants: up to 5 open job positions, up to 10 medical certificate uploads/month, AI wellbeing chatbot access, 100 included AI credits.

Infinity

- Paid tier (Stripe price `price_1S9fzIBqOCxgBpW2TkYzispP`). Grants: up to 10 open job positions, up to 20 medical certificate uploads/month, AI wellbeing chatbot access, 250 included AI credits.

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

Not formally defined anywhere in the codebase. The only existing user-facing copy that hints at positioning is the homepage hero text: "HR was never as easy as now!" / "Revolutionize your human resources with AI-powered tools for recruitment, employee wellness, and workplace happiness assessment." This has not been developed into a formal positioning statement.

---

# 14. Marketing Notes

Important information for Marketing.

- Use the real plan names — Free, Momentum, Infinity — not generic tier names like "Starter/Pro/Enterprise."
- Plan-based gating is now real for three things: number of open job postings, number of medical certificate uploads per month, and AI wellbeing chatbot access (Momentum/Infinity only, not Free). It is safe to market these as plan differentiators. Do NOT claim any other module (payroll, time & attendance, absences, performance, tickets, onboarding) is plan-differentiated — it isn't, for any plan including Free.
- Storage access control for medical certificates and CVs was significantly hardened (private storage, short-lived signed URLs, company-scoped database access) — but do NOT claim full compliance (e.g. GDPR/HIPAA) yet: medical certificate and CV data is still sent to third-party AI/OCR services (OCR.Space, OpenRouter) with no redaction step, and there's no confirmed data retention/deletion policy.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT make guarantees about candidate CV data privacy or retention — no documented policy exists in either direction.
- The public Job Assistant (free CV scoring + AI-rewritten CV + voice-based mock interview + coaching report) is the strongest, most differentiated feature in the product — it is the best candidate for a dedicated campaign, and is unaffected by the plan gating described above since it requires no company account.
- No design system or brand identity exists yet; any campaign creative needs to establish visual identity rather than extend an existing one.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. The most severe pre-launch data-exposure risks identified in the prior version of this brief (public storage URLs for health documents and CVs, unauthenticated candidate-data access) have since been fixed, and monetization is now partially functional (3 of the product's modules enforce plan limits). Still not production-hardened — see Section 8 for what remains.

Major blockers

- Monetization is only partially functional: job posting creation, medical certificate uploads, and the wellbeing chatbot enforce plan limits, but every other paid-feeling module (payroll, time & attendance, absences, performance, etc.) is available identically regardless of plan, including to companies with no active subscription.
- Medical certificate and CV data is still sent to third-party AI/OCR services with no redaction step, and there's no confirmed retention/deletion policy — a compliance gap even though access control was fixed.
- No product documentation exists beyond this brief.

Recommended launch timing

- Not documented in the codebase.

---

# 16. KPIs

Current metrics (if known)

- Not available. Vercel Analytics and Speed Insights are integrated in the codebase, but no usage data is accessible from the repository itself.

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
- What is the intended approach for third-party AI/OCR data handling and retention for medical certificates and CVs (still unresolved even after the access-control fixes)?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond a weak i18n/commit-language signal.

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Secured medical certificate storage: private bucket, short-lived signed URLs replacing a previously public URL, company-scoped database access, and removal of a debug log that leaked raw OCR text from health documents
- Secured CV storage and candidate/position data: private bucket, signed URLs scoped to the requesting user's company, and company-scoped database access replacing previously wide-open policies
- Fixed a candidate-stats API endpoint that had no authentication at all
- Implemented plan-based feature gating for job posting creation, medical certificate uploads, and the AI wellbeing chatbot, tied to the real Stripe-linked plan tiers (Free, Momentum, Infinity)
- Fixed a company with no active subscription to permanently fall back to Free-tier limits instead of being blocked outright, without retroactively hiding or blocking any data from before a downgrade
- Added Stripe webhook handling for subscription cancellation on Stripe's own side (`customer.subscription.deleted`), keeping the company's plan in sync; also fixed the webhook endpoint to correctly verify and handle both live-mode and test-mode Stripe events arriving at the same production URL
- Restricted the Job Assistant to public-only access
- Added voice recognition and an AI consent flow to the interview assistant

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (payroll, time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, and AI wellbeing chatbot access can now be marketed as real plan differentiators (Free / Momentum / Infinity). Do not imply any other module is plan-gated.
- Continue to hold off on claiming full data-privacy/compliance for medical certificates and CVs — access control was fixed, but third-party AI/OCR processing and data retention are still open questions (see Section 18).

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment, payroll, time & attendance, absences, performance, and employee wellbeing.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — the most severe data-exposure risks (public storage URLs, unauthenticated candidate data access) have been fixed, and monetization is now partially functional, but the product is still not production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting + voice-based mock interview) is a genuine differentiator versus typical employer-only ATS AI tools.
- Real plan tiers are Free, Momentum, and Infinity, and now actually enforce limits on job postings, medical certificate uploads, and wellbeing-chatbot access — including a company with no active subscription, which now permanently behaves like the Free plan instead of being blocked, and stays in sync with Stripe-side cancellations via a webhook handler.
- Biggest remaining weaknesses: most modules (payroll, time & attendance, absences, performance, tickets, onboarding) have no plan differentiation at all; medical certificate/CV data still goes to third-party AI/OCR services with no redaction step.
- `openedpositions` still has unscoped row-level-security policies, found but not yet fixed.
- Launch readiness has not been formally assessed; major blockers are now narrower (partial monetization gap, third-party data-handling compliance) than the previously wide-open data-exposure issues.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

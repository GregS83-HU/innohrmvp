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

Assessment based on evidence in the codebase: multiple functional modules exist end-to-end, but there is no product documentation, no feature-gating tied to billing, leftover debug logging, and known unresolved workarounds — consistent with an active MVP, not a production-hardened product.

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

Not documented in the codebase. Company size, industry vertical, and geography are not stated anywhere. Weak, non-authoritative signal only: French-language commit messages and built-in French/English i18n suggest a possible French-speaking/EU market, but this is not confirmed.

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
- AI employee happiness/wellbeing chatbot with pulse check-ins

## Documents

- Medical certificate upload, listing, and download, with AI-based OCR text extraction
- CV upload and parsing (Job Assistant)

## Settings

- Stripe-based subscription management page (view plan status, manage billing via Stripe customer portal)

## Notifications

Not confirmed in the codebase.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## Administration

- Bulk user import and user creation
- Job posting / position management (public and private postings)
- Recruitment pipeline / applicant tracking
- Payroll (grid/bulk entry, allowances, deductions, period close, exports)
- Time & attendance (time clock, employee and manager views)
- Absence tracking (calendar-based)
- Performance management (goals, pulse surveys, team performance)
- Internal support tickets / feedback forms

---

# 6. Features In Development

Based on the most recent commit history (not a formally stated roadmap):

- Job Assistant refinements — restricting the tool to public-only access
- Interview experience optimization
- AI consent flow for the Job Assistant
- Voice recognition for the interview assistant

Expected value and priority are not documented; the above is inferred purely from commit activity, which is the most active area right now.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- No feature-gating tied to billing: Stripe checkout, customer portal, and webhook syncing of the company's plan are fully implemented, but no code path in the app actually restricts feature access based on plan — a company with no active subscription has the same access as one with an active plan.
- No product documentation exists (README is unmodified Next.js boilerplate; no docs/marketing files existed prior to this brief).
- No custom design system: no Tailwind theme/config, no defined brand colors or typography beyond default black/white and Arial/Helvetica.
- Medical certificate uploads generate a public Supabase Storage URL for sensitive health documents (in addition to a signed URL used for OCR); no visible encryption-at-rest, access control, or data retention/deletion logic was found for this data.
- Medical certificate and CV data are sent to third-party services (OCR.Space, OpenRouter/OpenAI) with only a stored AI-consent-date field as a visible safeguard — no visible redaction step.
- No explicit data retention or deletion policy found for Job Assistant CV data; no persistence layer was found for it either, so this is an absence of evidence, not a confirmed policy in either direction.
- Leftover debug `console.log` statements remain in roughly 30 files across `src/app`, including one that logs raw AI-extracted text from medical certificates.
- Known unresolved bug in job description generation: a prompt-variable helper ("fillPromptVariables") does not work correctly, worked around with manual replacement rather than fixed.
- Admin/permission checks are implemented ad hoc per route rather than through a centralized authorization layer.
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

- Supabase Storage

Other

- Stripe (billing/subscriptions)
- Resend and Nodemailer (email)
- next-intl (internationalization — English and French)

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

Current pricing strategy.

Free

- No formal "Free" tier is defined in the code. The public Job Assistant (CV scoring, mock interview) is free and requires no company account, but it is not labeled as a tier of the core product.

Starter

- Not defined in the codebase — no tier names appear in the code.

Pro

- Not defined in the codebase.

Enterprise

- Not defined in the codebase.

Notes

- Plan names and prices are not hardcoded in the app; they are fetched dynamically from the connected Stripe account (`stripe.prices.list`), meaning the actual pricing structure lives in Stripe, not in this repository.
- A `forfait` (plan) field on the company record is synced from Stripe subscription events via webhook, but as noted in Section 8, this field is not currently used anywhere to gate feature access.

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

- Do NOT claim medical certificate handling is secure or compliant (e.g., GDPR/HIPAA) — a public storage URL is generated for uploaded health documents and no encryption-at-rest, access control, or retention policy is visible in the code.
- Do NOT claim that paid/premium plans unlock specific features — no feature-gating exists yet; billing and feature access are currently independent.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT make guarantees about candidate CV data privacy or retention — no documented policy exists in either direction.
- The public Job Assistant (free CV scoring + AI-rewritten CV + voice-based mock interview + coaching report) is the strongest, most differentiated feature in the product and is also the team's current active development focus per recent commit history — it is the best candidate for a dedicated campaign.
- No design system or brand identity exists yet; any campaign creative needs to establish visual identity rather than extend an existing one.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. Qualitatively, the product shows broad feature coverage across modules but pre-production maturity gaps (see Section 8).

Major blockers

- Billing is implemented but does not gate any features, so monetization is not functional as built.
- Medical certificate data handling has visible security/compliance gaps (public URL exposure, no retention policy, third-party AI/OCR processing of health data).
- No product documentation exists.

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

Not formally documented. Based on recent commit history, the active focus is finishing and polishing the public Job Assistant (public-only access, AI consent flow, interview UX, voice recognition).

## Short-term

Not documented in the codebase.

## Medium-term

Not documented in the codebase.

## Long-term

Not documented in the codebase.

---

# 18. Open Questions

Business questions still unresolved, based on gaps found in the codebase:

- What is the intended pricing/feature-gating model, now that billing infrastructure exists but enforces nothing?
- What is the intended data-handling and compliance approach for medical certificates and other sensitive employee data?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond a weak i18n/commit-language signal.

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent commits available:

- Restricted the Job Assistant to public-only access
- Optimized the AI interview experience
- Fixed a Vercel deployment error
- Added voice recognition to the interview assistant
- Added an AI consent flow for the Job Assistant

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (payroll, time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Hold off on paid acquisition spend until pricing/feature-gating is actually decided and implemented (see Section 11 and Section 18), and until the medical-certificate data-handling gaps in Section 8 are addressed.

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment, payroll, time & attendance, absences, performance, and employee wellbeing.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — broad feature coverage, but no product documentation, no design system, and several pre-production maturity gaps.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting + voice-based mock interview) is a genuine differentiator versus typical employer-only ATS AI tools.
- Biggest weaknesses: billing is wired but doesn't gate any features; medical-certificate handling has visible security/compliance gaps; leftover debug logging includes sensitive extracted data.
- Current priority, per recent commits: polishing and hardening the public Job Assistant (access control, consent, interview UX, voice recognition).
- Pricing model is undecided in practice — Stripe plans exist and prices are fetched dynamically, but no plan restricts any feature today.
- Launch readiness has not been formally assessed; major blockers are non-functional monetization and unresolved data-handling risk around health data.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

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

2026-08-02

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: multiple functional modules exist end-to-end, the most severe data-exposure gaps (medical certificates, CVs, candidate records) have since been closed, plan-based feature gating exists for three features, a real public homepage, pricing page, and minimal design system are in place, and — as of this update — a prospect can now sign up and reach a working dashboard entirely unassisted. Still consistent with an active MVP rather than a production-hardened product: no product documentation beyond this brief, ad hoc per-route admin checks instead of a centralized authorization layer, most modules still have no plan-based differentiation at all, and known unresolved workarounds remain (see Section 8).

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
- Benefit 4: A new company can sign up and start posting jobs immediately with no sales call and no waiting — while the higher-complexity modules (payroll, time & attendance, absences, performance, AI wellbeing chatbot) are deliberately held behind a short guided onboarding call rather than left for the customer to configure alone, trading a small amount of friction for a safer first experience with those modules

## Competitive Advantages

The clearest differentiator found in the code is the public, candidate-facing Job Assistant (free CV scoring, AI-rewritten CV, voice-based mock interview, AI coaching report) — most HR/ATS tools build AI screening only for the employer side, not as a free tool for candidates. No competitor comparison exists in the repo to confirm this is unique in the market (see Section 12).

---

# 5. Current Features

List ONLY completed features, based on what exists in the code.

## Authentication

- Supabase-based authentication
- Multi-tenant company/organization accounts (org slug-based)
- Self-serve signup (`/signup`): a prospect creates a brand-new company and its first admin account in one step — company name, admin name, work email, and password — and is logged straight into their dashboard immediately, with no manual step from the team. The new company starts on the Free plan.
- Admin-gated routes for payroll, positions, and user management

## Dashboard

- Per-company SaaS entry point at `/jobs/[slug]` — reached only by someone who knows their company's slug (not discoverable/indexed). Not logged in: company branding (logo/name) and a login prompt. Logged in: "Welcome back" plus a role-aware grid of quick links to the company's HR tools (positions, HR tools, performance, time clock, absences, and for admins: payroll, subscription, users, tickets).
- Distinct from the public homepage at `/` (see Marketing/Public Site below), which the previous version of this brief mistakenly conflated with this dashboard.

## Marketing / Public Site

- Public homepage (`/`, no company slug) leads with the free Job Assistant (AI CV scoring, no account needed) as the primary hook, with a "For employers" section below introducing the full platform and a link to the new pricing page.
- Pricing page (`/pricing`): three columns (Free / Momentum / Infinity) with real limits and prices pulled from Stripe/the `forfait` table, a note that downgrading never deletes existing data, and every plan's button now leads to the self-serve signup flow rather than a contact form or demo request — including Momentum and Infinity, since every new company starts on Free and upgrades afterward from inside the dashboard (see Pricing, Section 11).
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu), also exists and carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, and the same pricing data, plus an interactive ROI calculator. This site was not part of the self-serve signup work — its pricing CTAs still go to a contact form, not the new signup flow (see Known Limitations).
- Lightweight funnel tracking now exists across this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact form submissions, ROI calculator use, signup started/completed, and onboarding-marked-complete are logged (with an anonymous session id, no CV/interview content) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`). A manual field on the `company` record can still link a company onboarded before self-serve signup existed back to the contact submission that led to it — see `FUNNEL_TRACKING.md`.

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
- Onboarding-completion gate: separate from and on top of the plan-based check above, payroll, time & attendance, absences, performance management, and the AI wellbeing chatbot are unavailable to any company — including one already paying for Momentum or Infinity — until the team manually marks that company's onboarding as complete. A company admin who hits one of these modules before then sees a clear "available after your onboarding call" message with a contact link, not a broken page. Every company onboarded manually before this feature existed was grandfathered in as already complete, so no existing customer was retroactively locked out. Recruitment/job postings and the Job Assistant are explicitly not subject to this gate.
- Data retention settings (super-admin only, `/admin/data-retention`): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable from this page with zero code change or redeploy, with a visible audit trail (who changed what, when) and a live preview of what the next scheduled deletion run would delete. A daily scheduled job deletes data older than whatever is currently configured. Retention periods are currently 365-day placeholders, not legally-informed numbers — see Section 8.

## Notifications

Not confirmed in the codebase.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## Administration

- Manual onboarding-completion toggle (super-admin only, `/jobs/[slug]/admin/onboarding`): a simple per-company list with current status and a one-click toggle, used by the team to unlock a self-serve company's higher-complexity modules once its setup call is done. Purely manual — no scheduling or workflow automation is attached to it.
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

- Extending plan-based (Free vs. Momentum vs. Infinity) feature gating to other modules (payroll, time & attendance, absences, performance, etc.) is not in progress — it would require a product decision and a schema change first, since the `forfait` table currently has no columns distinguishing those modules by plan (see Section 8). This is a separate question from the new onboarding-completion gate on those same modules (Section 5, Settings), which blocks access uniformly regardless of plan rather than differentiating between plans.

Expected value and priority are not documented for the above or for anything else; there is no formally stated in-development feature list beyond what can be inferred from recent work.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- Plan-based feature gating (Free vs. Momentum vs. Infinity) covers only three features (opening a new job position, medical certificate uploads, the AI wellbeing chatbot) because those are the only ones with real per-plan limits/flags in the `forfait` table. Payroll, time & attendance, absences, performance management, and tickets have no plan-based distinction at all — a Free company and an Infinity company that are both onboarded have identical access to those.
- No product documentation exists beyond this brief (README is unmodified Next.js boilerplate).
- Self-serve signup is scoped, not full-platform: a brand-new company can sign up and use recruitment/Job Assistant completely unassisted, but payroll, time & attendance, absences, performance, and the AI wellbeing chatbot all stay locked behind a manual onboarding-completion toggle regardless of plan (Section 5, Settings). Marking a company onboarded is a manual, one-at-a-time action with no scheduling or capacity-planning tooling attached — if self-serve signups grow faster than the team's ability to run setup calls, new customers could end up waiting on those modules with no automated fallback or queue visibility for them.
- The separate `hrinno-marketing` site (www.hrinno.hu) was not updated as part of the self-serve signup work: its pricing CTAs still lead to a contact form, not the new `/signup` flow, so a prospect arriving from that site takes an extra step compared to one starting from this app's own `/pricing` page.
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
- As of this update, plan-tier gating (Free vs. Momentum vs. Infinity) covers job posting creation, medical certificate uploads, and the AI wellbeing chatbot only. Payroll, time & attendance, absences, performance, and tickets are not plan-differentiated in the data model at all (see Section 8).
- Every new company created through self-serve signup starts on Free automatically (no plan is selected during signup itself, even if the visitor clicked a Momentum or Infinity button on the pricing page). Upgrading to a paid plan is a separate step taken afterward from inside the dashboard's existing subscription page, unchanged by this update.
- Payroll, time & attendance, absences, performance, and the AI wellbeing chatbot are additionally withheld from every self-serve company — on any plan, including paid ones — until the team manually marks that company's onboarding as complete (Section 5, Settings). This is independent of the plan-tier limits described above.

---

# 12. Competitors

Not documented in the codebase. No competitor names, comparisons, or market research files exist in the repo.

| Competitor | Strength | Weakness |
|------------|-----------|-----------|
| | | |

---

# 13. Positioning

Not formally defined as a written statement, but the homepage hero now states a clear positioning: lead with the free, no-account Job Assistant as the candidate-facing hook ("Get your CV scored, free before you apply"), with the full HR platform (recruitment, payroll, time & attendance, absences, performance) positioned as what a company gets once a candidate becomes a lead. The `hrinno-marketing` site carries an aligned version of this pitch. The previous generic tagline ("HR was never as easy as now!") is gone from the homepage itself but still appears in `<meta name="description">` (`src/app/layout.tsx`) and other copy that wasn't updated.

With self-serve signup now live, the product's access model is a deliberate hybrid rather than pure product-led growth: recruitment/Job Assistant is instant and fully unassisted, while payroll, time & attendance, absences, performance, and the wellbeing chatbot require a short human-guided onboarding call before first use, on any plan. The pitch this supports is "start free in minutes for recruiting, get white-glove setup for the harder HR operations" rather than "buy and self-configure the whole platform."

---

# 14. Marketing Notes

Important information for Marketing.

- Use the real plan names — Free, Momentum, Infinity — not generic tier names like "Starter/Pro/Enterprise."
- Plan-based gating is now real for three things: number of open job postings, number of medical certificate uploads per month, and AI wellbeing chatbot access (Momentum/Infinity only, not Free). It is safe to market these as plan differentiators. Do NOT claim any other module (payroll, time & attendance, absences, performance, tickets) is plan-differentiated — it isn't, for any plan including Free.
- Storage access control for medical certificates and CVs was significantly hardened (private storage, short-lived signed URLs, company-scoped database access), a best-effort PII redaction pass now runs on medical certificate text before it's sent to the AI provider, and a runtime-adjustable retention/deletion mechanism now exists — but do NOT claim full compliance (e.g. GDPR/HIPAA) yet: the redaction is best-effort (not an ML PII detector, can miss things), the configured retention periods (365 days) are placeholders awaiting a real legal decision, and whether the AI/OCR providers' own terms are acceptable for health data hasn't been reviewed.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT make guarantees about candidate CV data privacy or retention — no documented policy exists in either direction.
- The public Job Assistant (free CV scoring + AI-rewritten CV + voice-based mock interview + coaching report) is the strongest, most differentiated feature in the product — it is the best candidate for a dedicated campaign, and is unaffected by the plan gating described above since it requires no company account.
- A minimal brand (indigo/emerald color palette, Sora/Inter fonts) now exists on the homepage and pricing page — usable as a starting point for campaign creative, but not yet a full brand system (no logo refresh, no broader style guide).
- Self-serve sign-up is now real and can be marketed as such — it is safe to say a company can sign up and start posting jobs / using the Job Assistant in minutes, with no sales call required. This is true for this app's own `/pricing` page, whose buttons now lead straight to signup on any plan (a Momentum/Infinity click still creates a Free account first; upgrading happens afterward inside the dashboard). It is NOT yet true for the separate `hrinno-marketing` site, whose CTAs still lead to a contact form — do not imply parity between the two until that site is updated.
- Do NOT imply that payroll, time & attendance, absences, performance, or the AI wellbeing chatbot are available immediately after self-serve signup — all five require a manual onboarding call with the team first, regardless of plan, even on Momentum or Infinity. Marketing copy for self-serve signup should frame this honestly (e.g. "get started free with recruiting today; the full HR suite unlocks after a quick setup call") rather than promising instant access to the whole platform.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. The most severe pre-launch data-exposure risks identified in the prior version of this brief (public storage URLs for health documents and CVs, unauthenticated candidate-data access) have since been fixed, monetization is now partially functional (3 of the product's modules enforce plan limits), and a prospective customer can now sign up and reach a working dashboard entirely unassisted. Still not production-hardened — see Section 8 for what remains.

Major blockers

- Self-serve signup now exists and closes the biggest previous gap (a prospect can create an account and start recruiting without any manual step), but it only covers recruitment: payroll, time & attendance, absences, performance, and the wellbeing chatbot still require a manual onboarding call before a self-serve company can use them, with no automation or capacity planning behind that manual step. At scale, this makes the onboarding-call team a potential bottleneck between signup and full product value.
- Monetization is only partially functional even for onboarded companies: job posting creation, medical certificate uploads, and the wellbeing chatbot enforce plan limits, but every other paid-feeling module (payroll, time & attendance, absences, performance, etc.) is available identically regardless of plan, including to companies with no active subscription.
- The separate `hrinno-marketing` site's pricing CTAs still lead to a contact form rather than the new signup flow, so the "no live purchase path" gap is only closed for prospects who reach this app's own pricing page.
- Medical certificate and CV data is still sent to third-party AI/OCR services. Best-effort redaction and a runtime-adjustable retention mechanism now exist (see Section 8), but the retention periods are placeholders pending a real legal decision, and the providers' own data-handling terms for health data haven't been reviewed — still a compliance gap, just a narrower one than before.
- No product documentation exists beyond this brief.

Recommended launch timing

- Not documented in the codebase.

---

# 16. KPIs

Current metrics (if known)

- Not available. Vercel Analytics and Speed Insights are integrated in the codebase, and lightweight funnel-event tracking (Job Assistant usage, pricing views/clicks, contact form submissions, ROI calculator use, signup started/completed, onboarding marked complete) now exists in a Supabase table with a super-admin dashboard, but no actual usage numbers are accessible from the repository itself — this is instrumentation only, not reported results.

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

- Should payroll, time & attendance, absences, performance, and tickets also be plan-differentiated? If so, this needs a product decision on what belongs to which plan, plus new columns on the `forfait` table — nothing in the current data model supports it. This is separate from the new onboarding-completion gate on those same modules.
- What are the real retention periods for medical certificates and CV data (the mechanism now exists — see Section 8 — but the 365-day values configured today are placeholders, not a legal decision)? Are OCR.Space's and OpenRouter's own data-handling terms acceptable for health data, and is a formal Data Processing Agreement needed with either?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond a weak i18n/commit-language signal.
- Now that self-serve signup exists, what turnaround target (if any) should the team hold itself to for completing onboarding calls and flipping a new company's toggle? The flag-flip is entirely manual today with no scheduling, queue, or reminder tooling — worth deciding before self-serve volume grows.
- Should `hrinno-marketing`'s pricing CTAs be updated to point at this app's new `/signup` flow instead of a contact form, to match the in-app pricing page?

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
- Shipped self-serve signup (`/signup`): a prospect can now create a company and admin account and land in their dashboard unassisted, on Free by default, with this app's pricing page CTAs now pointing there instead of a contact form. Recruitment and the Job Assistant work immediately; payroll, time & attendance, absences, performance, and the AI wellbeing chatbot are additionally gated behind a new manual "onboarding complete" toggle (super-admin page) that applies regardless of paid plan — existing, already-onboarded companies were grandfathered in as complete so none were retroactively locked out

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (payroll, time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, and AI wellbeing chatbot access can now be marketed as real plan differentiators (Free / Momentum / Infinity). Do not imply any other module is plan-gated.
- Continue to hold off on claiming full data-privacy/compliance for medical certificates and CVs — access control, best-effort redaction, and a retention mechanism are now in place, but the retention periods are still placeholders and the AI/OCR providers' own terms for health data haven't been legally reviewed (see Section 18).
- It is now accurate to advertise instant, self-serve signup for recruitment ("start free in minutes, no sales call") on this app's own pricing page. Do not extend that promise to payroll, time & attendance, absences, performance, or the wellbeing chatbot — those require a manual onboarding call regardless of plan, and overselling instant access there would set the wrong expectation right after signup. Note also that `hrinno-marketing`'s CTAs still route to a contact form, not this new signup flow, until that site is separately updated.

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment, payroll, time & attendance, absences, performance, and employee wellbeing.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — the most severe data-exposure risks have been fixed, monetization is now partially functional, the product has a real homepage, pricing page, and minimal design system, and a new prospect can now sign up and reach a working dashboard entirely unassisted — but it's still not production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting + voice-based mock interview) is a genuine differentiator versus typical employer-only ATS AI tools, and is now the lead hook on both the app's homepage and the separate `hrinno-marketing` site.
- Real plan tiers are Free, Momentum, and Infinity, now correctly priced (a stale test-mode Stripe price ID was found and fixed) and enforced for job postings, medical certificate uploads, and wellbeing-chatbot access — including a company with no active subscription, which now permanently behaves like the Free plan instead of being blocked.
- Self-serve signup now exists on this app's own pricing page: a new company can create an account and start recruiting immediately, with no manual step. It's deliberately scoped rather than full-platform — payroll, time & attendance, absences, performance, and the wellbeing chatbot stay locked behind a manual, per-company onboarding-call toggle regardless of plan, and that manual step has no scheduling or capacity tooling behind it yet.
- Other remaining weaknesses: most modules (payroll, time & attendance, absences, performance, tickets) have no plan differentiation at all; the separate `hrinno-marketing` site's CTAs weren't updated to the new signup flow; medical certificate/CV data still goes to third-party AI/OCR services, and while best-effort redaction and a runtime-adjustable retention mechanism now exist, the retention periods are placeholders and the providers' own terms for health data haven't been legally reviewed.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure and a missing signup path (both now fixed) to partial monetization coverage and the operational scalability of manual onboarding calls.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

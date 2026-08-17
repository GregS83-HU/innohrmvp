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

2026-08-04

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: multiple functional modules exist end-to-end, the most severe data-exposure gaps (medical certificates, CVs, candidate records) have since been closed, plan-based feature gating is real and substantial (job postings, medical certificates, the wellbeing chatbot, payroll/time & attendance/absences, performance management, and total employee seats all differ by plan — only support tickets don't), a real public homepage, pricing page, and minimal design system are in place, and a prospect can now sign up and reach a working dashboard entirely unassisted. Still consistent with an active MVP rather than a production-hardened product: no internal/developer documentation beyond this brief and the in-app user manual, ad hoc per-route admin checks instead of a centralized authorization layer, and known unresolved workarounds remain (see Section 8).

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
- Benefit 4: A new company can sign up and start posting jobs immediately with no sales call and no waiting — while the higher-complexity modules (payroll, time & attendance, absences, performance, AI wellbeing chatbot) and, temporarily, medical certificate uploads are deliberately held behind a short guided onboarding call rather than left for the customer to configure alone, trading a small amount of friction for a safer first experience with those modules

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
- Pricing page (`/pricing`): three columns (Free / Momentum / Infinity) with real limits and prices pulled from Stripe/the `forfait` table, a note that downgrading never deletes existing data, a note that payroll/time & attendance/absences/performance/the wellbeing chatbot/medical certificate uploads all additionally require a completed onboarding call regardless of plan, and every plan's button now leads to the self-serve signup flow rather than a contact form or demo request — including Momentum and Infinity, since every new company starts on Free and upgrades afterward from inside the dashboard (see Pricing, Section 11).
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu), also exists and carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, and the same pricing data, plus an interactive ROI calculator. Its pricing buttons (Free/Momentum/Infinity) now also lead straight to this app's self-serve signup flow, each with its own plan-specific label, matching this app's own pricing page — previously they led to a contact form and stated self-serve sign-up was "coming soon." It carries the same onboarding-completion disclaimer as this app's pricing page. A separate, unrelated "want this automation in your company" contact CTA elsewhere on that site is unchanged.
- Lightweight funnel tracking now exists across this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact form submissions, ROI calculator use, signup started/completed, and onboarding-marked-complete are logged (with an anonymous session id, no CV/interview content) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`). A manual field on the `company` record can still link a company onboarded before self-serve signup existed back to the contact submission that led to it — see `FUNNEL_TRACKING.md`.

## AI Features

- AI-generated job descriptions (with a known workaround for a broken prompt-variable helper — see Section 8)
- AI CV scoring and CV improvement (Job Assistant, public/candidate-facing)
- AI-driven first-round interviews, including voice recognition, for both internal recruitment and the public Job Assistant
- AI interview scoring and coaching reports
- AI employee happiness/wellbeing chatbot with pulse check-ins — now gated to companies whose plan includes it (Momentum and Infinity; not Free)

## Documents

- Medical certificate upload, listing, and download, with AI-based OCR text extraction. Files are stored in a private bucket and viewed via short-lived signed URLs generated on demand (previously a public URL was also generated for every upload); monthly upload volume is capped per the company's plan. Before the OCR'd text is sent to the AI provider for extraction, a best-effort regex redaction pass now strips likely national ID numbers, phone numbers, and addresses (dates are protected so extraction still works); this is not a guarantee of complete PII removal. The upload flow now also requires an AI-processing consent checkbox before any document is sent to OCR/AI — previously this page had no consent UI at all, so the consent-date field was never populated. Uploading (listing and downloading are unaffected) now additionally requires the company's onboarding call to be complete, on any plan — see Settings below for why.
- CV upload and parsing (Job Assistant, and separately for company-side recruitment pipelines). Company-side CVs are stored privately and viewed via short-lived signed URLs, generated only for users confirmed to belong to the company that owns the position the candidate applied to. CV content sent to the AI provider was audited and found already minimal (CV text/job description only, no extra PII fields) — no redaction applied here, since name/contact info is needed for the product to function (candidate-to-job matching).

## Settings

- Stripe-based subscription management page (view plan status, manage billing via Stripe customer portal)
- Plan-based feature gating: a single server-side helper checks a company's plan (`company.forfait`) before allowing new job postings, new medical certificate uploads, wellbeing-chatbot sessions, payroll/time & attendance/absences actions, performance-management actions, and adding a new employee (seat cap), using per-plan limits/flags stored in the `forfait` table. Payroll/attendance/absences and performance are "locked preview" on plans that don't include them — admins can see the module but not enter real data; everyone else simply doesn't see it in navigation. A company with no active plan permanently behaves like the Free plan for every one of these checks, rather than being blocked outright. See Section 11 for the actual plan tiers and Section 8 for what is and isn't covered by this.
- Onboarding-completion gate: separate from and on top of the plan-based check above, payroll, time & attendance, absences, performance management, the AI wellbeing chatbot, and medical certificate uploads are unavailable to any company — including one already paying for Momentum or Infinity — until the team manually marks that company's onboarding as complete. A company admin who hits one of these modules before then sees a clear "available after your onboarding call" message with a contact link, not a broken page. Every company onboarded manually before this feature existed was grandfathered in as already complete, so no existing customer was retroactively locked out. Recruitment/job postings and the Job Assistant are explicitly not subject to this gate.
  - Medical certificate uploads were added to this gate for a different reason than the other five: not because the feature is complex to learn, but as a temporary compliance safeguard. Certificate uploads send employee health data to third-party AI/OCR services with best-effort (not guaranteed) redaction and placeholder (not legally-reviewed) retention periods — see Known Limitations. The locked-state message for this specific module says so explicitly, rather than implying a training gate. Intent is to remove this one from the gate once the pending legal review of retention periods and subprocessor terms is complete — the other five modules are not expected to be removed from the gate on the same timeline.
- Automated onboarding-call booking: right after self-serve signup, the new admin automatically gets an email with a Calendly link to book the onboarding call (skipped for companies already grandfathered as onboarded). If they haven't booked within 3 business days, a one-time reminder email goes out automatically with the same link. This only automates getting the prospect to book — actually running the call and flipping the company to onboarded is still a fully manual step (see Administration below); nothing marks a company onboarded automatically based on a booked or completed call.
- Data retention settings (super-admin only, `/admin/data-retention`): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable from this page with zero code change or redeploy, with a visible audit trail (who changed what, when) and a live preview of what the next scheduled deletion run would delete. A daily scheduled job deletes data older than whatever is currently configured. Retention periods are currently 365-day placeholders, not legally-informed numbers — see Section 8.

## Help & Documentation

- In-app user manual, reachable from the logged-in admin's account menu ("User Guide"). A browsable, searchable guide covering every currently-live feature — recruitment/job postings, AI job descriptions, medical certificates, payroll, time & attendance, absences, performance, the wellbeing chatbot, user management, subscription & billing, and support tickets — written in plain customer-facing language with accurate plan limits and role restrictions for each. Content is stored as Markdown files rather than hardcoded in the app, so updating it going forward is a text edit, not a code change. English only today; the content structure is ready for French/Hungarian translation later but that hasn't been done yet.

## Notifications

Not confirmed in the codebase.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## Administration

- Manual onboarding-completion toggle (super-admin only, `/jobs/[slug]/admin/onboarding`): a simple per-company list with current status and a one-click toggle, used by the team to unlock a self-serve company's higher-complexity modules once its setup call is done. The list also shows, per company, whether the automated booking email and reminder have been sent (see Settings), so the team can see who hasn't engaged yet without checking Calendly by hand. Marking a company onboarded itself is still purely manual — nothing about the toggle or the trigger to flip it is automated.
- Bulk user import and user creation
- Job posting / position management (public and private postings) — creating a new open position is capped per the company's plan. The public job board now excludes positions whose `position_end_date` has passed (previously showed every position ever created, closed or not); RLS on `openedpositions` was verified directly against production and confirmed already correctly scoped (company-scoped insert/update, intentionally public read for the job board). Separately, the public job board endpoint itself was found silently ignoring its own company filter (a query bug, not an RLS gap) and returning every company's positions regardless of which company's job board was requested, with the company attribution blanked out on every result — this also meant a company's own recruiting dashboard showed zero open positions instead of its real ones. Now fixed: each company's job board and recruiting dashboard correctly show only that company's own positions — see Section 19.
- Recruitment pipeline / applicant tracking, restricted so a user can only view or edit candidates for positions owned by their own company
- Payroll (grid/bulk entry, allowances, deductions, period close, exports)
- Time & attendance (time clock, employee and manager views)
- Absence tracking (calendar-based)
- Performance management (goals, pulse surveys, team performance)
- Internal support tickets / feedback forms

---

# 6. Features In Development

Based on the most recent commit and work history (not a formally stated roadmap):

- Payroll, time & attendance, absences, and performance management already have plan-based (Free vs. Momentum vs. Infinity) gating (see Section 11) — support tickets are the one remaining module with no plan-based distinction, and extending gating there is not in progress.

Expected value and priority are not documented for the above or for anything else; there is no formally stated in-development feature list beyond what can be inferred from recent work.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- Plan-based feature gating (Free vs. Momentum vs. Infinity) is real and substantial, covering opening a new job position, medical certificate uploads, the AI wellbeing chatbot, payroll/time & attendance/absences (locked on Free; usable on Momentum up to 20 employees; usable on Infinity up to 100), performance management (locked on Free and Momentum; usable on Infinity up to 100 employees), and total employee seats (20 on Momentum, 100 on Infinity, beyond which it's not self-serve — a "contact us for a custom quote" state). Support tickets are the one module with no plan-based distinction today.
- Customers now have an in-app user manual (Section 5, Help & Documentation), but internal/developer-facing documentation is still absent — the README remains unmodified Next.js boilerplate, and this brief is still the only business-facing document in the repo.
- Self-serve signup is scoped, not full-platform: a brand-new company can sign up and use recruitment/Job Assistant completely unassisted, but payroll, time & attendance, absences, performance, the AI wellbeing chatbot, and medical certificate uploads all stay locked behind a manual onboarding-completion toggle regardless of plan (Section 5, Settings). Getting the prospect to book a call is now automated (Calendly link at signup, one-time reminder after 3 business days), but everything after that — actually running the call and flipping the toggle — is still a manual, one-at-a-time action with no capacity-planning tooling attached. If self-serve signups grow faster than the team's ability to run setup calls, new customers will have booked a call but still have no visibility into when it'll actually happen or when the modules will unlock.
- Medical certificate and CV data are still sent to third-party services (OCR.Space, OpenRouter/OpenAI). A best-effort regex redaction pass (national ID/phone/address) now runs on medical certificate text before that AI call, and a missing AI-consent checkbox on the certificate upload page was fixed — but this redaction is not a guarantee (fixed regex patterns, not an ML PII detector, so unusual/non-Hungarian formats can still get through), and whether OCR.Space's/OpenRouter's own data-handling terms are acceptable for health data, or whether a formal Data Processing Agreement is needed with either, has not been reviewed (see `REDACTION_RETENTION_FIX.md`). As an interim mitigation for this specific gap, medical certificate uploads for brand-new self-serve companies are now held behind the onboarding-completion gate (Section 5, Settings) until this review is done — this doesn't reduce the underlying exposure for already-onboarded companies, who can upload today as they always could.
- A runtime-adjustable data retention mechanism now exists (`data_retention_settings` table, admin UI, daily scheduled deletion job) for medical certificates and company-pipeline CV data, verified end-to-end against production. Job Assistant CV data still has no persistence layer at all (confirmed, not just unconfirmed, by tracing every route — nothing touches Supabase), so there's nothing for that data type to delete. The retention periods currently configured (365 days for every data type) are placeholders picked to demonstrate the mechanism, explicitly not a legal or compliance determination — the real periods still require a human legal decision.
- Leftover debug `console.log` statements remain in roughly 30 files across `src/app` (two instances that logged raw AI-extracted content — one in the medical certificate OCR flow, one in `analyse-cv/route.ts`'s JSON-parse failure path — have been fixed; the rest of the ~30 files were not audited). A few remaining `console.error` calls in `analyse-cv/route.ts` log raw Supabase error objects on insert/upload failure, which could in principle include a candidate's field value via Postgres's constraint-violation error detail — not fixed, flagged in `RLS_JOBBOARD_LOG_FIX.md`.
- Known unresolved bug in job description generation: a prompt-variable helper ("fillPromptVariables") does not work correctly, worked around with manual replacement rather than fixed.
- Admin/permission checks are implemented ad hoc per route rather than through a centralized authorization layer. Explicitly not addressed by the recent security and gating work, which added company/plan checks alongside the existing ad hoc pattern rather than replacing it. A concrete instance of this pattern's risk materialized in the public job board endpoint, which silently returned every company's positions instead of just the requested one's due to a missing join-scoping detail (now fixed, see Section 19) — a reminder that per-route scoping can silently regress without a centralized layer enforcing it.
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

- No Stripe price attached (default/no-payment tier). Grants: up to 2 open job positions, up to 5 medical certificate uploads/month, no AI wellbeing chatbot access, 50 included AI credits. Payroll, time & attendance, and absences are visible to admins as a locked preview only (not usable for real data entry); performance management is likewise locked.

Momentum

- Paid tier (Stripe price `price_1S9ezYBqOCxgBpW2elkKzqUB`, live-mode "HR Inno - Momentum" — 20 000 HUF/month). Grants: up to 5 open job positions, up to 10 medical certificate uploads/month, AI wellbeing chatbot access, 100 included AI credits. Payroll, time & attendance, and absences are usable for up to 20 employees. Performance management is still locked (same as Free).

Infinity

- Paid tier (Stripe price `price_1S9ezpBqOCxgBpW26j6WvxOE`, live-mode "HR Inno - Infinity" — 45 000 HUF/month). Grants: up to 10 open job positions, up to 20 medical certificate uploads/month, AI wellbeing chatbot access, 250 included AI credits. Payroll, time & attendance, absences, and performance management are all usable, for up to 100 employees. Adding an employee beyond 100 isn't self-serve — the app shows a "contact us for a custom quote" state rather than a hard block.

Notes

- Plan names are Free / Momentum / Infinity — not the Starter/Pro/Enterprise naming previously assumed in this document before the actual `forfait` table was inspected.
- A company with no active plan (`forfait` is null — the state both before ever subscribing and immediately after canceling/expiry) permanently behaves like the Free plan for every gated feature, not blocked outright. This is not a temporary grace period — "no plan" and "Free plan" are treated as identical going forward. A company that had more items than Free's caps allow before downgrading (e.g. 8 open positions on Infinity, dropping to Free's cap of 2) keeps full read/edit/close access to everything it already has; only creating new items beyond the cap is blocked.
- A Stripe subscription canceled directly on Stripe's side (not through the app's own cancel button) is now correctly synced back to the company record via a `customer.subscription.deleted` webhook handler (plus a narrower `customer.subscription.updated` handler for cancellations reported that way), clearing the plan to the same null/Free-fallback state as an in-app cancellation.
- Per-plan limits/flags live in the `forfait` table and are read live by the app, not hardcoded — changing a plan's limits in Supabase takes effect without a code deploy.
- AI credits (`included_ai_credits` / `used_ai_credits`) are metered per API call (e.g. CV analysis, medical certificate OCR) independently of the gated features above; this metering was already implemented before the recent gating work and is unchanged.
- Plan-tier gating (Free vs. Momentum vs. Infinity) covers job posting creation, medical certificate uploads, the AI wellbeing chatbot, payroll/time & attendance/absences, performance management, and total employee seat count. Support tickets are the only module with no plan-based distinction in the data model (see Section 8).
- Every new company created through self-serve signup starts on Free automatically (no plan is selected during signup itself, even if the visitor clicked a Momentum or Infinity button on the pricing page). Upgrading to a paid plan is a separate step taken afterward from inside the dashboard's existing subscription page, unchanged by this update. On Free, this means payroll/attendance/absences/performance are locked by plan tier in addition to the onboarding gate below — upgrading alone isn't enough to unlock them without also completing onboarding.
- Payroll, time & attendance, absences, performance, the AI wellbeing chatbot, and medical certificate uploads are additionally withheld from every self-serve company — on any plan, including paid ones — until the team manually marks that company's onboarding as complete (Section 5, Settings). This onboarding gate is independent of, and layered on top of, the plan-tier limits described above. Medical certificate uploads are in this list as a temporary compliance safeguard, not a training gate like the other five — see Known Limitations.

---

# 12. Competitors

Not documented in the codebase. No competitor names, comparisons, or market research files exist in the repo.

| Competitor | Strength | Weakness |
|------------|-----------|-----------|
| | | |

---

# 13. Positioning

Not formally defined as a written statement, but the homepage hero now states a clear positioning: lead with the free, no-account Job Assistant as the candidate-facing hook ("Get your CV scored, free before you apply"), with the full HR platform (recruitment, payroll, time & attendance, absences, performance) positioned as what a company gets once a candidate becomes a lead. The `hrinno-marketing` site carries an aligned version of this pitch. The `<meta name="description">` (`src/app/layout.tsx`) is also already aligned with this pitch (leads with the free CV scoring hook) — the previous generic tagline ("HR was never as easy as now!") only survives in an unused backup file, not anywhere live.

With self-serve signup now live, the product's access model is a deliberate hybrid rather than pure product-led growth: recruitment/Job Assistant is instant and fully unassisted, while payroll, time & attendance, absences, performance, the wellbeing chatbot, and (temporarily) medical certificate uploads require a short human-guided onboarding call before first use, on any plan. The pitch this supports is "start free in minutes for recruiting, get white-glove setup for the harder HR operations" rather than "buy and self-configure the whole platform."

---

# 14. Marketing Notes

Important information for Marketing.

- Use the real plan names — Free, Momentum, Infinity — not generic tier names like "Starter/Pro/Enterprise."
- Plan-based gating is real and substantial: number of open job postings, number of medical certificate uploads per month, AI wellbeing chatbot access (Momentum/Infinity only, not Free), payroll/time & attendance/absences (locked on Free; usable on Momentum up to 20 employees; usable on Infinity up to 100), performance management (locked on Free and Momentum; usable on Infinity up to 100 employees), and total employee seats (20 on Momentum, 100 on Infinity). All of these are safe to market as plan differentiators. Support tickets are the one module with no plan-based distinction today.
- Storage access control for medical certificates and CVs was significantly hardened (private storage, short-lived signed URLs, company-scoped database access), a best-effort PII redaction pass now runs on medical certificate text before it's sent to the AI provider, and a runtime-adjustable retention/deletion mechanism now exists — but do NOT claim full compliance (e.g. GDPR/HIPAA) yet: the redaction is best-effort (not an ML PII detector, can miss things), the configured retention periods (365 days) are placeholders awaiting a real legal decision, and whether the AI/OCR providers' own terms are acceptable for health data hasn't been reviewed.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT make guarantees about candidate CV data privacy or retention — no documented policy exists in either direction.
- The public Job Assistant (free CV scoring + AI-rewritten CV + voice-based mock interview + coaching report) is the strongest, most differentiated feature in the product — it is the best candidate for a dedicated campaign, and is unaffected by the plan gating described above since it requires no company account.
- A minimal brand (indigo/emerald color palette, Sora/Inter fonts) now exists on the homepage and pricing page — usable as a starting point for campaign creative, but not yet a full brand system (no logo refresh, no broader style guide).
- Self-serve sign-up is now real and can be marketed as such on both properties — it is safe to say a company can sign up and start posting jobs / using the Job Assistant in minutes, with no sales call required. Both this app's own `/pricing` page and the separate `hrinno-marketing` site (www.hrinno.hu) now send every plan button (Free/Momentum/Infinity) straight to signup (a Momentum/Infinity click still creates a Free account first; upgrading happens afterward inside the dashboard).
- Do NOT imply that payroll, time & attendance, absences, performance, the AI wellbeing chatbot, or medical certificate uploads are available immediately after self-serve signup — all six require a manual onboarding call with the team first, regardless of plan, even on Momentum or Infinity. Marketing copy for self-serve signup should frame this honestly (e.g. "get started free with recruiting today; the full HR suite unlocks after a quick setup call") rather than promising instant access to the whole platform. Both this app's `/pricing` page and `hrinno-marketing` now carry a shared disclaimer saying so — keep any new marketing copy consistent with it.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. The most severe pre-launch data-exposure risks identified in the prior version of this brief (public storage URLs for health documents and CVs, unauthenticated candidate-data access) have since been fixed, monetization is functional across most of the product (see Section 11), and a prospective customer can now sign up and reach a working dashboard entirely unassisted. Still not production-hardened — see Section 8 for what remains.

Major blockers

- Self-serve signup now exists and closes the biggest previous gap (a prospect can create an account and start recruiting without any manual step), but it only covers recruitment: payroll, time & attendance, absences, performance, the wellbeing chatbot, and medical certificate uploads still require a manual onboarding call before a self-serve company can use them. Getting the prospect to book that call is now automated (a Calendly-link email at signup plus a one-time reminder), but running the call and flipping the toggle remains manual with no capacity planning behind it. At scale, this still makes the onboarding-call team a potential bottleneck between signup and full product value.
- Monetization is functional and covers most of the product: job posting creation, medical certificate uploads, the wellbeing chatbot, payroll/time & attendance/absences, performance management, and total employee seats all enforce real plan limits. Support tickets are the one module available identically regardless of plan.
- Medical certificate and CV data is still sent to third-party AI/OCR services. Best-effort redaction and a runtime-adjustable retention mechanism now exist (see Section 8), but the retention periods are placeholders pending a real legal decision, and the providers' own data-handling terms for health data haven't been reviewed — still a compliance gap, just a narrower one than before.
- Customers now have an in-app user manual, closing the "new admin has nothing to reference" gap; internal/developer documentation (README, architecture) is still absent, though that's a lower-priority gap for launch readiness than customer-facing docs were.

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

- Should support tickets also be plan-differentiated? It's the one module with no plan-based distinction today; payroll, time & attendance, absences, and performance already are (see Section 11).
- What are the real retention periods for medical certificates and CV data (the mechanism now exists — see Section 8 — but the 365-day values configured today are placeholders, not a legal decision)? Are OCR.Space's and OpenRouter's own data-handling terms acceptable for health data, and is a formal Data Processing Agreement needed with either?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond a weak i18n/commit-language signal.
- Now that a prospect gets an automated Calendly-link email at signup plus a reminder after 3 business days if they haven't booked, what turnaround target (if any) should the team hold itself to for actually running the call and flipping a new company's onboarding toggle? Getting someone to book is now automated; completing the call and the flag-flip itself is still entirely manual with no queue or capacity tooling — worth deciding before self-serve volume grows.

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Fixed a company with no active subscription to permanently fall back to Free-tier limits instead of being blocked outright, and added Stripe webhook handling so a subscription canceled directly on Stripe's side (live or test mode) correctly syncs back to the company record
- Added lightweight funnel tracking (Job Assistant usage → pricing views/clicks → contact form submissions → manually onboarded companies) across this app and `hrinno-marketing`, with a super-admin dashboard, to inform a future self-serve-signup decision
- Added best-effort PII redaction on medical certificate text before it reaches the AI provider, fixed a missing AI-consent checkbox on the certificate upload flow, and built a runtime-adjustable data retention system (settings table, admin UI, daily scheduled deletion) for medical certificates and company-pipeline CVs, verified end-to-end against production
- Verified the `openedpositions` RLS policies directly against production (unscoped "Allow all updates"/"Allow public insert" policies flagged in earlier work no longer exist, confirmed correct rather than re-fixed) and separately fixed the public job board (`positions-public/route.ts`) twice since: to exclude positions with a past `position_end_date` (previously returned unconditionally), and — most recently — to actually honor its own company filter, since a missing join-scoping detail meant it silently returned every company's positions regardless of which company's job board was requested, with company attribution blanked out on every result; this also made every company's own recruiting dashboard show zero open positions instead of its real ones. Also trimmed a log leak in `analyse-cv/route.ts` that logged the AI's full raw response text (candidate-derived) on a JSON-parse failure
- Fixed a login/session bug that made a manager's or admin's role randomly fail to register right after signing in (showing the generic candidate "Apply" action instead of their "Treatment" recruiting action, and denying access to the recruitment stats page) until they logged out and back in: the header's login form was authenticating against its own separate, disconnected client instance instead of the one the rest of the app reads session state from, so the two could race and disagree about who was logged in. Login now goes through a single shared client app-wide
- Shipped self-serve signup (`/signup`): a prospect can now create a company and admin account and land in their dashboard unassisted, on Free by default, with this app's pricing page CTAs now pointing there instead of a contact form. Recruitment and the Job Assistant work immediately; payroll, time & attendance, absences, performance, and the AI wellbeing chatbot are additionally gated behind a new manual "onboarding complete" toggle (super-admin page) that applies regardless of paid plan — existing, already-onboarded companies were grandfathered in as complete so none were retroactively locked out
- Added an in-app user manual, reachable from the admin account menu, covering every currently-live feature with accurate plan limits and role restrictions, stored as Markdown so future content edits don't require a code change (English only for now)
- Aligned the `hrinno-marketing` site's pricing CTAs with this app's own self-serve signup: all three plan buttons now lead straight to `/signup` instead of a contact form, each with its own plan-specific label, and the "self-serve sign-up is coming soon" copy was removed
- Added medical certificate uploads to the onboarding-completion gate as a temporary compliance safeguard (certificate data goes to third-party AI/OCR services with best-effort redaction and placeholder retention periods), reusing the same gate and locked-state UI already covering payroll/attendance/absences/performance/the wellbeing chatbot; existing onboarded companies are unaffected, and a shared "requires onboarding" disclaimer was added to both this app's and `hrinno-marketing`'s pricing pages
- Automated the onboarding-call booking nudge: a new self-serve admin now gets an immediate email with a Calendly link right after signup, plus a one-time reminder if they haven't booked within 3 business days; the super-admin onboarding page now shows whether each company's booking email and reminder have gone out. Only the invitation to book is automated — running the call and flipping a company's onboarding toggle is still a fully manual step

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (payroll, time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, AI wellbeing chatbot access, payroll/time & attendance/absences, performance management, and total employee seats can all be marketed as real plan differentiators (Free / Momentum / Infinity). Support tickets are the one module not plan-gated.
- Continue to hold off on claiming full data-privacy/compliance for medical certificates and CVs — access control, best-effort redaction, and a retention mechanism are now in place, but the retention periods are still placeholders and the AI/OCR providers' own terms for health data haven't been legally reviewed (see Section 18).
- It is now accurate to advertise instant, self-serve signup for recruitment ("start free in minutes, no sales call") on both this app's own pricing page and the `hrinno-marketing` site — both now route every plan button to the same signup flow. Do not extend that promise to payroll, time & attendance, absences, performance, the wellbeing chatbot, or medical certificate uploads — those require a manual onboarding call regardless of plan, and overselling instant access there would set the wrong expectation right after signup.

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment, payroll, time & attendance, absences, performance, and employee wellbeing.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — the most severe data-exposure risks have been fixed, monetization is functional across most of the product, the product has a real homepage, pricing page, and minimal design system, and a new prospect can now sign up and reach a working dashboard entirely unassisted — but it's still not production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting + voice-based mock interview) is a genuine differentiator versus typical employer-only ATS AI tools, and is now the lead hook on both the app's homepage and the separate `hrinno-marketing` site.
- Real plan tiers are Free, Momentum, and Infinity, now correctly priced (a stale test-mode Stripe price ID was found and fixed) and enforced substantially: job postings, medical certificate uploads, wellbeing-chatbot access, payroll/time & attendance/absences, performance management, and total employee seats all differ meaningfully by plan — including a company with no active subscription, which now permanently behaves like the Free plan instead of being blocked. Infinity's differentiation from Momentum isn't just bigger numbers: it's the only plan with performance management and the only one usable past 20 employees, up to 100 (beyond which it's a custom-quote conversation, not self-serve).
- Self-serve signup now exists on this app's own pricing page: a new company can create an account and start recruiting immediately, with no manual step. It's deliberately scoped rather than full-platform — payroll, time & attendance, absences, performance, the wellbeing chatbot, and (temporarily, for compliance reasons) medical certificate uploads stay locked behind a manual, per-company onboarding-call toggle regardless of plan. Getting the prospect to book that call is now automated (an immediate Calendly-link email plus a one-time reminder), but actually running the call and flipping the toggle is still a fully manual step with no capacity tooling behind it.
- Other remaining weaknesses: support tickets are the one module with no plan differentiation at all; medical certificate/CV data still goes to third-party AI/OCR services, and while best-effort redaction and a runtime-adjustable retention mechanism now exist, the retention periods are placeholders and the providers' own terms for health data haven't been legally reviewed.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure and a missing signup path (both now fixed) to partial monetization coverage and the operational scalability of manual onboarding calls.
- Customers now have an in-app user manual covering every live feature, closing the "new admin has nothing to reference" gap this brief previously flagged; internal/developer documentation (README, architecture docs) remains absent.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

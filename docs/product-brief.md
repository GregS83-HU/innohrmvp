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

2026-08-25

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: multiple functional modules exist end-to-end, the most severe data-exposure gaps (medical certificates, CVs, candidate records) have since been closed, plan-based feature gating is real and substantial (job postings, medical certificates, the wellbeing chatbot, time & attendance/absences, performance management, and total employee seats all differ by plan — only support tickets don't), a real public homepage, pricing page, and minimal design system are in place, and a prospect can now sign up and reach a working dashboard entirely unassisted. The Payroll module, previously part of the platform, has been removed entirely as a business decision (see Section 19). Still consistent with an active MVP rather than a production-hardened product: no internal/developer documentation beyond this brief and the in-app user manual, ad hoc per-route admin checks instead of a centralized authorization layer, a newly-documented EU AI Act compliance gap on the candidate-scoring feature (Section 8), and known unresolved workarounds remain.

## Short Description

HRInno is a multi-tenant HR platform that combines AI-assisted recruitment (job postings, AI-generated job descriptions, AI-driven first-round interviews with voice recognition) with core HR operations (time & attendance, absences, performance, medical certificates) and an AI employee-wellbeing chatbot — plus a free, public, candidate-facing tool that scores and improves a CV and runs a mock AI interview. A separate marketing site (`hrinno-marketing`, www.hrinno.hu) carries the same pitch plus an interactive ROI calculator, with CTAs pointing back into this app.

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

HR administrators / company owners. Inferred from the codebase: the app is multi-tenant (organized around a company/org slug), with admin-gated routes for positions and user management. Not stated explicitly in any README or doc — no such document exists.

## Secondary Audience

Recruiters and people managers (candidate pipeline, team performance) and employees (time clock, absences, wellbeing check-ins). Inferred from role-gated features in the code, not from explicit documentation.

## Ideal Customer Profile

Not documented in the codebase. Company size, industry vertical, and geography are not stated anywhere. Weak, non-authoritative signal only: French-language commit messages and built-in French/English/Hungarian i18n suggest a possible French-speaking/EU market, but this is not confirmed.

## Customer Problems

Inferred from the features that were built (not from any stated problem statement):
- Manual, time-consuming resume screening and first-round interviewing
- Poor candidate experience during the application/interview process
- Fragmented HR tooling across time tracking, absences, and performance
- Difficulty monitoring employee engagement/wellbeing on an ongoing basis
- Manual handling of employee medical certificates

---

# 4. Value Proposition

## Why customers choose this product

Not documented as a stated value proposition. Based on the feature set, the apparent pitch is: AI-assisted recruitment and interviewing combined with core HR administration in a single platform, plus a free candidate-facing tool that can serve as a differentiator versus other ATS/HR tools.

## Main Benefits

- Benefit 1: AI-assisted job descriptions, CV screening, and first-round interviewing reduce manual recruiter workload
- Benefit 2: One platform covers recruitment, time/attendance, absences, and performance instead of separate point tools
- Benefit 3: A free, public, self-serve CV-scoring and mock-interview tool gives candidates direct value and can function as an acquisition channel
- Benefit 4: A new company can sign up and start posting jobs immediately with no sales call and no waiting — while the higher-complexity modules (time & attendance, absences, performance, AI wellbeing chatbot) and, temporarily, medical certificate uploads are deliberately held behind a short guided onboarding call rather than left for the customer to configure alone, trading a small amount of friction for a safer first experience with those modules

## Competitive Advantages

The clearest differentiator found in the code is the public, candidate-facing Job Assistant (free CV scoring, AI-rewritten CV, voice-based mock interview, AI coaching report) — most HR/ATS tools build AI screening only for the employer side, not as a free tool for candidates. No competitor comparison exists in the repo to confirm this is unique in the market (see Section 12).

---

# 5. Current Features

List ONLY completed features, based on what exists in the code.

## Authentication

- Supabase-based authentication
- Multi-tenant company/organization accounts (org slug-based)
- Self-serve signup (`/signup`): a prospect creates a brand-new company and its first admin account in one step — company name, admin name, work email, and password — and is logged straight into their dashboard immediately, with no manual step from the team. The new company starts on the Free plan.
- Admin-gated routes for positions and user management

## Dashboard

- Per-company SaaS entry point at `/jobs/[slug]` — reached only by someone who knows their company's slug (not discoverable/indexed). Not logged in: company branding (logo/name) and a login prompt. Logged in: "Welcome back" plus a role-aware grid of quick links to the company's HR tools (positions, HR tools, performance, time clock, absences, and for admins: subscription, users, tickets).
- Distinct from the public homepage at `/` (see Marketing/Public Site below), which the previous version of this brief mistakenly conflated with this dashboard.

## Marketing / Public Site

- Public homepage (`/`, no company slug) leads with the free Job Assistant (AI CV scoring, no account needed) as the primary hook, with a "For employers" section below introducing the full platform and a link to the new pricing page.
- Pricing page (`/pricing`): three columns (Free / Momentum / Infinity) with real limits and prices pulled from Stripe/the `forfait` table, a note that downgrading never deletes existing data, a note that time & attendance/absences/performance/the wellbeing chatbot/medical certificate uploads all additionally require a completed onboarding call regardless of plan, and every plan's button now leads to the self-serve signup flow rather than a contact form or demo request — including Momentum and Infinity, since every new company starts on Free and upgrades afterward from inside the dashboard (see Pricing, Section 11).
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu), also exists and carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, and the same pricing data, plus an interactive ROI calculator. Its pricing buttons (Free/Momentum/Infinity) now also lead straight to this app's self-serve signup flow, each with its own plan-specific label, matching this app's own pricing page — previously they led to a contact form and stated self-serve sign-up was "coming soon." It carries the same onboarding-completion disclaimer as this app's pricing page. A separate, unrelated "want this automation in your company" contact CTA elsewhere on that site is unchanged.
- Legal pages (privacy notice, terms, cookies, impressum) are now reachable from every public-site page: the footer's links to them previously 404'd for any visitor on the homepage or the public Job Assistant (only company-scoped versions of these pages existed). Root-level versions now exist and render the same content. The privacy notice itself was also completed: it previously omitted OCR.Space (used for medical certificate text extraction) from its list of third-party services, and stated data is deleted "automatically every night" while the terms of service already said "after 30 days" — both now say 30 days consistently, matching the actual retention configuration (see Settings below).
- Lightweight funnel tracking now exists across this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact form submissions, ROI calculator use, signup started/completed, and onboarding-marked-complete are logged (with an anonymous session id, no CV/interview content) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`). A manual field on the `company` record can still link a company onboarded before self-serve signup existed back to the contact submission that led to it — see `FUNNEL_TRACKING.md`.

## AI Features

- AI-generated job descriptions (with a known workaround for a broken prompt-variable helper — see Section 8)
- AI CV scoring and CV improvement (Job Assistant, public/candidate-facing). The public Job Assistant's CV upload now requires checking an AI-processing consent box before the file is sent to the third-party AI service (previously the checkbox copy existed in the translation files but wasn't wired into the page, so no consent was actually collected). This flow has no database persistence layer at all — the CV is parsed and scored in memory and never stored — so there is nothing to log a consent timestamp against; the checkbox is purely a client-side gate on whether the request is sent.
- AI-driven first-round interviews, including voice recognition, for both internal recruitment and the public Job Assistant
- AI interview scoring and coaching reports
- AI employee happiness/wellbeing chatbot with pulse check-ins — now gated to companies whose plan includes it (Momentum and Infinity; not Free)
- AI-based candidate scoring/ranking (company-side recruitment pipeline, `/api/analyse-cv` and `/api/analyse-massive`) is now documented as falling under the EU AI Act's high-risk classification (Annex III, point 4(a): recruitment/candidate evaluation) — see Known Limitations for what that means and what's currently unmet.

## Documents

- Medical certificate upload, listing, and download, with AI-based OCR text extraction. Files are stored in a private bucket and viewed via short-lived signed URLs generated on demand (previously a public URL was also generated for every upload); monthly upload volume is capped per the company's plan. Before the OCR'd text is sent to the AI provider for extraction, a best-effort regex redaction pass now strips likely national ID numbers, phone numbers, and addresses (dates are protected so extraction still works); this is not a guarantee of complete PII removal. The upload flow now also requires an AI-processing consent checkbox before any document is sent to OCR/AI — previously this page had no consent UI at all, so the consent-date field was never populated. Uploading (listing and downloading are unaffected) now additionally requires the company's onboarding call to be complete, on any plan — see Settings below for why.
- CV upload and parsing (Job Assistant, and separately for company-side recruitment pipelines). Company-side CVs are stored privately and viewed via short-lived signed URLs, generated only for users confirmed to belong to the company that owns the position the candidate applied to. CV content sent to the AI provider was audited and found already minimal (CV text/job description only, no extra PII fields) — no redaction applied here, since name/contact info is needed for the product to function (candidate-to-job matching).

## Settings

- Stripe-based subscription management page (view plan status, manage billing via Stripe customer portal)
- Plan-based feature gating: a single server-side helper checks a company's plan (`company.forfait`) before allowing new job postings, new medical certificate uploads, wellbeing-chatbot sessions, time & attendance/absences actions, performance-management actions, and adding a new employee (seat cap), using per-plan limits/flags stored in the `forfait` table. Time & attendance/absences and performance are "locked preview" on plans that don't include them — admins can see the module but not enter real data; everyone else simply doesn't see it in navigation. A company with no active plan permanently behaves like the Free plan for every one of these checks, rather than being blocked outright. See Section 11 for the actual plan tiers and Section 8 for what is and isn't covered by this.
- Onboarding-completion gate: separate from and on top of the plan-based check above, time & attendance, absences, performance management, the AI wellbeing chatbot, and medical certificate uploads are unavailable to any company — including one already paying for Momentum or Infinity — until the team manually marks that company's onboarding as complete. A company admin who hits one of these modules before then sees a clear "available after your onboarding call" message with a contact link, not a broken page. Every company onboarded manually before this feature existed was grandfathered in as already complete, so no existing customer was retroactively locked out. Recruitment/job postings and the Job Assistant are explicitly not subject to this gate.
  - Medical certificate uploads were added to this gate for a different reason than the other four: not because the feature is complex to learn, but as a temporary compliance safeguard. Certificate uploads send employee health data to third-party AI/OCR services with best-effort (not guaranteed) redaction, and while the retention period itself is now formally set (30 days, matching the privacy notice), the providers' own subprocessor terms for health data haven't been legally reviewed — see Known Limitations. The locked-state message for this specific module says so explicitly, rather than implying a training gate. Intent is to remove this one from the gate once that pending legal review is complete — the other four modules are not expected to be removed from the gate on the same timeline.
- Automated onboarding-call booking: right after self-serve signup, the new admin automatically gets an email with a Calendly link to book the onboarding call (skipped for companies already grandfathered as onboarded). If they haven't booked within 3 business days, a one-time reminder email goes out automatically with the same link. This only automates getting the prospect to book — actually running the call and flipping the company to onboarded is still a fully manual step (see Administration below); nothing marks a company onboarded automatically based on a booked or completed call.
- Data retention settings (super-admin only, `/admin/data-retention`): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable from this page with zero code change or redeploy, with a visible audit trail (who changed what, when) and a live preview of what the next scheduled deletion run would delete. A daily scheduled job (03:00 UTC) deletes data older than whatever is currently configured. The configured period is now 30 days for both data types, a deliberate product decision that aligns the actual sweep behavior with what the published privacy notice and terms of service already stated — replacing the 365-day placeholder used to first demonstrate the mechanism. This changes the configured number and logs it to the audit trail; it does not itself delete anything retroactively — deletion happens on the next scheduled run. See Section 8 for what's still open (the scheduled job's required `CRON_SECRET` environment variable, and whether the AI/OCR providers' own data-handling terms are acceptable for health data).

## Help & Documentation

- In-app user manual, reachable from the logged-in admin's account menu ("User Guide"). A browsable, searchable guide covering every currently-live feature — recruitment/job postings, AI job descriptions, medical certificates, time & attendance, absences, performance, the wellbeing chatbot, user management, subscription & billing, and support tickets — written in plain customer-facing language with accurate plan limits and role restrictions for each. Content is stored as Markdown files rather than hardcoded in the app, so updating it going forward is a text edit, not a code change. English only today; the content structure is ready for French/Hungarian translation later but that hasn't been done yet.

## Notifications

Not confirmed in the codebase.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## Administration

- Manual onboarding-completion toggle (super-admin only, `/jobs/[slug]/admin/onboarding`): a simple per-company list with current status and a one-click toggle, used by the team to unlock a self-serve company's higher-complexity modules once its setup call is done. The list also shows, per company, whether the automated booking email and reminder have been sent (see Settings), so the team can see who hasn't engaged yet without checking Calendly by hand. Marking a company onboarded itself is still purely manual — nothing about the toggle or the trigger to flip it is automated.
- Bulk user import and user creation
- Job posting / position management (public and private postings) — creating a new open position is capped per the company's plan. The public job board now excludes positions whose `position_end_date` has passed (previously showed every position ever created, closed or not); RLS on `openedpositions` was verified directly against production and confirmed already correctly scoped (company-scoped insert/update, intentionally public read for the job board). Separately, the public job board endpoint itself was found silently ignoring its own company filter (a query bug, not an RLS gap) and returning every company's positions regardless of which company's job board was requested, with the company attribution blanked out on every result — this also meant a company's own recruiting dashboard showed zero open positions instead of its real ones. Now fixed: each company's job board and recruiting dashboard correctly show only that company's own positions — see Section 19.
- Recruitment pipeline / applicant tracking, restricted so a user can only view or edit candidates for positions owned by their own company
- Time & attendance (time clock, employee and manager views)
- Absence tracking (calendar-based)
- Performance management (goals, pulse surveys, team performance)
- Internal support tickets / feedback forms

---

# 6. Features In Development

Based on the most recent commit and work history (not a formally stated roadmap):

- Time & attendance, absences, and performance management already have plan-based (Free vs. Momentum vs. Infinity) gating (see Section 11) — support tickets are the one remaining module with no plan-based distinction, and extending gating there is not in progress.

Expected value and priority are not documented for the above or for anything else; there is no formally stated in-development feature list beyond what can be inferred from recent work.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- Plan-based feature gating (Free vs. Momentum vs. Infinity) is real and substantial, covering opening a new job position, medical certificate uploads, the AI wellbeing chatbot, time & attendance/absences (locked on Free; usable on Momentum up to 20 employees; usable on Infinity up to 100), performance management (locked on Free and Momentum; usable on Infinity up to 100 employees), and total employee seats (20 on Momentum, 100 on Infinity, beyond which it's not self-serve — a "contact us for a custom quote" state). Support tickets are the one module with no plan-based distinction today.
- Customers now have an in-app user manual (Section 5, Help & Documentation), but internal/developer-facing documentation is still absent — the README remains unmodified Next.js boilerplate, and this brief is still the only business-facing document in the repo.
- Self-serve signup is scoped, not full-platform: a brand-new company can sign up and use recruitment/Job Assistant completely unassisted, but time & attendance, absences, performance, the AI wellbeing chatbot, and medical certificate uploads all stay locked behind a manual onboarding-completion toggle regardless of plan (Section 5, Settings). Getting the prospect to book a call is now automated (Calendly link at signup, one-time reminder after 3 business days), but everything after that — actually running the call and flipping the toggle — is still a manual, one-at-a-time action with no capacity-planning tooling attached. If self-serve signups grow faster than the team's ability to run setup calls, new customers will have booked a call but still have no visibility into when it'll actually happen or when the modules will unlock.
- Medical certificate and CV data are still sent to third-party services (OCR.Space, OpenRouter/OpenAI). A best-effort regex redaction pass (national ID/phone/address) now runs on medical certificate text before that AI call, and a missing AI-consent checkbox on the certificate upload page was fixed — but this redaction is not a guarantee (fixed regex patterns, not an ML PII detector, so unusual/non-Hungarian formats can still get through). The privacy notice previously omitted OCR.Space from its list of third-party services entirely; that omission is now fixed (OCR.Space is listed in all three locales), but whether OCR.Space's/OpenRouter's own data-handling terms are acceptable for health data, or whether a formal Data Processing Agreement is needed with either, still has not been reviewed (see `REDACTION_RETENTION_FIX.md`). As an interim mitigation for this specific gap, medical certificate uploads for brand-new self-serve companies are now held behind the onboarding-completion gate (Section 5, Settings) until this review is done — this doesn't reduce the underlying exposure for already-onboarded companies, who can upload today as they always could.
- A runtime-adjustable data retention mechanism now exists (`data_retention_settings` table, admin UI, daily scheduled deletion job) for medical certificates and company-pipeline CV data, verified end-to-end against production. Job Assistant CV data still has no persistence layer at all (confirmed, not just unconfirmed, by tracing every route — nothing touches Supabase), so there's nothing for that data type to delete. The configured retention period is now 30 days for every data type, a deliberate product decision that replaces the earlier 365-day placeholder and matches what the privacy notice and terms of service publicly state — no longer an arbitrary number, though it has not been independently legally reviewed as a compliance-correct figure. The daily deletion job also depends on a `CRON_SECRET` environment variable being set in the production deployment; as of the most recent change touching this area, that had not yet been confirmed set, which would leave the sweep silently not running even though the configured period is now correct.
- AI-based candidate scoring/ranking (`/api/analyse-cv`, `/api/analyse-massive`) has been documented as falling under the EU AI Act's high-risk classification (Annex III, point 4(a) — recruitment/candidate evaluation systems), whose obligations became applicable 2 August 2026. None of the associated requirements currently exist: a documented risk-management process, data-governance review of the scoring prompts/data for bias, technical documentation of the scoring logic, structured logging of individual scoring events for audit purposes, documented human-oversight measures, a candidate-facing "AI is used to evaluate you" notice, or a conformity assessment. This is a documentation-only finding so far (no behavior change) — final compliance determination and remediation priority require legal review (see `COMPLIANCE.md`).
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

- No Stripe price attached (default/no-payment tier). Grants: up to 2 open job positions, up to 5 medical certificate uploads/month, no AI wellbeing chatbot access, 50 included AI credits. Time & attendance and absences are visible to admins as a locked preview only (not usable for real data entry); performance management is likewise locked.

Momentum

- Paid tier (Stripe price `price_1S9ezYBqOCxgBpW2elkKzqUB`, live-mode "HR Inno - Momentum" — 20 000 HUF/month). Grants: up to 5 open job positions, up to 10 medical certificate uploads/month, AI wellbeing chatbot access, 100 included AI credits. Time & attendance and absences are usable for up to 20 employees. Performance management is still locked (same as Free).

Infinity

- Paid tier (Stripe price `price_1S9ezpBqOCxgBpW26j6WvxOE`, live-mode "HR Inno - Infinity" — 45 000 HUF/month). Grants: up to 10 open job positions, up to 20 medical certificate uploads/month, AI wellbeing chatbot access, 250 included AI credits. Time & attendance, absences, and performance management are all usable, for up to 100 employees. Adding an employee beyond 100 isn't self-serve — the app shows a "contact us for a custom quote" state rather than a hard block.

Notes

- Plan names are Free / Momentum / Infinity — not the Starter/Pro/Enterprise naming previously assumed in this document before the actual `forfait` table was inspected.
- A company with no active plan (`forfait` is null — the state both before ever subscribing and immediately after canceling/expiry) permanently behaves like the Free plan for every gated feature, not blocked outright. This is not a temporary grace period — "no plan" and "Free plan" are treated as identical going forward. A company that had more items than Free's caps allow before downgrading (e.g. 8 open positions on Infinity, dropping to Free's cap of 2) keeps full read/edit/close access to everything it already has; only creating new items beyond the cap is blocked.
- A Stripe subscription canceled directly on Stripe's side (not through the app's own cancel button) is now correctly synced back to the company record via a `customer.subscription.deleted` webhook handler (plus a narrower `customer.subscription.updated` handler for cancellations reported that way), clearing the plan to the same null/Free-fallback state as an in-app cancellation.
- Per-plan limits/flags live in the `forfait` table and are read live by the app, not hardcoded — changing a plan's limits in Supabase takes effect without a code deploy.
- AI credits (`included_ai_credits` / `used_ai_credits`) are metered per API call (e.g. CV analysis, medical certificate OCR) independently of the gated features above; this metering was already implemented before the recent gating work and is unchanged.
- Plan-tier gating (Free vs. Momentum vs. Infinity) covers job posting creation, medical certificate uploads, the AI wellbeing chatbot, time & attendance/absences, performance management, and total employee seat count. Support tickets are the only module with no plan-based distinction in the data model (see Section 8).
- Every new company created through self-serve signup starts on Free automatically (no plan is selected during signup itself, even if the visitor clicked a Momentum or Infinity button on the pricing page). Upgrading to a paid plan is a separate step taken afterward from inside the dashboard's existing subscription page, unchanged by this update. On Free, this means attendance/absences/performance are locked by plan tier in addition to the onboarding gate below — upgrading alone isn't enough to unlock them without also completing onboarding.
- Time & attendance, absences, performance, the AI wellbeing chatbot, and medical certificate uploads are additionally withheld from every self-serve company — on any plan, including paid ones — until the team manually marks that company's onboarding as complete (Section 5, Settings). This onboarding gate is independent of, and layered on top of, the plan-tier limits described above. Medical certificate uploads are in this list as a temporary compliance safeguard, not a training gate like the other four — see Known Limitations.

---

# 12. Competitors

Not documented in the codebase. No competitor names, comparisons, or market research files exist in the repo.

| Competitor | Strength | Weakness |
|------------|-----------|-----------|
| | | |

---

# 13. Positioning

Not formally defined as a written statement, but the homepage hero now states a clear positioning: lead with the free, no-account Job Assistant as the candidate-facing hook ("Get your CV scored, free before you apply"), with the full HR platform (recruitment, time & attendance, absences, performance) positioned as what a company gets once a candidate becomes a lead. The `hrinno-marketing` site carries an aligned version of this pitch. The `<meta name="description">` (`src/app/layout.tsx`) is also already aligned with this pitch (leads with the free CV scoring hook) — the previous generic tagline ("HR was never as easy as now!") only survives in an unused backup file, not anywhere live.

With self-serve signup now live, the product's access model is a deliberate hybrid rather than pure product-led growth: recruitment/Job Assistant is instant and fully unassisted, while time & attendance, absences, performance, the wellbeing chatbot, and (temporarily) medical certificate uploads require a short human-guided onboarding call before first use, on any plan. The pitch this supports is "start free in minutes for recruiting, get white-glove setup for the harder HR operations" rather than "buy and self-configure the whole platform."

---

# 14. Marketing Notes

Important information for Marketing.

- Use the real plan names — Free, Momentum, Infinity — not generic tier names like "Starter/Pro/Enterprise."
- Plan-based gating is real and substantial: number of open job postings, number of medical certificate uploads per month, AI wellbeing chatbot access (Momentum/Infinity only, not Free), time & attendance/absences (locked on Free; usable on Momentum up to 20 employees; usable on Infinity up to 100), performance management (locked on Free and Momentum; usable on Infinity up to 100 employees), and total employee seats (20 on Momentum, 100 on Infinity). All of these are safe to market as plan differentiators. Support tickets are the one module with no plan-based distinction today.
- Storage access control for medical certificates and CVs was significantly hardened (private storage, short-lived signed URLs, company-scoped database access), a best-effort PII redaction pass now runs on medical certificate text before it's sent to the AI provider, and the data retention period is now formally set to 30 days (matching the public privacy notice/terms of service, replacing an earlier 365-day placeholder) — but do NOT claim full compliance (e.g. GDPR/HIPAA) yet: the redaction is best-effort (not an ML PII detector, can miss things), and whether the AI/OCR providers' own terms are acceptable for health data hasn't been reviewed.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT claim the AI candidate-scoring feature is EU AI Act compliant. It has been documented as high-risk under the Act (recruitment/candidate evaluation), and none of the associated obligations are currently met — this is a legal-review item, not a marketing claim to make either way, positive or reassuring.
- Do NOT make guarantees about candidate CV data privacy or retention beyond what the privacy notice/terms of service now state (30-day retention) — no further documented policy exists.
- The public site's legal pages (privacy notice, terms, cookies, impressum) previously 404'd from the homepage and public Job Assistant footer; they're now reachable everywhere, so it's safe to link them in campaign landing pages without risk of a broken link.
- The public Job Assistant (free CV scoring + AI-rewritten CV + voice-based mock interview + coaching report) is the strongest, most differentiated feature in the product — it is the best candidate for a dedicated campaign, and is unaffected by the plan gating described above since it requires no company account.
- A minimal brand (indigo/emerald color palette, Sora/Inter fonts) now exists on the homepage and pricing page — usable as a starting point for campaign creative, but not yet a full brand system (no logo refresh, no broader style guide).
- Self-serve sign-up is now real and can be marketed as such on both properties — it is safe to say a company can sign up and start posting jobs / using the Job Assistant in minutes, with no sales call required. Both this app's own `/pricing` page and the separate `hrinno-marketing` site (www.hrinno.hu) now send every plan button (Free/Momentum/Infinity) straight to signup (a Momentum/Infinity click still creates a Free account first; upgrading happens afterward inside the dashboard).
- Do NOT imply that time & attendance, absences, performance, the AI wellbeing chatbot, or medical certificate uploads are available immediately after self-serve signup — all five require a manual onboarding call with the team first, regardless of plan, even on Momentum or Infinity. Marketing copy for self-serve signup should frame this honestly (e.g. "get started free with recruiting today; the full HR suite unlocks after a quick setup call") rather than promising instant access to the whole platform. Both this app's `/pricing` page and `hrinno-marketing` now carry a shared disclaimer saying so — keep any new marketing copy consistent with it.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. The most severe pre-launch data-exposure risks identified in the prior version of this brief (public storage URLs for health documents and CVs, unauthenticated candidate-data access) have since been fixed, monetization is functional across most of the product (see Section 11), and a prospective customer can now sign up and reach a working dashboard entirely unassisted. Still not production-hardened — see Section 8 for what remains.

Major blockers

- Self-serve signup now exists and closes the biggest previous gap (a prospect can create an account and start recruiting without any manual step), but it only covers recruitment: time & attendance, absences, performance, the wellbeing chatbot, and medical certificate uploads still require a manual onboarding call before a self-serve company can use them. Getting the prospect to book that call is now automated (a Calendly-link email at signup plus a one-time reminder), but running the call and flipping the toggle remains manual with no capacity planning behind it. At scale, this still makes the onboarding-call team a potential bottleneck between signup and full product value.
- Monetization is functional and covers most of the product: job posting creation, medical certificate uploads, the wellbeing chatbot, time & attendance/absences, performance management, and total employee seats all enforce real plan limits. Support tickets are the one module available identically regardless of plan.
- Medical certificate and CV data is still sent to third-party AI/OCR services. Best-effort redaction and a runtime-adjustable retention mechanism now exist and the retention period has been formally set to 30 days to match the public privacy notice (see Section 8), but the AI/OCR providers' own data-handling terms for health data still haven't been reviewed, and the daily deletion job's environment dependency (`CRON_SECRET`) had not been confirmed set as of the most recent related change — still a compliance gap, just a narrower one than before.
- The AI candidate-scoring feature (core to the recruitment pitch) has been documented as high-risk under the EU AI Act, with an applicability date that has already passed and none of the associated obligations (risk management, data governance, technical documentation, logging, human oversight, candidate transparency notice, conformity assessment) currently met. This is a new, EU-market-relevant legal-risk item that didn't exist in the prior version of this brief — see Section 8 and `COMPLIANCE.md`.
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

- Should support tickets also be plan-differentiated? It's the one module with no plan-based distinction today; time & attendance, absences, and performance already are (see Section 11).
- Retention periods for medical certificates and CV data are now formally set to 30 days, matching the published privacy notice and terms of service (Section 8) — but are OCR.Space's and OpenRouter's own data-handling terms acceptable for health data, and is a formal Data Processing Agreement needed with either? Also: has the `CRON_SECRET` environment variable actually been confirmed set in production, without which the daily deletion job would not run despite the correct configured period?
- What is the realistic remediation plan and timeline for the AI candidate-scoring feature's EU AI Act high-risk obligations, given the applicability date (2 August 2026) has already passed? Should a candidate-facing "AI is used to evaluate you" notice be added to the application flow, and is a lighter-weight interim risk-management/logging measure feasible before full technical documentation and a conformity assessment are built out (see `COMPLIANCE.md`)?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond a weak i18n/commit-language signal.
- Now that a prospect gets an automated Calendly-link email at signup plus a reminder after 3 business days if they haven't booked, what turnaround target (if any) should the team hold itself to for actually running the call and flipping a new company's onboarding toggle? Getting someone to book is now automated; completing the call and the flag-flip itself is still entirely manual with no queue or capacity tooling — worth deciding before self-serve volume grows.

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Decommissioned the Payroll module entirely (business decision: ongoing Hungarian tax/contribution compliance maintenance, not differentiated versus dedicated payroll providers, diluted the AI-first positioning). All payroll UI, API routes, and application code are removed — the customer-facing product no longer has a Payroll feature. The accompanying database migration archives existing payroll data into a locked-down schema (not exposed via the API) before dropping the live payroll tables. Time & attendance, absences, and performance management are unaffected; only the internal name of the entitlement flag they share changed (`access_payroll_attendance_absences` → `access_attendance_absences`), not its gating behavior
- Documented that the AI-based candidate scoring/ranking feature falls under the EU AI Act's high-risk classification (recruitment/candidate evaluation), with several associated obligations currently unmet. Documentation-only so far, no behavior change — see Section 8 and `COMPLIANCE.md`
- Formally set the data retention period to 30 days for medical certificates and company-pipeline CV data, replacing the earlier 365-day placeholder, to match what the privacy notice and terms of service already publicly stated
- Completed the privacy notice: added OCR.Space (previously missing) to the list of third-party services that process data, and corrected the stated retention wording to match the terms of service and the actual 30-day configuration
- Added a missing AI-processing consent checkbox to the public, no-account Job Assistant CV demo (the checkbox copy existed in the translations but wasn't wired into the page, so no consent was actually being collected before a CV was sent to the AI provider)
- Fixed the public site's legal pages (privacy notice, terms, cookies, impressum): footer links to them 404'd from the homepage and the public Job Assistant, since only company-scoped versions of these pages existed. Root-level versions now exist and render identical content
- Added lightweight funnel tracking (Job Assistant usage → pricing views/clicks → contact form submissions → manually onboarded companies) across this app and `hrinno-marketing`, with a super-admin dashboard, to inform a future self-serve-signup decision
- Added best-effort PII redaction on medical certificate text before it reaches the AI provider, fixed a missing AI-consent checkbox on the certificate upload flow, and built a runtime-adjustable data retention system (settings table, admin UI, daily scheduled deletion) for medical certificates and company-pipeline CVs, verified end-to-end against production
- Fixed the public job board (`positions-public/route.ts`) to exclude positions with a past `position_end_date`, and separately fixed it to actually honor its own company filter — a missing join-scoping detail meant it silently returned every company's positions regardless of which company's job board was requested, with company attribution blanked out on every result; this also made every company's own recruiting dashboard show zero open positions instead of its real ones
- Fixed a login/session bug that made a manager's or admin's role randomly fail to register right after signing in until they logged out and back in: the header's login form authenticated against its own disconnected client instance instead of the one the rest of the app reads session state from. Login now goes through a single shared client app-wide
- Shipped self-serve signup (`/signup`): a prospect can now create a company and admin account and land in their dashboard unassisted, on Free by default. Recruitment and the Job Assistant work immediately; time & attendance, absences, performance, the AI wellbeing chatbot, and medical certificate uploads are additionally gated behind a manual "onboarding complete" toggle (super-admin page) that applies regardless of paid plan

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, AI wellbeing chatbot access, time & attendance/absences, performance management, and total employee seats can all be marketed as real plan differentiators (Free / Momentum / Infinity). Support tickets are the one module not plan-gated.
- Continue to hold off on claiming full data-privacy/compliance for medical certificates and CVs — access control, best-effort redaction, and a formally-set 30-day retention period are now in place, but the AI/OCR providers' own terms for health data haven't been legally reviewed (see Section 18).
- Do not make any compliance claim about the AI candidate-scoring feature. It has been documented as high-risk under the EU AI Act with most obligations currently unmet — this is a legal-review and remediation item, not something to reference in marketing either as a risk or as a reassurance, until legal review is complete (see Section 18).
- It is now accurate to advertise instant, self-serve signup for recruitment ("start free in minutes, no sales call") on both this app's own pricing page and the `hrinno-marketing` site — both now route every plan button to the same signup flow. Do not extend that promise to time & attendance, absences, performance, the wellbeing chatbot, or medical certificate uploads — those require a manual onboarding call regardless of plan, and overselling instant access there would set the wrong expectation right after signup.

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment, time & attendance, absences, performance, and employee wellbeing.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — the most severe data-exposure risks have been fixed, monetization is functional across most of the product, the product has a real homepage, pricing page, and minimal design system, and a new prospect can now sign up and reach a working dashboard entirely unassisted — but it's still not production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting + voice-based mock interview) is a genuine differentiator versus typical employer-only ATS AI tools, and is now the lead hook on both the app's homepage and the separate `hrinno-marketing` site.
- Real plan tiers are Free, Momentum, and Infinity, now correctly priced (a stale test-mode Stripe price ID was found and fixed) and enforced substantially: job postings, medical certificate uploads, wellbeing-chatbot access, time & attendance/absences, performance management, and total employee seats all differ meaningfully by plan — including a company with no active subscription, which now permanently behaves like the Free plan instead of being blocked. Infinity's differentiation from Momentum isn't just bigger numbers: it's the only plan with performance management and the only one usable past 20 employees, up to 100 (beyond which it's a custom-quote conversation, not self-serve).
- Self-serve signup now exists on this app's own pricing page: a new company can create an account and start recruiting immediately, with no manual step. It's deliberately scoped rather than full-platform — time & attendance, absences, performance, the wellbeing chatbot, and (temporarily, for compliance reasons) medical certificate uploads stay locked behind a manual, per-company onboarding-call toggle regardless of plan. Getting the prospect to book that call is now automated (an immediate Calendly-link email plus a one-time reminder), but actually running the call and flipping the toggle is still a fully manual step with no capacity tooling behind it.
- Other remaining weaknesses: support tickets are the one module with no plan differentiation at all; medical certificate/CV data still goes to third-party AI/OCR services, and while best-effort redaction now exists and the retention period is formally set to 30 days (matching the public privacy notice), the providers' own terms for health data haven't been legally reviewed. A newly-documented weakness: the AI candidate-scoring feature (a core recruitment differentiator) has been found to fall under the EU AI Act's high-risk classification, with most of the associated legal obligations currently unmet and the applicability date already passed.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure and a missing signup path (both now fixed) to partial monetization coverage, the operational scalability of manual onboarding calls, and now the AI Act compliance gap on candidate scoring.
- Customers now have an in-app user manual covering every live feature, closing the "new admin has nothing to reference" gap this brief previously flagged; internal/developer documentation (README, architecture docs) remains absent.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

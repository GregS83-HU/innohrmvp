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

2026-09-13

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: the product now covers a genuinely broad set of end-to-end HR workflows (recruitment/ATS with two AI interview mechanisms — now both delivered with the same voice-enabled experience — plus a standalone public candidate-coaching tool, time & attendance, absences, medical certificates, performance management, an AI employee-wellbeing chatbot, and support tickets), every plan-gateable module (job postings, medical certificates, the wellbeing chatbot, attendance/absences, performance management, advanced recruitment reporting, and support tickets) enforces real plan rules, a self-serve signup flow lets a prospect reach a working dashboard unassisted, and authorization has undergone a substantial, centralized hardening pass (`lib/authz/`) closing 16 confirmed critical/high-severity access-control vulnerabilities. Two previously dead UI controls (a job-posting "upgrade" button and a wellbeing-dashboard "export" button) have also since been removed. Medical certificates no longer involve any third-party AI or OCR service at all — a company admin now manually enters the employee name and sickness dates instead of an AI/OCR pipeline extracting them, closing what was previously the product's most sensitive health-data exposure. The four public legal pages have been substantively rewritten to describe the real, paid product (not a demo), with an accurate list of data categories, third-party processors, retention periods, and data-subject rights, and the cookie-consent banner now genuinely gates optional analytics rather than only displaying a choice with no effect. The impressum now carries the operator's real name and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) rather than placeholders, and honestly discloses that no business entity (sole trader or company) is registered yet — but none of the four pages have been reviewed by qualified legal counsel, and whether operating without a registered business entity is appropriate for a paid product processing health data at this scale is an open question (see Open Questions). Pricing has just been overhauled from two flat-fee tiers to base-fee-plus-per-employee pricing on Core (capped at 30 employees) and Growth (requires 31+), with a one-time onboarding fee, optional annual billing, and a manually-applied founding-customer discount — real, working code, but not yet exercised by a real paying customer, and self-serve tier/interval switching for an already-subscribed company isn't built yet. Still consistent with an active MVP rather than a production-hardened product: support-ticket notification emails are still mocked and never actually sent, a documented EU AI Act compliance gap remains open on the candidate-scoring feature, and there is still no internal/developer documentation beyond this brief and the in-app user manual.

## Short Description

HRInno is a multi-tenant HR platform that combines AI-assisted recruitment (job postings, AI-generated job descriptions, a Trello-style applicant pipeline, AI CV scoring at both individual and bulk-database scale, and two distinct AI-driven interview mechanisms) with core HR operations (time & attendance, absence management, medical certificates, performance management with weekly pulse check-ins), an AI employee-wellbeing chatbot, a support-ticket helpdesk, and a free, public, candidate-facing tool that scores a CV, rewrites it, and runs a voice-enabled AI mock interview with a coaching report. A separate marketing site (`hrinno-marketing`, www.hrinno.hu) carries the same pitch plus an interactive ROI calculator, with CTAs pointing back into this app.

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

HR administrators / company owners. Inferred from the codebase: the app is multi-tenant (organized around a company/org slug), with admin-gated routes for positions, user management, billing, and all higher-complexity HR modules.

## Secondary Audience

Recruiters and people managers (candidate pipeline, team performance, timeclock/leave approvals) and employees (time clock, absence requests, performance goals/pulse, wellbeing check-ins, support tickets). Inferred from role-gated features in the code, not from explicit documentation.

## Ideal Customer Profile

Not documented in the codebase. Company size, industry vertical, and geography are not stated anywhere. Weak, non-authoritative signals only: French-language code comments, Hungarian-specific OCR/business-day logic, and built-in English/French/Hungarian localization suggest a possible Hungarian/French-speaking EU market, but this is not confirmed by any explicit statement.

## Customer Problems

Inferred from the features that were built (not from any stated problem statement):
- Manual, time-consuming resume screening and first-round interviewing
- Poor candidate experience during the application/interview process
- Fragmented HR tooling across time tracking, absences, and performance
- Difficulty monitoring employee engagement/wellbeing on an ongoing basis
- Manual handling of employee medical certificates
- No structured way to track and follow up on individual employee goals week to week

---

# 4. Value Proposition

## Why customers choose this product

Not documented as a stated value proposition. Based on the feature set, the apparent pitch is: AI-assisted recruitment and interviewing combined with core HR administration in a single platform, plus a free candidate-facing tool that can serve as an acquisition channel.

## Main Benefits

- Benefit 1: AI-assisted job descriptions, CV screening (single and bulk-database re-scoring against a new opening), and two distinct AI interview mechanisms reduce manual recruiter workload
- Benefit 2: One platform covers recruitment, time/attendance, absences, medical certificates, performance management, and employee wellbeing instead of separate point tools
- Benefit 3: A free, public, self-serve CV-scoring, CV-rewriting, and voice-based mock-interview tool gives candidates direct value and functions as a top-of-funnel acquisition channel (it is explicitly instrumented for funnel tracking, not just a goodwill feature)
- Benefit 4: A new company can sign up and start posting jobs immediately with no sales call and no waiting — while the higher-complexity modules (time & attendance, absences, performance, the AI wellbeing chatbot) and, temporarily, medical certificate uploads are deliberately held behind a short guided onboarding call rather than left for the customer to configure alone, trading a small amount of friction for a safer first experience with those modules

## Competitive Advantages

The clearest differentiator found in the code is the public, candidate-facing Job Assistant (free CV scoring, AI-rewritten CV with a downloadable .docx, a genuinely voice-enabled mock interview using the browser's native speech recognition, and an AI coaching report) — most HR/ATS tools build AI screening only for the employer side, not as a free, unauthenticated tool for candidates. No competitor comparison exists in the repo to confirm this is unique in the market (see Section 12).

---

# 5. Current Features

List ONLY completed features, based on what exists in the code.

## Authentication & Account Model

- Supabase-based authentication (email/password), with a standard password-reset/recovery-link flow.
- Multi-tenant company/organization accounts (org slug-based), one admin per newly created company.
- Self-serve signup (`/signup`): a prospect creates a brand-new company and its first admin account in one step — company name, admin name, work email, and password — and is logged straight into their dashboard immediately, with no manual step from the team and no email-verification wait. The new company always starts on the Free plan with onboarding marked incomplete; the signup page itself tells the prospect upfront that time & attendance, absences, performance management, and the wellbeing chatbot unlock only after a short onboarding call.
- Admin-gated routes for positions, user management, billing, and every higher-complexity HR module.

## Dashboard

- Per-company SaaS entry point at `/jobs/[slug]` — reached only by someone who knows their company's slug (not discoverable/indexed). Not logged in: company branding (logo/name) and a login prompt. Logged in: "Welcome back" plus a role-aware grid of quick links to the company's HR tools (positions, HR tools, performance, time clock, absences, and for admins: subscription, users, tickets).
- Distinct from the public homepage at `/` (see Marketing/Public Site below).

## Marketing / Public Site

- Public homepage (`/`, no company slug) leads with the free Job Assistant (AI CV scoring, no account needed) as the primary hook, with a "For employers" section below introducing the full platform and a link to the pricing page.
- Pricing page (`/pricing`): three columns (Free / Core / Growth) showing each paid tier's flat monthly base fee plus its per-employee fee (cost scales with headcount) and the employee-count range each tier is valid for (Core: up to 30; Growth: 31+), a note about the one-time onboarding fee and the 15%-off annual billing option, a note that downgrading never deletes existing data, a note that time & attendance/absences/performance/the wellbeing chatbot/medical certificate uploads all additionally require a completed onboarding call regardless of plan, and every plan's button leads to the self-serve signup flow rather than a contact form or demo request.
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu), also exists and carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, the same pricing data, and an interactive ROI calculator, with its own pricing buttons leading straight into this app's signup flow.
- Legal pages exist at the root level (privacy, terms, cookies, impressum) and are reachable from every public-site page's footer. Their content has been substantively rewritten to describe the actual live, paid product rather than the "free demo, no real data" framing they previously carried: an accurate GDPR-structured privacy notice (data categories including special-category health data, legal bases, controller/processor roles, AI/automated-decision disclosure, retention periods, and a corrected, real contact address after `privacy@innohr.hu` — a domain the product no longer sends mail from — was replaced with `privacy@hrinno.hu` everywhere, including the footer), a real commercial terms of service (plans/billing/cancellation, onboarding gate, AI-feature limitations, liability, governing law), and a cookie notice with an accurate table of the specific cookies/local-storage items actually used. The route paths still carry a legacy `-demo` suffix (`/privacy-demo`, `/terms-demo`, `/impressum-demo`; `/cookies` is the exception) — cosmetic only, not visible to a reader of the page content, but a candidate for a future URL cleanup. The impressum now shows the operator's real name and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) and honestly states that no business entity is registered yet, rather than showing "to be completed" placeholders — but none of the four pages have had legal counsel review, which should happen before treating them as final for a real launch.
- Lightweight, privacy-respecting funnel tracking exists across this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact-form submissions, ROI calculator use, signup started/completed, and onboarding-marked-complete are logged (with an anonymous, client-generated, non-identifying session id — no CV/interview content, no account link) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`) used internally by the HRInno team to inform go-to-market decisions. This tracking now genuinely honors the cookie-consent banner (previously the banner recorded a choice but nothing in the code actually read it): the anonymous funnel-session identifier is only created, and no event is recorded, until a visitor explicitly accepts optional analytics — declining, or not yet answering, means no tracking happens at all. This is a real, if likely small, reduction in visible top-of-funnel volume versus the prior always-on behavior, traded for the cookie notice's claims being actually true rather than aspirational.

## Recruitment & Applicant Tracking

- **Job posting management**: an admin or recruiter creates a position with a name, a short public description, a longer "detailed" description used specifically to improve AI CV matching, a start date, employment type, and (on newer postings) location/location-type, salary range with an optional "make salary public" toggle, and an application deadline. Creating a new open position is capped per the company's plan (Free = 2 open positions; Core/Growth allow more, with the possibility of an "unlimited" tier). There is currently no way to edit a live posting's text after creation — only closing it (which stops it accepting applications but keeps all its history) is supported.
- **Public job board**: candidates browse a company's open positions with no account needed; the public list currently shows the posting name and descriptions but not yet the richer fields (salary, location, deadline) — those only appear once a candidate opens a specific posting's apply page.
- **AI-generated job descriptions**: from a short rough draft, one click generates both the public-facing description and the longer AI-matching description, consuming one metered AI credit per generation.
- **Advanced reporting (Growth only)**: a dedicated recruitment analytics dashboard shows total candidates, average/median AI score, days open, applications per day, a timeline chart, a score-distribution histogram, and a breakdown of where candidates came from (direct upload vs. re-surfaced from the company's own historical candidate database), per open position. Free and Core admins see a locked-preview notice instead; this is the one recruitment capability that differs by tier — the Trello-style pipeline board and per-candidate AI scoring below are available on every plan, including Free.
- **Customizable applicant pipeline (Trello-style board)**: each company can order its own named pipeline stages (e.g. Unassigned, Screening, Interview, Offer, Rejected); recruiters drag and drop one or many candidates between stages, leave free-text comments on a candidate, and view each candidate's CV via a short-lived (10-minute) signed link — never a permanent public URL.
- **AI CV scoring — single candidate**: when a candidate applies, their CV is automatically scored 0–10 against the specific position's detailed description, producing both an internal recruiter-facing analysis and separate, softer feedback shown to the candidate themselves. Candidates scoring below the pass threshold are automatically routed into the pipeline's "Rejected" stage with no human step required; everyone else lands in "Unassigned" for a recruiter to triage. Company admins and the position's assigned manager are notified in-app the moment a new CV comes in.
- **AI CV re-scoring at database scale ("Analyse Massive")**: when opening a brand-new position, a recruiter can instantly re-score every candidate in the company's entire historical applicant database against the new opening — surfacing good-fit past applicants without asking anyone to reapply — with a live progress indicator as it works through the batch.
- **Two distinct AI interview mechanisms** exist and both ultimately show up as an "AI Interview" score on a candidate's pipeline card, which is worth being precise about when describing the feature externally:
  1. **Recruiter-run assisted interview**: a recruiter schedules a real, human-conducted interview (with an automatic calendar invite — compatible with Google/Outlook/Apple Calendar — sent to the candidate, including reminder and cancellation emails). Before the interview, the recruiter can ask the AI to suggest interview questions based on the candidate's CV and the job. After the interview, the recruiter types their own free-text notes, and the AI turns those into a structured summary (strengths, weaknesses, cultural fit, a recommendation, and a score). There is no audio/voice capture in this flow — the AI works only from what the recruiter types.
  2. **Automated interview taken directly by the candidate**: offered inline to strong applicants (CV score above a threshold) as an explicitly optional "Virtual Interview" — ten AI-generated questions, each with three suggested sample answers the candidate can pick from or override with their own answer. On completion, the AI scores the full transcript and writes a short HR-style summary automatically, with no recruiter involvement needed to generate the score. The candidate can now answer by voice as well as by typing — the same browser-based speech recognition used by the public Job Assistant tool (English/French/Hungarian, with the same "use Chrome or Edge" fallback message on unsupported browsers) — so the candidate-facing experience is now consistent between this in-pipeline interview and the free public tool. The two remain functionally separate underneath: this one is tied to a specific candidate and job application and its result is saved to that candidate's pipeline record, while the public tool (below) is anonymous and stores nothing.

## Public Job Assistant (free, standalone candidate tool)

- A completely free, anonymous, no-account, no-employer-affiliation career-coaching tool (`/job-assistant`), independent from applying to any specific job — built and instrumented as a top-of-funnel acquisition asset, not a monetized feature.
- **CV scoring**: a candidate pastes any job description and uploads their CV; receives an overall 0–100 score plus a five-way breakdown (skills, experience, education, keyword match, presentation) with top strengths and gaps.
- **CV rewriting**: on request, the AI rewrites the CV to better match the target job — explicitly instructed not to invent experience, only to rephrase/restructure — producing an improved score and a ready-to-download Word (.docx) file.
- **AI mock interview with genuine voice input**: ten tailored questions mixing behavioral, technical, motivational, and situational styles, each with an "ideal answer" reference; the candidate can answer by typing or by speaking (using the browser's own speech-to-text, supporting English, French, and Hungarian dictation, with a clear fallback message on unsupported browsers). Each answer is scored 0–100 with a model example of a stronger phrasing.
- **Final coaching report**: aggregates per-category performance into an overall verdict (from "Strongly Recommend" to "Not Recommended"), a prioritized coaching plan, and an interview-readiness assessment.
- **Fully stateless by design**: nothing typed or uploaded in this tool is ever saved to the database — the candidate is told explicitly that "no data is stored after the session ends," and this matches the code (no database writes exist anywhere in this flow). It is also not subject to any company's metered AI-credit pool.

## Time & Attendance

- **Employee self-service**: a simple clock-in/clock-out screen with a live running "time worked" counter, a weekly summary (total hours, on-time days, overtime hours), and a 30-day history with per-entry Late/Overtime/On-Time status, computed against the employee's assigned work shift (or a sensible default if none is assigned). Every clock-in/out is strictly self-service — an employee can only see and act on their own record.
- **Manager view**: a live "today" roster of the manager's direct reports (Working / Finished / Not Started, clock times, lateness, weekly hours) plus a "Pending Approvals" queue of completed entries awaiting sign-off, with one-click approve/reject and visibility into flags like lateness or overtime. Every clock-in starts in a "pending" state awaiting this manager review.
- Company admins get built-in oversight of any manager's team data through this same manager view (not a separate admin dashboard) — there is no distinct company-wide "everyone regardless of manager" attendance view today.
- Plan-gated: locked on Free; usable on both Core (up to 30 employees) and Growth (31+ employees), with cost scaling via the per-employee billing component (see Section 11). Also requires the company's onboarding call to be marked complete on every plan, including paid ones.

## Absences / Leave Management

- **Employee self-service**: request leave by type and date range from a modal; the number of working days is calculated automatically. A running leave balance and a list of past requests are shown on the same page.
- **Manager approvals**: managers see a "Team Approvals" tab with a pending-count badge and approve or reject each direct report's request.
- **Calendar view**: a year-grid calendar (toggle between "my leave" and "my team's leave") with print/PDF export and an iCal (.ics) download so approved leave can be added to any external calendar.
- **Medical-certificate linkage**: sick leave can be tied directly to an uploaded medical certificate, either pre-filling a new request or attaching to an existing one.
- Shares the same plan gate as Time & Attendance (locked on Free; usable on Core up to 30 employees and on Growth from 31 up) and the same mandatory onboarding-completion requirement on every plan. Non-admin users simply don't see the module at all when it's locked; company admins see an explicit upgrade/locked notice.

## Medical Certificates

- **Manual-entry upload**: an admin uploads a scanned certificate (PDF or image, up to 1MB) and manually types the employee's name and sickness start/end dates. No AI or OCR service ever reads the document — the certificate is stored as-is, with its details entered by hand rather than auto-extracted, so certificate content never leaves HRInno's own infrastructure for a third-party AI provider.
- **Confirm & save, with optional leave linkage**: after entering the details, the certificate is saved permanently and can be linked to an existing or new leave request, automatically marking that leave as medically confirmed.
- **Certificate list & tracking**: a searchable, company-wide list of all certificates with a "hide treated" filter and a manual "treated" toggle (which also updates any linked leave request).
- **Private storage, on-demand access only**: files are never given a permanent public URL — every view goes through a freshly generated, short-lived (10-minute) signed link, scoped to the caller's own company.
- Capped per plan per calendar month (Free 5, Core 10, Growth 20), and available on both paid tiers. It is also currently held behind the same mandatory onboarding-completion gate as the other higher-complexity modules; the original reason for this specific gate (certificate data being sent to third-party AI/OCR services) no longer applies now that certificates are manual-entry-only, and whether to keep this module in the onboarding-gated set is an open product decision (see Open Questions).

## Performance Management

- **Goal setting**: any employee can create their own goal (title, description, success criteria, quarter). A goal an employee creates themselves starts as a draft awaiting their manager's approval; a goal a manager or admin creates for someone starts active immediately. Creating a goal requires the employee to already have an assigned manager, tying the feature to the org chart.
- **Weekly pulse check-ins**: for every active goal, the employee gives a weekly status update — "On Track," "Some Issues," or "Blocked" — with a free-text progress comment (and a required explanation if blocked). One update per goal per calendar week; resubmitting the same week updates it in place.
- **Employee dashboard**: at-a-glance counts of active goals, goals needing this week's pulse update, red-flagged (blocked) goals, and goals awaiting the manager's approval.
- **Manager/team view**: a per-employee rollup across the whole team (active/red/yellow/green/needs-pulse/pending-approval counts), a dedicated "Red Flags" view listing every blocked goal across the team with its blockers, and a "Pending Approval" queue with inline one-click approval of employee-created draft goals.
- Available on the **Growth plan only** (not included on Free or Core), and additionally requires the company's onboarding call to be marked complete.

## AI Employee Wellbeing Chatbot

- A conversational, PERMA-model-based wellbeing check-in (positive emotion, engagement, relationships, meaning, accomplishment, and work-life balance — two questions per dimension, twelve questions total), available in English and Hungarian.
- Each answer is scored by AI in real time; on completion the employee receives an overall wellbeing score plus three personalized pieces of AI-generated advice, with the tone of the closing message adapting to how well they scored.
- Sessions are anonymous by design (a random session token, not a personal account record).
- **Admin/manager dashboard**: shows only company-wide, aggregated results — average score, number of completed check-ins, a participation trend, and PERMA-dimension breakdowns with suggested areas for improvement. No individual employee's answers or identity are ever surfaced — this is stated explicitly in the in-app help documentation and matches how the underlying data is queried. Any authenticated member of the company (not only admins/managers) can view this aggregate dashboard.
- Available on **Growth only** (not Free or Core — moved from a Core+Growth feature to a Growth-exclusive one as part of the Core/Growth pricing overhaul), and additionally requires the company's onboarding call to be marked complete.

## Support Tickets

- A helpdesk channel through which a company's employees and admins reach the HRInno support team directly (not a peer-to-peer or department-routed internal ticketing system) — company admins from HRInno's own operating companies get a cross-tenant support-agent view of every customer's tickets, i.e. HRInno's own support staff use this same interface.
- Creating a ticket captures a title, description, priority (low/medium/high/urgent), an optional category (technical support, bug report, feature request, account issue, billing, general inquiry, other), and file attachments (multiple files, 5MB each).
- **Plan-gated**: creating a *new* ticket requires the Core or Growth plan (a Free-plan or no-active-plan company sees an upgrade prompt instead of the create form); this gate does not require the onboarding call to be complete, so it's available immediately after self-serve signup on a paid plan. Existing tickets remain fully viewable and repliable regardless of plan — the gate only applies to opening new ones.
- In-app notifications alert relevant users when a ticket is created; a separate, planned email-notification path (new ticket / new message / status change) exists as message templates but is not currently wired to actually send email (see Known Limitations).

## General Feedback

- A lightweight 1–5 star rating plus free-text comment widget attached to the public marketing/demo experience (not tied to a company's employees) — a visitor's overall impression of the demo, distinct from the internal support-ticket system above.

## Contact / Lead Capture

- A public contact form (first/last name, email, phone, company name, comment, GDPR consent required, marketing-consent opt-in) with basic rate-limiting and input sanitization, feeding an internal "contact submissions" list.
- Submissions are reviewed exclusively by HRInno's own internal team (not by any customer), who can search, filter, update status, add notes, and delete entries — this is the internal sales/lead-qualification tool that sits upstream of a company's decision to sign up.
- A functioning unsubscribe link lets a contact opt out of future marketing email, which is recorded against their submission record.

## Documents

- Medical certificate upload, listing, and download, with manual entry of the certificate's key details (see Medical Certificates above for the full workflow) — no AI or OCR service ever processes the document's content.
- CV upload and parsing, both for the company-side recruitment pipeline (stored privately, viewed via short-lived signed URLs scoped to the company that owns the position applied to) and for the standalone public Job Assistant (never stored at all — see above).

## Help & Documentation

- In-app user manual, reachable from the logged-in admin's account menu ("User Guide"). A browsable guide covering every currently-live customer-facing feature — recruitment/job postings, AI job descriptions, medical certificates, time & attendance, absences, performance management, the wellbeing chatbot, user management, subscription & billing, and support tickets — written in plain customer-facing language with accurate plan limits and role restrictions for each. Content is stored as Markdown files rather than hardcoded in the app, so updating it is a text edit, not a code change. **English only today** — despite the rest of the product supporting French and Hungarian, no French or Hungarian help content exists yet.

## Notifications

- Automated transactional email exists for: the onboarding-call booking invitation sent immediately at signup (with a Calendly link), a one-time onboarding-call reminder if the prospect hasn't booked within a few business days, and interview invitation/cancellation emails (with a calendar-file attachment) sent to recruitment candidates.
- In-app notifications (a bell/notification feed, distinct from email) exist for new CV submissions on a position and for new support tickets.
- Support-ticket email notifications (new ticket, new reply, status change) are defined as message templates but are not currently wired to send real email — see Known Limitations.

## Mobile

No native mobile app identified; the product is a responsive web application (Next.js).

## User & Role Management

- **Roles**: Employee (default, acts only on their own records), Manager (also acts on behalf of their direct reports, resolved from the org chart, never trusted from the client), Company Admin (full control within their own company — billing, user management, settings — but confined to that company), and Super Admin (a global, internal HRInno-team role, not available to any customer, used for cross-company tooling).
- **Adding employees**: a company admin adds employees one at a time (assigning a manager and a start date) from inside the app; each active employee adds that plan's per-employee fee to the subscription (see Section 11), and adding one automatically increases the Stripe subscription's per-employee billing quantity to match. On Core, this is also capped at 30 active employees — the add is rejected with an upgrade-to-Growth message once the company is at the cap, so a Core account can never silently grow past the point where its formula would cost more than Growth's.
- **Bulk import**: uploading a CSV/XLSX of many users at once, spanning multiple companies if needed, exists as an internal HRInno-team tool (not self-serve for customers) — each row is checked against the same Core seat cap before insert, and each affected company's billing quantity is resynced once the import finishes.
- **Manager assignment and activation status**: an admin can reassign an employee's manager at any time, and can activate/deactivate an employee's account (there is no separate "suspended" state beyond active/inactive); deactivating an employee reduces the billed per-employee quantity, and reactivating increases it again — reactivation is subject to the same Core 30-employee cap as adding a brand-new employee.

## Billing & Subscription

- Three real plan tiers — **Free**, **Core**, and **Growth** — with live prices read from Stripe and cached limits/feature flags read from the `forfait` table (not hardcoded), so changing a plan's limits in the database takes effect without a code deploy.
- **Base fee + per-employee pricing on both paid tiers**: Core and Growth are each billed as a flat monthly (or annual) base fee plus a separate per-employee fee that scales with the company's actual active headcount — billed as two distinct Stripe subscription items (not a single flat price), so the invoice itemizes the base fee and the per-employee charge separately. The per-employee subscription item's quantity is kept in sync automatically every time an employee is added, deactivated, or reactivated, with Stripe prorating the difference.
- **Hard employee-count range per paid tier**: a pricing review found that Core's formula (25,000 + 1,000/employee) would cross over to cost more than Growth's (40,000 + 750/employee) past a certain headcount, despite Growth including strictly more features — an account must never be able to sit in that zone. Core is hard-capped at 30 employees (enforced on every employee add/reactivation, not just shown as a label); Growth requires at least 31 employees to self-serve subscribe in the first place. Both checks are enforced in billing/API logic, not only in pricing-page copy. There is no forced downgrade for a Growth account that later shrinks below 31 - that's an explicit, confirmed non-requirement (see Section 18).
- **One-time onboarding fee**: a single, non-recurring fee is charged once at signup for Core or Growth, added to the first invoice alongside the first subscription charge; it is never charged again on a resubscribe.
- **Annual billing option**: either paid tier can be billed annually instead of monthly at 15% off the annualized total, paid upfront. If headcount grows mid-term on an annual plan, the per-employee component is still prorated the same way as monthly billing (an additional invoice, not solely a year-end reconciliation).
- **Founding-customer discount**: a manually-applied, time-boxed discount (30% or 40% off the base fee only — never the per-employee fee or the onboarding fee — for 12 months) exists for a small batch of early signups, applied by a super admin from the internal billing dashboard rather than as a public promo code.
- Subscribing is a self-serve Stripe Checkout flow from inside the dashboard's subscription page, with a monthly/annual toggle; switching tier or billing interval on an already-subscribed company is not yet self-serve (routed to the Stripe customer portal instead — see Known Limitations). Canceling can be done in-app (an immediate, not end-of-period, cancellation clearing the plan right away) and is also correctly synced if a customer cancels directly through Stripe rather than through the app.
- **AI credits**: a monthly, metered allowance (Free 50 / Core 100 / Growth 250) consumed specifically by AI job-description generation and by CV scoring (both single-candidate and bulk re-scoring); running out blocks that specific action with a clear "no credits remaining" message until the monthly reset, or the admin can buy an additional one-time top-up pack through Stripe. The AI wellbeing chatbot is not metered by this credit pool — it's separately capped by its own plan flag (Growth only). Medical certificates no longer involve any AI call at all (manual entry only), so there's nothing to meter there.
- **Downgrade/cancellation promise, enforced architecturally, not just stated**: canceling or downgrading never deletes or hides any data the company already has — plan checks only ever run at the moment of *creating* something new (a job posting, a certificate upload), never on reading or editing existing records. A company with no active subscription (never subscribed, or canceled/expired) permanently behaves exactly like the Free plan for every gated feature rather than being blocked outright.
- **Internal billing dashboard (super-admin only)**: a cross-company view listing every company's plan, billing interval, active employee count, whether the onboarding fee has been paid, and founding-discount status, with a one-click action to apply the founding discount to an eligible company.
- **Per-company outbound email**: a company admin can configure their own outbound SMTP relay so platform emails are sent from the company's own domain; the stored password is encrypted at rest and never redisplayed.

## Settings

- Plan-based feature gating: a single, centrally-defined entitlements layer checks a company's plan before allowing new job postings, new medical certificate uploads, wellbeing-chatbot sessions, time & attendance/absences actions, performance-management actions, viewing the advanced recruitment reporting dashboard, and new support tickets, using per-plan limits/flags stored in the `forfait` table and read live (not cached/hardcoded). Adding a new employee is no longer capacity-gated by plan (see Section 11) — it instead increases that plan's per-employee billing quantity. See Section 11 for the actual plan tiers.
- Onboarding-completion gate: separate from and layered on top of the plan-based check above, time & attendance, absences, performance management, and the AI wellbeing chatbot, plus medical certificate uploads, are unavailable to any company — including one already paying for Core or Growth — until the HRInno team manually marks that company's onboarding as complete. A company admin who hits one of these modules before then sees a clear "available after your onboarding call" message with a contact link, not a broken page. Recruitment/job postings, the advanced reporting dashboard, and support tickets are explicitly not subject to this gate, so a self-serve company can start recruiting and asking for help immediately.
- Automated onboarding-call booking: right after self-serve signup, the new admin automatically gets an email with a Calendly link to book the onboarding call. If they haven't booked within a few business days, a one-time reminder email goes out automatically with the same link. Actually running the call and flipping the company to onboarded remains a fully manual step by the HRInno team.
- Data retention settings (super-admin only): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable with zero code change or redeploy, with a visible audit trail and a live preview of what the next scheduled deletion run would delete. A daily scheduled job deletes data older than whatever is currently configured (30 days today for both data types, matching the public privacy notice). A one-off "delete now" tool also exists to fulfil an individual data-subject deletion request ahead of the scheduled sweep.

## Administration (Internal, HRInno-team-only)

- Manual onboarding-completion toggle: a simple per-company list with current status and a one-click toggle, used by the team to unlock a self-serve company's higher-complexity modules once its setup call is done, plus visibility into whether the automated booking/reminder emails have already been sent to that company.
- Billing dashboard: a cross-company list of plan, billing interval, active employee count, onboarding-fee-paid status, and founding-discount status, with a one-click action to apply the time-boxed founding-customer discount to an eligible company's subscription.
- Marketing/sales funnel dashboard: Job Assistant usage, pricing-page views and per-plan CTA clicks, contact-form submissions (with source), and onboarded-company counts, including how many companies trace back to a specific contact-form submission.
- Bulk user import (see User & Role Management above).
- Job posting / position management, applicant tracking, time & attendance, absences, performance management, and support tickets are otherwise the customer-facing administration surface described in their own sections above.

---

# 6. Features In Development

Based on the most recent commit and work history (not a formally stated roadmap): no net-new customer-facing feature is currently mid-flight. The most recent body of work (per commit history and the current uncommitted working tree) has been a security-hardening pass centralizing authorization checks into a single `lib/authz/` layer and closing 16 confirmed critical/high-severity access-control vulnerabilities across leave requests, performance goals/pulse, timeclock, and support tickets, and shipping plan-based gating for support-ticket creation (now live and reflected in Section 5 and Section 11, not listed here as pending).

Expected value and priority are not documented for anything else; there is no formally stated in-development feature list beyond what can be inferred from recent work.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- Plan-based feature gating (Free vs. Core vs. Growth) is real and substantial, covering opening a new job position, medical certificate uploads, the AI wellbeing chatbot (Growth only), time & attendance/absences, performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket creation. No module remains entirely ungated by plan today. Employee headcount also drives per-employee billing (see Section 11) and, following a pricing review, is hard-capped on Core (30 employees) and hard-floored on Growth (31 employees) to prevent an account ever landing in the zone where Core's formula would cost more than Growth's despite Growth including more features.
- Switching an already-subscribed company between tiers (Core↔Growth) or between monthly and annual billing is not yet self-serve: the subscription page's plan cards are disabled once a company has an active subscription, directing the admin to the Stripe customer portal instead of an in-app plan-swap flow. Not a blocker today since no real customers exist yet, but worth building before it becomes one — and when it is built, a Growth→Core downgrade must itself be blocked (or forced to first reduce headcount) if the account has more than 30 employees, to avoid recreating the same overpaying-on-Core problem from the other direction. No such guard exists today because there's nothing yet to guard against.
- The public legal pages (privacy notice, terms of service, cookie notice, impressum) now describe the real, paid product accurately, and the impressum carries the operator's real name and address rather than placeholders, but it honestly discloses that no business entity is registered yet, and none of the four pages have been reviewed by qualified legal counsel. Treat them as a substantive, accurate draft — not yet a finished, legally sign-off-ready document — until legal review happens and the business-registration question (see Open Questions) is resolved.
- Support-ticket notification emails (new ticket / new reply / status change) have message templates defined but the underlying send function is a mock that only logs and never delivers actual email — the only remaining customer-visible dead end of this kind (the previously non-functional job-posting "upgrade" button and wellbeing-dashboard "export" button have since been removed rather than left clickable-but-broken). The anti-abuse cooldown on starting a new wellbeing chatbot session also has a logic bug that makes it effectively inert.
- There is no way to edit a live job posting's text after it's created — only closing it is supported, which stops new applications but keeps its history.
- The AI auto-rejection threshold is inconsistent between the two CV-scoring paths: a single freshly-submitted candidate is auto-rejected below a 5/10 score, while the bulk "re-score my whole candidate database against this new job" tool uses a 7/10 threshold — the same scoring model applying two different pass bars depending on which button triggered it.
- Medical certificate upload is gated at the API level to company admins only, while the upload control itself is surfaced on the ordinary employee-facing absence page with no visible restriction — a non-admin employee attempting to use it as pictured in the UI would be rejected by the server. Certificate upload should currently be described as an HR-admin-mediated workflow, not employee self-service.
- Customers now have an in-app user manual, but it exists in English only; French and Hungarian customers get no localized help content despite the product itself being fully trilingual. Internal/developer-facing documentation is still absent — the README remains unmodified Next.js boilerplate, and this brief is still the only business-facing document in the repo.
- Self-serve signup is scoped, not full-platform: a brand-new company can sign up and use recruitment/Job Assistant and support tickets (on a paid plan) completely unassisted, but time & attendance, absences, performance, and the AI wellbeing chatbot, plus medical certificate uploads, all stay locked behind a manual onboarding-completion toggle regardless of plan. Getting the prospect to book a call is automated, but everything after that — actually running the call and flipping the toggle — is a manual, one-at-a-time action with no capacity-planning tooling attached.
- Medical certificates no longer involve any third-party AI or OCR service at all — the document's content is never sent anywhere beyond HRInno's own storage, and its key details are entered manually. This closes what was previously the product's most sensitive data-handling gap (health data going to third-party AI/OCR providers with only best-effort redaction). CV data is still a separate matter: it's sent to OpenRouter/OpenAI for scoring and matching, which is expected and necessary for that feature to work (candidate name/contact info is needed for candidate-to-job matching), and isn't a special-category-data concern the way health data was.
- A runtime-adjustable data retention mechanism exists for medical certificates and company-pipeline CV data (30-day period today, matching the public privacy notice), with a full audit trail and an on-demand single-record deletion tool for individual data-subject requests. The retention module's own internal documentation is explicit that this makes the retention period an editable, auditable parameter — it does not, by itself, make the product GDPR/HIPAA compliant. Job Assistant CV data has no persistence layer at all, so there is nothing to delete for that data type by design.
- AI-based candidate scoring/ranking (single and bulk) has been documented as falling under the EU AI Act's high-risk classification (Annex III, point 4(a): recruitment/candidate evaluation), whose obligations became applicable 2 August 2026. None of the associated requirements currently exist: a documented risk-management process, data-governance review of the scoring prompts/data for bias, technical documentation of the scoring logic, structured logging of individual scoring events for audit purposes, documented human-oversight measures, a candidate-facing "AI is used to evaluate you" notice, or a conformity assessment. This is a documentation-only finding so far (no behavior change) — final compliance determination and remediation priority require legal review.
- Leave-request approval/rejection is not backed by an explicit server-side authorization check the way leave-request *creation* now is — it is a direct database update from the browser relying entirely on database-level row security, rather than the app-level identity checks used elsewhere in the recent hardening pass. Not confirmed to be exploitable, but architecturally inconsistent with the rest of the newly centralized authorization model.
- A public feedback-listing endpoint (used for the marketing demo's star-rating widget) returns every submitted rating/comment with no authorization check at all, despite being commented as intended for internal/admin use only — low sensitivity (demo feedback, not employee or candidate data), but a gap.
- There is no dedicated company-wide admin view for time & attendance — oversight is folded into the manager approval screen (an admin can act on any manager's team through it), not a separate "everyone regardless of manager" dashboard.
- Known unresolved bug in job description generation: a prompt-variable helper does not work correctly, worked around with manual replacement rather than fixed.
- Admin/permission checks have recently been centralized into a single authorization module (`lib/authz/`) closing 16 confirmed critical/high-severity issues, replacing the previous ad hoc per-route pattern for most of the surfaces reviewed. This is a meaningful maturity improvement, though it was not confirmed to cover every single route in the app exhaustively.
- Obsolete/backup code and folders (e.g., an "ObsoleteHome" folder) remain in the codebase.

---

# 9. Technical Overview

## Platform

Web (responsive), Next.js application. No native mobile app.

## Technology Stack

Frontend

- Next.js 15, React 19, Tailwind CSS v4 with a minimal custom theme (brand indigo/accent emerald color scales) and a Sora/Inter font pairing, applied so far mainly to the homepage and pricing page.

Backend

- Next.js API routes
- A centralized authorization module (`lib/authz/`) providing reusable identity/permission checks (self, manager-of, company-admin, super-admin, service-secret for cron jobs, session-token for anonymous flows)
- A centralized entitlements/plan-gating layer (`lib/entitlements.ts` + `src/config/entitlements.ts`) that maps feature keys to live database checks rather than hardcoding limits in code

Database

- Supabase (PostgreSQL)

Hosting

- Vercel (Vercel Analytics and Speed Insights are integrated)

Authentication

- Supabase Auth

AI

- OpenAI SDK and OpenRouter (models used include Claude 3.5 Sonnet and Claude 3 Haiku for recruitment scoring/generation, GPT-4o-mini for the public Job Assistant, GPT-3.5-turbo and Mistral for various interview/assistant flows, with automatic fallback chains between providers on failure) — used for recruitment/CV features, the wellbeing chatbot, and the public Job Assistant; deliberately not used anywhere in the medical-certificate flow
- Browser-native speech recognition (Web Speech API) for the public Job Assistant's voice-enabled mock interview
- Tesseract.js and pdf-parse (document/CV parsing)

Storage

- Supabase Storage. Medical certificate and CV buckets are private; files are served via short-lived signed URLs generated on demand server-side rather than public URLs.

Other

- Stripe (billing/subscriptions, one-time AI-credit top-up purchases)
- Resend and Nodemailer (email), with optional per-company outbound SMTP configuration (encrypted credentials)
- next-intl (internationalization — English, French, and Hungarian)
- AES-256-GCM encryption (used currently for company SMTP credentials at rest)

---

# 10. Integrations

Current integrations found in the codebase:

- Stripe (billing, subscriptions, customer portal, one-time credit purchases)
- Supabase (auth, database, storage)
- OpenAI / OpenRouter (AI text generation and analysis, multiple models with fallback chains)
- Resend / Nodemailer (transactional email)
- Calendly (onboarding-call booking link)
- Vercel Analytics / Speed Insights

---

# 11. Pricing

Current pricing strategy, confirmed against the live `forfait` table and its seeding migrations (not inferred).

Free

- No Stripe price attached (default/no-payment tier). Grants: up to 2 open job positions, up to 5 medical certificate uploads/month, no AI wellbeing chatbot access, 50 included AI credits/month, no support-ticket creation. Time & attendance/absences, performance management, and advanced recruitment reporting are locked (visible to admins as a locked preview only, not usable for real data entry). Employee seats are uncapped on Free (there is nothing to bill per seat, since Free has no subscription).

Core

- Paid tier: 25,000 HUF/month base fee plus 1,000 HUF/employee/month, billed as two separate Stripe subscription items so the per-employee charge scales automatically and transparently with headcount. **Hard-capped at 30 employees** — adding (or reactivating) an employee that would push the company past 30 is rejected with an upgrade-to-Growth message, and self-serve Core checkout itself is refused above 30 employees. This ceiling exists specifically to prevent an account from reaching the headcount where Core's formula would cost more than Growth's. Grants: up to 5 open job positions, up to 10 medical certificate uploads/month, 100 included AI credits/month, support-ticket creation, and time & attendance/absences. Performance management, the AI wellbeing chatbot, and advanced recruitment reporting are not included (Growth only).

Growth

- Paid tier: 40,000 HUF/month base fee plus 750 HUF/employee/month, same two-item billing structure as Core. **Requires at least 31 employees to self-serve subscribe** (checked at checkout); no upper cap once subscribed, and no forced downgrade if headcount later drops below 31. Grants everything in Core, plus performance management, the AI wellbeing chatbot, and advanced recruitment reporting.

Onboarding fee and annual billing

- A one-time 60,000 HUF onboarding fee is charged once at signup for either paid tier, added to the first invoice alongside the first subscription charge (never charged again on a resubscribe).
- Both paid tiers can be billed annually instead of monthly, at 15% off the annualized total (base fee and per-employee fee both discounted), paid upfront. Billing interval cannot be mixed within one subscription — both the base and per-employee items always share the same interval.

Founding-customer discount

- A manually-applied Stripe coupon (30% or 40% off the base fee only, for 12 months) exists for a small batch (target: 10–15) of early signups. It is never offered as a public promotion code — a super admin applies it to a specific company's subscription from the internal billing dashboard, and it is scoped so it can only ever discount the base-fee line, never the per-employee fee or the onboarding fee.

Notes

- Plan names are Free / Core / Growth.
- A company with no active plan (the state both before ever subscribing and immediately after canceling/expiry) permanently behaves like the Free plan for every gated feature, not blocked outright. A company that had more items than Free's caps allow before downgrading keeps full read/edit/close access to everything it already has; only creating new items beyond the cap is blocked.
- A Stripe subscription canceled directly on Stripe's side (not through the app's own cancel button) is correctly synced back to the company record via webhook, clearing the plan to the same null/Free-fallback state as an in-app cancellation. A failed renewal payment triggers a 7-day grace period before the plan is downgraded.
- Per-plan limits/flags live in the `forfait` table and are read live by the app, not hardcoded — changing a plan's limits in Supabase takes effect without a code deploy. Base fee and per-employee fee amounts are also cached in that table for display, sourced from the corresponding Stripe Price objects.
- AI credits are metered per AI-generation call (job-description generation, single CV analysis, bulk CV re-scoring) independently of the boolean/capacity gates above; a top-up pack can be purchased one-time via Stripe if a company's monthly allowance runs out.
- Plan-tier gating now covers job posting creation, medical certificate uploads, the AI wellbeing chatbot (Growth only), time & attendance/absences, performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket creation (Core and Growth). Employee count both drives the per-employee billing component and, on Core specifically, is itself a hard capacity gate (30-employee ceiling) — the only capacity gate tied to a tier boundary rather than a plan-wide feature.
- Every new company created through self-serve signup starts on Free automatically (no plan is selected during signup itself, even if the visitor clicked a Core or Growth button on the pricing page). Upgrading to a paid plan is a separate step taken afterward from inside the dashboard's existing subscription page.
- Time & attendance, absences, performance, and the AI wellbeing chatbot, plus medical certificate uploads, are additionally withheld from every self-serve company — on any plan, including paid ones — until the team manually marks that company's onboarding as complete. Support ticket creation, recruitment/job postings, and advanced recruitment reporting are not subject to this onboarding gate.
- Zero real customers exist yet, so this pricing model (and the Core/Growth rename from the prior Momentum/Infinity flat-fee tiers) was rolled out directly with no migration path for existing subscriptions.

---

# 12. Competitors

Not documented in the codebase. No competitor names, comparisons, or market research files exist in the repo.

| Competitor | Strength | Weakness |
|------------|-----------|-----------|
| | | |

---

# 13. Positioning

Not formally defined as a written statement, but the homepage hero states a clear positioning: lead with the free, no-account Job Assistant as the candidate-facing hook, with the full HR platform (recruitment, time & attendance, absences, performance, wellbeing) positioned as what a company gets once a candidate becomes a lead. The `hrinno-marketing` site carries an aligned version of this pitch.

With self-serve signup now live, the product's access model is a deliberate hybrid rather than pure product-led growth: recruitment/Job Assistant and (on a paid plan) support tickets are instant and fully unassisted, while time & attendance, absences, performance, and the wellbeing chatbot, plus (temporarily) medical certificate uploads, require a short human-guided onboarding call before first use, on any plan. The pitch this supports is "start free in minutes for recruiting, get white-glove setup for the harder HR operations" rather than "buy and self-configure the whole platform."

---

# 14. Marketing Notes

Important information for Marketing.

- Use the real plan names — Free, Core, Growth — not generic tier names like "Starter/Pro/Enterprise."
- Both paid tiers are priced as a flat base fee plus a per-employee fee, not a single flat price — this is a genuine differentiator worth leading with ("pay for what you use," no forced upgrade just to add a few more employees) versus competitors' flat per-seat-bucket pricing.
- Plan-based gating is now real and complete across every gateable module: number of open job postings, number of medical certificate uploads per month, AI wellbeing chatbot access (Growth only, not Free or Core), time & attendance/absences (locked on Free; usable on both Core and Growth), performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket creation (Core and Growth). All of these are safe to market as plan differentiators. Employee headcount IS a hard gate on Core specifically (30-employee ceiling, enforced in billing logic) and a hard floor on Growth (31-employee minimum to subscribe) — market these as "Core: up to 30 employees" / "Growth: 31+ employees," not as an uncapped feature.
- The public Job Assistant (free CV scoring + AI-rewritten CV with a downloadable .docx + genuinely voice-enabled mock interview + coaching report) is the strongest, most differentiated feature in the product and requires no company account — it is the best candidate for a dedicated acquisition campaign, distinct from and not to be confused with the "AI Interview" features that live inside a company's own recruitment pipeline.
- Be precise about the recruitment pipeline's two different "AI interview" mechanisms when writing copy: one is an AI *assistant* that helps a human recruiter prepare questions and summarize their own notes after a real interview (no voice, no candidate-facing AI conversation); the other is a fully automated interview the candidate takes alone. That automated candidate-run interview ("Virtual Interview") now supports voice answers, the same speech-recognition experience as the free public Job Assistant tool — so it's accurate to describe both of those specifically as voice-enabled, but keep the recruiter-assistant tool separate in copy since it never talks to the candidate at all.
- Storage access control for medical certificates and CVs is hardened (private storage, short-lived signed URLs, company-scoped database access), medical certificates are now manual-entry-only with no third-party AI or OCR service ever touching the document, and the data retention period is formally set to 30 days. This is a genuine, safe-to-use differentiator for the medical certificate feature specifically — but still do NOT claim full compliance (e.g. GDPR/HIPAA) for the platform overall, since CV/recruitment data is still sent to third-party AI providers (necessary for that feature to work) and other compliance items remain open (see Known Limitations).
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT claim the AI candidate-scoring feature is EU AI Act compliant. It has been documented as high-risk under the Act (recruitment/candidate evaluation), and none of the associated obligations are currently met — this is a legal-review item, not a marketing claim to make either way, positive or reassuring.
- Do NOT treat the current privacy notice, terms of service, or impressum as final, lawyer-reviewed legal copy — the content is now substantively accurate to the real product, including the operator's real name and address, but none of the four pages have had qualified legal review, and the impressum's honest disclosure of "no registered business entity yet" is itself a business question worth resolving (see Open Questions). Don't cite them as authoritative in contractual contexts until both are resolved.
- Do NOT make guarantees about candidate CV data privacy or retention beyond what the privacy notice/terms of service currently state (30-day retention) — no further documented policy exists.
- Self-serve sign-up is real and can be marketed as such: a company can sign up and start posting jobs / using the Job Assistant in minutes, with no sales call required, and (on a paid plan) can also open a support ticket immediately. Do NOT imply that time & attendance, absences, performance, or the AI wellbeing chatbot, or medical certificate uploads, are available immediately after self-serve signup — all five require a manual onboarding call with the team first, regardless of plan, even on Core or Growth.
- The founding-customer discount (30–40% off the base fee for 12 months) is an internal, manually-applied offer for a small batch of early signups, not a public promo code — don't publish a redeemable code for it, and don't promise it will remain available beyond the first 10–15 signups.
- Avoid describing medical certificate upload as an "employee self-service" feature in copy — the backend restricts it to company admins even though it is currently surfaced on an employee-facing screen; describe it as an HR-admin-managed workflow instead until that's resolved.
- A minimal brand (indigo/emerald color palette, Sora/Inter fonts) exists on the homepage and pricing page — usable as a starting point for campaign creative, but not yet a full brand system.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. Every plan-gateable module (recruitment, medical certificates, wellbeing chatbot, attendance/absences, performance, seats, and support tickets) enforces real limits, a prospective customer can sign up and reach a working dashboard entirely unassisted, authorization has gone through a substantial, centralized hardening pass, and the public legal pages have been substantively rewritten to describe the real product — all now committed and pushed. Still not production-hardened — see Section 8 for what remains, most notably the lack of legal counsel review on any of the four legal pages, the open question of whether a registered business entity is needed given the impressum's honest "individual, not yet registered" disclosure, and the still-mocked support-ticket notification emails.

Major blockers

- Self-serve signup covers recruitment and (on a paid plan) support tickets unassisted; time & attendance, absences, performance, and the wellbeing chatbot, plus medical certificate uploads, still require a manual onboarding call before a self-serve company can use them, with running the call and flipping the toggle remaining a fully manual, uncapacity-planned step.
- The public legal pages now substantively and accurately describe the real product, with the operator's real name and address in the impressum, but none of the four pages have been reviewed by qualified legal counsel, and the impressum's honest disclosure that no business entity is registered yet raises its own question about whether that's the right structure for a paid product processing health data — both remain a blocker for launch messaging that references privacy, terms, or compliance claims as final.
- Medical certificates no longer go to any third-party AI/OCR service (manual entry only) — this specific health-data exposure is resolved. CV/recruitment data is still sent to third-party AI providers, which is expected for that feature, with a runtime-adjustable 30-day retention mechanism in place.
- The AI candidate-scoring feature (core to the recruitment pitch) has been documented as high-risk under the EU AI Act, with an applicability date that has already passed and none of the associated obligations currently met.
- One customer-visible feature is only partially wired: support-ticket notification emails don't actually send (message templates exist, but the send function is mocked) — a moment where a real customer would expect an email and not get one. The two previously dead buttons in this category (position-limit "upgrade," wellbeing-dashboard "export") have been removed.
- Customers have an in-app user manual, but it's English-only; internal/developer documentation (README, architecture) is still absent.

Recommended launch timing

- Not documented in the codebase.

---

# 16. KPIs

Current metrics (if known)

- Not available. Vercel Analytics and Speed Insights are integrated, and lightweight funnel-event tracking (Job Assistant usage, pricing views/clicks, contact form submissions, ROI calculator use, signup started/completed, onboarding marked complete) exists in a Supabase table with a super-admin dashboard, but no actual usage numbers are accessible from the repository itself — this is instrumentation only, not reported results.

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

- The 30/31-employee boundary between Core and Growth is now a hard, enforced rule (Core capped at 30, Growth requires 31+ to subscribe) specifically to keep an account out of the zone where Core would cost more than Growth. Core's "~15-employee" lower bound and Growth's "~100-employee" upper bound remain advisory marketing framing only, with no enforcement - is that the intended final state, or should either of those also become a hard rule (e.g. blocking Core checkout below 15 employees, or requiring a custom quote above 100 on Growth)?
- Now that medical certificates no longer touch any third-party AI/OCR service, should the module be removed from the onboarding-completion gate (its original rationale no longer applies), or is there a separate reason to keep it gated? Is OpenRouter's own data-handling terms acceptable for the CV/recruitment data it still processes, and is a formal Data Processing Agreement needed? Has the daily deletion job's required environment configuration been confirmed correctly set in production?
- What is the realistic remediation plan and timeline for the AI candidate-scoring feature's EU AI Act high-risk obligations, given the applicability date (2 August 2026) has already passed? Should a candidate-facing "AI is used to evaluate you" notice be added to the application flow?
- The impressum now names the real operator and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) and honestly discloses that no business entity is registered yet. Is operating as a private individual — with no sole-trader ("egyéni vállalkozó") or company registration, and so no business tax number — the right legal/tax structure for a paid, commercial SaaS product processing health data at this scale? This is a legal/tax question for a qualified professional, not something to resolve in the document itself. When will a qualified Hungarian/EU lawyer review the rewritten privacy notice, terms of service, and impressum before they're treated as final?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond weak i18n/code-comment signals.
- What turnaround target (if any) should the team hold itself to for actually running the onboarding call and flipping a new company's toggle, now that booking itself is automated? This remains a fully manual step with no queue or capacity tooling.
- Should the two "AI interview" mechanisms inside the recruitment pipeline be renamed or otherwise disambiguated in the product itself, given they're functionally quite different (assistant-for-a-human-interviewer vs. fully automated candidate-run interview) but currently look like one feature to an end user?
- Self-serve tier/interval switching (Core↔Growth, monthly↔annual) for an already-subscribed company isn't built yet — is that acceptable to leave as a manual, portal-routed process for now given zero real customers exist, or should it be prioritized before the first real signups land? When it is built, it will need its own guard preventing a Growth→Core downgrade for an account with more than 30 employees (no such guard exists today since there's no downgrade path to guard yet).

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Replaced the flat-fee Momentum/Infinity pricing with Core (25,000 HUF + 1,000 HUF/employee/month, capped at 30 employees) and Growth (40,000 HUF + 750 HUF/employee/month, requires 31+ employees to subscribe), each billed as two separate Stripe subscription items (base + per-employee) kept in sync automatically as employees are added, deactivated, or reactivated. The 30/31 employee-range boundary is enforced in billing logic, not just pricing-page copy - it exists specifically because a pricing review found Core's formula would otherwise cross over to cost more than Growth's past a certain headcount despite Growth including more features, and an account must never be able to reach that zone. Also added a one-time onboarding fee charged at signup, a 15%-off annual billing option, and a manually-applied founding-customer discount (30–40% off the base fee for 12 months, targeted at the first 10–15 signups). Alongside the pricing change, the AI wellbeing chatbot, performance management, and a newly-carved-out "advanced recruitment reporting" dashboard (previously ungated) all moved to Growth-only, while recruitment, time & attendance/absences, medical certificate uploads, and support tickets remain available on both Core and Growth. A new internal billing dashboard gives super admins cross-company visibility into plan, billing interval, employee count, onboarding-fee status, and founding-discount status. Zero real customers exist yet, so this shipped as a direct replacement with no migration path for existing subscriptions
- Removed AI/OCR processing from medical certificates entirely: certificates are now manual-entry-only (a company admin types the employee name and sickness start/end dates instead of an AI/OCR pipeline extracting them), so certificate content is never sent to any third-party AI provider — this closes what was previously the product's most sensitive health-data exposure. Also removed the now-unused OCR.Space integration and the best-effort PII-redaction helper that existed specifically to mitigate that exposure, since there's nothing left for either to protect
- Rewrote all four public legal pages (privacy notice, terms of service, cookie notice, impressum) to substantively and accurately describe the real, paid product instead of their previous "free demo, don't enter real data" framing — added GDPR-structured disclosures (data categories including special-category health data, legal bases, controller/processor roles, an AI/automated-decision-making section covering the EU AI Act finding, a full third-party processor list, and per-category retention), a real commercial terms of service, and an accurate cookie/local-storage table; fixed a dead contact-email domain (`privacy@innohr.hu`, which the product no longer sends mail from) to the live `privacy@hrinno.hu` everywhere it appeared; and made the cookie-consent banner actually functional by gating the anonymous funnel-tracking identifier and its events behind explicit consent, rather than collecting regardless of the visitor's choice. The impressum now carries the operator's real name and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) and honestly states that no business entity is registered yet, rather than "to be completed" placeholders — but none of the four pages have been reviewed by qualified legal counsel, and whether a registered business entity is needed given the product's scale and health-data handling remains an open question
- Added real voice input to the in-pipeline "Virtual Interview" (the automated interview a candidate takes during a real application), bringing it to the same voice-answer experience as the free public Job Assistant tool's mock interview — the two remain separate underneath (one saves to the candidate's pipeline record, the other stores nothing), but now feel consistent to a candidate
- Removed two previously non-functional UI controls (a job-posting "upgrade" button that only logged to the console, a wellbeing-dashboard "export" button that only showed a placeholder alert) rather than leaving them visible but broken
- Centralized authorization into a single `lib/authz/` module (self, manager-of, company-admin, super-admin, service-secret, session-token, and composite "self-or-manager"/"self-or-company-admin" checks), replacing the previous ad hoc per-route pattern across most of the app's sensitive surfaces, and closed 16 confirmed critical/high-severity authorization vulnerabilities as part of that centralization — including previously possible impersonation risks (creating a leave request, performance goal, pulse update, or support ticket "as" an arbitrary other user) and a timeclock manager route that didn't verify the caller actually managed the team being viewed
- Shipped plan-based gating for creating a new support ticket (Momentum/Infinity only, not onboarding-gated), the one module previously available identically regardless of plan — support tickets are now consistent with every other plan-differentiated module
- Decommissioned the Payroll module entirely (business decision: ongoing Hungarian tax/contribution compliance maintenance, not differentiated versus dedicated payroll providers, diluted the AI-first positioning); existing payroll data was archived to a locked-down schema before the live tables were dropped
- Documented that the AI-based candidate scoring/ranking feature falls under the EU AI Act's high-risk classification, with several associated obligations currently unmet (documentation-only so far, no behavior change)
- Formally set the data retention period to 30 days for medical certificates and company-pipeline CV data (matching the public privacy notice and terms of service), added a one-off "delete now" tool for individual data-subject deletion requests, and a mandatory AI-processing consent checkbox on the public Job Assistant CV flow
- Shipped self-serve signup: a prospect can create a company and admin account and land in their dashboard unassisted, on Free by default, with recruitment and the Job Assistant usable immediately and the higher-complexity modules gated behind a manual onboarding-completion toggle

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI rewrite + genuinely voice-enabled AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, AI wellbeing chatbot access (Growth only), time & attendance/absences, performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket access can all be marketed as real plan differentiators (Free / Core / Growth). Base-fee-plus-per-employee pricing is itself a differentiator worth leading with, not just the feature list — but be precise that Core tops out at 30 employees and Growth starts at 31, not "no cap."
- Medical certificates now never touch any third-party AI or OCR service (manual entry only) — this is safe to market as a genuine privacy-by-design point for that specific feature. CVs are a separate matter: they're still sent to third-party AI providers for scoring (expected, since that's how the feature works), so continue to hold off on claiming full data-privacy/compliance for the platform as a whole.
- Do not make any compliance claim about the AI candidate-scoring feature. It has been documented as high-risk under the EU AI Act with most obligations currently unmet.
- Do not cite the current privacy notice, terms, or impressum pages as final, lawyer-reviewed legal copy in any campaign material — the content is now substantively accurate, including the operator's real identity and address, but none of the four pages have had qualified legal review, and the underlying business-registration question is still open.
- It is accurate to advertise instant, self-serve signup for recruitment ("start free in minutes, no sales call") and, on a paid plan, for opening a support ticket. Do not extend that promise to time & attendance, absences, performance, or the wellbeing chatbot, or medical certificate uploads — those require a manual onboarding call regardless of plan.
- When describing the recruitment AI interview capability, be careful to distinguish the assistant that helps a human recruiter (question suggestions + notes-to-summary, no voice, no candidate-facing AI conversation) from the fully automated candidate-run "Virtual Interview," which now shares the same voice-answer experience as the free public Job Assistant tool.

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment/applicant tracking, time & attendance, absences, medical certificates, performance management, and employee wellbeing, plus a support-ticket helpdesk.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — every plan-gateable module now enforces real limits, a new prospect can sign up and reach a working dashboard entirely unassisted, authorization has been substantially centralized and hardened (16 confirmed vulnerabilities closed), and the public legal pages now substantively and accurately describe the real product, all now committed and pushed — but none of the four legal pages have had qualified legal review, the impressum's honest "individual, not yet registered as a business" disclosure raises its own legal/tax question, and support-ticket notification emails are still mocked, so it's not yet production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting with a downloadable .docx, plus a genuinely voice-enabled mock interview and coaching report) is a real differentiator versus typical employer-only ATS AI tools, requires no account, and is explicitly instrumented as a top-of-funnel acquisition asset.
- The recruitment pipeline itself is now feature-rich: customizable per-company pipeline stages, AI CV scoring both for individual applicants and for instantly re-scoring the entire historical candidate database against a new opening, an advanced reporting dashboard (Growth only), and two functionally distinct AI interview mechanisms (an assistant for human-run interviews, and a separate fully automated, now voice-enabled candidate-run interview) that both surface as a single "AI Interview" score.
- Real plan tiers are Free, Core, and Growth. Both paid tiers are priced as a flat base fee plus a per-employee fee (Core: 25,000 HUF + 1,000 HUF/employee/month, hard-capped at 30 employees; Growth: 40,000 HUF + 750 HUF/employee/month, requires 31+ employees to subscribe), plus a one-time onboarding fee and an optional 15%-off annual billing plan. The employee-range boundary is enforced in billing logic specifically to prevent an account from ever reaching a headcount where Core would cost more than Growth despite Growth's larger feature set. Every gateable module — job postings, medical certificate uploads, the wellbeing chatbot (Growth only), time & attendance/absences, performance management (Growth only), advanced reporting (Growth only), and support ticket creation (Core and Growth) — differs meaningfully by plan, including a company with no active subscription, which permanently behaves like Free rather than being blocked outright.
- Self-serve signup exists and is deliberately scoped: a new company can create an account and start recruiting (and, on a paid plan, open support tickets) immediately, while time & attendance, absences, performance, and the wellbeing chatbot, plus (temporarily, for compliance reasons) medical certificate uploads, stay locked behind a manual, per-company onboarding-call toggle regardless of plan.
- Remaining weaknesses: the public legal pages, while now substantively accurate (including the operator's real name and address), have no qualified legal review, and the impressum's honest disclosure that no business entity is registered raises its own legal/tax question for a paid product processing health data; CV/recruitment data still goes to third-party AI providers (expected, not a flaw, but still unreviewed for DPA/subprocessor-terms purposes); the AI candidate-scoring feature has been found to fall under the EU AI Act's high-risk classification with most obligations unmet and the applicability date already passed; and support-ticket notification emails are still mocked rather than actually sent. Medical certificates, previously the product's most sensitive data-handling gap, no longer touch any third-party AI/OCR service at all.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure and missing authorization checks (both substantially addressed by the recent hardening pass) toward legal-copy finalization, third-party data-processing review, the AI Act compliance gap, and the operational scalability of manual onboarding calls.
- Customers have an in-app user manual covering every live feature, but it's English-only; internal/developer documentation (README, architecture docs) remains absent.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

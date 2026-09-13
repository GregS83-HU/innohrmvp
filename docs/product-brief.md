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

2026-09-12

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: the product now covers a genuinely broad set of end-to-end HR workflows (recruitment/ATS with two distinct AI interview mechanisms, a standalone public candidate-coaching tool, time & attendance, absences, medical certificates, performance management, an AI employee-wellbeing chatbot, and support tickets), all six of the plan-gateable modules (job postings, medical certificates, the wellbeing chatbot, attendance/absences, performance management, and now support tickets) enforce real plan limits, a self-serve signup flow lets a prospect reach a working dashboard unassisted, and authorization has just undergone a substantial, centralized hardening pass (`lib/authz/`) closing 16 confirmed critical/high-severity access-control vulnerabilities. Still consistent with an active MVP rather than a production-hardened product: the four public legal pages are explicitly named "-demo" (placeholder legal content, not reviewed/finalized copy), several smaller features are visibly half-wired (a "limit reached" upgrade button that only logs to the console, ticket-notification emails that are mocked and never actually sent, a happiness-dashboard export button that just shows an alert), a documented EU AI Act compliance gap remains open on the candidate-scoring feature, and there is still no internal/developer documentation beyond this brief and the in-app user manual.

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
- Pricing page (`/pricing`): three columns (Free / Momentum / Infinity) with limits and prices pulled from Stripe/the `forfait` table, a note that downgrading never deletes existing data, a note that time & attendance/absences/performance/the wellbeing chatbot/medical certificate uploads all additionally require a completed onboarding call regardless of plan, and every plan's button leads to the self-serve signup flow rather than a contact form or demo request.
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu), also exists and carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, the same pricing data, and an interactive ROI calculator, with its own pricing buttons leading straight into this app's signup flow.
- Legal pages exist at the root level (privacy, terms, cookies, impressum) and are reachable from every public-site page's footer. **All four are explicitly named with a "-demo" suffix in the codebase** (`/privacy-demo`, `/terms-demo`, `/impressum-demo`; `/cookies` is the one exception in naming) — a strong signal that this is placeholder legal content pending final legal review, not approved, production-ready legal copy. This should factor into any "commercial readiness" claim.
- Lightweight, privacy-respecting funnel tracking exists across this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact-form submissions, ROI calculator use, signup started/completed, and onboarding-marked-complete are logged (with an anonymous, client-generated, non-identifying session id — no CV/interview content, no account link) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`) used internally by the HRInno team to inform go-to-market decisions.

## Recruitment & Applicant Tracking

- **Job posting management**: an admin or recruiter creates a position with a name, a short public description, a longer "detailed" description used specifically to improve AI CV matching, a start date, employment type, and (on newer postings) location/location-type, salary range with an optional "make salary public" toggle, and an application deadline. Creating a new open position is capped per the company's plan (Free = 2 open positions; Momentum/Infinity allow more, with the possibility of an "unlimited" tier). There is currently no way to edit a live posting's text after creation — only closing it (which stops it accepting applications but keeps all its history) is supported.
- **Public job board**: candidates browse a company's open positions with no account needed; the public list currently shows the posting name and descriptions but not yet the richer fields (salary, location, deadline) — those only appear once a candidate opens a specific posting's apply page.
- **AI-generated job descriptions**: from a short rough draft, one click generates both the public-facing description and the longer AI-matching description, consuming one metered AI credit per generation.
- **Per-position analytics**: a dedicated analytics view per posting shows total candidates, average/median AI score, days open, applications per day, a timeline chart, a score-distribution histogram, and a breakdown of where candidates came from (direct upload vs. re-surfaced from the company's own historical candidate database).
- **Customizable applicant pipeline (Trello-style board)**: each company can order its own named pipeline stages (e.g. Unassigned, Screening, Interview, Offer, Rejected); recruiters drag and drop one or many candidates between stages, leave free-text comments on a candidate, and view each candidate's CV via a short-lived (10-minute) signed link — never a permanent public URL.
- **AI CV scoring — single candidate**: when a candidate applies, their CV is automatically scored 0–10 against the specific position's detailed description, producing both an internal recruiter-facing analysis and separate, softer feedback shown to the candidate themselves. Candidates scoring below the pass threshold are automatically routed into the pipeline's "Rejected" stage with no human step required; everyone else lands in "Unassigned" for a recruiter to triage. Company admins and the position's assigned manager are notified in-app the moment a new CV comes in.
- **AI CV re-scoring at database scale ("Analyse Massive")**: when opening a brand-new position, a recruiter can instantly re-score every candidate in the company's entire historical applicant database against the new opening — surfacing good-fit past applicants without asking anyone to reapply — with a live progress indicator as it works through the batch.
- **Two distinct AI interview mechanisms** exist and both ultimately show up as an "AI Interview" score on a candidate's pipeline card, which is worth being precise about when describing the feature externally:
  1. **Recruiter-run assisted interview**: a recruiter schedules a real, human-conducted interview (with an automatic calendar invite — compatible with Google/Outlook/Apple Calendar — sent to the candidate, including reminder and cancellation emails). Before the interview, the recruiter can ask the AI to suggest interview questions based on the candidate's CV and the job. After the interview, the recruiter types their own free-text notes, and the AI turns those into a structured summary (strengths, weaknesses, cultural fit, a recommendation, and a score). There is no audio/voice capture in this flow — the AI works only from what the recruiter types.
  2. **Automated interview taken directly by the candidate**: offered inline to strong applicants (CV score above a threshold) as an explicitly optional "Virtual Interview" — ten AI-generated questions, each with three suggested sample answers the candidate can pick from or override by typing their own. On completion, the AI scores the full transcript and writes a short HR-style summary automatically, with no recruiter involvement needed to generate the score. This flow is text/tap-based only — despite "Virtual Interview" branding, it does not use voice recognition (that capability exists only in the separate, standalone public Job Assistant tool below).

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
- Plan-gated: locked on Free; usable on Momentum for up to 20 employees and on Infinity for up to 100. Also requires the company's onboarding call to be marked complete on every plan, including paid ones.

## Absences / Leave Management

- **Employee self-service**: request leave by type and date range from a modal; the number of working days is calculated automatically. A running leave balance and a list of past requests are shown on the same page.
- **Manager approvals**: managers see a "Team Approvals" tab with a pending-count badge and approve or reject each direct report's request.
- **Calendar view**: a year-grid calendar (toggle between "my leave" and "my team's leave") with print/PDF export and an iCal (.ics) download so approved leave can be added to any external calendar.
- **Medical-certificate linkage**: sick leave can be tied directly to an uploaded medical certificate, either pre-filling a new request or attaching to an existing one.
- Shares the same plan gate as Time & Attendance (locked on Free; Momentum up to 20 employees; Infinity up to 100) and the same mandatory onboarding-completion requirement on every plan. Non-admin users simply don't see the module at all when it's locked; company admins see an explicit upgrade/locked notice.

## Medical Certificates

- **Upload with AI-assisted data extraction**: an admin uploads a scanned certificate (PDF or image, up to 1MB); the system runs OCR and then AI extraction to prefill the employee's name and sickness start/end dates, leaving any field the AI couldn't confidently read as an editable manual-entry box rather than guessing silently.
- **Mandatory AI-processing consent**: the upload cannot proceed until the user checks a box explicitly consenting to AI/OCR processing of the document, and that consent is timestamped and stored.
- **Confirm & save, with optional leave linkage**: after review, the certificate is saved permanently and can be linked to an existing or new leave request, automatically marking that leave as medically confirmed.
- **Certificate list & tracking**: a searchable, company-wide list of all certificates with a "hide treated" filter and a manual "treated" toggle (which also updates any linked leave request).
- **Private storage, on-demand access only**: files are never given a permanent public URL — every view goes through a freshly generated, short-lived (10-minute) signed link, scoped to the caller's own company.
- Capped per plan per calendar month (Free 5, Momentum 10, Infinity 20), and — uniquely among the plan-gated modules — held behind the mandatory onboarding-completion gate on every plan (including paid ones) as a deliberate, temporary compliance safeguard rather than a training gate, because certificate data is sent to third-party AI/OCR services with only best-effort redaction (see Known Limitations).

## Performance Management

- **Goal setting**: any employee can create their own goal (title, description, success criteria, quarter). A goal an employee creates themselves starts as a draft awaiting their manager's approval; a goal a manager or admin creates for someone starts active immediately. Creating a goal requires the employee to already have an assigned manager, tying the feature to the org chart.
- **Weekly pulse check-ins**: for every active goal, the employee gives a weekly status update — "On Track," "Some Issues," or "Blocked" — with a free-text progress comment (and a required explanation if blocked). One update per goal per calendar week; resubmitting the same week updates it in place.
- **Employee dashboard**: at-a-glance counts of active goals, goals needing this week's pulse update, red-flagged (blocked) goals, and goals awaiting the manager's approval.
- **Manager/team view**: a per-employee rollup across the whole team (active/red/yellow/green/needs-pulse/pending-approval counts), a dedicated "Red Flags" view listing every blocked goal across the team with its blockers, and a "Pending Approval" queue with inline one-click approval of employee-created draft goals.
- Available on the **Infinity plan only** (not included on Free or Momentum), and additionally requires the company's onboarding call to be marked complete.

## AI Employee Wellbeing Chatbot

- A conversational, PERMA-model-based wellbeing check-in (positive emotion, engagement, relationships, meaning, accomplishment, and work-life balance — two questions per dimension, twelve questions total), available in English and Hungarian.
- Each answer is scored by AI in real time; on completion the employee receives an overall wellbeing score plus three personalized pieces of AI-generated advice, with the tone of the closing message adapting to how well they scored.
- Sessions are anonymous by design (a random session token, not a personal account record).
- **Admin/manager dashboard**: shows only company-wide, aggregated results — average score, number of completed check-ins, a participation trend, and PERMA-dimension breakdowns with suggested areas for improvement. No individual employee's answers or identity are ever surfaced — this is stated explicitly in the in-app help documentation and matches how the underlying data is queried. Any authenticated member of the company (not only admins/managers) can view this aggregate dashboard.
- Available on **Momentum and Infinity** (not Free), and additionally requires the company's onboarding call to be marked complete.

## Support Tickets

- A helpdesk channel through which a company's employees and admins reach the HRInno support team directly (not a peer-to-peer or department-routed internal ticketing system) — company admins from HRInno's own operating companies get a cross-tenant support-agent view of every customer's tickets, i.e. HRInno's own support staff use this same interface.
- Creating a ticket captures a title, description, priority (low/medium/high/urgent), an optional category (technical support, bug report, feature request, account issue, billing, general inquiry, other), and file attachments (multiple files, 5MB each).
- **Plan-gated**: creating a *new* ticket now requires the Momentum or Infinity plan (a Free-plan or no-active-plan company sees an upgrade prompt instead of the create form); this gate does not require the onboarding call to be complete, so it's available immediately after self-serve signup on a paid plan. Existing tickets remain fully viewable and repliable regardless of plan — the gate only applies to opening new ones.
- In-app notifications alert relevant users when a ticket is created; a separate, planned email-notification path (new ticket / new message / status change) exists as message templates but is not currently wired to actually send email (see Known Limitations).

## General Feedback

- A lightweight 1–5 star rating plus free-text comment widget attached to the public marketing/demo experience (not tied to a company's employees) — a visitor's overall impression of the demo, distinct from the internal support-ticket system above.

## Contact / Lead Capture

- A public contact form (first/last name, email, phone, company name, comment, GDPR consent required, marketing-consent opt-in) with basic rate-limiting and input sanitization, feeding an internal "contact submissions" list.
- Submissions are reviewed exclusively by HRInno's own internal team (not by any customer), who can search, filter, update status, add notes, and delete entries — this is the internal sales/lead-qualification tool that sits upstream of a company's decision to sign up.
- A functioning unsubscribe link lets a contact opt out of future marketing email, which is recorded against their submission record.

## Documents

- Medical certificate upload, listing, and download, with AI-based OCR text extraction (see Medical Certificates above for the full workflow). Before OCR'd text is sent to the AI provider for extraction, a best-effort regex redaction pass strips likely national ID numbers, phone numbers, and addresses (dates are protected so extraction still works); this is not a guarantee of complete PII removal.
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
- **Adding employees**: a company admin adds employees one at a time (assigning a manager and a start date) from inside the app; this is capped by the plan's employee-seat limit before the new account is created.
- **Bulk import**: uploading a CSV/XLSX of many users at once, spanning multiple companies if needed, exists as an internal HRInno-team tool (not self-serve for customers) — each new row is checked individually against that company's seat cap.
- **Manager assignment and activation status**: an admin can reassign an employee's manager at any time, and can activate/deactivate an employee's account (there is no separate "suspended" state beyond active/inactive); a deactivated employee no longer counts against the plan's seat cap.

## Billing & Subscription

- Three real plan tiers — **Free**, **Momentum**, and **Infinity** — with live prices and limits read from Stripe/the `forfait` table (not hardcoded), so changing a plan's limits in the database takes effect without a code deploy.
- Subscribing/upgrading is a self-serve Stripe Checkout flow from inside the dashboard's subscription page; canceling can be done in-app (an immediate, not end-of-period, cancellation clearing the plan right away) and is also correctly synced if a customer cancels directly through Stripe rather than through the app.
- **AI credits**: a monthly, metered allowance (Free 50 / Momentum 100 / Infinity 250) consumed specifically by AI job-description generation and by CV scoring (both single-candidate and bulk re-scoring); running out blocks that specific action with a clear "no credits remaining" message until the monthly reset, or the admin can buy an additional one-time top-up pack through Stripe. The AI wellbeing chatbot and medical-certificate OCR are not metered by this credit pool — they're separately capped by their own plan flags/monthly limits.
- **Downgrade/cancellation promise, enforced architecturally, not just stated**: canceling or downgrading never deletes or hides any data the company already has — plan checks only ever run at the moment of *creating* something new (a job posting, a certificate upload, a new employee), never on reading or editing existing records. A company with no active subscription (never subscribed, or canceled/expired) permanently behaves exactly like the Free plan for every gated feature rather than being blocked outright.
- **Per-company outbound email**: a company admin can configure their own outbound SMTP relay so platform emails are sent from the company's own domain; the stored password is encrypted at rest and never redisplayed.

## Settings

- Plan-based feature gating: a single, centrally-defined entitlements layer checks a company's plan before allowing new job postings, new medical certificate uploads, wellbeing-chatbot sessions, time & attendance/absences actions, performance-management actions, new support tickets, and adding a new employee (seat cap), using per-plan limits/flags stored in the `forfait` table and read live (not cached/hardcoded). See Section 11 for the actual plan tiers.
- Onboarding-completion gate: separate from and layered on top of the plan-based check above, time & attendance, absences, performance management, and the AI wellbeing chatbot, plus medical certificate uploads, are unavailable to any company — including one already paying for Momentum or Infinity — until the HRInno team manually marks that company's onboarding as complete. A company admin who hits one of these modules before then sees a clear "available after your onboarding call" message with a contact link, not a broken page. Recruitment/job postings and support tickets are explicitly not subject to this gate, so a self-serve company can start recruiting and asking for help immediately.
- Automated onboarding-call booking: right after self-serve signup, the new admin automatically gets an email with a Calendly link to book the onboarding call. If they haven't booked within a few business days, a one-time reminder email goes out automatically with the same link. Actually running the call and flipping the company to onboarded remains a fully manual step by the HRInno team.
- Data retention settings (super-admin only): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable with zero code change or redeploy, with a visible audit trail and a live preview of what the next scheduled deletion run would delete. A daily scheduled job deletes data older than whatever is currently configured (30 days today for both data types, matching the public privacy notice). A one-off "delete now" tool also exists to fulfil an individual data-subject deletion request ahead of the scheduled sweep.

## Administration (Internal, HRInno-team-only)

- Manual onboarding-completion toggle: a simple per-company list with current status and a one-click toggle, used by the team to unlock a self-serve company's higher-complexity modules once its setup call is done, plus visibility into whether the automated booking/reminder emails have already been sent to that company.
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

- Plan-based feature gating (Free vs. Momentum vs. Infinity) is real and substantial, covering opening a new job position, medical certificate uploads, the AI wellbeing chatbot, time & attendance/absences, performance management, total employee seats, and — as of the most recent work — support ticket creation. No module remains entirely ungated by plan today.
- The public legal pages (privacy notice, terms of service, impressum) are explicitly named as "-demo" pages in the codebase — a strong signal this is placeholder content pending final legal sign-off, not finished, production-ready legal copy. This should be resolved before any campaign leans on these pages as authoritative.
- Several smaller pieces of UI are visibly stubbed rather than functional: the "limit reached, upgrade" button on the new-position page does nothing but log to the browser console instead of navigating anywhere; support-ticket notification emails (new ticket / new reply / status change) have message templates defined but the underlying send function is a mock that only logs and never delivers actual email; the wellbeing dashboard's "Export" button shows a plain alert instead of exporting anything; and the anti-abuse cooldown on starting a new wellbeing chatbot session has a logic bug that makes it effectively inert.
- There is no way to edit a live job posting's text after it's created — only closing it is supported, which stops new applications but keeps its history.
- The AI auto-rejection threshold is inconsistent between the two CV-scoring paths: a single freshly-submitted candidate is auto-rejected below a 5/10 score, while the bulk "re-score my whole candidate database against this new job" tool uses a 7/10 threshold — the same scoring model applying two different pass bars depending on which button triggered it.
- Medical certificate upload is gated at the API level to company admins only, while the upload control itself is surfaced on the ordinary employee-facing absence page with no visible restriction — a non-admin employee attempting to use it as pictured in the UI would be rejected by the server. Certificate upload should currently be described as an HR-admin-mediated workflow, not employee self-service.
- Customers now have an in-app user manual, but it exists in English only; French and Hungarian customers get no localized help content despite the product itself being fully trilingual. Internal/developer-facing documentation is still absent — the README remains unmodified Next.js boilerplate, and this brief is still the only business-facing document in the repo.
- Self-serve signup is scoped, not full-platform: a brand-new company can sign up and use recruitment/Job Assistant and support tickets (on a paid plan) completely unassisted, but time & attendance, absences, performance, and the AI wellbeing chatbot, plus medical certificate uploads, all stay locked behind a manual onboarding-completion toggle regardless of plan. Getting the prospect to book a call is automated, but everything after that — actually running the call and flipping the toggle — is a manual, one-at-a-time action with no capacity-planning tooling attached.
- Medical certificate and CV data are still sent to third-party services (OCR.Space, OpenRouter/OpenAI). A best-effort regex redaction pass (national ID/phone/address) runs on medical certificate text before that AI call, but this redaction is not a guarantee (fixed regex patterns, not an ML PII detector, so unusual/non-Hungarian formats can still get through), and whether the providers' own data-handling terms are acceptable for health data, or whether a formal Data Processing Agreement is needed, has not been reviewed. As an interim mitigation, medical certificate uploads for self-serve companies are held behind the onboarding-completion gate until this review is complete.
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

- OpenAI SDK and OpenRouter (models used include Claude 3.5 Sonnet and Claude 3 Haiku for recruitment scoring/generation, GPT-4o-mini for the public Job Assistant, GPT-3.5-turbo and Mistral for various interview/assistant flows, with automatic fallback chains between providers on failure)
- OCR.Space (document OCR for medical certificates)
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
- OCR.Space (document OCR)
- Resend / Nodemailer (transactional email)
- Calendly (onboarding-call booking link)
- Vercel Analytics / Speed Insights

---

# 11. Pricing

Current pricing strategy, confirmed against the live `forfait` table and its seeding migrations (not inferred).

Free

- No Stripe price attached (default/no-payment tier). Grants: up to 2 open job positions, up to 5 medical certificate uploads/month, no AI wellbeing chatbot access, 50 included AI credits/month, no support-ticket creation. Time & attendance/absences and performance management are locked (visible to admins as a locked preview only, not usable for real data entry). Employee seats are uncapped on Free.

Momentum

- Paid tier (~20 000 HUF/month). Grants: up to 5 open job positions, up to 10 medical certificate uploads/month, AI wellbeing chatbot access, 100 included AI credits/month, support-ticket creation. Time & attendance and absences are usable for up to 20 employees. Performance management is still locked (same as Free).

Infinity

- Paid tier (~45 000 HUF/month). Grants: up to 10 open job positions, up to 20 medical certificate uploads/month, AI wellbeing chatbot access, 250 included AI credits/month, support-ticket creation. Time & attendance, absences, and performance management are all usable, for up to 100 employees. Adding an employee beyond 100 isn't self-serve — the app shows a "contact us for a custom quote" state rather than a hard block.

Notes

- Plan names are Free / Momentum / Infinity.
- A company with no active plan (the state both before ever subscribing and immediately after canceling/expiry) permanently behaves like the Free plan for every gated feature, not blocked outright. A company that had more items than Free's caps allow before downgrading keeps full read/edit/close access to everything it already has; only creating new items beyond the cap is blocked.
- A Stripe subscription canceled directly on Stripe's side (not through the app's own cancel button) is correctly synced back to the company record via webhook, clearing the plan to the same null/Free-fallback state as an in-app cancellation. A failed renewal payment triggers a 7-day grace period before the plan is downgraded.
- Per-plan limits/flags live in the `forfait` table and are read live by the app, not hardcoded — changing a plan's limits in Supabase takes effect without a code deploy.
- AI credits are metered per AI-generation call (job-description generation, single CV analysis, bulk CV re-scoring) independently of the boolean/capacity gates above; a top-up pack can be purchased one-time via Stripe if a company's monthly allowance runs out.
- Plan-tier gating now covers job posting creation, medical certificate uploads, the AI wellbeing chatbot, time & attendance/absences, performance management, total employee seat count, and support ticket creation. Every module that can be plan-differentiated now is.
- Every new company created through self-serve signup starts on Free automatically (no plan is selected during signup itself, even if the visitor clicked a Momentum or Infinity button on the pricing page). Upgrading to a paid plan is a separate step taken afterward from inside the dashboard's existing subscription page.
- Time & attendance, absences, performance, and the AI wellbeing chatbot, plus medical certificate uploads, are additionally withheld from every self-serve company — on any plan, including paid ones — until the team manually marks that company's onboarding as complete. Support ticket creation and recruitment/job postings are not subject to this onboarding gate.

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

- Use the real plan names — Free, Momentum, Infinity — not generic tier names like "Starter/Pro/Enterprise."
- Plan-based gating is now real and complete across every gateable module: number of open job postings, number of medical certificate uploads per month, AI wellbeing chatbot access (Momentum/Infinity only, not Free), time & attendance/absences (locked on Free; usable on Momentum up to 20 employees; usable on Infinity up to 100), performance management (Infinity only), total employee seats, and support ticket creation (Momentum/Infinity only). All of these are safe to market as plan differentiators.
- The public Job Assistant (free CV scoring + AI-rewritten CV with a downloadable .docx + genuinely voice-enabled mock interview + coaching report) is the strongest, most differentiated feature in the product and requires no company account — it is the best candidate for a dedicated acquisition campaign, distinct from and not to be confused with the "AI Interview" features that live inside a company's own recruitment pipeline.
- Be precise about the recruitment pipeline's two different "AI interview" mechanisms when writing copy: one is an AI *assistant* that helps a human recruiter prepare questions and summarize their own notes after a real interview; the other is a fully automated interview the candidate takes alone, with no voice component. Only the free, public Job Assistant tool uses actual voice recognition — do not imply the in-pipeline "Virtual Interview" is voice-based.
- Storage access control for medical certificates and CVs is hardened (private storage, short-lived signed URLs, company-scoped database access), a best-effort PII redaction pass runs on medical certificate text before it's sent to the AI provider, and the data retention period is formally set to 30 days — but do NOT claim full compliance (e.g. GDPR/HIPAA) yet: the redaction is best-effort (not an ML PII detector, can miss things), and whether the AI/OCR providers' own terms are acceptable for health data hasn't been reviewed.
- Do NOT present the AI job-description generator as fully polished — it has a known, unresolved bug worked around manually rather than fixed.
- Do NOT claim the AI candidate-scoring feature is EU AI Act compliant. It has been documented as high-risk under the Act (recruitment/candidate evaluation), and none of the associated obligations are currently met — this is a legal-review item, not a marketing claim to make either way, positive or reassuring.
- Do NOT treat the current privacy notice, terms of service, or impressum as final, reviewed legal copy — they are explicitly named as "-demo" pages in the product and should not be cited as authoritative in customer-facing or contractual contexts until legal sign-off happens.
- Do NOT make guarantees about candidate CV data privacy or retention beyond what the privacy notice/terms of service currently state (30-day retention) — no further documented policy exists.
- Self-serve sign-up is real and can be marketed as such: a company can sign up and start posting jobs / using the Job Assistant in minutes, with no sales call required, and (on a paid plan) can also open a support ticket immediately. Do NOT imply that time & attendance, absences, performance, or the AI wellbeing chatbot, or medical certificate uploads, are available immediately after self-serve signup — all five require a manual onboarding call with the team first, regardless of plan, even on Momentum or Infinity.
- Avoid describing medical certificate upload as an "employee self-service" feature in copy — the backend restricts it to company admins even though it is currently surfaced on an employee-facing screen; describe it as an HR-admin-managed workflow instead until that's resolved.
- A minimal brand (indigo/emerald color palette, Sora/Inter fonts) exists on the homepage and pricing page — usable as a starting point for campaign creative, but not yet a full brand system.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. Every plan-gateable module (recruitment, medical certificates, wellbeing chatbot, attendance/absences, performance, seats, and now support tickets) enforces real limits, a prospective customer can sign up and reach a working dashboard entirely unassisted, and authorization has just gone through a substantial, centralized hardening pass. Still not production-hardened — see Section 8 for what remains, most notably the placeholder ("-demo") legal pages and a handful of visibly stubbed UI affordances.

Major blockers

- Self-serve signup covers recruitment and (on a paid plan) support tickets unassisted; time & attendance, absences, performance, and the wellbeing chatbot, plus medical certificate uploads, still require a manual onboarding call before a self-serve company can use them, with running the call and flipping the toggle remaining a fully manual, uncapacity-planned step.
- The public legal pages are explicitly placeholder ("-demo") content pending legal review — a real blocker for any launch messaging that references privacy, terms, or compliance claims.
- Medical certificate and CV data is still sent to third-party AI/OCR services; best-effort redaction and a runtime-adjustable 30-day retention mechanism exist, but the providers' own data-handling terms for health data still haven't been reviewed.
- The AI candidate-scoring feature (core to the recruitment pitch) has been documented as high-risk under the EU AI Act, with an applicability date that has already passed and none of the associated obligations currently met.
- A few customer-visible features are only partially wired (non-functional "upgrade" CTA on the position-limit banner, ticket-notification emails that don't actually send, a non-functional wellbeing-dashboard export button) — small individually, but each is a moment where a real customer would hit a dead end.
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

- Now that every gateable module (including support tickets) has plan-based differentiation, is the current split (which modules require Momentum vs. Infinity, and which require the onboarding call) the intended long-term packaging, or should it be revisited now that the picture is complete?
- Are OCR.Space's and OpenRouter's own data-handling terms acceptable for health data, and is a formal Data Processing Agreement needed with either? Has the daily deletion job's required environment configuration been confirmed correctly set in production?
- What is the realistic remediation plan and timeline for the AI candidate-scoring feature's EU AI Act high-risk obligations, given the applicability date (2 August 2026) has already passed? Should a candidate-facing "AI is used to evaluate you" notice be added to the application flow?
- When will the four public legal pages move from their current "-demo" placeholder status to final, legally reviewed copy, and does that block any planned marketing campaign that links to them?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond weak i18n/code-comment signals.
- What turnaround target (if any) should the team hold itself to for actually running the onboarding call and flipping a new company's toggle, now that booking itself is automated? This remains a fully manual step with no queue or capacity tooling.
- Should the two "AI interview" mechanisms inside the recruitment pipeline be renamed or otherwise disambiguated in the product itself, given they're functionally quite different (assistant-for-a-human-interviewer vs. fully automated candidate-run interview) but currently look like one feature to an end user?

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Centralized authorization into a single `lib/authz/` module (self, manager-of, company-admin, super-admin, service-secret, session-token, and composite "self-or-manager"/"self-or-company-admin" checks), replacing the previous ad hoc per-route pattern across most of the app's sensitive surfaces
- Closed 16 confirmed critical/high-severity authorization vulnerabilities as part of that centralization — including previously possible impersonation risks (creating a leave request, performance goal, pulse update, or support ticket "as" an arbitrary other user) and a timeclock manager route that didn't verify the caller actually managed the team being viewed
- Shipped plan-based gating for creating a new support ticket (Momentum/Infinity only, not onboarding-gated), the one module previously available identically regardless of plan — support tickets are now consistent with every other plan-differentiated module
- Decommissioned the Payroll module entirely (business decision: ongoing Hungarian tax/contribution compliance maintenance, not differentiated versus dedicated payroll providers, diluted the AI-first positioning); existing payroll data was archived to a locked-down schema before the live tables were dropped
- Documented that the AI-based candidate scoring/ranking feature falls under the EU AI Act's high-risk classification, with several associated obligations currently unmet (documentation-only so far, no behavior change)
- Formally set the data retention period to 30 days for medical certificates and company-pipeline CV data, matching the public privacy notice and terms of service, and added a one-off "delete now" tool for individual data-subject deletion requests ahead of the scheduled sweep
- Added best-effort PII redaction on medical certificate text before it reaches the AI provider, and a mandatory AI-processing consent checkbox on both the certificate upload flow and the public Job Assistant CV flow
- Fixed the public job board's company-scoping bug (it was silently returning every company's positions rather than just the requested company's) and added exclusion of positions whose end date has passed
- Fixed a login/session bug that made a manager's or admin's role randomly fail to register right after signing in until they logged out and back in
- Shipped self-serve signup: a prospect can create a company and admin account and land in their dashboard unassisted, on Free by default, with recruitment and the Job Assistant usable immediately and the higher-complexity modules gated behind a manual onboarding-completion toggle

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI rewrite + genuinely voice-enabled AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, AI wellbeing chatbot access, time & attendance/absences, performance management, total employee seats, and now support ticket access can all be marketed as real plan differentiators (Free / Momentum / Infinity) — every gateable module now differentiates.
- Continue to hold off on claiming full data-privacy/compliance for medical certificates and CVs — access control, best-effort redaction, and a formally-set 30-day retention period are in place, but the AI/OCR providers' own terms for health data haven't been legally reviewed.
- Do not make any compliance claim about the AI candidate-scoring feature. It has been documented as high-risk under the EU AI Act with most obligations currently unmet.
- Do not cite the current privacy notice, terms, or impressum pages as final legal copy in any campaign material — they are internally marked as placeholder ("-demo") content pending legal review.
- It is accurate to advertise instant, self-serve signup for recruitment ("start free in minutes, no sales call") and, on a paid plan, for opening a support ticket. Do not extend that promise to time & attendance, absences, performance, or the wellbeing chatbot, or medical certificate uploads — those require a manual onboarding call regardless of plan.
- When describing the recruitment AI interview capability, be careful to distinguish the assistant that helps a human recruiter (question suggestions + notes-to-summary) from the fully automated candidate-run "Virtual Interview" — conflating them overstates what either one alone does, and neither of them uses voice (only the separate public Job Assistant tool does).

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment/applicant tracking, time & attendance, absences, medical certificates, performance management, and employee wellbeing, plus a support-ticket helpdesk.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — every plan-gateable module now enforces real limits, a new prospect can sign up and reach a working dashboard entirely unassisted, and authorization has just been substantially centralized and hardened (16 confirmed vulnerabilities closed) — but the public legal pages remain explicit placeholders and several smaller UI affordances are visibly stubbed, so it's not yet production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting with a downloadable .docx, plus a genuinely voice-enabled mock interview and coaching report) is a real differentiator versus typical employer-only ATS AI tools, requires no account, and is explicitly instrumented as a top-of-funnel acquisition asset.
- The recruitment pipeline itself is now feature-rich: customizable per-company pipeline stages, AI CV scoring both for individual applicants and for instantly re-scoring the entire historical candidate database against a new opening, per-position analytics, and two functionally distinct AI interview mechanisms (an assistant for human-run interviews, and a separate fully automated candidate-run interview) that both surface as a single "AI Interview" score.
- Real plan tiers are Free, Momentum, and Infinity, and every gateable module — job postings, medical certificate uploads, the wellbeing chatbot, time & attendance/absences, performance management (Infinity only), total employee seats, and now support ticket creation — differs meaningfully by plan, including a company with no active subscription, which permanently behaves like Free rather than being blocked outright.
- Self-serve signup exists and is deliberately scoped: a new company can create an account and start recruiting (and, on a paid plan, open support tickets) immediately, while time & attendance, absences, performance, and the wellbeing chatbot, plus (temporarily, for compliance reasons) medical certificate uploads, stay locked behind a manual, per-company onboarding-call toggle regardless of plan.
- Remaining weaknesses: the public legal pages are explicit "-demo" placeholders, not final legal copy; medical certificate/CV data still goes to third-party AI/OCR services with only best-effort redaction and unreviewed provider terms for health data; the AI candidate-scoring feature has been found to fall under the EU AI Act's high-risk classification with most obligations unmet and the applicability date already passed; and a handful of smaller features (upgrade CTA, ticket email notifications, wellbeing-dashboard export) are visibly stubbed rather than functional.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure and missing authorization checks (both substantially addressed by the recent hardening pass) toward legal-copy finalization, third-party data-processing review, the AI Act compliance gap, and the operational scalability of manual onboarding calls.
- Customers have an in-app user manual covering every live feature, but it's English-only; internal/developer documentation (README, architecture docs) remains absent.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

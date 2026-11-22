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

2026-11-21

## Status
- Idea
- MVP ← current
- Alpha
- Beta
- Production
- Growth

Assessment based on evidence in the codebase: the product now covers a genuinely broad set of end-to-end HR workflows (recruitment/ATS with two AI interview mechanisms — now both delivered with the same voice-enabled experience — plus a standalone public candidate-coaching tool, time & attendance, absences, medical certificates, performance management, an AI employee-wellbeing chatbot, and support tickets), every plan-gateable module (job postings, medical certificates, the wellbeing chatbot, attendance/absences, performance management, advanced recruitment reporting, and support tickets) enforces real plan rules, and onboarding is now fully self-serve: a prospect signs up, goes through a short in-app setup wizard (company, team, plan), pays by card, and every module in their plan unlocks automatically the moment the first payment succeeds — no call with the team is required. Authorization has undergone two rounds of hardening: a centralized `lib/authz/` module closed 16 confirmed critical/high-severity access-control vulnerabilities in application code, and a separate live-database audit then found that four schema/RLS migrations had silently never been applied to the production database (a gap between what the migration files said and what was actually live), fixing three more real, confirmed-exploitable issues — unauthenticated create/edit/close access to any company's job postings, every plan-gated feature check failing open or closed unpredictably because a required `forfait` column was missing, and any authenticated user (not just a company's own admins) being able to read and write another company's SMTP credentials. Two previously dead UI controls (a job-posting "upgrade" button and a wellbeing-dashboard "export" button) have also since been removed. Medical certificates no longer involve any third-party AI or OCR service at all — a company admin now manually enters the employee name and sickness dates instead of an AI/OCR pipeline extracting them, closing what was previously the product's most sensitive health-data exposure. The legal/policy pages have been substantively rewritten to describe the real, paid product (not a demo) and their footprint has been split: the privacy notice and cookie notice stay in-app (at `/privacy` and `/cookies`, the legacy `-demo` URL suffix now fully removed) since they document this app's own data handling, while the terms of service and impressum now live on the external marketing site (www.hrinno.hu/terms and /legal-notice) with this app's footer linking out to them, and the shared privacy/cookie contact address is now `info@hrinno.hu`. The cookie-consent banner genuinely gates optional analytics rather than only displaying a choice with no effect. The impressum carries the operator's real name and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) rather than placeholders, and honestly discloses that no business entity (sole trader or company) is registered yet — but none of the legal pages have been reviewed by qualified legal counsel, and whether operating without a registered business entity is appropriate for a paid product processing health data at this scale is an open question (see Open Questions). The app's default language switched from English to Hungarian (matching the marketing site, which always defaults to Hungarian) and no longer auto-detects the visitor's browser language, so a visitor arriving from the Hungarian marketing site sees a consistent language rather than switching based on their OS locale; the app header logo was also redesigned to match the marketing site's dark badge/sparkle mark so the two properties read as the same brand. Pricing has just been overhauled from two flat-fee tiers to base-fee-plus-per-employee pricing on Core (capped at 30 employees) and Growth (requires 31+), with an optional one-time assisted-onboarding fee, optional annual billing, a manually-applied founding-customer discount, and a daily notification cron that would alert a Core account once its headcount crosses the point where Growth becomes cheaper — though under the current numbers that crossover point (61 employees) is mathematically unreachable while Core's 30-employee cap stands, so the cron currently runs as a harmless no-op, kept in place in case the cap policy changes later. All of this is real, working code, but not yet exercised by a real paying customer, and self-serve tier/interval switching for an already-subscribed company isn't built yet. Still consistent with an active MVP rather than a production-hardened product: support-ticket notification emails are still mocked and never actually sent, a documented EU AI Act compliance gap remains open on the candidate-scoring feature, and there is still no internal/developer documentation beyond this brief and the in-app user manual.

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

Not formally documented, but the product now defaults to Hungarian rather than English for both this app and the marketing site — a deliberate choice (not just an available option), with browser-language auto-detection removed specifically so a visitor doesn't land in a different language than the marketing site they arrived from. Combined with Hungarian-denominated pricing (HUF), the impressum's Hungarian business address, and Hungarian-specific business-day logic, this is a much stronger signal than before that Hungary is the primary target market, though it is still not stated as an explicit ICP (company size and industry vertical remain undocumented). French-language code comments and French localization remain a secondary, weaker signal of a possible French-speaking EU market too.

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
- Benefit 4: Fully self-serve onboarding: a new company can sign up and start posting jobs immediately on Free, and can unlock the rest of the platform (time & attendance, absences, performance, the AI wellbeing chatbot, medical certificates) in minutes by finishing a short in-app setup wizard and paying by card — no sales call, no waiting for the team. Customers who want hand-holding can add an optional paid assisted onboarding call, without it delaying access

## Competitive Advantages

The clearest differentiator found in the code is the public, candidate-facing Job Assistant (free CV scoring, AI-rewritten CV with a downloadable .docx, a genuinely voice-enabled mock interview using the browser's native speech recognition, and an AI coaching report) — most HR/ATS tools build AI screening only for the employer side, not as a free, unauthenticated tool for candidates. No competitor comparison exists in the repo to confirm this is unique in the market (see Section 12).

---

# 5. Current Features

List ONLY completed features, based on what exists in the code.

## Authentication & Account Model

- Supabase-based authentication (email/password), with a standard password-reset/recovery-link flow.
- Multi-tenant company/organization accounts (org slug-based), one admin per newly created company.
- Self-serve signup (`/signup`): a prospect creates a brand-new company and its first admin account in one step — company name, admin name, work email, and password — and is logged straight in, with no manual step from the team and no email-verification wait. The new company always starts on the Free plan with onboarding marked incomplete, and the admin lands directly in the setup wizard (see Self-Onboarding below), with a "Skip for now" link for those who only want to recruit on Free. The signup page tells the prospect upfront that time & attendance, absences, performance management, and the wellbeing chatbot unlock as soon as they finish the short in-app setup and choose a plan, with no call needed.
- **Self-onboarding wizard** (`/jobs/[slug]/onboarding`, company admins only): three steps — (1) confirm the company name, (2) add employees (opens the existing add-employee screen in a new tab; the headcount refreshes automatically and the wizard recommends Core for up to 30 employees or Growth for 31+), (3) choose Core or Growth, monthly or annual (15% off), see the estimated recurring cost and first payment, and optionally tick a paid assisted onboarding call — then pay through Stripe Checkout. The card is saved and the recurring subscription starts; when Stripe confirms the first payment, the company is automatically marked onboarded and every onboarding-gated module included in its plan unlocks. The wizard waits on a "confirming your payment" screen and then shows a "You're all set" page with links to the newly unlocked modules. Nothing in the gated set unlocks before a successful payment, which keeps cost-bearing modules away from non-paying accounts. Available in English, Hungarian, and French.
- Admin-gated routes for positions, user management, billing, and every higher-complexity HR module.

## Dashboard

- Per-company SaaS entry point at `/jobs/[slug]` — reached only by someone who knows their company's slug (not discoverable/indexed). Not logged in: company branding (logo/name) and a login prompt. Logged in: "Welcome back" plus role-aware quick links to the company's HR tools, grouped under four headings — Recruitment, Time & absences, Performance & wellbeing, and Administration (subscription, users, tickets; admins only). Until the company has finished self-onboarding, admins also see a "Finish setting up your account" banner linking to the setup wizard.
- Distinct from the public homepage at `/` (see Marketing/Public Site below).

## Visual Design

- The whole app uses one restrained, consistent visual style (applied app-wide on 2026-11-21): a single indigo accent for primary actions, links and selection; neutral slate grays for page backgrounds, cards and text; and green, amber and red only to signal success, warning and error. There are no gradients, no oversized drop shadows and no grow-on-hover effects. Cards are flat white panels with thin borders, and every screen shares the same primary button.
- Color that carries meaning is preserved: the absence calendar's leave-type, approved, pending and public-holiday colors, and the green/yellow/red CV score and status indicators.
- Typography is Sora for headings and Inter for text. The public Job Assistant keeps its own green identity, and the homepage and pricing page were already in this style.
- The interface uses no emoji. Traffic-light statuses (performance goals, weekly pulse check-ins, red flags) are shown as small green, amber, red or gray dots, and other pictograms are simple single-color icons. The wellbeing chatbot's built-in tips and messages are plain text. Transactional emails (interview invitations, the team's onboarding notification) still use a few emoji labels such as calendar and clock symbols.

## Marketing / Public Site

- Public homepage (`/`, no company slug) leads with the free Job Assistant (AI CV scoring, no account needed) as the primary hook, with a "For employers" section below introducing the full platform and a link to the pricing page.
- Pricing page (`/pricing`): three columns (Free / Core / Growth) showing each paid tier's flat monthly base fee plus its per-employee fee (cost scales with headcount) and the employee-count range each tier is valid for (Core: up to 30; Growth: 31+), a note about the optional one-time assisted-onboarding fee and the 15%-off annual billing option, a note that downgrading never deletes existing data, a note that setup is fully self-serve (time & attendance/absences/performance/the wellbeing chatbot/medical certificate uploads unlock as soon as the in-app setup is finished and the first payment goes through, with no onboarding call required), and every plan's button leads to the self-serve signup flow rather than a contact form or demo request.
- A separate repository/site, `hrinno-marketing` (www.hrinno.hu, Hungarian default with an English version at /en), carries an aligned pitch: the Job Assistant, a "Full HR Platform" section, a pricing section on the homepage (there is no separate /pricing page), and an interactive ROI calculator. Its signup buttons lead straight into this app's signup flow. Checked against the live site on 2026-11-15: it already describes self-serve setup ("no call required") and the optional 60,000 HUF assisted onboarding, and its Core/Growth prices, employee ranges, position/certificate/AI-credit limits and worked price examples match the app. One error remains: the Core pricing card says the AI wellbeing chatbot is included (in both languages), but in the app it is Growth only. Its legal pages also show unfinished placeholders (see Known Limitations).
- Two legal pages remain in-app, at clean root-level paths with no `-demo` suffix (`/privacy`, `/cookies`), reachable from every public-site page's footer: an accurate GDPR-structured privacy notice (data categories including special-category health data, legal bases, controller/processor roles, AI/automated-decision disclosure, retention periods) and a cookie notice with an accurate table of the specific cookies/local-storage items actually used. Both stayed in-app because they document this app's own data handling specifically. The terms of service and impressum have moved out to the external marketing site (www.hrinno.hu/terms and www.hrinno.hu/legal-notice) — this app's footer links out to them (opening in a new tab) rather than hosting its own copies — since they're shared, company-wide legal content rather than something specific to this application. The shared privacy/cookie contact address is `info@hrinno.hu` (the earlier placeholder domain, `privacy@innohr.hu`, is gone from every page). The impressum shows the operator's real name and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) and honestly states that no business entity is registered yet, rather than showing "to be completed" placeholders — but none of the legal pages have had legal counsel review, which should happen before treating them as final for a real launch.
- Lightweight, privacy-respecting funnel tracking exists across this app and `hrinno-marketing`: Job Assistant start/completion, pricing views and per-plan CTA clicks, contact-form submissions, ROI calculator use, signup started/completed, self-onboarding completed (first payment succeeded), and manual onboarding overrides are logged (with an anonymous, client-generated, non-identifying session id — no CV/interview content, no account link) to a shared Supabase table, viewable in a super-admin funnel dashboard (`/admin/funnel`) used internally by the HRInno team to inform go-to-market decisions. This tracking now genuinely honors the cookie-consent banner (previously the banner recorded a choice but nothing in the code actually read it): the anonymous funnel-session identifier is only created, and no event is recorded, until a visitor explicitly accepts optional analytics — declining, or not yet answering, means no tracking happens at all. This is a real, if likely small, reduction in visible top-of-funnel volume versus the prior always-on behavior, traded for the cookie notice's claims being actually true rather than aspirational.

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
- Plan-gated: locked on Free; usable on both Core (up to 30 employees) and Growth (31+ employees), with cost scaling via the per-employee billing component (see Section 11). Like every onboarding-gated module, it unlocks once the company has finished the setup wizard and its first subscription payment has succeeded.

## Absences / Leave Management

- **Employee self-service**: request leave by type and date range from a modal; the number of working days is calculated automatically. A running leave balance and a list of past requests are shown on the same page.
- **Manager approvals**: managers see a "Team Approvals" tab with a pending-count badge and approve or reject each direct report's request.
- **Calendar view**: a year-grid calendar (toggle between "my leave" and "my team's leave") with print/PDF export and an iCal (.ics) download so approved leave can be added to any external calendar.
- **Medical-certificate linkage**: sick leave can be tied directly to an uploaded medical certificate, either pre-filling a new request or attaching to an existing one.
- Shares the same plan gate as Time & Attendance (locked on Free; usable on Core up to 30 employees and on Growth from 31 up) and the same self-onboarding requirement (setup finished and first payment succeeded). Non-admin users simply don't see the module at all when it's locked; company admins see an explicit upgrade/locked notice.

## Medical Certificates

- **Manual-entry upload**: an admin uploads a scanned certificate (PDF or image, up to 1MB) and manually types the employee's name and sickness start/end dates. No AI or OCR service ever reads the document — the certificate is stored as-is, with its details entered by hand rather than auto-extracted, so certificate content never leaves HRInno's own infrastructure for a third-party AI provider.
- **Confirm & save, with optional leave linkage**: after entering the details, the certificate is saved permanently and can be linked to an existing or new leave request, automatically marking that leave as medically confirmed.
- **Certificate list & tracking**: a searchable, company-wide list of all certificates with a "hide treated" filter and a manual "treated" toggle (which also updates any linked leave request).
- **Private storage, on-demand access only**: files are never given a permanent public URL — every view goes through a freshly generated, short-lived (10-minute) signed link, scoped to the caller's own company.
- Capped per plan per calendar month (Free 5, Core 10, Growth 20), and available on both paid tiers. It also sits in the same onboarding-gated set as the other higher-complexity modules, so it unlocks only once the company has finished self-onboarding (setup wizard + first successful payment). A side effect: a Free company that never subscribes cannot upload certificates at all, even though Free's plan row allows 5 per month (see Open Questions).

## Performance Management

- **Goal setting**: any employee can create their own goal (title, description, success criteria, quarter). A goal an employee creates themselves starts as a draft awaiting their manager's approval; a goal a manager or admin creates for someone starts active immediately. Creating a goal requires the employee to already have an assigned manager, tying the feature to the org chart.
- **Weekly pulse check-ins**: for every active goal, the employee gives a weekly status update — "On Track," "Some Issues," or "Blocked" — with a free-text progress comment (and a required explanation if blocked). One update per goal per calendar week; resubmitting the same week updates it in place.
- **Employee dashboard**: at-a-glance counts of active goals, goals needing this week's pulse update, red-flagged (blocked) goals, and goals awaiting the manager's approval.
- **Manager/team view**: a per-employee rollup across the whole team (active/red/yellow/green/needs-pulse/pending-approval counts), a dedicated "Red Flags" view listing every blocked goal across the team with its blockers, and a "Pending Approval" queue with inline one-click approval of employee-created draft goals.
- Available on the **Growth plan only** (not included on Free or Core), and unlocks once the company has finished self-onboarding.

## AI Employee Wellbeing Chatbot

- A conversational, PERMA-model-based wellbeing check-in (positive emotion, engagement, relationships, meaning, accomplishment, and work-life balance — two questions per dimension, twelve questions total), available in English and Hungarian.
- Each answer is scored by AI in real time; on completion the employee receives an overall wellbeing score plus three personalized pieces of AI-generated advice, with the tone of the closing message adapting to how well they scored.
- Sessions are anonymous by design (a random session token, not a personal account record).
- **Admin/manager dashboard**: shows only company-wide, aggregated results — average score, number of completed check-ins, a participation trend, and PERMA-dimension breakdowns with suggested areas for improvement. No individual employee's answers or identity are ever surfaced — this is stated explicitly in the in-app help documentation and matches how the underlying data is queried. Any authenticated member of the company (not only admins/managers) can view this aggregate dashboard.
- Available on **Growth only** (not Free or Core — moved from a Core+Growth feature to a Growth-exclusive one as part of the Core/Growth pricing overhaul), and unlocks once the company has finished self-onboarding.

## Support Tickets

- A helpdesk channel through which a company's employees and admins reach the HRInno support team directly (not a peer-to-peer or department-routed internal ticketing system) — company admins from HRInno's own operating companies get a cross-tenant support-agent view of every customer's tickets, i.e. HRInno's own support staff use this same interface.
- Creating a ticket captures a title, description, priority (low/medium/high/urgent), an optional category (technical support, bug report, feature request, account issue, billing, general inquiry, other), and file attachments (multiple files, 5MB each).
- **Plan-gated**: creating a *new* ticket requires the Core or Growth plan (a Free-plan or no-active-plan company sees an upgrade prompt instead of the create form); this is not part of the onboarding-gated set, so it's available as soon as a company is on a paid plan. Existing tickets remain fully viewable and repliable regardless of plan — the gate only applies to opening new ones.
- In-app notifications alert relevant users when a ticket is created; a separate, planned email-notification path (new ticket / new message / status change) exists as message templates but is not currently wired to actually send email (see Known Limitations).

## General Feedback

- A lightweight 1–5 star rating plus free-text comment widget attached to the public marketing/demo experience (not tied to a company's employees) — a visitor's overall impression of the demo, distinct from the internal support-ticket system above.
- Anyone can submit feedback, but reading the collected feedback (which includes the submitter's IP address) is restricted to HRInno's own internal team. There is no internal screen for browsing it yet.

## Contact / Lead Capture

- A public contact form (first/last name, email, phone, company name, comment, GDPR consent required, marketing-consent opt-in) with basic rate-limiting and input sanitization, feeding an internal "contact submissions" list.
- Submissions are reviewed exclusively by HRInno's own internal team (not by any customer), who can search, filter, update status, add notes, and delete entries — this is the internal sales/lead-qualification tool that sits upstream of a company's decision to sign up.
- An unsubscribe mechanism exists that records a contact's opt-out from marketing email against their submission record, and it only accepts a link cryptographically signed for that exact email address (so nobody can unsubscribe someone else). However, the product does not send any marketing email or generate unsubscribe links today, so contacts currently have no in-product way to reach it; it is ready for when marketing email is introduced.

## Documents

- Medical certificate upload, listing, and download, with manual entry of the certificate's key details (see Medical Certificates above for the full workflow) — no AI or OCR service ever processes the document's content.
- CV upload and parsing, both for the company-side recruitment pipeline (stored privately, viewed via short-lived signed URLs scoped to the company that owns the position applied to) and for the standalone public Job Assistant (never stored at all — see above).

## Help & Documentation

- In-app user manual, reachable from the logged-in admin's account menu ("User Guide"). A browsable guide covering every currently-live customer-facing feature — recruitment/job postings, AI job descriptions, medical certificates, time & attendance, absences, performance management, the wellbeing chatbot, user management, subscription & billing, and support tickets — written in plain customer-facing language with the current Free/Core/Growth plan names, prices, employee ranges, per-plan limits, and role restrictions for each, plus how modules unlock through self-onboarding and the optional assisted call. The Subscription & Billing page includes a full plan comparison table. Content is stored as Markdown files rather than hardcoded in the app, so updating it is a text edit, not a code change. **English only today** — despite the rest of the product supporting French and Hungarian, no French or Hungarian help content exists yet.

## Notifications

- Automated transactional email exists for: interview invitation/cancellation emails (with a calendar-file attachment) sent to recruitment candidates; and, only for customers who paid for the optional assisted onboarding call, a Calendly booking link sent when their first payment succeeds plus a one-time reminder if the call hasn't been marked done within a few business days. No onboarding email is sent at signup any more.
- Internal notification email to the HRInno team (sent to a configurable address) every time a company finishes self-onboarding and starts paying: company, admin name and email, plan and billing interval, headcount, and first payment amount. When the customer paid for the assisted call, the email leads with an explicit "please call this customer back" request.
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
- **Optional assisted onboarding fee**: a single, non-recurring 60,000 HUF fee, charged only when the admin ticks the optional assisted onboarding call at checkout (in the setup wizard or on the subscription page), added to the first invoice alongside the first subscription charge. It is never charged by default and never charged twice.
- **Annual billing option**: either paid tier can be billed annually instead of monthly at 15% off the annualized total, paid upfront. If headcount grows mid-term on an annual plan, the per-employee component is still prorated the same way as monthly billing (an additional invoice, not solely a year-end reconciliation).
- **Founding-customer discount**: a manually-applied, time-boxed discount (30% or 40% off the base fee only — never the per-employee fee or the onboarding fee — for 12 months) exists for a small batch of early signups, applied by a super admin from the internal billing dashboard rather than as a public promo code.
- Subscribing is a self-serve Stripe Checkout flow, reached either through the setup wizard (the main path for new companies) or from the dashboard's subscription page, with a monthly/annual toggle; both paths unlock the onboarding-gated modules automatically on the first successful payment; switching tier or billing interval on an already-subscribed company is not yet self-serve (routed to the Stripe customer portal instead — see Known Limitations). There is no cancel button in the app itself (a server-side cancel endpoint exists but no screen calls it); a cancellation made through Stripe's billing portal or the Stripe Dashboard is correctly synced back to the app, clearing the plan.
- **AI credits**: a monthly, metered allowance (Free 50 / Core 100 / Growth 250) consumed specifically by AI job-description generation and by CV scoring (both single-candidate and bulk re-scoring); running out blocks that specific action with a clear "no credits remaining" message until the monthly reset, or the admin can buy an additional one-time top-up pack through Stripe. The AI wellbeing chatbot is not metered by this credit pool — it's separately capped by its own plan flag (Growth only). Medical certificates no longer involve any AI call at all (manual entry only), so there's nothing to meter there.
- **Downgrade/cancellation promise, enforced architecturally, not just stated**: canceling or downgrading never deletes or hides any data the company already has — plan checks only ever run at the moment of *creating* something new (a job posting, a certificate upload), never on reading or editing existing records. A company with no active subscription (never subscribed, or canceled/expired) permanently behaves exactly like the Free plan for every gated feature rather than being blocked outright.
- **Internal billing dashboard (super-admin only)**: a cross-company view listing every company's plan, billing interval, active employee count, whether the onboarding fee has been paid, and founding-discount status, with a one-click action to apply the founding discount to an eligible company.
- **Per-company outbound email**: a company admin can configure their own outbound SMTP relay so platform emails are sent from the company's own domain; the stored password is encrypted at rest and never redisplayed.

## Settings

- Plan-based feature gating: a single, centrally-defined entitlements layer checks a company's plan before allowing new job postings, new medical certificate uploads, wellbeing-chatbot sessions, time & attendance/absences actions, performance-management actions, viewing the advanced recruitment reporting dashboard, and new support tickets, using per-plan limits/flags stored in the `forfait` table and read live (not cached/hardcoded). Adding a new employee is no longer capacity-gated by plan (see Section 11) — it instead increases that plan's per-employee billing quantity. See Section 11 for the actual plan tiers.
- Onboarding-completion gate: separate from and layered on top of the plan-based check above, time & attendance, absences, performance management, the AI wellbeing chatbot, and medical certificate uploads stay unavailable until the company has finished self-onboarding. This happens automatically when its first subscription payment succeeds (card on file, recurring billing live); the team can still override it manually. A company admin who opens one of these modules before then sees a clear "Finish setting up your account" message with a "Finish setup" button leading to the wizard, not a broken page. Recruitment/job postings, the advanced reporting dashboard, and support tickets are not subject to this gate.
- Data retention settings (super-admin only): retention periods for medical certificates and company-pipeline CV data are stored in a database table and editable with zero code change or redeploy, with a visible audit trail and a live preview of what the next scheduled deletion run would delete. A daily scheduled job deletes data older than whatever is currently configured (30 days today for both data types, matching the public privacy notice). A one-off "delete now" tool also exists to fulfil an individual data-subject deletion request ahead of the scheduled sweep.

## Administration (Internal, HRInno-team-only)

- Onboarding overview: a per-company list showing plan, onboarding status, whether the company asked for the paid assisted call (with a count of companies waiting for a call-back and a one-click "mark call done" action that stops the reminder email), and whether the booking/reminder emails were sent. A manual onboarded/not-onboarded toggle remains as an override, but onboarding normally completes automatically on payment.
- Billing dashboard: a cross-company list of plan, billing interval, active employee count, onboarding-fee-paid status, and founding-discount status, with a one-click action to apply the time-boxed founding-customer discount to an eligible company's subscription.
- Marketing/sales funnel dashboard: Job Assistant usage, pricing-page views and per-plan CTA clicks, contact-form submissions (with source), and onboarded-company counts, including how many companies trace back to a specific contact-form submission.
- Bulk user import (see User & Role Management above).
- Job posting / position management, applicant tracking, time & attendance, absences, performance management, and support tickets are otherwise the customer-facing administration surface described in their own sections above.

---

# 6. Features In Development

Based on the most recent commit and work history (not a formally stated roadmap): no net-new customer-facing feature is currently mid-flight. Full self-onboarding (Section 5) is now released and live in production (2026-11-15); before release it was tested end to end with Stripe test payments, one company without and one with the assisted call. The body of work before it (per commit history) was: a security-hardening pass centralizing authorization checks into a single `lib/authz/` layer and closing 16 confirmed critical/high-severity access-control vulnerabilities; a follow-up live-database audit that found and fixed 3 more real vulnerabilities caused by migration files that had never actually been applied to the production database; moving the terms-of-service and impressum pages out to the external marketing site while keeping privacy/cookies in-app; switching the app's default language to Hungarian; a small brand-alignment fix to the app header logo; and closing the last seven server endpoints that lacked a caller check (AI job-description generation, bulk CV re-scoring, the demo-feedback list, two recruiter dashboard lookups, the support-ticket email trigger and the marketing unsubscribe endpoint). All of this is now live and reflected in the relevant sections above, not listed here as pending.

Expected value and priority are not documented for anything else; there is no formally stated in-development feature list beyond what can be inferred from recent work.

---

# 7. Planned Features

Not documented in the codebase.

---

# 8. Known Limitations

- Plan-based feature gating (Free vs. Core vs. Growth) is real and substantial, covering opening a new job position, medical certificate uploads, the AI wellbeing chatbot (Growth only), time & attendance/absences, performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket creation. No module remains entirely ungated by plan today. Employee headcount also drives per-employee billing (see Section 11) and, following a pricing review, is hard-capped on Core (30 employees) and hard-floored on Growth (31 employees) to prevent an account ever landing in the zone where Core's formula would cost more than Growth's despite Growth including more features.
- Switching an already-subscribed company between tiers (Core↔Growth) or between monthly and annual billing is not yet self-serve: the subscription page's plan cards are disabled once a company has an active subscription, directing the admin to the Stripe customer portal instead of an in-app plan-swap flow. Not a blocker today since no real customers exist yet, but worth building before it becomes one — and when it is built, a Growth→Core downgrade must itself be blocked (or forced to first reduce headcount) if the account has more than 30 employees, to avoid recreating the same overpaying-on-Core problem from the other direction. No such guard exists today because there's nothing yet to guard against.
- The legal/policy pages (privacy notice and cookie notice in-app; terms of service and impressum now on the external marketing site) describe the real, paid product accurately, and the impressum carries the operator's real name and address rather than placeholders, but it honestly discloses that no business entity is registered yet, and none of the pages have been reviewed by qualified legal counsel. Treat them as a substantive, accurate draft — not yet a finished, legally sign-off-ready document — until legal review happens and the business-registration question (see Open Questions) is resolved.
- A live-database audit found that four schema/RLS migrations written in earlier sessions had silently never been applied to the actual production Supabase project (the CLI used in this environment is authenticated to a different account than the one that owns the project, so `db push` never reliably reported what had actually landed) — three of the four were confirmed, real, exploitable vulnerabilities (unauthenticated create/edit/close access to any company's job postings; every plan-gated feature check across the whole app failing unpredictably because a `forfait` column the code queried didn't exist in the live database; any authenticated user able to read/write another company's stored SMTP credentials). All four have now been reproduced with corrected, current-state migrations and fixed. This is a process risk, not just a one-time bug: nothing currently guarantees that a migration file committed to the repo is actually reflected in the live database, so a repeat of this class of gap is possible until that verification step is automated or the CLI/account mismatch is resolved.
- Support-ticket notification emails (new ticket / new reply / status change) have message templates defined but the underlying send function is a mock that only logs and never delivers actual email — the only remaining customer-visible dead end of this kind (the previously non-functional job-posting "upgrade" button and wellbeing-dashboard "export" button have since been removed rather than left clickable-but-broken). The anti-abuse cooldown on starting a new wellbeing chatbot session also has a logic bug that makes it effectively inert.
- The marketing site (www.hrinno.hu) has three customer-visible problems, found on 2026-11-15:
  - The Core pricing card wrongly says the AI wellbeing chatbot is included (Hungarian and English); it is Growth only in the product.
  - The public terms of service show an unfinished editorial placeholder in place of the cancellation and refund policy ("[BILLING TERMS PENDING — DO NOT PUBLISH UNTIL FILLED IN: …]"), and the assisted-onboarding fee amount is blank in the same paragraph.
  - The legal notice (impressum) shows "[PENDING]" for the company registration number and tax number, consistent with no business entity being registered yet.
- There is no way to edit a live job posting's text after it's created — only closing it is supported, which stops new applications but keeps its history.
- The AI auto-rejection threshold is inconsistent between the two CV-scoring paths: a single freshly-submitted candidate is auto-rejected below a 5/10 score, while the bulk "re-score my whole candidate database against this new job" tool uses a 7/10 threshold — the same scoring model applying two different pass bars depending on which button triggered it.
- Medical certificate upload is gated at the API level to company admins only, while the upload control itself is surfaced on the ordinary employee-facing absence page with no visible restriction — a non-admin employee attempting to use it as pictured in the UI would be rejected by the server. Certificate upload should currently be described as an HR-admin-mediated workflow, not employee self-service.
- Customers now have an in-app user manual, but it exists in English only; French and Hungarian customers get no localized help content despite the product itself being fully trilingual. Internal/developer-facing documentation is still absent — the README remains unmodified Next.js boilerplate, and this brief is still the only business-facing document in the repo.
- Onboarding is fully self-serve but payment-first: the HR modules (time & attendance, absences, performance, wellbeing chatbot, medical certificates) unlock only after a successful card payment. There is no free trial of those modules; a prospect can only see them as a locked preview before paying.
- A company with 31+ employees must add them all before it can subscribe to Growth (Growth checkout requires 31 active employees). Customers add employees one at a time; bulk CSV import is an internal HRInno-team tool, not customer-facing, so a larger company faces real data-entry friction during setup.
- Medical certificates no longer involve any third-party AI or OCR service at all — the document's content is never sent anywhere beyond HRInno's own storage, and its key details are entered manually. This closes what was previously the product's most sensitive data-handling gap (health data going to third-party AI/OCR providers with only best-effort redaction). CV data is still a separate matter: it's sent to OpenRouter/OpenAI for scoring and matching, which is expected and necessary for that feature to work (candidate name/contact info is needed for candidate-to-job matching), and isn't a special-category-data concern the way health data was.
- A runtime-adjustable data retention mechanism exists for medical certificates and company-pipeline CV data (30-day period today, matching the public privacy notice), with a full audit trail and an on-demand single-record deletion tool for individual data-subject requests. The retention module's own internal documentation is explicit that this makes the retention period an editable, auditable parameter — it does not, by itself, make the product GDPR/HIPAA compliant. Job Assistant CV data has no persistence layer at all, so there is nothing to delete for that data type by design.
- AI-based candidate scoring/ranking (single and bulk) has been documented as falling under the EU AI Act's high-risk classification (Annex III, point 4(a): recruitment/candidate evaluation), whose obligations became applicable 2 August 2026. None of the associated requirements currently exist: a documented risk-management process, data-governance review of the scoring prompts/data for bias, technical documentation of the scoring logic, structured logging of individual scoring events for audit purposes, documented human-oversight measures, a candidate-facing "AI is used to evaluate you" notice, or a conformity assessment. This is a documentation-only finding so far (no behavior change) — final compliance determination and remediation priority require legal review.
- Leave-request approval/rejection is not backed by an explicit server-side authorization check the way leave-request *creation* now is — it is a direct database update from the browser relying entirely on database-level row security, rather than the app-level identity checks used elsewhere in the recent hardening pass. Not confirmed to be exploitable, but architecturally inconsistent with the rest of the newly centralized authorization model.
- There is no dedicated company-wide admin view for time & attendance — oversight is folded into the manager approval screen (an admin can act on any manager's team through it), not a separate "everyone regardless of manager" dashboard.
- Admin/permission checks have been centralized into a single authorization module (`lib/authz/`), closing 16 confirmed critical/high-severity issues and then the last seven unprotected server endpoints (including two AI features that anyone could trigger to spend any company's AI credits, one of which could also overwrite a company's candidate scores). Every server endpoint now either performs an explicit caller check or is explicitly documented as public by design (e.g. the job board, candidate applications, the free Job Assistant), and an automated test fails if a new endpoint ships without one. This covers application-level authorization only — a separate, unrelated audit (see the migration-drift bullet above) found 3 further live vulnerabilities that had nothing to do with application-level authorization code at all, so closing the `lib/authz/` gaps does not by itself guarantee the live database's own row-level security matches what the migration files describe.
- Obsolete/backup code and folders (e.g., an "ObsoleteHome" folder) remain in the codebase.

---

# 9. Technical Overview

## Platform

Web (responsive), Next.js application. No native mobile app.

## Technology Stack

Frontend

- Next.js 15, React 19, Tailwind CSS v4 with a small design system: a full brand indigo color scale plus an emerald accent, slate neutrals, a Sora/Inter font pairing, and shared button/card style helpers (`components/ui/styles.ts`) used across the app.

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
- Calendly (booking link for the optional, paid assisted onboarding call)
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

Assisted onboarding fee and annual billing

- An optional, one-time 60,000 HUF assisted onboarding fee, charged only if the customer ticks the assisted onboarding call at checkout, added to the first invoice alongside the first subscription charge (never charged again on a resubscribe). Self-serve setup without the call costs nothing extra.
- Both paid tiers can be billed annually instead of monthly, at 15% off the annualized total (base fee and per-employee fee both discounted), paid upfront. Billing interval cannot be mixed within one subscription — both the base and per-employee items always share the same interval.

Founding-customer discount

- A manually-applied Stripe coupon (30% or 40% off the base fee only, for 12 months) exists for a small batch (target: 10–15) of early signups. It is never offered as a public promotion code — a super admin applies it to a specific company's subscription from the internal billing dashboard, and it is scoped so it can only ever discount the base-fee line, never the per-employee fee or the assisted onboarding fee.

Notes

- Plan names are Free / Core / Growth.
- A company with no active plan (the state both before ever subscribing and immediately after canceling/expiry) permanently behaves like the Free plan for every gated feature, not blocked outright. A company that had more items than Free's caps allow before downgrading keeps full read/edit/close access to everything it already has; only creating new items beyond the cap is blocked.
- A Stripe subscription canceled on Stripe's side (through the billing portal or the Stripe Dashboard; there is no in-app cancel button) is correctly synced back to the company record via webhook, clearing the plan to the same null/Free-fallback state as an in-app cancellation. A failed renewal payment triggers a 7-day grace period before the plan is downgraded.
- Per-plan limits/flags live in the `forfait` table and are read live by the app, not hardcoded — changing a plan's limits in Supabase takes effect without a code deploy. Base fee and per-employee fee amounts are also cached in that table for display, sourced from the corresponding Stripe Price objects.
- AI credits are metered per AI-generation call (job-description generation, single CV analysis, bulk CV re-scoring) independently of the boolean/capacity gates above; a top-up pack can be purchased one-time via Stripe if a company's monthly allowance runs out.
- Plan-tier gating now covers job posting creation, medical certificate uploads, the AI wellbeing chatbot (Growth only), time & attendance/absences, performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket creation (Core and Growth). Employee count both drives the per-employee billing component and, on Core specifically, is itself a hard capacity gate (30-employee ceiling) — the only capacity gate tied to a tier boundary rather than a plan-wide feature.
- Every new company created through self-serve signup starts on Free automatically (no plan is selected on the signup form itself, even if the visitor clicked a Core or Growth button on the pricing page). The admin is taken straight into the setup wizard, where choosing and paying for Core or Growth is the final step.
- Time & attendance, absences, performance, the AI wellbeing chatbot, and medical certificate uploads unlock automatically when a company's first subscription payment succeeds. Support ticket creation, recruitment/job postings, and advanced recruitment reporting are not subject to this onboarding gate.
- Zero real customers exist yet, so this pricing model (and the Core/Growth rename from the prior Momentum/Infinity flat-fee tiers) was rolled out directly with no migration path for existing subscriptions.
- A daily cron exists to notify a Core account's admin, by email, if their headcount ever crosses the point where Growth's formula becomes both cheaper and more feature-rich (notify-only, never changes the plan itself). Under the current numbers that crossover point is 61 employees, which is mathematically unreachable while Core is hard-capped at 30 — so today this cron is a confirmed no-op, kept only in case the cap policy changes later (see Open Questions).

---

# 12. Competitors

Not documented in the codebase. No competitor names, comparisons, or market research files exist in the repo.

| Competitor | Strength | Weakness |
|------------|-----------|-----------|
| | | |

---

# 13. Positioning

Not formally defined as a written statement, but the homepage hero states a clear positioning: lead with the free, no-account Job Assistant as the candidate-facing hook, with the full HR platform (recruitment, time & attendance, absences, performance, wellbeing) positioned as what a company gets once a candidate becomes a lead. The `hrinno-marketing` site carries an aligned version of this pitch.

The access model is now fully product-led: recruitment/Job Assistant is instant and free, and the whole HR platform unlocks the moment a company finishes a short in-app setup and pays by card, with no sales or onboarding call in the way. Human help is an optional paid add-on (the assisted onboarding call), not a gate. The pitch this supports is "set up your whole HR platform yourself in minutes, with expert help if you want it."

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
- Do NOT advertise the AI wellbeing chatbot as part of Core, even though the marketing site's Core card currently says so — it is Growth only in the product. Fix that card before running pricing campaigns.
- Do NOT treat the current privacy notice, terms of service, or impressum as final, lawyer-reviewed legal copy — the content is now substantively accurate to the real product, including the operator's real name and address, but none of these pages have had qualified legal review, and the impressum's honest disclosure of "no registered business entity yet" is itself a business question worth resolving (see Open Questions). Don't cite them as authoritative in contractual contexts until both are resolved. Note the pages now live in two places: privacy and cookies stay on this app (app.hrinno.hu), while terms and the impressum are on the marketing site (www.hrinno.hu) — link to the correct one when referencing them externally.
- The app and marketing site now default to Hungarian (with browser-language auto-detection removed) and share a consistent brand mark in both headers — safe to lean into a Hungary-first go-to-market angle in copy and creative, more so than before this change.
- Do NOT make guarantees about candidate CV data privacy or retention beyond what the privacy notice/terms of service currently state (30-day retention) — no further documented policy exists.
- Self-serve onboarding is real and live end to end: a company can sign up and post jobs in minutes for free, and can unlock time & attendance, absences, performance, the wellbeing chatbot, and medical certificates immediately by finishing the in-app setup and paying by card. No sales or onboarding call is required. The assisted onboarding call is an optional paid add-on (60,000 HUF one-time) and never delays access. Do NOT promise a free trial of the HR modules: they unlock only after payment.
- The founding-customer discount (30–40% off the base fee for 12 months) is an internal, manually-applied offer for a small batch of early signups, not a public promo code — don't publish a redeemable code for it, and don't promise it will remain available beyond the first 10–15 signups.
- Avoid describing medical certificate upload as an "employee self-service" feature in copy — the backend restricts it to company admins even though it is currently surfaced on an employee-facing screen; describe it as an HR-admin-managed workflow instead until that's resolved.
- The product now has one consistent, sober visual style across every screen (indigo accent, slate neutrals, Sora/Inter fonts, no gradients) — screenshots of any screen are now usable in campaign creative without looking like a different product from the homepage. There is still no formal brand guideline document beyond this.

---

# 15. Launch Readiness

Current readiness (0–100%)

- Not formally assessed; no scoring exists in the repo. Every plan-gateable module (recruitment, medical certificates, wellbeing chatbot, attendance/absences, performance, seats, and support tickets) enforces real limits, a prospective customer can sign up, choose a plan, pay, and reach every module in their plan entirely unassisted, authorization has gone through two rounds of hardening (centralized application-level checks, then a live-database audit that closed a further 3 confirmed vulnerabilities caused by migrations that had never actually reached production), and the legal/policy pages have been substantively rewritten to describe the real product and split appropriately between this app (privacy, cookies) and the marketing site (terms, impressum) — all now committed and pushed. Still not production-hardened — see Section 8 for what remains, most notably the lack of legal counsel review on any of the legal pages, the open question of whether a registered business entity is needed given the impressum's honest "individual, not yet registered" disclosure, the still-mocked support-ticket notification emails, and the process gap that let migrations silently fail to reach the live database undetected for a full session.

Major blockers

- The public terms of service have no cancellation or refund policy: that section is a visible "[BILLING TERMS PENDING — DO NOT PUBLISH UNTIL FILLED IN]" placeholder, live on www.hrinno.hu while the product is taking real card payments. This needs to be written (and ideally legally reviewed) as a priority.
- The legal/policy pages now substantively and accurately describe the real product, with the operator's real name and address in the impressum, but none of them have been reviewed by qualified legal counsel, and the impressum's honest disclosure that no business entity is registered yet raises its own question about whether that's the right structure for a paid product processing health data — both remain a blocker for launch messaging that references privacy, terms, or compliance claims as final.
- A live-database audit found and fixed 3 real vulnerabilities caused by migration files that had silently never reached the production database for a full prior session (including every plan-gate check across the app failing unpredictably). The specific bugs are fixed, but nothing yet automatically verifies that a committed migration is actually applied live — that verification gap should be closed before it's treated as a solved problem rather than a one-time catch.
- Medical certificates no longer go to any third-party AI/OCR service (manual entry only) — this specific health-data exposure is resolved. CV/recruitment data is still sent to third-party AI providers, which is expected for that feature, with a runtime-adjustable 30-day retention mechanism in place.
- The AI candidate-scoring feature (core to the recruitment pitch) has been documented as high-risk under the EU AI Act, with an applicability date that has already passed and none of the associated obligations currently met.
- One customer-visible feature is only partially wired: support-ticket notification emails don't actually send (message templates exist, but the send function is mocked) — a moment where a real customer would expect an email and not get one. The two previously dead buttons in this category (position-limit "upgrade," wellbeing-dashboard "export") have been removed.
- Customers have an in-app user manual, but it's English-only; internal/developer documentation (README, architecture) is still absent.

Recommended launch timing

- Not documented in the codebase.

---

# 16. KPIs

Current metrics (if known)

- Not available. Vercel Analytics and Speed Insights are integrated, and lightweight funnel-event tracking (Job Assistant usage, pricing views/clicks, contact form submissions, ROI calculator use, signup started/completed, self-onboarding completed, manual onboarding overrides) exists in a Supabase table with a super-admin dashboard, but no actual usage numbers are accessible from the repository itself — this is instrumentation only, not reported results.

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
- Medical certificate uploads are in the onboarding-gated set, which now means "paying customers only" — yet the Free plan row still advertises 5 uploads per month that a Free company can never actually use. Should medical certificates leave the gated set (so Free gets its 5/month), or should Free's certificate allowance be removed from pricing copy? Is OpenRouter's own data-handling terms acceptable for the CV/recruitment data it still processes, and is a formal Data Processing Agreement needed? Has the daily deletion job's required environment configuration been confirmed correctly set in production?
- What is the realistic remediation plan and timeline for the AI candidate-scoring feature's EU AI Act high-risk obligations, given the applicability date (2 August 2026) has already passed? Should a candidate-facing "AI is used to evaluate you" notice be added to the application flow?
- What cancellation and refund policy should apply to Core and Growth subscriptions (monthly and annual), and to the optional 60,000 HUF assisted onboarding fee? The public terms currently show a placeholder instead of an answer. The app itself cancels via the Stripe billing portal with no in-app cancel button.
- The impressum now names the real operator and address (Saussez Grégory, 1031 Budapest, Csikovar utca 1) and honestly discloses that no business entity is registered yet. Is operating as a private individual — with no sole-trader ("egyéni vállalkozó") or company registration, and so no business tax number — the right legal/tax structure for a paid, commercial SaaS product processing health data at this scale? This is a legal/tax question for a qualified professional, not something to resolve in the document itself. When will a qualified Hungarian/EU lawyer review the rewritten privacy notice, terms of service, and impressum before they're treated as final?
- What is the target market (company size, industry, geography)? Nothing in the repo confirms this beyond weak i18n/code-comment signals.
- What call-back turnaround should the team commit to for customers who pay for the assisted onboarding call? The team is emailed immediately and can mark calls done, but there is no SLA, queue, or capacity tooling beyond that.
- Should HR modules get a free trial period? Today they unlock only on payment, which controls costs but means a prospect can't try time & attendance or absences with real data before paying.
- Should the two "AI interview" mechanisms inside the recruitment pipeline be renamed or otherwise disambiguated in the product itself, given they're functionally quite different (assistant-for-a-human-interviewer vs. fully automated candidate-run interview) but currently look like one feature to an end user?
- Self-serve tier/interval switching (Core↔Growth, monthly↔annual) for an already-subscribed company isn't built yet — is that acceptable to leave as a manual, portal-routed process for now given zero real customers exist, or should it be prioritized before the first real signups land? When it is built, it will need its own guard preventing a Growth→Core downgrade for an account with more than 30 employees (no such guard exists today since there's no downgrade path to guard yet).
- A live-database audit found that migration files can be committed to the repo but silently never reach the production database, because the CLI environment used is authenticated to a different account than the one that actually owns the Supabase project. Three real vulnerabilities existed undetected for a full prior session as a result. Should the deployment process add an automated check that every committed migration is confirmed applied to production, and should the CLI/account mismatch itself be fixed so `db push` can be trusted again?
- The new plan-crossover notification cron is currently a confirmed no-op (the headcount at which Growth becomes cheaper than Core, 61, is unreachable while Core is hard-capped at 30 employees) but was kept rather than removed, in case the cap policy changes later. Is that the right call, or should genuinely dead automation like this be removed until/unless the underlying policy actually changes?

---

# 19. Recent Major Changes

Brief summary (maximum 10 bullet points). Based on the most recent completed work:

- Rolled out a sober, modern visual style across the whole app: one indigo accent, neutral grays, color only for success/warning/error, no gradients, hover effects or emoji (statuses shown as colored dots); dashboard links are now grouped by area (Recruitment, Time & absences, Performance & wellbeing, Administration)
- Released full self-onboarding: a three-step in-app setup wizard (company, team, plan & card payment) replaces the mandatory onboarding call. The HR modules unlock automatically on the first successful payment. The onboarding fee became an optional paid assisted-call add-on, the Calendly booking email now goes only to customers who chose that add-on, and the team gets an email for every new paying customer, including a call-back request for assisted customers
- A live-database audit found that four schema/RLS migrations from earlier sessions had silently never been applied to the actual production Supabase project (a mismatch between the CLI's authenticated account and the project owner's), and reproduced/fixed the three that were real, confirmed-exploitable vulnerabilities: unauthenticated create/edit/close access to any company's job postings; every plan-gated feature check across the whole app failing unpredictably because a `forfait` column the code queried was missing from the live database; and any authenticated user (not just a company's own admins) able to read/write another company's stored SMTP credentials
- Moved the terms of service and impressum out of this app to the external marketing site (www.hrinno.hu/terms and /legal-notice), keeping only the privacy notice and cookie notice in-app (now at clean `/privacy` and `/cookies` paths with the legacy `-demo` suffix fully removed) since those two document this app's own data handling specifically; consolidated the shared privacy/cookie contact address to `info@hrinno.hu`
- Switched the app's default language from English to Hungarian and removed browser-language auto-detection, matching the marketing site's fixed Hungarian default so a visitor doesn't land in a different language than the page they came from; also shipped a daily notification cron that would alert a Core account once its headcount crosses the point where Growth becomes cheaper, though under current pricing that crossover (61 employees) is unreachable while Core's 30-employee cap stands, so it currently runs as a no-op
- Redesigned the app header logo to match the marketing site's dark badge/sparkle brand mark, so the product no longer looks like a different company immediately after a visitor clicks through from the marketing site
- Replaced the flat-fee Momentum/Infinity pricing with Core (25,000 HUF + 1,000 HUF/employee/month, capped at 30 employees) and Growth (40,000 HUF + 750 HUF/employee/month, requires 31+ employees to subscribe), each billed as two separate Stripe subscription items kept in sync as employees are added/deactivated/reactivated, plus a one-time onboarding fee (since made optional — see the self-onboarding change above), 15%-off annual billing, and a manually-applied founding-customer discount. The 30/31 boundary is enforced in billing logic specifically to prevent an account reaching the headcount where Core would cost more than Growth. The AI wellbeing chatbot, performance management, and a newly-carved-out advanced recruitment reporting dashboard all moved to Growth-only as part of this change. Zero real customers exist yet, so it shipped with no migration path for existing subscriptions
- Removed AI/OCR processing from medical certificates entirely — an admin now manually types the employee name and sickness dates instead of an AI/OCR pipeline extracting them, so certificate content is never sent to any third-party AI provider, closing what was previously the product's most sensitive health-data exposure
- Substantively rewrote the legal/policy pages to accurately describe the real, paid product instead of their previous "free demo" framing — GDPR-structured disclosures, a real commercial terms of service, an accurate cookie/local-storage table, and a cookie-consent banner that actually gates the analytics it describes rather than only displaying a choice with no effect. The impressum carries the operator's real name and address, honestly disclosing that no business entity is registered yet
- Added real voice input to the in-pipeline "Virtual Interview," matching the free public Job Assistant's voice-enabled mock interview experience; also removed two previously non-functional UI controls (a job-posting "upgrade" button, a wellbeing-dashboard "export" button) rather than leaving them visible but broken

---

# 20. Last Marketing Recommendations

- Lead campaigns with the public Job Assistant (free CV scoring + AI rewrite + genuinely voice-enabled AI mock interview) as the primary differentiator and top-of-funnel acquisition tool, rather than the table-stakes HR modules (time tracking, absences, performance).
- Use a two-sided funnel: attract candidates for free via the Job Assistant, convert HR buyers who encounter it through job postings.
- Job posting limits, medical certificate limits, AI wellbeing chatbot access (Growth only), time & attendance/absences, performance management (Growth only), advanced recruitment reporting (Growth only), and support ticket access can all be marketed as real plan differentiators (Free / Core / Growth). Base-fee-plus-per-employee pricing is itself a differentiator worth leading with, not just the feature list — but be precise that Core tops out at 30 employees and Growth starts at 31, not "no cap."
- Medical certificates now never touch any third-party AI or OCR service (manual entry only) — this is safe to market as a genuine privacy-by-design point for that specific feature. CVs are a separate matter: they're still sent to third-party AI providers for scoring (expected, since that's how the feature works), so continue to hold off on claiming full data-privacy/compliance for the platform as a whole.
- Do not make any compliance claim about the AI candidate-scoring feature. It has been documented as high-risk under the EU AI Act with most obligations currently unmet.
- Do not cite the current privacy notice, terms, or impressum pages as final, lawyer-reviewed legal copy in any campaign material — the content is now substantively accurate, including the operator's real identity and address, but none of the pages have had qualified legal review, and the underlying business-registration question is still open.
- It is accurate to advertise the whole platform as self-serve: "start free in minutes, unlock the full HR suite as soon as you subscribe, no sales or onboarding call needed," with the assisted onboarding call positioned as optional expert help. Don't advertise a free trial of the HR modules; there isn't one.
- When describing the recruitment AI interview capability, be careful to distinguish the assistant that helps a human recruiter (question suggestions + notes-to-summary, no voice, no candidate-facing AI conversation) from the fully automated candidate-run "Virtual Interview," which now shares the same voice-answer experience as the free public Job Assistant tool.

---

# 21. Executive Summary

Maximum 10 bullet points.

- HRInno is an AI-assisted, multi-tenant HR platform covering recruitment/applicant tracking, time & attendance, absences, medical certificates, performance management, and employee wellbeing, plus a support-ticket helpdesk.
- Primary audience (inferred): HR administrators/company owners; secondary: recruiters, managers, employees; tertiary: job candidates via a free public tool.
- Current maturity: MVP — every plan-gateable module now enforces real limits, a new prospect can sign up and reach a working dashboard entirely unassisted, authorization has been hardened in two passes (16 application-level vulnerabilities closed, then 3 more found and fixed via a live-database migration-drift audit), and the legal/policy pages now substantively and accurately describe the real product (privacy/cookies in-app, terms/impressum on the marketing site), all now committed and pushed — but none of the legal pages have had qualified legal review, the impressum's honest "individual, not yet registered as a business" disclosure raises its own legal/tax question, and support-ticket notification emails are still mocked, so it's not yet production-hardened.
- Biggest strength: the public, free Job Assistant (AI CV scoring/rewriting with a downloadable .docx, plus a genuinely voice-enabled mock interview and coaching report) is a real differentiator versus typical employer-only ATS AI tools, requires no account, and is explicitly instrumented as a top-of-funnel acquisition asset.
- The recruitment pipeline itself is now feature-rich: customizable per-company pipeline stages, AI CV scoring both for individual applicants and for instantly re-scoring the entire historical candidate database against a new opening, an advanced reporting dashboard (Growth only), and two functionally distinct AI interview mechanisms (an assistant for human-run interviews, and a separate fully automated, now voice-enabled candidate-run interview) that both surface as a single "AI Interview" score.
- Real plan tiers are Free, Core, and Growth. Both paid tiers are priced as a flat base fee plus a per-employee fee (Core: 25,000 HUF + 1,000 HUF/employee/month, hard-capped at 30 employees; Growth: 40,000 HUF + 750 HUF/employee/month, requires 31+ employees to subscribe), plus an optional one-time assisted-onboarding fee and an optional 15%-off annual billing plan. The employee-range boundary is enforced in billing logic specifically to prevent an account from ever reaching a headcount where Core would cost more than Growth despite Growth's larger feature set. Every gateable module — job postings, medical certificate uploads, the wellbeing chatbot (Growth only), time & attendance/absences, performance management (Growth only), advanced reporting (Growth only), and support ticket creation (Core and Growth) — differs meaningfully by plan, including a company with no active subscription, which permanently behaves like Free rather than being blocked outright.
- Onboarding is fully self-serve and live: a new company signs up, recruits for free immediately, and unlocks every HR module in its plan by finishing a short setup wizard and paying by card. The HRInno team is emailed for every new paying customer, and the onboarding call is now an optional paid add-on rather than a gate.
- Remaining weaknesses: the legal/policy pages, while now substantively accurate (including the operator's real name and address), have no qualified legal review, and the impressum's honest disclosure that no business entity is registered raises its own legal/tax question for a paid product processing health data; CV/recruitment data still goes to third-party AI providers (expected, not a flaw, but still unreviewed for DPA/subprocessor-terms purposes); the AI candidate-scoring feature has been found to fall under the EU AI Act's high-risk classification with most obligations unmet and the applicability date already passed; support-ticket notification emails are still mocked rather than actually sent; and a live-database audit found that migration files can silently fail to reach production undetected, a process gap that let three real vulnerabilities persist for a full session before being caught. Medical certificates, previously the product's most sensitive data-handling gap, no longer touch any third-party AI/OCR service at all.
- Launch readiness has not been formally assessed; major blockers have shifted from wide-open data exposure and missing authorization checks (both substantially addressed by the recent hardening pass) toward legal-copy finalization, third-party data-processing review, and the AI Act compliance gap; manual onboarding calls are no longer a bottleneck now that self-onboarding is live.
- Customers have an in-app user manual covering every live feature, but it's English-only; internal/developer documentation (README, architecture docs) remains absent.
- No competitor research, market sizing, or formal positioning statement exists in the repo.

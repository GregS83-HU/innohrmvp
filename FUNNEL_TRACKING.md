# Funnel Tracking

Lightweight instrumentation for the current sales-assisted funnel: **Job
Assistant usage → pricing viewed → contact form submitted → manually
onboarded paying company.** Built to inform a future decision about
self-serve signup, not as a general analytics platform.

## Architecture: why a Supabase table, not just Vercel Analytics

Both are used, but for different reasons:

- **`funnel_events` table in Supabase — the source of truth.** Required
  because this task also asks for a queryable admin dashboard with
  date-range filtering, and a way to join funnel data against
  `company`/`contact_submissions`. Vercel Analytics custom events have no
  API for querying them back into a page we build ourselves — they're
  dashboard-view-only in Vercel's own UI. A first-party table is the only
  way to satisfy the dashboard requirement.
- **Vercel Analytics `track()` — a free secondary signal.** Fired alongside
  every Supabase write, at zero extra infrastructure cost (the package was
  already integrated in both repos). Gives an at-a-glance view in Vercel's
  own dashboard without needing to open the internal one. Not relied on for
  anything this doc describes as queryable.

Both repos (`innohrmvp` and `hrinno-marketing`) write to the **same**
Supabase project — confirmed directly (`hrinno-marketing`'s `.env.local`
and `innohrmvp`'s Vercel **production** environment variable both point at
`ihniitoocqviylnvyijn`; only `innohrmvp`'s **local** `.env.local` points
elsewhere, at the UAT project, which is why local dev testing shows a
"table not found" error for `funnel_events` until the migration is also
applied there — see Manual Steps below). This is what makes the
company-onboarding "close the loop" feature possible: `contact_submissions`
and `company` already lived in one place.

## What's tracked

| Event | Where it fires | Fields set |
|---|---|---|
| `job_assistant_started` | `innohrmvp` `/job-assistant` — when a CV analysis is submitted | — |
| `job_assistant_completed` | `innohrmvp` `/job-assistant` — when the AI score/analysis result renders | — |
| `pricing_viewed` | `innohrmvp` `/pricing` on page load; `hrinno-marketing` homepage on clicking the "Pricing"/"Árak" nav link | `source` |
| `pricing_cta_clicked` | Each plan card's CTA, both properties | `source`, `plan` (`free`/`momentum`/`infinity`) |
| `contact_form_submitted` | `hrinno-marketing`'s `ContactForm.tsx`, right after a successful `contact_submissions` insert | `source: 'marketing_site'` |
| `roi_calculator_used` | `hrinno-marketing` ROI calculator — first slider interaction only (not on every drag tick) | `source: 'marketing_site'` |

**Interpretation note:** "Job Assistant completed" is tracked at the point
the initial AI score/analysis renders (the core value delivery), not at the
end of the full optional flow (CV rewrite, mock interview, coaching
report). If a stricter "completed the whole thing" definition is wanted
later, that's a different event to add, not a redefinition of this one.

## What's deliberately *not* tracked

- **`innohrmvp`'s own pricing page CTA doesn't actually lead to a contact
  form** — it links to `/job-assistant` (found while tracing, not changed
  here per the "measurement only" constraint). So `pricing_cta_clicked`
  with `source: 'pricing_page'` will fire, but you won't see a matching
  `contact_form_submitted` with that same source following it — there's no
  such path today. The real contact-form conversion point is entirely on
  `hrinno-marketing`. This is accurate instrumentation of a real gap, not a
  tracking bug.
- **`innohrmvp`'s slug-scoped demo contact form** (`components/ContactForm.tsx`,
  used at `/jobs/[slug]/contact`) was **not** instrumented. It's a
  different, pre-existing "request a demo" flow tied to an already-created
  company slug, not part of the pricing-driven prospect funnel this task
  describes, and doesn't map cleanly onto the `source` values in scope
  (homepage / pricing page / marketing site). Flagged rather than
  force-fitted.
- **`hrinno-marketing`'s `app/actions/contact.ts`** (a Next.js server
  action) is **dead code** — nothing calls it. The real, live contact form
  (`app/components/ContactForm.tsx`) inserts into `contact_submissions`
  directly from the client with the anon key. Tracking was added to the
  real path; the unused server action was left alone (not deleted — out of
  scope for this task) but is worth removing separately.

## Privacy

- **No CV content, interview answers, names, or emails are stored in
  `funnel_events`.** Just an event type, a timestamp, and optionally
  `source`/`plan`/small `metadata`.
- **`session_id` is anonymous**: a `crypto.randomUUID()` generated
  client-side and kept in `localStorage` (key: `hrinno_funnel_sid`), not
  derived from or linked to any account, email, or name. It exists only so
  a single visitor's own funnel steps can be correlated (e.g. "viewed
  pricing, then clicked Momentum") — not to identify who they are.
- **No cross-domain correlation.** `innohrmvp` and `hrinno-marketing` are
  different origins, so a visitor gets a *different* anonymous session id
  on each. Stitching one identity across both sites would need heavier,
  more privacy-invasive tracking (a shared identifier passed through URLs,
  cookies set across domains, etc.) that would go beyond "lightweight" —
  deliberately not built. Each property's funnel is measured on its own.
- **The contact form's own submission (name, email, company, message)
  already lives in `contact_submissions`** and is not duplicated here —
  `funnel_events` only records that a submission happened, and from where.

## Schema

```sql
create table funnel_events (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  event_type text not null,  -- see CHECK constraint for the 6 valid values
  session_id text not null,  -- anonymous, client-generated
  source text,               -- 'homepage' | 'pricing_page' | 'marketing_site'
  plan text,                 -- 'free' | 'momentum' | 'infinity'
  metadata jsonb
);
```

Row-level security: anyone (including fully anonymous visitors) can
`INSERT` — that's the entire point of top-of-funnel instrumentation, and
matches the existing `happiness_sessions` "anonymous session creation"
pattern. Only super admins can `SELECT` (same check as the existing "Super
admins can view all tickets" policy: `users.is_super_admin = true`).
Migration: [supabase/migrations/20260801010000_add_funnel_tracking.sql](supabase/migrations/20260801010000_add_funnel_tracking.sql).

## Closing the loop: linking an onboarded company back to a contact submission

`manually onboarded paying company` is an off-platform step today (no
self-serve signup exists — see `docs/product-brief.md`). To make that step
measurable anyway, `company` has a new nullable column:

```sql
company.onboarded_from_contact_submission_id uuid references contact_submissions(id)
```

**Not set automatically.** Whoever manually onboards a company from a
contact-form lead should set it, e.g.:

```sql
update company
set onboarded_from_contact_submission_id = '<contact_submissions.id>'
where id = <new company id>;
```

The admin dashboard (below) reports how many companies onboarded in a date
range have this set, versus how many don't — i.e. how much of your
onboarding volume is actually traceable back to the tracked funnel today.

## Querying the funnel

**Admin dashboard**: `/jobs/[slug]/admin/funnel` (any slug — it's not
company-scoped data), super-admin only. Linked from the header's "Manage
Account" menu ("Funnel Dashboard") for super admins. Shows counts for each
event type over a date range, a plan breakdown for CTA clicks, a source
breakdown for contact submissions, and the onboarded-companies /
traced-to-contact numbers.

Backed by `GET /api/admin/funnel?from=<ISO date>&to=<ISO date>` (defaults
to the last 30 days), which does a real server-side super-admin check
(cookie or Bearer token → `users.is_super_admin`) before querying — not
just hidden from the nav for other users.

**Manual SQL**, if you'd rather query directly:
```sql
select event_type, count(*) 
from funnel_events 
where created_at between '2026-07-01' and '2026-07-31'
group by event_type
order by event_type;
```

## Manual steps

1. **Apply the migration to UAT** (`supabase/migrations/20260801010000_add_funnel_tracking.sql`) if you want local dev / UAT testing to actually record events — right now it's applied to production only (same pattern as every other migration this session; `innohrmvp`'s local `.env.local` points at UAT, not production).
2. **No new environment variables needed** — both repos already have the Supabase URL/anon key required to write to `funnel_events`.
3. **Set `company.onboarded_from_contact_submission_id`** by hand whenever a contact-form lead becomes a paying company, to keep the "traced to contact" number in the dashboard meaningful.
4. **Consider fixing two things found while tracing this** (not fixed here, out of scope for "measurement only"):
   - `innohrmvp`'s `/pricing` page CTA links to `/job-assistant` instead of any contact mechanism — there's currently no way for a prospect who views in-app pricing to actually request a demo without navigating away first.
   - `src/app/api/contact-submissions/route.ts`'s super-admin auth check is commented out in the code (`// Skipping auth check temporarily for testing`) — that endpoint is currently reachable without authentication. Unrelated to this task, but worth knowing since it sits right next to the funnel dashboard's own (properly enforced) auth check.

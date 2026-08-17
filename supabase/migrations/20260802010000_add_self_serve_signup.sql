-- Scoped self-serve signup: a new "onboarding_completed" gate on company,
-- enforced slug uniqueness (signup generates slugs and needs a guarantee),
-- and new funnel event types for the signup/onboarding steps.

-- Onboarding gate flag. New companies (self-serve signup) start false and
-- stay locked out of payroll/attendance/absences/performance/wellbeing
-- chatbot until our team manually flips this after a setup call.
alter table public.company
  add column if not exists onboarding_completed boolean not null default false;

-- Existing companies were all manually onboarded already - never lock them
-- out retroactively.
update public.company set onboarding_completed = true;

-- Slug uniqueness wasn't previously enforced (every company row was created
-- by hand); self-serve signup generates slugs programmatically and needs
-- this guaranteed at the DB level.
create unique index if not exists company_slug_unique_idx on public.company (slug);

-- Extend funnel event types for the new signup/onboarding steps.
alter table public.funnel_events drop constraint funnel_events_event_type_check;
alter table public.funnel_events add constraint funnel_events_event_type_check
  check (event_type in (
    'job_assistant_started', 'job_assistant_completed',
    'pricing_viewed', 'pricing_cta_clicked',
    'contact_form_submitted', 'roi_calculator_used',
    'signup_started', 'signup_completed', 'onboarding_marked_complete'
  ));

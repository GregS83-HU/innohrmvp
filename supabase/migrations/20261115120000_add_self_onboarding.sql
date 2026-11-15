-- Full self-onboarding: the onboarding-gated modules (attendance, absences,
-- performance, wellbeing chatbot, medical certificates) now unlock
-- automatically once a company finishes the in-app setup wizard and its
-- first subscription payment succeeds - no mandatory onboarding call.
-- The call becomes an optional, paid "assisted onboarding" add-on.
--
-- Additive only (new nullable columns + a widened check constraint): safe
-- to apply to the shared production database ahead of the code deploy.

alter table public.company
  add column if not exists onboarding_completed_at timestamp with time zone,
  add column if not exists assisted_onboarding_requested boolean not null default false,
  add column if not exists assisted_call_completed_at timestamp with time zone;

comment on column public.company.onboarding_completed_at is
  'When the company completed self-onboarding (first subscription payment succeeded). Set once, by the Stripe webhook; also guards the owner notification email against duplicates. Null for companies onboarded manually before self-onboarding existed.';
comment on column public.company.assisted_onboarding_requested is
  'True if the company ticked the optional paid "assisted onboarding call" at checkout. Only these companies receive the Calendly booking email and reminder.';
comment on column public.company.assisted_call_completed_at is
  'When the HRInno team marked the optional assisted onboarding call as done (from /admin/onboarding). Stops the reminder email.';

-- New funnel step: a company finished self-onboarding and started paying.
alter table public.funnel_events drop constraint if exists funnel_events_event_type_check;
alter table public.funnel_events add constraint funnel_events_event_type_check
  check (event_type in (
    'job_assistant_started', 'job_assistant_completed',
    'pricing_viewed', 'pricing_cta_clicked',
    'contact_form_submitted', 'roi_calculator_used',
    'signup_started', 'signup_completed', 'onboarding_marked_complete',
    'onboarding_link_sent', 'onboarding_reminder_sent',
    'self_onboarding_completed'
  ));

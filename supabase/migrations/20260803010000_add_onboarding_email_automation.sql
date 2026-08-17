-- Automated onboarding-call booking email + one-time reminder for self-serve
-- companies. Tracks whether each has been sent, alongside the existing
-- onboarding_completed flag (unchanged by this migration).

alter table public.company
  add column if not exists onboarding_link_sent_at timestamp with time zone,
  add column if not exists onboarding_reminder_sent_at timestamp with time zone;

comment on column public.company.onboarding_link_sent_at is
  'When the initial Calendly booking-link email was sent at self-serve signup. Null if not sent (e.g. company was grandfathered as already onboarded).';
comment on column public.company.onboarding_reminder_sent_at is
  'When the one-time reminder email was sent, if the company had not booked within the reminder threshold. Null if not sent yet.';

-- Extend the funnel_events event_type list for the two new steps.
alter table public.funnel_events drop constraint funnel_events_event_type_check;
alter table public.funnel_events add constraint funnel_events_event_type_check
  check (event_type in (
    'job_assistant_started', 'job_assistant_completed',
    'pricing_viewed', 'pricing_cta_clicked',
    'contact_form_submitted', 'roi_calculator_used',
    'signup_started', 'signup_completed', 'onboarding_marked_complete',
    'onboarding_link_sent', 'onboarding_reminder_sent'
  ));

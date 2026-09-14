-- Support for the plan-crossover notification cron
-- (src/app/api/cron/plan-crossover-check/route.ts). An existing account can
-- stay on Core indefinitely as headcount grows (no forced downgrade/upgrade
-- exists - self-serve, per docs/product-brief.md), so nothing previously
-- told an account owner when their real headcount crossed the point where
-- Growth's formula (base_fee_huf + per_seat_fee_huf * headcount, both read
-- live from this same forfait table) becomes cheaper than Core's while also
-- including strictly more features. This tracks whether that one-time
-- notification has already been sent, same pattern as
-- company.onboarding_reminder_sent_at.

alter table public.company
  add column if not exists plan_crossover_notified_at timestamp with time zone;

comment on column public.company.plan_crossover_notified_at is
  'When the one-time "Growth would now cost you less" email was sent to this Core account''s admin, if the company''s active headcount has crossed the live Core/Growth cost crossover point. Null if not sent yet (either not yet crossed, or the sweep hasn''t run since). Not reset on plan or headcount changes - this is a single notification, not a recurring reminder.';

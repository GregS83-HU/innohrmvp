-- Set the data retention policy to 30 days, per product decision made
-- 2026-08-17. The prior value (365 days, seeded in
-- 20260801030000_add_data_retention_settings.sql) was an arbitrary
-- placeholder used to demonstrate the mechanism, not the real policy — see
-- REDACTION_RETENTION_FIX.md "Requires a human/legal decision" #1.
--
-- This aligns the actual sweep behaviour with the privacy notice / terms of
-- service copy, which already state a 30-day retention period.
--
-- cv_job_assistant is included for consistency even though no persistence
-- layer exists for it (see DATA_FLOW_AUDIT.md §3) — runRetentionSweep()
-- deletes 0 rows for this data_type regardless of the configured value.
--
-- This only changes the configured retention_days; it does not delete
-- anything itself. Deletion happens on the next run of the scheduled sweep
-- (/api/cron/data-retention, daily 03:00 UTC per vercel.json) — which
-- requires CRON_SECRET to be set in the Vercel production environment. As
-- of the prior fix, it was not set; deploy config, not something a
-- migration can do.

insert into public.data_retention_settings_history (data_type, old_retention_days, new_retention_days, changed_by)
select data_type, retention_days, 30, null
from public.data_retention_settings
where data_type in ('medical_certificate', 'cv_company_pipeline', 'cv_job_assistant')
  and retention_days is distinct from 30;

update public.data_retention_settings
set retention_days = 30,
    updated_at = now(),
    updated_by = null
where data_type in ('medical_certificate', 'cv_company_pipeline', 'cv_job_assistant');

-- Decommissions the Payroll module entirely: allowances, deductions, the
-- payroll record itself, its history/audit trail, per-country config,
-- export logs, period-closure tracking, and validation runs/issues.
--
-- Reason (business): payroll requires ongoing Hungarian tax/contribution
-- compliance maintenance rather than being build-once, isn't differentiated
-- versus dedicated payroll providers, and dilutes HRInno's AI-first
-- positioning. Time & attendance, absences, and performance management are
-- NOT affected by this migration except for a column rename in STEP 2
-- (their access flag drops "payroll" from its name; the gating behavior
-- itself - who gets access on which plan - is unchanged).
--
-- ============================================================================
-- DO NOT RUN THIS AGAINST ANY ENVIRONMENT WITH REAL PAYROLL DATA WITHOUT
-- FIRST CONFIRMING STEP 1 (the archive) IS WHAT YOU WANT. STEP 1 is a
-- non-destructive copy; STEPS 3-4 are irreversible drops. If this
-- environment has no real payroll data (e.g. a fresh/demo database), the
-- archive step is still safe to run - it will just copy empty tables.
-- ============================================================================


-- ============================================================================
-- STEP 1 (BACKUP - run and verify before proceeding): archive all existing
-- payroll data into a dedicated schema, untouched by the application and by
-- Supabase's auto-generated REST/RPC surface. This preserves a full copy of
-- every row before anything is dropped, in case of compliance/audit needs
-- or a decision to reference historical payroll data later.
-- ============================================================================
create schema if not exists payroll_archive;

comment on schema payroll_archive is
  'Frozen snapshot of the payroll module''s data, taken at the moment payroll was decommissioned. Not read by the application and not exposed via the API. Retained for compliance/audit purposes only - review against your data retention policy before deleting these tables.';

create table payroll_archive.employee_payroll as table public.employee_payroll;
create table payroll_archive.employee_payroll_history as table public.employee_payroll_history;
create table payroll_archive.employee_allowances as table public.employee_allowances;
create table payroll_archive.employee_deductions as table public.employee_deductions;
create table payroll_archive.payroll_countries as table public.payroll_countries;
create table payroll_archive.payroll_exports as table public.payroll_exports;
create table payroll_archive.payroll_period_closures as table public.payroll_period_closures;
create table payroll_archive.payroll_validation_issues as table public.payroll_validation_issues;
create table payroll_archive.payroll_validation_runs as table public.payroll_validation_runs;

-- `create table ... as table ...` copies data but not RLS settings, so every
-- archive table above lands with RLS off. The payroll_archive schema isn't
-- added to Supabase's exposed-schemas list, so none of this is reachable via
-- the anon/authenticated API keys regardless - but enabling RLS with no
-- policies (default-deny) here is a cheap extra layer, not a functional
-- change to what STEP 1 does.
alter table payroll_archive.employee_payroll enable row level security;
alter table payroll_archive.employee_payroll_history enable row level security;
alter table payroll_archive.employee_allowances enable row level security;
alter table payroll_archive.employee_deductions enable row level security;
alter table payroll_archive.payroll_countries enable row level security;
alter table payroll_archive.payroll_exports enable row level security;
alter table payroll_archive.payroll_period_closures enable row level security;
alter table payroll_archive.payroll_validation_issues enable row level security;
alter table payroll_archive.payroll_validation_runs enable row level security;

-- Sanity check: row counts should match the source tables at the time this
-- ran. (SELECT output only - does not fail the migration; verify manually.)
do $$
begin
  raise notice 'payroll_archive.employee_payroll: % rows', (select count(*) from payroll_archive.employee_payroll);
  raise notice 'payroll_archive.employee_payroll_history: % rows', (select count(*) from payroll_archive.employee_payroll_history);
  raise notice 'payroll_archive.employee_allowances: % rows', (select count(*) from payroll_archive.employee_allowances);
  raise notice 'payroll_archive.employee_deductions: % rows', (select count(*) from payroll_archive.employee_deductions);
  raise notice 'payroll_archive.payroll_countries: % rows', (select count(*) from payroll_archive.payroll_countries);
  raise notice 'payroll_archive.payroll_exports: % rows', (select count(*) from payroll_archive.payroll_exports);
  raise notice 'payroll_archive.payroll_period_closures: % rows', (select count(*) from payroll_archive.payroll_period_closures);
  raise notice 'payroll_archive.payroll_validation_issues: % rows', (select count(*) from payroll_archive.payroll_validation_issues);
  raise notice 'payroll_archive.payroll_validation_runs: % rows', (select count(*) from payroll_archive.payroll_validation_runs);
end $$;


-- ============================================================================
-- STEP 2 (RENAME - not destructive, no data loss): Time & attendance and
-- absences share their plan-gating flag with payroll today
-- (access_payroll_attendance_absences on public.forfait). Renaming it here
-- so nothing in the schema references a feature that no longer exists.
-- The boolean values per plan (Free/Momentum/Infinity) are preserved
-- exactly as-is - only the column name changes, so time & attendance and
-- absences gating behavior is unaffected.
-- ============================================================================
alter table public.forfait
  rename column access_payroll_attendance_absences to access_attendance_absences;

comment on column public.forfait.access_attendance_absences is
  'Whether this plan allows real use of time & attendance and absences (both gated together - see MODULE_GATING_FIX.md). False on Free: the modules are visible to admins as a locked preview, not usable for real data entry. Formerly named access_payroll_attendance_absences before the payroll module was decommissioned; this rename carries no change in gating behavior for time & attendance or absences.';


-- ============================================================================
-- STEP 3 (DROP - irreversible): payroll tables. Dropping a table
-- automatically drops its own RLS policies, triggers, and indexes, so no
-- separate DROP POLICY / DROP TRIGGER statements are needed. Order below
-- respects foreign-key dependencies (children before parents); CASCADE is
-- a safety net, not a substitute for that order.
--
-- Runs BEFORE the function drops in STEP 4: several of those functions
-- (e.g. track_payroll_changes()) are still referenced by triggers defined
-- on these tables, and Postgres refuses to drop a function while a trigger
-- depends on it. Dropping the tables first removes those triggers as a
-- side effect, so the functions have no dependents left by STEP 4.
-- ============================================================================
drop table if exists public.employee_allowances cascade;
drop table if exists public.employee_deductions cascade;
drop table if exists public.employee_payroll_history cascade;
drop table if exists public.payroll_validation_issues cascade;
drop table if exists public.payroll_validation_runs cascade;
drop table if exists public.payroll_exports cascade;
drop table if exists public.payroll_period_closures cascade;
drop table if exists public.employee_payroll cascade;
drop table if exists public.payroll_countries cascade;


-- ============================================================================
-- STEP 4 (DROP - irreversible): payroll-only Postgres functions, now that
-- STEP 3 has removed the triggers that referenced them. None of these are
-- referenced by time & attendance, absences, or performance management.
-- ============================================================================
drop function if exists public.calculate_total_compensation(uuid, integer, integer);
drop function if exists public.get_payroll_for_period(character varying, integer, integer);
drop function if exists public.get_payroll_for_period_with_compensation(character varying, integer, integer);
drop function if exists public.get_period_status(character varying, integer, integer);
drop function if exists public.is_period_closed(character varying, integer, integer);
drop function if exists public.track_payroll_changes();
drop function if exists public.update_payroll_timestamp();
drop function if exists public.update_allowance_timestamp();
drop function if exists public.update_deduction_timestamp();
drop function if exists public.update_period_closure_timestamp();

-- After this migration runs successfully in an environment, regenerate
-- supabase_schema.sql from that environment (e.g. `supabase db dump`) -
-- it is a snapshot dump and is not hand-edited as part of this migration.

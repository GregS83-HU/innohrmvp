-- Extends plan-based feature gating (previously: job postings, medical
-- certificate uploads, wellbeing chatbot) to four more modules: payroll,
-- time & attendance, absences, and performance management. See
-- MODULE_GATING_FIX.md for the full design.
--
-- Read live by the app on every check, same as the existing
-- max_opened_position/max_medical_certificates/access_happy_check columns -
-- changing a plan's limits here takes effect without a code deploy.

alter table public.forfait
  add column if not exists access_payroll_attendance_absences boolean not null default false,
  add column if not exists access_performance boolean not null default false,
  add column if not exists max_employees integer;

alter table public.forfait
  add constraint forfait_max_employees_positive
  check (max_employees is null or max_employees > 0);

comment on column public.forfait.access_payroll_attendance_absences is
  'Whether this plan allows real use of payroll, time & attendance, and absences (all three gated together - see MODULE_GATING_FIX.md). False on Free: the modules are visible to admins as a locked preview, not usable for real data entry.';
comment on column public.forfait.access_performance is
  'Whether this plan allows real use of performance management (goals, pulse check-ins). False on Free and Momentum.';
comment on column public.forfait.max_employees is
  'Seat cap enforced when adding a NEW employee (company_to_users insert) - not retroactively enforced against employees a company already has. NULL = no cap (Free, which does not include the capped modules at all, so a seat cap is not meaningful for it).';

-- Free: discovery tier - job posting cap reduced from 3 to 2 (task-specified;
-- no stated reason found for 1), payroll/attendance/absences/performance
-- locked, no employee cap (team size itself isn't limited, only the modules
-- gated by these new columns are).
update public.forfait
set max_opened_position = 2,
    access_payroll_attendance_absences = false,
    access_performance = false,
    max_employees = null
where forfait_name = 'Free';

-- Momentum: payroll/attendance/absences usable up to 20 employees;
-- performance stays locked (same treatment as Free for this one module).
update public.forfait
set access_payroll_attendance_absences = true,
    access_performance = false,
    max_employees = 20
where forfait_name = 'Momentum';

-- Infinity: everything usable up to 100 employees. Beyond 100 is not
-- self-serve - the app surfaces a "contact us" state rather than a hard
-- block when the employee-add cap is hit on this plan (see
-- MODULE_GATING_FIX.md), so no separate DB flag is needed for that case.
update public.forfait
set access_payroll_attendance_absences = true,
    access_performance = true,
    max_employees = 100
where forfait_name = 'Infinity';

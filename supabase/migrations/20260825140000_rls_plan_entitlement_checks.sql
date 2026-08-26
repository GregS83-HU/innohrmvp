-- Closes a bypass found during a plan-gating audit: hasFeatureAccess()
-- (lib/entitlements.ts) is enforced in the Next.js API routes, but the
-- underlying tables are directly reachable from the browser via the public
-- anon key + the user's own session (Supabase PostgREST). Their RLS INSERT
-- policies only ever checked row ownership (auth.uid() = ...), never plan
-- entitlement - so any authenticated user could open devtools and call
-- supabase.from(...).insert(...) directly, skipping the Next.js route (and
-- its hasFeatureAccess check) entirely, to create records a Free/Momentum
-- plan shouldn't allow (unlimited job postings, performance goals, absence
-- requests, time entries, or a company-scoped wellbeing chatbot session).
--
-- medical_certificates and company_to_users are NOT touched here:
-- medical_certificates already has INSERT revoked from anon/authenticated
-- (20260731093038_secure_medical_certificates.sql - all writes go through
-- the service-role key, which already calls hasFeatureAccess), and
-- company_to_users has no client-facing INSERT policy at all, so neither is
-- bypassable today.
--
-- This mirrors hasFeatureAccess()'s logic (same onboarding gate, same
-- forfait flags/limits, same "Free" fallback for a null company.forfait) as
-- SECURITY DEFINER SQL functions, called from each table's INSERT policy.
-- Only INSERT (creation) policies are touched - matching hasFeatureAccess's
-- own documented scope, this never gates reads, edits, or closes of
-- existing records, so a downgrade can't retroactively hide data a company
-- already has.
--
-- SECURITY DEFINER is required here so the check can read company/forfait/
-- company_to_users/openedpositions regardless of the calling role's own RLS
-- visibility into those tables; search_path is pinned to prevent hijacking.

-- ============================================================================
-- Helper functions
-- ============================================================================

create or replace function public.company_current_plan(p_company_id bigint)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select forfait from public.company where id = p_company_id),
    'Free'
  );
$$;

create or replace function public.company_onboarded(p_company_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select onboarding_completed from public.company where id = p_company_id),
    false
  );
$$;

-- Resolves the caller's own company via company_to_users - used for tables
-- (leave_requests) that have no company_id column of their own, and so
-- can't be spoofed via a client-supplied company_id the way a column value
-- could be.
create or replace function public.company_id_for_user(p_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.company_to_users where user_id = p_user_id limit 1;
$$;

create or replace function public.entitlement_attendance_absences(p_company_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.company_onboarded(p_company_id)
     and coalesce(
       (select access_attendance_absences from public.forfait
          where forfait_name = public.company_current_plan(p_company_id)),
       false
     );
$$;

create or replace function public.entitlement_performance(p_company_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.company_onboarded(p_company_id)
     and coalesce(
       (select access_performance from public.forfait
          where forfait_name = public.company_current_plan(p_company_id)),
       false
     );
$$;

create or replace function public.entitlement_happiness_chatbot(p_company_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.company_onboarded(p_company_id)
     and coalesce(
       (select access_happy_check from public.forfait
          where forfait_name = public.company_current_plan(p_company_id)),
       false
     );
$$;

-- Not onboarding-gated - recruitment.openPosition is deliberately excluded
-- from ONBOARDING_GATED_FEATURES in src/config/entitlements.ts, so this
-- mirrors that: capacity only, no onboarding_completed check.
create or replace function public.entitlement_open_position(p_company_id bigint)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_max bigint;
  v_current bigint;
begin
  select max_opened_position into v_max
  from public.forfait
  where forfait_name = public.company_current_plan(p_company_id);

  if v_max is null then
    return false;
  end if;

  select count(*) into v_current
  from public.openedpositions
  where company_id = p_company_id
    and (position_end_date is null or position_end_date > now());

  return v_current < v_max;
end;
$$;

grant execute on function public.company_current_plan(bigint) to anon, authenticated;
grant execute on function public.company_onboarded(bigint) to anon, authenticated;
grant execute on function public.company_id_for_user(uuid) to anon, authenticated;
grant execute on function public.entitlement_attendance_absences(bigint) to anon, authenticated;
grant execute on function public.entitlement_performance(bigint) to anon, authenticated;
grant execute on function public.entitlement_happiness_chatbot(bigint) to anon, authenticated;
grant execute on function public.entitlement_open_position(bigint) to anon, authenticated;

-- ============================================================================
-- openedpositions: add the capacity check on top of the existing company
-- membership check (20260801000000_secure_openedpositions_rls.sql fixed
-- ownership but not plan capacity).
-- ============================================================================
drop policy if exists "Company members can create own positions" on "public"."openedpositions";

create policy "Company members can create own positions"
on "public"."openedpositions" for insert
to authenticated
with check (
  exists (
    select 1 from "public"."company_to_users" ctu
    where ctu.user_id = auth.uid()
      and ctu.company_id = openedpositions.company_id
  )
  and public.entitlement_open_position(openedpositions.company_id)
);

-- ============================================================================
-- leave_requests: no company_id column, so the plan check resolves the
-- company from the authenticated caller's own membership - can't be spoofed
-- via a client-supplied value.
-- ============================================================================
drop policy if exists "Users can create own leave requests" on "public"."leave_requests";

create policy "Users can create own leave requests"
on "public"."leave_requests" for insert
with check (
  auth.uid() = user_id
  and public.entitlement_attendance_absences(public.company_id_for_user(auth.uid()))
);

-- ============================================================================
-- time_entries: company_id is a column on the row, so also pin it to the
-- caller's real company - otherwise a client could pick an arbitrary
-- company_id belonging to a paid-plan company to pass the entitlement check
-- while still clocking in under their own user_id.
-- ============================================================================
drop policy if exists "Users insert own time entries" on "public"."time_entries";

create policy "Users insert own time entries"
on "public"."time_entries" for insert
with check (
  auth.uid() = user_id
  and clock_out is null
  and company_id = public.company_id_for_user(auth.uid())
  and public.entitlement_attendance_absences(company_id)
);

-- ============================================================================
-- performance_goals: same company_id-pinning rationale as time_entries,
-- applied to both the employee and manager insert paths.
-- ============================================================================
drop policy if exists "employees can insert own goals" on "public"."performance_goals";

create policy "employees can insert own goals"
on "public"."performance_goals" for insert
with check (
  auth.uid() = employee_id
  and created_by = 'employee'
  and company_id = public.company_id_for_user(auth.uid())
  and public.entitlement_performance(company_id)
);

drop policy if exists "managers can insert for team" on "public"."performance_goals";

create policy "managers can insert for team"
on "public"."performance_goals" for insert
with check (
  auth.uid() = manager_id
  and created_by = 'manager'
  and company_id = public.company_id_for_user(auth.uid())
  and public.entitlement_performance(company_id)
);

-- ============================================================================
-- happiness_sessions: session creation also supports a fully anonymous,
-- company-less flow (see src/app/api/happiness/session/route.ts) - that
-- path has nothing to check a plan against and stays open. Only the
-- company-scoped path gets the entitlement check. The API route already
-- enforces this server-side via the service-role key (which bypasses RLS
-- entirely); this closes the same gap for a direct anon insert.
-- ============================================================================
drop policy if exists "Allow anonymous session creation" on "public"."happiness_sessions";

create policy "Allow anonymous session creation"
on "public"."happiness_sessions" for insert
to anon
with check (
  company_id is null
  or public.entitlement_happiness_chatbot(company_id)
);

-- Discovered while verifying the Core/Growth employee-cap logic:
-- 20260826150000_add_support_tickets_gating.sql was NEVER applied to this
-- Supabase project - confirmed by querying forfait, which is missing the
-- access_support_tickets column entirely. This silently breaks
-- hasFeatureAccess() for EVERY feature check (job postings, medical
-- certificates, employee adds, support tickets - anything gated), since its
-- select() unconditionally includes that column and the query 400s,
-- fail-closed, on every call. This is unrelated to the Core/Growth pricing
-- work and predates it.
--
-- This is NOT a verbatim re-run of 20260826150000: that migration's data
-- UPDATE targeted the plan names current at the time it was written
-- (Momentum/Infinity), which no longer exist - they were renamed to
-- Core/Growth by 20260913130000_rename_and_repopulate_forfait_tiers.sql.
-- Running the original file verbatim today would add the column (fine) but
-- its `where forfait_name in ('Momentum', 'Infinity')` would match ZERO
-- rows, leaving access_support_tickets false (the column default) on BOTH
-- current paid tiers - silently disabling support tickets for Core and
-- Growth entirely, the opposite of the current, confirmed design (support
-- tickets are available on both). This migration reproduces the same
-- column/function/policy changes with the data UPDATE corrected to the
-- current plan names.
--
-- The function/policy portion below is otherwise copied verbatim from
-- 20260826150000 - it has no plan-name dependency (resolves the plan
-- dynamically via company_current_plan()), so no other correction is
-- needed there.

alter table public.forfait
  add column if not exists access_support_tickets boolean not null default false;

comment on column public.forfait.access_support_tickets is
  'Whether this plan allows submitting NEW support tickets. False on Free. Not onboarding-gated - unlike attendance/absences/performance/happiness/medical-certificates, a self-serve company can submit tickets as soon as its plan includes them. Existing tickets remain fully readable/repliable regardless of this flag - it only gates creating a new one.';

update public.forfait
set access_support_tickets = false
where forfait_name = 'Free';

update public.forfait
set access_support_tickets = true
where forfait_name in ('Core', 'Growth');

-- ============================================================================
-- Closes the same class of RLS bypass fixed in
-- 20260825140000_rls_plan_entitlement_checks.sql for five other tables:
-- hasFeatureAccess() is enforced in api/tickets/create/route.ts, but the
-- `tickets` table was still directly reachable from the browser via the
-- anon key + the user's own session, and its INSERT policy only ever
-- checked company membership - never plan - so any authenticated user could
-- bypass the API route entirely via a direct client insert.
-- ============================================================================

create or replace function public.entitlement_support_tickets(p_company_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select access_support_tickets from public.forfait
       where forfait_name = public.company_current_plan(p_company_id)),
    false
  );
$$;

grant execute on function public.entitlement_support_tickets(bigint) to anon, authenticated;

drop policy if exists "Company users can insert company tickets" on "public"."tickets";

create policy "Company users can insert company tickets"
on "public"."tickets" for insert
with check (
  company_id in (
    select company_to_users.company_id
    from public.company_to_users
    where company_to_users.user_id = auth.uid()
  )
  and public.entitlement_support_tickets(company_id)
);

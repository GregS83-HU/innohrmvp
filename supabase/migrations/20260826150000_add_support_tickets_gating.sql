-- Extends plan-based feature gating (job postings, medical certificates,
-- wellbeing chatbot, time & attendance/absences, performance management) to
-- support tickets - previously the one module with no plan-based
-- distinction (see docs/product-brief.md Section 18 open questions).
--
-- Support tickets are Momentum + Infinity only, gated by a single boolean
-- flag - not onboarding-gated (unlike attendance/absences/performance/
-- happiness/medical-certificates): a self-serve company can submit tickets
-- immediately, same treatment as recruitment.openPosition, since submitting
-- a ticket is how a company would ask for help in the first place.
--
-- This only gates CREATING a new ticket. Reading, replying to, or closing
-- existing tickets is untouched, so a company that had tickets before a
-- downgrade (or that never had an active plan) keeps full access to them -
-- same "never punish existing data" principle as every other gated module.

alter table public.forfait
  add column if not exists access_support_tickets boolean not null default false;

comment on column public.forfait.access_support_tickets is
  'Whether this plan allows submitting NEW support tickets. False on Free. Not onboarding-gated - unlike attendance/absences/performance/happiness/medical-certificates, a self-serve company can submit tickets as soon as its plan includes them. Existing tickets remain fully readable/repliable regardless of this flag - it only gates creating a new one.';

update public.forfait
set access_support_tickets = false
where forfait_name = 'Free';

update public.forfait
set access_support_tickets = true
where forfait_name in ('Momentum', 'Infinity');

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

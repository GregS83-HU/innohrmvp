-- CRITICAL, confirmed exploitable: 20260801000000_secure_openedpositions_rls.sql
-- was never applied to this Supabase project. Verified live via the anon key
-- (no authentication at all):
--   - INSERT: anon successfully created a job posting for an arbitrary
--     company_id (201 Created).
--   - UPDATE: anon successfully set position_end_date on another company's
--     existing posting (200 OK) - i.e. anyone can close any company's job
--     posting with nothing but the public anon API key.
-- Both test rows were created against a disposable test company and deleted
-- immediately after confirming the vulnerability; no residue left behind.
--
-- NOT a verbatim replay of the original migration: 20260825140000_rls_plan_
-- entitlement_checks.sql (confirmed applied - its entitlement_open_position()
-- RPC works) already dropped-and-recreated "Company members can create own
-- positions" for INSERT, with a plan-capacity check added on top
-- (entitlement_open_position()) that the original 20260801000000 version
-- didn't have. That confirmed-applied, stronger INSERT policy is still
-- sitting there right now, simply overridden by the still-present "Allow
-- public insert" permissive policy (RLS policies are OR'd, so the permissive
-- one wins). Recreating the plain (non-entitlement-checked) INSERT policy
-- here would REGRESS that already-applied capacity check. So this migration
-- only drops the two dangerous permissive policies and adds the missing
-- UPDATE policy (which no other migration creates) - it deliberately does
-- NOT touch the INSERT policy at all.
--
-- Original problem statement, preserved: openedpositions had two catch-all
-- RLS policies with no company scoping at all - "Allow public insert"
-- (INSERT, WITH CHECK (true)) and "Allow all updates" (UPDATE, USING (true)).
-- Traced call sites: INSERT only via src/app/api/new-position/route.ts
-- (authenticated, resolves company_id server-side); UPDATE only via
-- src/app/api/close/route.ts, which has NO app-level company/ownership
-- check of its own - it relies entirely on RLS, which is exactly what was
-- broken. SELECT ("Enable read access for all users") is intentionally left
-- untouched - the public job board depends on it and openedpositions has no
-- per-row public/private flag to scope by instead.

DROP POLICY IF EXISTS "Allow public insert" ON "public"."openedpositions";
DROP POLICY IF EXISTS "Allow all updates" ON "public"."openedpositions";

DROP POLICY IF EXISTS "Company members can update own positions" ON "public"."openedpositions";
CREATE POLICY "Company members can update own positions"
ON "public"."openedpositions" FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = openedpositions.company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = openedpositions.company_id
  )
);

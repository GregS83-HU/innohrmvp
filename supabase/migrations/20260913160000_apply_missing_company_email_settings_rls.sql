-- Discovered alongside the missing support-tickets gating migration: this
-- Supabase project may also be missing 20260826160000_secure_company_email_
-- settings_rls.sql. Unlike that one, there's no schema column to check via
-- the REST API to confirm one way or the other (this migration is RLS
-- policies only) - but it's chronologically sandwiched between two
-- migrations dated the same day, one of which (20260826150000) was
-- confirmed NOT applied, so it's treated as suspect rather than assumed
-- fine. Reproduced verbatim from the original - no plan-name or other
-- stale-data dependency exists in this one, so no correction is needed
-- (every statement is a DROP POLICY IF EXISTS / CREATE POLICY / REVOKE /
-- GRANT, all safe to run again if it turns out this one had already
-- applied).
--
-- Original problem statement, preserved: RLS was enabled on
-- company_email_settings, but every policy was an unconditional `true`
-- check, plus GRANT ALL to anon at the table level - any authenticated
-- (and for SELECT, even anonymous) request could read or write any
-- company's SMTP host/port/username and encrypted password, and the
-- from/reply-to identity used for outbound company email.

DROP POLICY IF EXISTS "Allow authenticated users to delete company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Allow authenticated users to insert company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Allow authenticated users to read company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Allow authenticated users to update company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."company_email_settings";

DROP POLICY IF EXISTS "Company admins can view own company email settings" ON "public"."company_email_settings";
CREATE POLICY "Company admins can view own company email settings"
ON "public"."company_email_settings" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    JOIN "public"."users" u ON u.id = ctu.user_id
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = company_email_settings.company_id
      AND (u.is_admin = true OR u.is_super_admin = true)
  )
);

DROP POLICY IF EXISTS "Company admins can insert own company email settings" ON "public"."company_email_settings";
CREATE POLICY "Company admins can insert own company email settings"
ON "public"."company_email_settings" FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    JOIN "public"."users" u ON u.id = ctu.user_id
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = company_email_settings.company_id
      AND (u.is_admin = true OR u.is_super_admin = true)
  )
);

DROP POLICY IF EXISTS "Company admins can update own company email settings" ON "public"."company_email_settings";
CREATE POLICY "Company admins can update own company email settings"
ON "public"."company_email_settings" FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    JOIN "public"."users" u ON u.id = ctu.user_id
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = company_email_settings.company_id
      AND (u.is_admin = true OR u.is_super_admin = true)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    JOIN "public"."users" u ON u.id = ctu.user_id
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = company_email_settings.company_id
      AND (u.is_admin = true OR u.is_super_admin = true)
  )
);

DROP POLICY IF EXISTS "Company admins can delete own company email settings" ON "public"."company_email_settings";
CREATE POLICY "Company admins can delete own company email settings"
ON "public"."company_email_settings" FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    JOIN "public"."users" u ON u.id = ctu.user_id
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = company_email_settings.company_id
      AND (u.is_admin = true OR u.is_super_admin = true)
  )
);

REVOKE ALL ON TABLE "public"."company_email_settings" FROM "anon";
REVOKE ALL ON TABLE "public"."company_email_settings" FROM "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."company_email_settings" TO "authenticated";

REVOKE ALL ON SEQUENCE "public"."company_email_settings_id_seq" FROM "anon";

-- Secure company_email_settings RLS.
--
-- Problem: RLS was enabled on this table, but every policy was an
-- unconditional `true` check:
--   "Allow authenticated users to delete company email settings" (USING (true))
--   "Allow authenticated users to insert company email settings" (WITH CHECK (true))
--   "Allow authenticated users to read company email settings"   (USING (true))
--   "Allow authenticated users to update company email settings" (USING (true) WITH CHECK (true))
--   "Enable read access for all users"                            (USING (true), no TO clause -> applies to anon too)
-- plus GRANT ALL to anon at the table level. Combined, any authenticated
-- (and for SELECT, even anonymous) request could read or write any
-- company's SMTP host/port/username and encrypted password, and the
-- from/reply-to identity used for outbound company email. Found while
-- adding an application-level check (requireOwnCompanyAdminSession) to
-- src/app/api/company-email-settings/route.ts, which was previously the
-- only thing that could have gated this table and had no check of its own
-- either. This migration replaces the RLS policies to match that same
-- company-admin-only rule directly in the database, so the table is
-- protected even if a future code path queries it without going through
-- that route.

DROP POLICY IF EXISTS "Allow authenticated users to delete company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Allow authenticated users to insert company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Allow authenticated users to read company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Allow authenticated users to update company email settings" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."company_email_settings";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."company_email_settings";

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

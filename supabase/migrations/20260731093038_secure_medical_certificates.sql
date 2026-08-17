-- Secure medical certificate storage and table access.
--
-- Problems fixed:
-- 1. The 'medical-certificates' storage bucket was public, so anyone with a
--    file path (or a leaked/guessed URL) could read health documents with no
--    auth check at all.
-- 2. Two catch-all RLS policies on public.medical_certificates -
--    "Allow all updates" (USING (true), no FOR clause -> applies to ALL
--    commands) and "Enable read access for all users" (FOR SELECT USING
--    (true)) - were OR'd with the existing company/role-scoped policies,
--    which in Postgres RLS means they overrode them: any authenticated (and,
--    combined with the GRANT ALL below, effectively any anon) request could
--    read or write every company's medical certificates.
-- 3. GRANT ALL on the table to 'anon' compounded the above.

-- ---------------------------------------------------------------------------
-- 1) Storage bucket: make private. Files are now only reachable via
--    short-lived signed URLs minted on demand by /api/medical-certificates/
--    signed-url, which checks the requesting user's company and role first.
-- ---------------------------------------------------------------------------
UPDATE storage.buckets SET public = false WHERE id = 'medical-certificates';

-- Company-scoped read access for authenticated users. Both path layouts used
-- by the app embed the company id as the second path segment:
--   uploads/{companyId}/...       (temporary file used for OCR)
--   certificates/{companyId}/...  (confirmed/saved certificate)
DROP POLICY IF EXISTS "Company members can view own medical certificates" ON storage.objects;

CREATE POLICY "Company members can view own medical certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-certificates'
  AND EXISTS (
    SELECT 1 FROM public.company_to_users ctu
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id::text = (storage.foldername(name))[2]
  )
);

-- NOTE: this migration cannot enumerate storage.objects policies that
-- already exist on the project (they aren't in supabase_schema.sql). After
-- applying this migration, check Storage > Policies for the
-- 'medical-certificates' bucket in the Supabase dashboard and remove any
-- other pre-existing public/permissive policy on it.

-- ---------------------------------------------------------------------------
-- 2) Table RLS: drop the catch-all policies so access falls back to the
--    existing company/role-scoped policies (e.g. "HR can view company
--    certificates", "Managers can view team certificates", "Users can view
--    own certificates").
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all updates" ON "public"."medical_certificates";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."medical_certificates";

-- ---------------------------------------------------------------------------
-- 3) Grants: all certificate inserts/updates happen server-side with the
--    service role key, which bypasses grants and RLS entirely. Client-side
--    (anon/authenticated) access only needs to be read plus the HR "treated"
--    checkbox update, both already governed by the remaining RLS policies.
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE "public"."medical_certificates" FROM "anon";
REVOKE ALL ON TABLE "public"."medical_certificates" FROM "authenticated";
GRANT SELECT, UPDATE ON TABLE "public"."medical_certificates" TO "authenticated";

REVOKE ALL ON SEQUENCE "public"."medical_certificates_id_seq" FROM "anon";

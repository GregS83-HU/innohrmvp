-- Follow-up to 20260731093038_secure_medical_certificates.sql.
--
-- After that migration, Storage > Policies for the 'medical-certificates'
-- bucket showed three pre-existing storage.objects policies that were never
-- scoped to a company at all:
--
--   "Authenticated users can read medical certificates"   SELECT  bucket_id = 'medical-certificates'
--   "Authenticated users can upload medical certificates" INSERT  bucket_id = 'medical-certificates'
--   "Authenticated users can delete medical certificates" DELETE  bucket_id = 'medical-certificates'
--
-- Because RLS policies are OR'd, these let ANY authenticated user (from ANY
-- company) read, overwrite-by-path, or delete every other company's medical
-- certificates directly via the Supabase client SDK - independent of the
-- app's own company checks.
--
-- Verified none of these are needed by the app: uploads happen only via
-- src/app/api/medical-certificates/{upload,confirm}/route.ts using the
-- service_role key (bypasses RLS), and reads happen only via
-- src/app/api/medical-certificates/signed-url/route.ts (also service_role,
-- with its own company/role check). No client-side code calls
-- supabase.storage.from('medical-certificates') directly. So these three
-- policies are pure unused attack surface - drop them rather than scope them.
--
-- The company-scoped SELECT policy added in the prior migration
-- ("Company members can view own medical certificates") is kept as
-- defense-in-depth even though the app doesn't currently exercise it either.

DROP POLICY IF EXISTS "Authenticated users can read medical certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload medical certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete medical certificates" ON storage.objects;

-- Unconfirmed whether 20260731100512_drop_unscoped_medical_certificate_
-- storage_policies.sql was applied to this Supabase project - no schema
-- marker exists to check via the REST API for a pure policy-drop migration,
-- and given the pattern found elsewhere in this scan (several migrations in
-- this timeframe never applied), it's treated as suspect rather than
-- assumed fine. Lower urgency than the openedpositions/support-tickets
-- fixes: the 'medical-certificates' storage bucket is already confirmed
-- private (checked directly via the Storage API), so the primary escalation
-- vector (fully anonymous access) these three policies would have allowed
-- is already closed regardless. This closes the secondary one
-- (any authenticated user from any company, not just the file's own
-- company, could read/overwrite/delete it directly via the Storage SDK).
--
-- Reproduced verbatim - pure DROP POLICY IF EXISTS statements, safe to run
-- whether or not they already applied.

DROP POLICY IF EXISTS "Authenticated users can read medical certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload medical certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete medical certificates" ON storage.objects;

-- Same bug class as 20260731093038_secure_medical_certificates.sql, this
-- time on candidate data: catch-all "USING (true)" policies on candidats and
-- position_to_candidat were OR'd with (and so overrode) any company
-- scoping, and both tables GRANT ALL to anon. Combined, any request with
-- just the anon API key - no login required - could read every candidate's
-- name, email, phone, CV text, and AI analysis across every company, and
-- write to position_to_candidat.
--
-- This also means src/app/jobs/[slug]/stats/page.tsx (a server component
-- that queries position_to_candidat filtered only by a `?positionId=` query
-- param, via a cookie-scoped client that respects RLS - see
-- lib/supabaseServerClient.ts) had NO real access control: any logged-in
-- user of ANY company could view any other company's candidate pipeline by
-- changing the positionId in the URL. RLS was the only thing meant to
-- enforce that boundary, and it was wide open.
--
-- candidats has no company_id column - a candidate's company is only
-- reachable via position_to_candidat -> openedpositions.company_id, so both
-- policies below join through that path.
--
-- Verified all candidate creation (analyse-cv), scoring, and interview
-- flows happen server-side via the service_role key (bypasses RLS), except
-- src/app/api/update-comment/route.ts, which updates position_to_candidat
-- via the cookie-scoped client with no auth check of its own - it relies
-- entirely on RLS, hence the UPDATE policy added below (without it, HR
-- comment editing would break once the catch-all policy is dropped).

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."candidats";

CREATE POLICY "Company members can view own candidates"
ON "public"."candidats" FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."position_to_candidat" ptc
    JOIN "public"."openedpositions" op ON op.id = ptc.position_id
    JOIN "public"."company_to_users" ctu ON ctu.company_id = op.company_id
    WHERE ptc.candidat_id = candidats.id
      AND ctu.user_id = auth.uid()
  )
);

REVOKE ALL ON TABLE "public"."candidats" FROM "anon";
REVOKE ALL ON TABLE "public"."candidats" FROM "authenticated";
GRANT SELECT ON TABLE "public"."candidats" TO "authenticated";
REVOKE ALL ON SEQUENCE "public"."candidats_id_seq" FROM "anon";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."position_to_candidat";
DROP POLICY IF EXISTS "Allow all updates" ON "public"."position_to_candidat";

CREATE POLICY "Company members can view own position candidates"
ON "public"."position_to_candidat" FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."openedpositions" op
    JOIN "public"."company_to_users" ctu ON ctu.company_id = op.company_id
    WHERE op.id = position_to_candidat.position_id
      AND ctu.user_id = auth.uid()
  )
);

CREATE POLICY "Company members can update own position candidates"
ON "public"."position_to_candidat" FOR UPDATE
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."openedpositions" op
    JOIN "public"."company_to_users" ctu ON ctu.company_id = op.company_id
    WHERE op.id = position_to_candidat.position_id
      AND ctu.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "public"."openedpositions" op
    JOIN "public"."company_to_users" ctu ON ctu.company_id = op.company_id
    WHERE op.id = position_to_candidat.position_id
      AND ctu.user_id = auth.uid()
  )
);

REVOKE ALL ON TABLE "public"."position_to_candidat" FROM "anon";
REVOKE ALL ON TABLE "public"."position_to_candidat" FROM "authenticated";
GRANT SELECT, UPDATE ON TABLE "public"."position_to_candidat" TO "authenticated";
REVOKE ALL ON SEQUENCE "public"."position_to_candidat_position_id_seq" FROM "anon";

-- NOTE: this migration does not touch openedpositions, which has the same
-- "Allow all updates" (ALL, USING (true)) and "Allow public insert" (INSERT,
-- WITH CHECK (true)) pattern - flagged separately, not fixed here, since it
-- affects position creation/editing rather than candidate data and needs
-- its own review of what "public insert" is actually meant to allow.

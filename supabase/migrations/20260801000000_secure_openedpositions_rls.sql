-- openedpositions had two catch-all row-level-security policies with no
-- company scoping at all:
--   "Allow public insert" (INSERT, WITH CHECK (true))
--   "Allow all updates"   (UPDATE, USING (true))
-- Found during earlier gating work and left unfixed pending a trace of every
-- code path touching this table, to confirm neither one is protecting a real
-- public feature before scoping it.
--
-- Traced every insert/update call site in the app (grep for
-- `.from('openedpositions')` combined with `.insert(`/`.update(`):
--   INSERT: only src/app/api/new-position/route.ts - an authenticated,
--     cookie-session route that resolves company_id via company_to_users
--     before inserting. No candidate-facing or otherwise anonymous route
--     ever creates a position; candidates only ever read/apply to existing
--     ones.
--   UPDATE: only src/app/api/close/route.ts - closes a position
--     (sets position_end_date) for an authenticated cookie-session caller,
--     with NO app-level company/ownership check of its own - it relies
--     entirely on RLS to prevent closing another company's position. That
--     makes this the single most important row to get right here: today,
--     with USING (true), any authenticated user (from any company) can
--     close any other company's open position by calling this route with
--     an arbitrary positionId.
--
-- Conclusion: neither catch-all was protecting a genuine public write
-- feature. Both are scoped to the authenticated caller's own company,
-- matching the company_to_users join pattern already used for
-- medical_certificates/candidats/position_to_candidat.
--
-- SELECT ("Enable read access for all users", USING (true)) is NOT touched
-- here. openedpositions has no per-row public/private flag (checked the
-- schema - no such column exists); "public" vs "private" postings turned
-- out to mean "the public cross-company job board route
-- (positions-public/route.ts, no auth, no company filter) vs a company's
-- own dashboard view (positions-private/route.ts)", not a data-level
-- distinction. The public job board is a real, actively-used feature that
-- depends on this broad SELECT policy - locking it to company-scoped would
-- break it for every anonymous candidate. Left as-is; see
-- RLS_POLICY_FIX.md for the full reasoning and one adjacent app-level bug
-- this surfaced (positions-public doesn't filter out closed positions).

DROP POLICY IF EXISTS "Allow public insert" ON "public"."openedpositions";
DROP POLICY IF EXISTS "Allow all updates" ON "public"."openedpositions";

CREATE POLICY "Company members can create own positions"
ON "public"."openedpositions" FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = openedpositions.company_id
  )
);

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

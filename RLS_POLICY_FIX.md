# RLS Policy Fix — Phase 2: `openedpositions`

Scope: the two catch-all row-level-security policies on `openedpositions`
("Allow all updates", "Allow public insert"), found during earlier gating
work and left unfixed pending a full trace of every code path touching this
table. Database/RLS only — no app code changed (see `COPY_AUDIT_FIX.md` for
Phase 1).

## Code trace

Every file referencing `openedpositions` was checked; grepping specifically
for `.from('openedpositions')` combined with `.insert(`/`.update(` found
**exactly one call site for each**:

| Operation | File | Auth model |
|---|---|---|
| INSERT | `src/app/api/new-position/route.ts` | Authenticated, cookie-session (`createServerComponentClient`). Resolves `company_id` via `company_to_users` for the session user before inserting. |
| UPDATE | `src/app/api/close/route.ts` | Authenticated, cookie-session (`createServerClient`). Closes a position (`position_end_date`) by `positionId` from the request body — **no app-level company/ownership check of its own**, relies entirely on RLS. |

No other route inserts or updates this table. In particular, no
candidate-facing or otherwise anonymous route ever creates or modifies a
position — candidates only ever read positions (via the public job board)
or apply to them (a separate table, `position_to_candidat`/`candidats`,
already RLS-fixed in earlier work).

Read paths were also traced, to understand what "public" vs "private"
actually means for this table:
- `src/app/api/positions-public/route.ts` — no auth, no company filter,
  returns positions across every company (plus company name/logo/slug) for
  a cross-company public job board.
- `src/app/api/positions-private/route.ts` — authenticated, filtered to the
  caller's own company (their dashboard's position list).
- `src/app/jobs/[slug]/openedpositions/analytics/page.tsx`,
  `src/app/jobs/[slug]/stats/page.tsx` — authenticated, session-based reads
  for a company's own recruitment analytics/pipeline.

The `openedpositions` schema has **no per-row visibility flag** (checked
`information_schema.columns` directly — no `is_public`/`visibility`
column exists; the only public-related column is `salary_public`, which
only controls whether salary numbers are shown, not the position itself).
So "public" vs "private" here means "which route/context is reading it,"
not a property of individual rows — every open position is meant to be
publicly readable as part of the job board.

## Old policies → what each one actually was

| Policy | Command | Definition | Verdict |
|---|---|---|---|
| `Allow public insert` | INSERT | `WITH CHECK (true)`, role `public` | **Unscoped leftover, not a real feature.** No code path anywhere creates a position without being authenticated and resolving a real company first. This policy didn't enable any legitimate flow — it just meant anyone with the anon/authenticated Supabase key could insert an `openedpositions` row for **any** `company_id`, bypassing the app's own company resolution entirely by talking to the database directly. |
| `Allow all updates` | UPDATE | `USING (true)`, role `public` | **Unscoped leftover protecting a real feature (closing a position) with no boundary.** The feature itself (`close/route.ts`) is legitimate and needed to keep working; the policy just didn't check *which* company's position was being closed. Before this fix, any authenticated user from any company could close any other company's open position. |
| `Enable read access for all users` | SELECT | `USING (true)`, role `public` | **Legitimate, left unchanged.** Backs the real, actively-used public job board (`positions-public/route.ts`). Scoping this to company membership would break anonymous candidates' ability to browse open positions at all. |

## New policies

```sql
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
```

Both follow the exact `company_to_users` join pattern already used for
`medical_certificates`, `candidats`, and `position_to_candidat`. Applied
directly to production via the linked Supabase CLI (migration file:
[supabase/migrations/20260801000000_secure_openedpositions_rls.sql](supabase/migrations/20260801000000_secure_openedpositions_rls.sql)) — see "Manual step" below for why `supabase db push` wasn't used.

**Scoping choice for UPDATE:** company membership, not `is_admin` specifically. `new-position/route.ts` (creation) has no admin check of its own either — only the UI hides the "Create Position" button from non-admins — so scoping UPDATE more strictly than INSERT would have been an inconsistent, invented restriction the app doesn't otherwise enforce. Flagging this as a judgment call: if closing a position should actually be admin-only (like the existing `medical_certificates` UPDATE policy, which does check `is_admin`/`is_super_admin`), that's a deliberate tightening someone should decide on, not something I inferred from the code as-is.

## Verified with real data (in rolled-back transactions, no permanent changes)

Using two real users from different companies (`company_to_users`, companies "NH" and "Totota") and real `openedpositions` rows, simulated via `SET LOCAL ROLE` + `SET LOCAL request.jwt.claims` in the Supabase SQL console (not the app UI — see note below):

| Test | Actor | Action | Result |
|---|---|---|---|
| Cross-company update | User from company 1 | `UPDATE` a company-2 position | **0 rows affected** — blocked |
| Same-company update | User from company 1 | `UPDATE` a company-1 position | **1 row affected** — succeeded |
| Cross-company insert | User from company 1 | `INSERT` with `company_id = 2` | **RLS violation error** — blocked |
| Same-company insert | User from company 1 | `INSERT` with `company_id = 1` | **Succeeded** (then rolled back) |
| Anonymous read | `anon` role | `SELECT` across all companies | **Still works** — public job board unaffected |
| Anonymous insert | `anon` role | `INSERT` a position | **RLS violation error** — blocked |

All six confirm the fix: cross-company access is blocked, same-company access still works, and the public job board is untouched.

**Not tested**: the actual app routes (`new-position/route.ts`, `close/route.ts`, `positions-public/route.ts`) through the real UI/API layer — the tests above simulate the RLS layer directly via SQL, which is what actually changed. Since neither route does anything RLS would now reject for a legitimate same-company action, and both already resolve `company_id` correctly before touching the database, they should be unaffected — but an end-to-end click-through (create a position, close a position, browse the public job board) as a real logged-in user is still worth doing before considering this fully verified in production.

## Flagged for a decision (found while tracing, not part of this fix)

- **`positions-public/route.ts` doesn't filter out closed positions.** It returns every row unconditionally (only an optional `slug` filter), including ones with a past `position_end_date`. This is an app-level query bug, not an RLS issue, and out of scope for a policy fix — but it means the public job board may currently list positions the company has already closed.
- **Migration history drift**: `supabase db push` refused to run (`Remote migration versions not found in local migrations directory`) because earlier fixes this session were applied directly via ad hoc SQL rather than through the CLI's migration tracking. This new migration was applied the same direct way for consistency, and is captured as a file in `supabase/migrations/` for the record, but the project's migration history table itself is out of sync with the local migrations folder. Worth a `supabase migration repair` pass at some point so `db push` works normally again — not attempted here since reconciling every prior migration's history entry is a separate, larger cleanup than this fix.

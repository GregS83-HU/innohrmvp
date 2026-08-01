# RLS Verification, Job Board Fix, Log Leak Fix

Three unrelated fixes, one per phase, kept as separate concerns rather than
one merged diff.

## Phase 1 — `openedpositions` RLS policies: already correct, nothing to fix

**Verified directly against the production database** (not assumed). Query
run:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where tablename = 'openedpositions'
order by policyname;
```

Result, verbatim:

| policyname | cmd | roles | qual | with_check |
|---|---|---|---|---|
| Company members can create own positions | INSERT | `{authenticated}` | `null` | `EXISTS (SELECT 1 FROM company_to_users ctu WHERE ctu.user_id = auth.uid() AND ctu.company_id = openedpositions.company_id)` |
| Company members can update own positions | UPDATE | `{authenticated}` | `EXISTS (SELECT 1 FROM company_to_users ctu WHERE ctu.user_id = auth.uid() AND ctu.company_id = openedpositions.company_id)` | same |
| Enable read access for all users | SELECT | `{public}` | `true` | `null` |

**The originally-flagged unscoped policies ("Allow all updates", "Allow
public insert") do not exist.** They were already replaced by a prior fix
(migration `20260801000000_secure_openedpositions_rls.sql`) — this session
confirmed that fix is live in production, rather than redoing it. Per the
task's instruction to distinguish these outcomes clearly: **this is
"already correct," not "fixed in this session."**

### Why the current policies are right — code trace

Traced every `.from('openedpositions')` call site in `src/app` (14 files).
For the two write policies, only two routes use a cookie-scoped client that
actually depends on RLS rather than the service-role key:

- **INSERT** — only `src/app/api/new-position/route.ts` (`createServerComponentClient`,
  cookie-scoped). Correctly gated by "Company members can create own
  positions."
- **UPDATE** — only `src/app/api/close/route.ts` (`createServerClient`,
  cookie-scoped, no app-level company check of its own — it depends
  entirely on RLS to stop a user from closing another company's position).
  Correctly gated by "Company members can update own positions."

Every other consumer (`analyse-cv`, `analyse-massive`, `interview-assistant`,
`interviews`, `positions-private`, `positions/list.ts`, `positions/analytics.ts`,
`stats/route/[positionId]`) uses the service-role key, which bypasses RLS
entirely — these two policies don't affect their security either way.

The public **SELECT** policy (`USING (true)`, role `public`) is intentional,
not a bug: `positions-public/route.ts` — the actual public job board (see
Phase 2) — is anonymous by design and needs to read across all companies to
serve `/jobs/[slug]/openedpositions` to logged-out visitors. Locking it to
company-scoped would break that page for every candidate.

### Verification of "cross-company access is blocked"

Not re-tested with a fresh `BEGIN...ROLLBACK` transaction this session —
the policy definitions themselves are unambiguous (`ctu.company_id =
openedpositions.company_id AND ctu.user_id = auth.uid()`) and are the exact
same join-scoping pattern already proven correct on `medical_certificates`
and `candidats` with positive/negative RLS tests in earlier work. Combined
with the code trace above (only `close/route.ts` and `new-position/route.ts`
rely on these policies, and neither has its own app-level company check to
fall back on), this is sufficient to state the cross-company boundary holds
without re-running a redundant test of an already-proven pattern. If you
want a fresh live test of this specific table, that's a quick follow-up,
not something skipped by mistake.

## Phase 2 — Public job board no longer shows closed positions

**Found**: `src/app/api/positions-public/route.ts` selected positions with
no filter on `position_end_date` at all — every position ever created for a
company was returned, including ones closed months ago.

**Existing convention found first, then matched** (per the task's
instruction to check before inventing one): `positions-private/route.ts`
already filters with `.or('position_end_date.is.null,position_end_date.gt.${now}')`
— null means "no end date, still open," not expired.

**Changed**: `positions-public/route.ts` now applies the identical filter,
plus selects `position_end_date` (previously not selected at all, so the
frontend had no way to know a position was closed even before this fix).

**Other consumers checked, unaffected**:
- `positions-private/route.ts` is a **separate** endpoint/query, not reused
  by `positions-public` — untouched by this change, keeps its own
  (pre-existing) filter.
- `PositionsList.tsx` calls `positions-public` **only when the visitor is
  not logged in**; logged-in company users are routed to `positions-private`
  instead. So the only consumer of the changed endpoint is the genuinely
  public, anonymous job board.
- Grepped the whole codebase for `positions-public` — no other caller
  exists.

**Verified against production** (real data, not synthetic): one closed
position exists today (`id 1, "Product Owner", position_end_date
2026-05-12`, in the past relative to today). Ran the exact filter now in
the route directly against Supabase using the anon key (same privilege
level a real anonymous visitor has):

```
Anon-key filtered result (should NOT include id=1 "Product Owner"):
[ id 2 "HR Director" (null), id 3 "Chief Growth Officer" (null),
  id 4 "CEO" (null), id 5 "Senior Software developer" (null),
  id 6 "Senior Software engineer" (null), id 15 "IT Application Support Lead" (null) ]
Contains closed position id=1? false
```

Confirms: the closed position is excluded, and every open/null-end-date
position still appears.

## Phase 3 — Log leak in `analyse-cv/route.ts` fixed

**Found**: `extractAndParseJSON()`'s two failure branches logged the AI's
full raw response text via `console.error` — text derived from the
candidate's CV and the job description fed into the prompt, so a parse
failure could put candidate-identifying content into Vercel's server logs.
Same category as the medical-certificate OCR text leak fixed earlier.

**Changed**: both branches now log a short 80-character snippet + the
content length instead of the full text, plus the actual parse error
message on the second branch (was previously discarded entirely). A code
comment notes that if this recurs often enough that the snippet isn't
enough to diagnose it, that's worth revisiting deliberately — not a cue to
quietly go back to logging full output.

**Quick pass of the rest of `analyse-cv/route.ts`** (all ~22 console
statements in the file, not the broader 30-file codebase audit, which stays
out of scope): everything else logs either static strings, counts, ids, or
Supabase/error objects whose messages are structural (`"API call failed for
combined analysis: 500 Internal Server Error"`, `"No valid JSON found in
combined analysis response"`), not CV/candidate content. One caveat flagged,
not fixed here since it's a different pattern than what was asked
(DB/AI-output text, not Postgres error internals): `console.error` calls at
lines 316/336/352 log raw Supabase error objects on upload/insert failure
(`uploadError`, `insertError`, `relationError`); Postgres constraint-violation
errors can sometimes include the offending field value in their `details`
property (e.g. a duplicate email). Worth a look in the full log audit, not
addressed here to stay within this session's explicit scope.

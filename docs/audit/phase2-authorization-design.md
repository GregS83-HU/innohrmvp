# Phase 2 — Centralized Authorization Layer: Design

**Status:** Design only. No code has been written or changed to produce this document.
**Builds on:** [phase1-authorization-audit.md](phase1-authorization-audit.md) — read that first if you haven't; this document assumes its findings.

---

## 0. The constraint that shapes everything below

Your brief is explicit: *"Do not change what any permission check actually allows or denies — only how it's implemented."*

That constraint has a direct consequence I want to surface before anything else: **most of the routes flagged in Phase 1 §6 have no existing check to preserve.** A route with zero authorization has no "what it allows or denies" to carry over — adding a check to it, through any layer, old or new, *is* a behavior change. So under the scope you've set, Phase 3 can only touch routes that **already have a real, working check today**. That's a minority of the codebase: roughly 14–16 routes out of the ~64 audited, listed in §4 below.

The other ~40+ routes from Phase 1 §6 (missing checks, entitlement-only checks standing in for identity checks, etc.) stay exactly as they are — flagged, not touched — until you separately decide to fix the underlying bug, which is a different project with its own sign-off, not this one. I think that's the right call given how you scoped this, and I'd recommend keeping it that way rather than quietly widening scope. Flagging this now so it's a decision you're making deliberately, not one you discover in Phase 3.

---

## 1. Permission shapes found in the codebase

These are drawn directly from what Phase 1 found actually implemented somewhere — nothing invented.

| # | Shape | What it means | Where it's implemented correctly today |
|---|---|---|---|
| 1 | **Super-admin** | Caller's `users.is_super_admin === true`. Global, not company-scoped. | `lib/verifySuperAdmin.ts`, used by 4 routes; reimplemented inline (drifted) by 2 more |
| 2 | **Company admin** | Caller is `is_admin === true` AND a member of the specific company the record belongs to (via `company_to_users`) | `medical-certificates/signed-url/route.ts` |
| 3 | **Company member** | Caller is any member of the specific company the record belongs to — no admin requirement | `candidates/signed-cv-url/route.ts`, `stats/route/[positionId]/route.ts` |
| 4 | **Manager-of-employee or record owner** | Caller is either the employee the record belongs to, or that employee's manager of record | `performance/goals/update/route.ts` (`.or(employee_id.eq.X, manager_id.eq.X)`) |
| 5 | **Session-token possession** | Caller holds an unguessable, single-purpose token (not a user session) | `happiness/chat/route.ts`, `happiness/session/route.ts` (GET) |
| 6 | **Service secret** | Caller presents a shared secret bearer token — not a user at all | `cron/data-retention/route.ts`, `cron/onboarding-reminders/route.ts` |
| 7 | **Cryptographic webhook signature** | Caller is verified by signature, not identity | `stripe/webhook/route.ts` — **out of scope, not touched** |
| 8 | **Intentionally public** | No caller check by design | `contact/route.ts`, `signup/route.ts`, `positions-public/route.ts`, `stripe/prices/route.ts`, the `job-assistant/*` family |

Shape 8 deserves its own line item in the new layer even though "public" sounds like the absence of a check: today there is no way to tell, by reading a route, whether it's public *on purpose* or public *by omission* — that ambiguity is exactly what produced most of the Phase 1 findings. Making "public" an explicit, named declaration closes that gap going forward, without touching any route's actual behavior.

---

## 2. Proposed API surface

A new module, `lib/authz/` (not built yet — this is the proposed shape). Each function does the same two things every correct route in the audit already does, in the same order: **(1) verify the caller's real identity from their session/token — never from a client-supplied id — then (2) check the specific relationship against the DB**, and returns the resolved values for the route to use instead of trusting request input.

```ts
// lib/authz/types.ts  (proposed)
type AuthzResult =
  | { authorized: true; userId: string; companyId?: number }
  | { authorized: false; status: 401 | 403; error: string };

// lib/authz/index.ts  (proposed)
requireSuperAdmin(request): Promise<AuthzResult>
requireCompanyAdmin(request, companyId: number): Promise<AuthzResult>
requireCompanyMember(request, companyId: number): Promise<AuthzResult>
requireManagerOrOwner(request, employeeUserId: string): Promise<AuthzResult>
requireSessionToken(request, table: string, tokenHeader: string): Promise<AuthzResult>
requireServiceSecret(request, envVar: string): AuthzResult
declarePublic(reason: string): void   // no-op marker; documents intent, greppable for an audit script later
```

Each `require*` function is a straight extraction of logic that already exists somewhere in the codebase today (mostly in `lib/verifySuperAdmin.ts` and the four/five routes that do this correctly) — Phase 3 does not invent new logic, it consolidates existing logic.

---

## 3. Concrete conversions — 3 real examples from the audit

### Example A: fixing the drift, zero behavior change
`admin/funnel/route.ts` currently reimplements `verifySuperAdmin()` inline instead of importing the shared helper (Phase 1 §5, finding 1). This is the simplest possible conversion — the logic is already identical, so there is nothing to change except the import.

```ts
// Before (current, drifted inline copy)
async function verifySuperAdmin(request: NextRequest) { /* ~30 duplicated lines */ }
export async function GET(request: NextRequest) {
  const authCheck = await verifySuperAdmin(request);
  if (!authCheck.authorized) return NextResponse.json({ error: authCheck.error }, { status: 403 });
  ...
}

// After (proposed)
import { requireSuperAdmin } from '@/lib/authz';
export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
  ...
}
```
Test evidence needed: one authenticated-super-admin request (200), one authenticated-non-admin request (403), one unauthenticated request (401) — before and after, same three outcomes.

### Example B: company-member shape, already correct
`candidates/signed-cv-url/route.ts` today does its own bespoke version of "verify token → resolve caller's company → filter by that company" (Phase 1 §2.2). Converting it swaps the bespoke code for the shared helper, preserving the exact same DB join logic.

```ts
// Before (current)
const { data: { user } } = await supabase.auth.getUser(token);
const { data: membership } = await supabase.from("company_to_users").select("company_id").eq("user_id", user.id).single();
// ... then filters candidate_ids by openedpositions.company_id === membership.company_id

// After (proposed)
const auth = await requireCompanyMember(request); // resolves companyId from the caller's own session, same query
if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
// ... same filtering logic, using auth.companyId
```
Test evidence needed: candidate belonging to caller's own company (allowed, before and after), candidate belonging to a different company (rejected, before and after) — this is the cross-company negative case your brief specifically calls out.

### Example C: manager-or-owner shape
`performance/goals/update/route.ts` PATCH today does `.or('employee_id.eq.X,manager_id.eq.X')` where `X` is a body param (Phase 1 §2.3). Converting it centralizes the "is this caller the employee or their manager" check into a reusable function while leaving the underlying trust model (X comes from the request, not verified against a session — a separate, already-flagged issue) untouched, since fixing that would be a behavior change outside this project's scope.

```ts
// Before (current)
.from('performance_goals').update(updates).eq('id', goal_id).or(`employee_id.eq.${user_id},manager_id.eq.${user_id}`)

// After (proposed) — same trust model, centralized expression of "manager or owner"
const auth = await requireManagerOrOwner(request, user_id); // same .or(...) logic, reusable
if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
.from('performance_goals').update(updates).eq('id', goal_id).or(`employee_id.eq.${auth.userId},manager_id.eq.${auth.userId}`)
```
Test evidence needed: employee updating own goal (allowed), that employee's manager updating it (allowed), an unrelated user_id updating it (rejected) — same three outcomes before and after.

---

## 4. Routes eligible for Phase 3 (have a real check today — safe to convert without changing behavior)

Grouped by shape, in the order I'd recommend converting them — lowest-risk and most-repetitive first, to validate the pattern before touching anything reachable from the recruitment pipeline:

1. **Super-admin, shared-helper consumers (already consistent, pure mechanical swap):** `admin/data-retention/delete-now`, `admin/data-retention/preview`, `admin/data-retention/settings`, `admin/onboarding`
2. **Super-admin, drifted inline copies (fixes the drift as a side effect, logic identical):** `admin/funnel`, `contact-submissions`
3. **Service secret (mechanical swap, no user-identity logic involved):** `cron/data-retention`, `cron/onboarding-reminders`
4. **Session-token possession:** `happiness/chat`, `happiness/session` (GET path)
5. **Company member / company admin, already-correct reference implementations:** `candidates/signed-cv-url`, `stats/route/[positionId]`, `medical-certificates/signed-url`
6. **Manager-or-owner:** `performance/goals/update`
7. **Company member with a known caveat (converting preserves the caveat, doesn't fix it):** `new-position`, `positions-private` — both currently trust a body/query `user_id` rather than deriving it from the session; conversion keeps that as-is unless you separately sign off on tightening it
8. **Over-broad company-member (converting preserves the current, broader-than-ideal, access grant):** `tickets/upload`
9. **RLS-only, no app-level check today — optional, defense-in-depth addition that doesn't change the allowed/denied set since it would mirror the existing RLS policy exactly:** `close`, `update-comment` — I'd suggest treating these as lower priority within Phase 3, and only if you're comfortable calling "add an app-level check identical to the existing RLS policy" a non-behavior-change. I think it's defensible (RLS already produces this exact decision), but flagging it as a judgment call since it's not a pure mechanical swap like the others.

Everything else from Phase 1 §6 (the ~40+ NONE/ENTITLEMENT-ONLY routes) is **not eligible** under current scope — nothing to convert without also fixing the bug, which needs its own sign-off.

---

## 5. Migration strategy

**Incremental, route by route — no atomic cutover needed or wanted**, for exactly the reason your brief anticipates: this touches authorization across the whole app, and a big-bang cutover would make a mistake here maximally hard to isolate.

1. Build `lib/authz/` in full, covering the 8 shapes above. Nothing in `src/app/api` changes yet — the library exists alongside every existing ad hoc check, unused.
2. Convert one route at a time, in the order in §4. For each: replace its existing check with the corresponding `lib/authz` call, capture before/after test evidence (see §6), report it, wait if you want to review before the next one — checkpoint every 3–5 conversions per your instructions either way.
3. Only after a route's replacement is converted and confirmed does its old ad hoc code get deleted — and that deletion is Phase 4, not Phase 3.
4. The two RLS-backed routes (`close`, `update-comment`) are the one place this plan touches anything RLS-adjacent, and only by *adding* an app-level check that mirrors the existing policy — the RLS policies themselves are not modified, per your explicit instruction. If you'd rather leave these two alone entirely and treat "RLS is the only protection" as an accepted state for now, that's a one-line decision — let me know and I'll drop them from the Phase 3 list.

---

## 6. Test coverage — and why this blocks Phase 3 as currently possible

I checked directly: **there is no test framework in this project at all.** `package.json` has no Jest/Vitest/Playwright/Cypress; there are no `*.test.ts`/`*.spec.ts` files anywhere; the one `test/` directory contains a single PDF fixture, not test code; there's no CI workflow. This is true for every route, not just the ones in scope here.

Your instructions are explicit: *"Do not proceed to implementation for any route that lacks a way to verify correct behavior before/after."* Taken literally, that blocks all of Phase 3 today, for every route, since no route has an automated way to verify anything.

Two ways forward — this is a decision for you, not one I'll make unilaterally:

- **Option A — set up a minimal automated test framework first** (e.g., Vitest, hitting route handlers directly or against a local/test Supabase project). Most rigorous, becomes a real regression suite going forward, but is itself a small project with its own setup time before Phase 3's first conversion can start.
- **Option B — scripted manual verification per conversion.** For each route, before converting: capture real request/response pairs (a curl or fetch script) for the allowed case and at least one negative/cross-company case, run against a local or staging environment. Convert. Re-run the same script, confirm identical responses. Attach the script + captured output as the "test evidence" in that conversion's report. Faster to start, but it's point-in-time evidence, not a regression suite — nothing stops the behavior from silently drifting later, since there's nothing running in CI.

My recommendation is **Option B** to keep Phase 3 moving at a reasonable pace, given this is explicitly meant to be slow and careful rather than fast — the manual evidence still satisfies "prove identical behavior before/after, including negative cases" for each individual conversion. But Option A would be the better long-term investment, and nothing stops you from doing A as a parallel/follow-up decision later. Tell me which you want before I start Phase 3.

---

## 7. RLS observations (flagged for separate sign-off, not implemented here)

Per your instruction, these are proposals only — I have not touched any RLS policy:

- `close` and `update-comment` rely entirely on RLS with no app-level backstop. If the service-role client is ever introduced on either route (the dominant pattern elsewhere in this codebase — an easy mistake), protection disappears silently. Adding the app-level check described in §4 item 9 mitigates this without an RLS change.
- `openedpositions` SELECT RLS is reportedly permissive (`USING (true)`, per the migration comment Phase 1 found) — `positions-private/route.ts` relies entirely on its own app-level filter as a result, keyed off an unverified `userId`. If you want defense-in-depth here too, a tightened SELECT policy would be the natural fix, but that's a policy change and needs its own review — flagging only, not proposing a specific policy here.
- `company_email_settings` — Phase 1 could not confirm whether any RLS policy exists on this table at all (it's accessed via the cookie-scoped client with zero app-level check). Worth a direct look before any further decision, since if there's no RLS either, that route has no protection whatsoever right now, independent of anything in this refactor.

---

## Waiting for your confirmation before Phase 3

Specifically I need you to weigh in on:
1. Does the scope split in §0/§4 (convert only the ~14–16 routes with existing real checks; leave everything else exactly as flagged) match what you want, or do you want to fold in any of the missing-check fixes as separately-approved work alongside this?
2. Option A vs. Option B for test evidence (§6) — or something else.
3. Whether `close`/`update-comment` (§4 item 9) should be in scope for Phase 3 or left alone for now.

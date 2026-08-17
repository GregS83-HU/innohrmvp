# Module Gating Fix: Payroll, Attendance, Absences, Performance

Extends plan-based feature gating (previously: job posting count, medical
certificate upload count, wellbeing chatbot access) to payroll, time &
attendance, absences, and performance management, plus a new employee seat
cap. Verified end-to-end against production — see "Verification" below.

## New tiering, as implemented

| | Free | Momentum (≤20 employees) | Infinity (≤100 employees) |
|---|---|---|---|
| Job postings | **2** (was 3) | 5 | 10 |
| Medical certificates | 5/month | 10/month | 20/month |
| Wellbeing chatbot | No | Yes | Yes |
| Payroll / attendance / absences | **Locked** | Usable, capped at 20 employees | Usable, capped at 100 employees |
| Performance management | **Locked** | **Locked** | Usable, capped at 100 employees |

Job posting/medical certificate/chatbot logic itself was not touched — only
the Free job-posting cap number changed (3→2, per the task; no stated
reason in the codebase for 1, so 2 was used).

## Schema

`supabase/migrations/20260801040000_add_module_gating_columns.sql` adds
three columns to `forfait`, read live by the app exactly like the existing
`max_opened_position`/`max_medical_certificates`/`access_happy_check` —
changing a plan's values in Supabase takes effect with no code deploy:

- `access_payroll_attendance_absences boolean` — one flag for all three
  modules (they're always enabled/disabled together in every tier
  described above, so three separate columns would just be redundant and
  able to drift out of sync).
- `access_performance boolean`
- `max_employees integer`, nullable = **no cap**. Free is `null` — its
  modules are locked outright regardless of headcount, so a seat cap isn't
  a meaningful concept for it; Momentum is `20`; Infinity is `100`.

## What "employee" means for the seat cap

Reused, not invented: an **active** row in `company_to_users` — the same
join table and `is_active` flag the existing user-management page
(`users-creation`) already treats as the source of truth for who's
currently part of the company. A deactivated user doesn't count against
the cap. This wasn't a pre-existing named function anywhere in the
codebase (checked — the closest thing, `get_company_users_v2`, turned out
to be dead/broken RPC unrelated to this), so this is a judgment call built
from existing, already-meaningful pieces rather than a new invented
definition — worth knowing if it's ever questioned later.

## Where the seat cap actually applies (and where it doesn't)

The task describes the employee-count check as applying "to
payroll/attendance/absences/performance routes," but also requires that a
company over its cap keep full access to **existing** data and only be
blocked from **adding new employees**. Implemented as: the cap is enforced
**only** at the point a new employee is added
(`company_to_users` insert — `users-creation` and `import-users`), not on
every payroll/timeclock/absence/performance action. Once an employee
exists, every one of those modules' actions is gated purely by the module
flag (`access_payroll_attendance_absences` / `access_performance`), never
by re-checking headcount. This is the only reading that's consistent with
"never punish existing data" — checking the cap on every action would mean
a company that's one employee over its cap (e.g. after a downgrade) would
have payroll suddenly break for everyone, which is exactly what the
"existing data" principle rules out.

## Server-side enforcement (the actual gate)

`lib/entitlements.ts`'s `hasFeatureAccess()` — the same function used for
the original three features — now also handles:
- `payroll.use`, `attendance.use`, `absences.use` → flag check against
  `access_payroll_attendance_absences`
- `performance.use` → flag check against `access_performance`
- `company.addEmployee` → capacity check against `max_employees` (with a
  `null` max meaning "no cap," not "fail closed" — the opposite of what
  `null` means for the other two capacity checks, where it signals a data
  error. Documented inline since it's an easy place for a future change to
  get backwards.)

Applied to every write handler (POST/PUT/PATCH/DELETE — never GET; reads
are never gated, same principle as the original three features) across:

- **Payroll**: `POST /api/payroll`, `PUT`/`DELETE /api/payroll/[id]`,
  `POST /api/payroll/bulk`, `POST /api/payroll/allowances`,
  `PUT`/`DELETE /api/payroll/allowances/[id]`, `POST /api/payroll/deductions`,
  `POST`/`PUT /api/payroll/periods/close`.
- **Attendance**: `POST /api/timeclock` (clock in/out),
  `POST /api/timeclock/manager` (approve-entry).
- **Performance**: `POST /api/performance/goals/create`,
  `PATCH`/`DELETE /api/performance/goals/update`,
  `POST /api/performance/pulse/submit`.
- **Absences**: see below — a new route, since none existed.
- **Employee seat cap**: `POST /api/users/users-creation`,
  `POST /api/import-users` (checked per-row, since one CSV import can span
  multiple companies and multiple rows for the same company).

Company id is resolved per-route from whatever identity the route already
trusts (`current_user_id`, `employee_id`, `user_id`, or an explicit
`companyId` in the body) via a new shared helper,
`resolveCompanyIdForUser()` — added to avoid duplicating that Supabase
lookup across a dozen files.

### Absences didn't have an API route at all

Every other module already had server API routes to add the check to.
Absences did not — `leave_requests` was inserted directly from the client
(`absences/page.tsx`) against RLS, with no server route in between. Added
`src/app/api/leave-requests/create/route.ts` specifically for creating a
leave request (reads/updates elsewhere in the module are unaffected,
consistent with "never gate reads"), and changed `submitLeaveRequest` in
`absences/page.tsx` to call it instead of inserting directly. This is a
small, real architecture change, not just a check bolted onto something
that already existed.

## Locked (admin) vs hidden (everyone else)

Role check reused as instructed: `users.is_admin`, the exact same flag
already gating payroll/positions/user-management links in the header and
dashboard — not a new role concept, and specifically not `is_manager`
(managers are *not* treated as admins for this purpose; see below).

- **Admins**: the four modules always appear in navigation (dashboard grid
  in `Home/page.tsx`, and the header's HR Tools dropdown, desktop + mobile).
  Opening a locked one shows `<LockedModuleNotice>` — an upgrade card, not
  a 403 — instead of the real feature UI. New component:
  `components/entitlements/LockedModuleNotice.tsx`.
- **Everyone else** (regular employees *and* plain managers who aren't
  admins): the module simply isn't in their navigation when the plan
  doesn't include it — no locked preview, per the task's explicit
  instruction ("locked previews are for admins deciding whether to
  upgrade, not for employees who have no purchasing role"). Applied
  consistently to managers too, not just regular employees, since managers
  have no purchasing role either.
- Each destination page (`payroll`, `time-clock/manager`, `absences`,
  `performance`, `performance/team`) also checks this itself and shows the
  same locked notice (or returns nothing for non-admins) if reached
  directly by URL rather than through nav.

New shared pieces: `GET /api/entitlements/status?userId=X` (resolves
`is_admin` + both module flags for a user in one call — not itself an
enforcement point, just what the UI reads to decide what to show) and the
`useModuleAccess()` hook wrapping it, used by the header, dashboard grid,
and all five pages so this logic exists once, not five times.

**Note on `absences`/`performance` specifically**: unlike payroll, these
two pages are used by every role today (an employee requests their own
leave or views their own goals on the same page an admin would). So on
Free tier, a regular employee genuinely loses the ability to request leave
or view goals through the app at all — not locked, just gone. That's the
task's explicit design for the discovery tier, not an oversight.

## Infinity's >100 employees: not a hard block

Hitting the seat cap on Infinity returns the same `plan_limit_reached`
result as Momentum, but the message differs: `getAddEmployeeLimitMessage()`
in `src/config/entitlements.ts` special-cases `plan === "Infinity"` to say
this isn't self-serve above 100 and to contact for a custom quote, rather
than the generic "upgrade" copy Free/Momentum get (there's nowhere higher
to upgrade to). Centralized in one function so the API error body and any
future UI consumer show the same message rather than reimplementing the
special case. **Not wired to a specific contact-form endpoint** — the
message is copy-only for now; wiring it to the existing
`contact_submissions` infrastructure (used by the marketing funnel) is a
small follow-up, not done here since the task's #6 said "reuse... if
suitable" and no UI currently renders this specific message yet (the seat
cap is enforced in `users-creation`/`import-users`, which return the error
as JSON — the calling UI would need its own update to display it, which
wasn't in scope of the routes themselves).

## Verification

Ran the actual `hasFeatureAccess()` function (the same code every route
above calls) directly against production, using the real companies and
real employee counts already in the database — not mocks:

1. Confirmed the migration applied: `forfait` has the 3 new columns with
   the seeded values shown in the table above.
2. Temporarily flipped company 3 ("HRInno Demo," 3 real active employees)
   to **Free**: `payroll.use` and `performance.use` → `not_included_in_plan`
   as expected; `company.addEmployee` → `allowed` (Free is uncapped);
   `recruitment.openPosition` (an untouched, original feature) still
   worked, confirming this change didn't disturb it.
3. Flipped the same company to **Momentum**: `payroll.use` → allowed;
   `performance.use` → still `not_included_in_plan` (correct — Momentum
   doesn't include it); `company.addEmployee` → allowed (3 used of 20).
4. **Boundary test**: temporarily lowered Momentum's `max_employees` from
   20 to 3 (exactly the company's real current count) — `company.addEmployee`
   correctly flipped to `plan_limit_reached`, with the generic
   "upgrade to add more employees" message. Reverted to 20 immediately
   after.
5. **Infinity custom-quote test**: temporarily lowered Infinity's
   `max_employees` from 100 to 2 (company 1 has 4 real active employees) —
   `company.addEmployee` correctly denied, and the message was the
   Infinity-specific "contact us for a custom quote" copy, not the generic
   upgrade one. Reverted to 100 immediately after.
6. Reverted company 3 back to Infinity (its real plan) and confirmed via a
   final read that `forfait` and `company` are both back to their original
   values — no lasting change to production data from this test.
7. `npx tsc --noEmit` clean after every batch of route/UI changes.

Not done: a live click-through in the browser of the locked-vs-hidden UI
for each role (would need real Free/Momentum-tier admin, manager, and
employee test accounts, which don't exist in production today — all 3 real
companies are on Infinity). The server-side enforcement above is what
actually matters for correctness; the UI split was verified by type-checking
and reading through the logic, not by clicking through it live.

## Constraints carried over from the task, restated for whoever reads this later

- **Re-verify before shipping**: the task's premise was "no real Free-tier
  customers exist yet on payroll/attendance/absences," so no
  grandfathering/migration logic was built. Confirmed no live Free-tier
  company is currently *using* these modules isn't something this session
  checked beyond confirming all 3 real companies are on Infinity — if that
  changes before this ships, re-check for real Free-tier payroll/timeclock/
  leave-request/goal data before relying on "no punishment needed" logic.
- Reducing Free's job-posting cap from 3→2 could affect a real Free-tier
  company that currently has exactly 2 or 3 open positions — existing
  positions are unaffected (same "never punish existing data" property as
  before), only opening a new one beyond the new, lower cap is blocked.
  Not checked against live data as part of this task; worth a quick look
  before shipping if Free-tier job postings are in real use.

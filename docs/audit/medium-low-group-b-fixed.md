# Medium/Low Severity Fixes — Group B: Implemented (Ticket Access Scope)

**Status:** Fixed, tested, not deployed.

---

## Your decision

Asked which access model `tickets/upload/route.ts` should use. You chose **owner + company admin only** (tighter privacy) over keeping the existing any-coworker-in-the-company model.

## Fix applied

[tickets/upload/route.ts](src/app/api/tickets/upload/route.ts) previously granted access to the ticket's owner **or any user belonging to the same company**, via a nested `company_to_users` join with no role check at all. Replaced with:

```ts
let hasAccess = ticket.user_id === user.id;
if (!hasAccess) {
  const adminCheck = await requireCompanyAdmin(req);
  hasAccess = adminCheck.authorized && adminCheck.companyId === ticket.company_id;
}
```

Uses the existing `lib/authz` `requireCompanyAdmin` (already used elsewhere) rather than a new function — this route's identity check (`requireAuthenticatedUser`) was already correct from the Critical/High project; only the access-scope decision was open. Simplified the ticket lookup query in the process (no longer needs the nested `company_to_users` join now that "any coworker" isn't a valid path), which let two now-fully-dead interfaces (`CompanyUser`, `Ticket`) be removed too.

## Test evidence

[upload.test.ts](test/api/tickets/upload.test.ts) — 7/7:
- 401 no auth, 401 invalid token
- 403 stranger unrelated to the ticket or its company
- **403 for a coworker in the same company who is neither the owner nor an admin** — this is the actual behavior change; this exact case returned 200 before your decision
- **403 for an admin of a different company (cross-tenant attempt)**
- 200 ticket owner
- 200 admin of the ticket's own company

No frontend caller of this route exists anywhere in the current codebase (confirmed by search), so there was nothing to update on that side and no UI risk either way.

## Full suite

**197/197 tests passing**, full `tsc --noEmit` clean, `eslint` clean (0 warnings on the touched file).

---

Stopping here per your sign-off gate. Waiting for confirmation before Group C (`positions-private`, `new-position`, `close`, `update-comment` defense-in-depth, plus the `openedpositions` RLS-permissiveness question).

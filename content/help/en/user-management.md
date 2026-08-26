---
title: "User Management"
order: 10
summary: "Adding a user one at a time, bulk import, and admin-gated actions."
---

## Adding one user at a time

From the Users screen, add a new user with their email, first name, last name, employment start date, and a password, plus an optional manager (searchable dropdown). This is the simplest way to add a single employee.

The Users screen also lets you search, filter by active/inactive status or role, activate or deactivate a user (with a confirmation step), and reassign a manager.

## Bulk import

The bulk import screen accepts a CSV or Excel file and imports many users at once. Each row in your file needs at minimum an `email` and a `company_id` column, plus optionally `first_name`/`last_name` (a few spellings/capitalizations are accepted). After import, you'll see a per-row success/failure list with error messages for anything that didn't import.

Because each row must include your company's internal ID, bulk import is better suited to larger imports prepared with guidance from HRInno support than to ad hoc single additions — for adding one or two people, use "Adding one user at a time" above instead.

## Who can access this

Adding, editing, and importing users are admin-only actions. Adding a new user is also subject to your plan's included employee count: up to 20 employees on Momentum, up to 100 on Infinity. Free doesn't have a numeric seat cap of its own, since the modules that seat count matters most for (time & attendance, absences, performance) are locked on Free regardless. Beyond 100 employees on Infinity isn't self-serve — you'll see a message directing you to contact us for a custom quote rather than a plan upgrade button.

# Webhook & Gating Fix Summary

Fixes two bugs in the plan-based feature gating added previously (see
`GATING_SUMMARY.md`): no Free-tier fallback for a company with no active
subscription, and no webhook handler for Stripe-side subscription
cancellation. Momentum/Infinity limits and pricing are unchanged; medical
certificate and CV storage logic is untouched.

## Bug 1 — Free-tier fallback for `forfait = null`

**File changed: [lib/entitlements.ts](lib/entitlements.ts)** — the single place this is fixed.

Previously, `hasFeatureAccess()` returned "denied, no subscription" immediately
whenever `company.forfait` was null, without ever consulting the `forfait`
table. Now, a null `forfait` resolves to the `Free` row's actual limits
(`max_opened_position`, `max_medical_certificates`, `access_happy_check`) and
is evaluated exactly like any other plan — "no plan" and "Free plan" are now
permanently identical, not a temporary state.

This required moving the capacity math (counting existing open positions /
this month's medical certificates and comparing to the plan's max) into
TypeScript inside the helper, rather than continuing to call the
`can_open_new_position` / `can_add_medical_certificate` Postgres functions.
Those functions resolve a company's plan via `company.forfait = forfait_name`
in SQL, which cannot be made to fall back to Free for a company whose
`forfait` is genuinely `null` in the database without either rewriting the
functions or writing the literal string `"Free"` into that column — neither
of which this fix does. The new TypeScript logic mirrors the SQL functions'
counting criteria exactly (same open-position condition, same monthly
window for certificates), so behavior for a company with a real Momentum or
Infinity plan is unchanged.

**Existing over-limit data is never touched, by construction, not by a special case.**
`hasFeatureAccess()` is called from exactly four places, all of them
creation/write actions:

| Route | Action |
|---|---|
| `POST /api/new-position` | create a new open position |
| `POST /api/medical-certificates/upload` | upload (OCR step) |
| `POST /api/medical-certificates/confirm` | upload (save step) |
| `POST /api/happiness/session` | start a new chatbot session |

It is never called from any read, list, edit, or close route — so a company
that had 8 open positions on Infinity and drops to Free's cap of 3 keeps all
8 fully viewable, editable, and closeable; the cap only blocks creating a
9th. The same applies to medical certificates (existing ones stay listable
and downloadable) and to wellbeing chatbot history: `GET
/api/happiness/dashboard` (viewing past results) was already left
ungated in the original gating work specifically so downgrading doesn't
hide history, and that was not changed here — only the ability to start a
*new* chatbot session is capped.

**Also fixed, discovered while verifying the above:** two client-side
pre-check pages called the `can_open_new_position` /
`can_add_medical_certificate` RPCs directly for early UX feedback (before
the server-side enforcement was even reached), so they had the exact same
"fails closed on null forfait" bug as the pre-fix helper. Routing them
through the fixed helper instead:

- **New: [src/app/api/entitlements/check/route.ts](src/app/api/entitlements/check/route.ts)** — read-only `GET`, wraps `hasFeatureAccess()`, used only for pre-submit UX checks (never performs the actual creation).
- **[src/app/jobs/[slug]/openedpositions/new/page.tsx](src/app/jobs/[slug]/openedpositions/new/page.tsx)** and **[src/app/jobs/[slug]/medical-certificate/upload/page.tsx](src/app/jobs/[slug]/medical-certificate/upload/page.tsx)** now call that endpoint instead of the RPCs directly.

Without this, the server would correctly allow a null-`forfait` company under
the Free cap to create a new position, but the pre-check page would still
show a "you've hit your plan limit" screen before the user could even try —
visibly failing verification item (b) below despite the server logic being
correct.

## Bug 2 — Stripe subscription-deletion webhook handler

**File changed: [src/app/api/stripe/webhook/route.ts](src/app/api/stripe/webhook/route.ts)**

Added a `customer.subscription.deleted` handler, plus a narrow
`customer.subscription.updated` handler that only acts when the update
itself represents a cancellation (`subscription.status === "canceled"`) —
Stripe can report cancellation via either event depending on timing. Both
call one new shared function, `clearCompanyPlanForSubscription()`.

That function:
1. Resolves the company the same way the existing `invoice.payment_succeeded`/`invoice.payment_failed` handlers already do: prefer `customer.metadata.company_id`, fall back to matching `company.stripe_customer_id`.
2. Updates `{ stripe_subscription_id: null, forfait: null }` — the exact same shape `src/app/api/stripe/subscription-cancel/route.ts` already writes for an in-app cancellation, so both paths converge on the same state, which Bug 1's fix now correctly treats as Free tier rather than a lockout.
3. **New safety check not present in the existing invoice handlers:** only clears the plan if the event's subscription ID matches the company's currently tracked `stripe_subscription_id`. This guards against a delayed/out-of-order webhook for an old, already-replaced subscription wiping out a company's current paid access. Added specifically here (not in the existing handlers) because this action is destructive (removes access) where the existing ones are additive (grant/maintain access) — asymmetric risk.

**Deliberately not added:** handling for `past_due` / `unpaid` subscription
statuses via `customer.subscription.updated`. The existing
`invoice.payment_failed` handler already has a distinct mechanism for
payment trouble (`grace_until`, a 7-day grace window) — adding an immediate
downgrade on `past_due`/`unpaid` would be new business logic beyond "sync
`forfait` to Stripe's actual cancellation," which is what was asked for.
Flagging this as a decision, not an oversight, in case it's wanted later.

**Idempotency:** already handled globally, for every event type including
these new ones — the webhook route checks and inserts into the `stripe_events`
table before dispatching to any handler. No new idempotency code was needed.

**⚠️ Manual step required:** code changes alone cannot make Stripe send
`customer.subscription.deleted` (or `customer.subscription.updated`) events
if the webhook endpoint isn't subscribed to them. **Go to the Stripe
Dashboard → Developers → Webhooks → your endpoint, and confirm
`customer.subscription.deleted` and `customer.subscription.updated` are
both enabled** (alongside whatever events are already configured for
`checkout.session.completed`, `invoice.payment_succeeded`, and
`invoice.payment_failed`). If they're not listed, add them — otherwise this
code will simply never run in production despite being correct.

## Bug 2 follow-up — one production URL serving both live and test Stripe modes

Discovered while verifying Bug 2 end-to-end (Stripe CLI trigger + Vercel/Supabase
CLI access to check the result directly): HRInno's live-mode and test-mode
Stripe "HRInno" event destinations both point at the same production URL,
`https://hrinno.vercel.app/api/stripe/webhook`. Vercel's Preview/Production
environment-variable scoping is per-*deployment*, not per-request, so it
cannot distinguish a live-mode event from a test-mode event arriving at that
one URL — both are handled by the same running Production deployment. This
surfaced as two distinct, sequential failures, each fixed in
[src/app/api/stripe/webhook/route.ts](src/app/api/stripe/webhook/route.ts):

1. **Signature verification** (`400`, "No signatures found matching the
   expected signature for payload") — each destination signs with its own
   secret. `verifyStripeEvent()` now tries `STRIPE_WEBHOOK_SECRET` (live)
   and, if that fails, `STRIPE_WEBHOOK_SECRET_TEST`, accepting whichever
   matches, instead of assuming a single secret.
2. **Outbound Stripe API calls** (`500`, "No such customer: ...; a similar
   object exists in test mode, but a live mode key was used to make this
   request") — verifying the signature correctly doesn't fix this on its
   own: every `stripe.customers.retrieve()` / `stripe.subscriptions.retrieve()`
   call in the handler was still using a single module-level client built
   from the live `STRIPE_SECRET_KEY`. `verifyStripeEvent()` now returns
   the Stripe client instance whose secret matched (backed by
   `STRIPE_SECRET_KEY` or the new `STRIPE_SECRET_KEY_TEST`) alongside the
   parsed event, and every subsequent Stripe API call in `POST` uses that
   client instead of a hardcoded live one. This affects the existing
   `checkout.session.completed`/`invoice.payment_succeeded`/
   `invoice.payment_failed` handlers too, not just the new subscription ones.

**Two new Production env vars required**, both added and confirmed working:
`STRIPE_WEBHOOK_SECRET_TEST` (the test-mode destination's signing secret)
and `STRIPE_SECRET_KEY_TEST` (the test-mode API secret key — a different
value, easy to mix up with the one above).

## Verification plan

**(a) Stripe CLI — subscription deletion. Completed and confirmed in production.**
```
stripe trigger customer.subscription.deleted
```
Confirmed via direct Vercel log access (`vercel logs hrinno.vercel.app`) and
direct Supabase queries (`supabase db query --linked`) rather than relaying
through the Dashboard UI: the event verifies, resolves the correct-mode
Stripe client, and completes cleanly at `info` level (`ℹ️ Subscription
deleted/canceled but no matching company found for customer ...` — expected,
since the CLI's synthetic customer isn't linked to a real company), and the
event row lands in `stripe_events`. This was reached only after fixing both
issues in the "Bug 2 follow-up" section above — the first several attempts
surfaced those bugs rather than confirming the original fix.

For testing against a real customer/subscription pair (rather than the
CLI's synthetic test event), first confirm the company's
`stripe_subscription_id` in the DB matches the subscription ID in the event,
otherwise the new staleness guard will correctly skip the update. Not yet
exercised against a real company - still worth doing once a suitable test
subscription exists, since the CLI's synthetic customer never matches one.

**(b) Free-tier fallback, zero existing data**
Pick (or create) a company with `forfait = null` and no positions/certificates.
- `GET /api/entitlements/check?company_id=<id>&feature=recruitment.openPosition` → `{ allowed: true, plan: "Free" }`
- Visit the "new position" page for that company → should show the creation form, not the plan-limit screen.
- Repeat for `medicalCertificates.upload` and the medical-certificate upload page.
- `happiness.chatbot` should return `{ allowed: false, reason: "not_included_in_plan", plan: "Free" }` (Free never includes the chatbot) — confirm the wellbeing check page shows the paywall state, not a block-with-no-explanation.

**(c) Downgrade with existing over-limit data**
Simulate (via direct DB update for a test company, or an actual
Momentum/Infinity → cancellation flow) a company with `forfait = null` and 8
existing open positions.
- List/detail views for all 8 positions load normally, are editable, and can be closed.
- `GET /api/entitlements/check?company_id=<id>&feature=recruitment.openPosition` → `{ allowed: false, reason: "plan_limit_reached", plan: "Free" }` (8 ≥ Free's cap of 3).
- `POST /api/new-position` for that company → `403`, `code: "UPGRADE_REQUIRED"`.
- Repeat with medical certificates: existing over-limit certificates remain listable/downloadable; a new upload is blocked with the same `plan_limit_reached` reason.

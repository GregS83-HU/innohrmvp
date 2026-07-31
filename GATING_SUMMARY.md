# Feature Gating Summary

Implements plan-based feature gating on top of the existing `company.forfait`
field. This does not change Stripe products/prices or billing logic — it only
consumes the plan data that already exists.

## Plan tiers (real data, confirmed against the `forfait` table)

The original task brief assumed a Free/Starter/Pro/Enterprise structure.
That's not what's configured. The actual tiers, from `forfait`:

| Plan | `stripe_price_id` | Max open positions | Max medical certs/month | AI wellbeing chatbot | Included AI credits |
|---|---|---|---|---|---|
| **Free** | *(null — no Stripe price, default/no-payment tier)* | 3 | 5 | No | 50 |
| **Momentum** | `price_1S9fz0BqOCxgBpW2AsHOWVii` | 5 | 10 | Yes | 100 |
| **Infinity** | `price_1S9fzIBqOCxgBpW2TkYzispP` | 10 | 20 | Yes | 250 |

Important correction to the task's assumption: **Free is not "no company
features, public Job Assistant only."** It's a real tier with real company-level
capacity (3 open positions, 5 certificates/month). The public, unauthenticated
Job Assistant (CV scoring/mock interview) is a separate thing entirely — it
has no company account and was never part of this plan structure.

## Single source of truth

- **[src/config/entitlements.ts](src/config/entitlements.ts)** — maps each `FeatureKey` to the Postgres function that decides access. Does not duplicate the numeric limits/flags from the `forfait` table — those are read live, so editing a plan's limits in Supabase takes effect without a code deploy.
- **[lib/entitlements.ts](lib/entitlements.ts)** — `hasFeatureAccess(companyId, featureKey)`, the one place that resolves a company's plan and checks it.

Both existing DB functions (`can_open_new_position`, `can_add_medical_certificate`)
and one previously-unused one (`can_access_happy_check`) are reused as-is
rather than reimplemented in TypeScript, so there's exactly one place each
limit is computed.

## What's gated

| Feature key | Routes | DB check | "No active subscription" | UI paywall |
|---|---|---|---|---|
| `recruitment.openPosition` | `POST /api/new-position` | `can_open_new_position` | Blocked (see below) | [openedpositions/new/page.tsx](src/app/jobs/[slug]/openedpositions/new/page.tsx) — **pre-existing**, already checks the RPC and shows a blocked state before the form renders. Added: server-side enforcement in the route itself (previously bypassable by calling the API directly), and the API's 403 now flows into the existing error-message fallback on submit. |
| `medicalCertificates.upload` | `POST /api/medical-certificates/upload`, `POST /api/medical-certificates/confirm` | `can_add_medical_certificate` | Blocked (see below) | [medical-certificate/upload/page.tsx](src/app/jobs/[slug]/medical-certificate/upload/page.tsx) — **pre-existing** RPC-based pre-check with a "plan limit reached" screen. Added: server-side enforcement on both routes (upload was checked only client-side before, so hitting the API directly bypassed it entirely; confirm had no check at all). |
| `happiness.chatbot` | `POST /api/happiness/session` (only when `company_id` is present in the request — see note below) | `can_access_happy_check` | Blocked (see below) | [components/HappinessCheck.tsx](components/HappinessCheck.tsx) — **new**. Added `featureUnavailable` state and a paywall block shown instead of the "Start Assessment" button on a 403. Translated (en/fr/hu). |

`happiness/chat` (sending a message) is not separately gated: a chat message
requires a valid `session_token`, and sessions can only be created through the
now-gated `/session` endpoint, so there's no direct bypass. `happiness/dashboard`
(viewing previously-collected results) is intentionally left ungated — a
company that downgrades keeps read access to its existing data, per the
recommended no-subscription behavior below.

## "No active subscription" behavior

`company.forfait` is `NULL` both for a company that has never subscribed and
for one that canceled (`subscription-cancel/route.ts` sets `forfait: null`
directly, with no grace period — grace periods only apply to failed
*payments*, via `grace_until`, tracked separately).

Decision: **`forfait IS NULL` is always denied for the three gated features
above** — no new open positions, no new medical certificate uploads, no
wellbeing chatbot sessions. This matches how the underlying `can_*` SQL
functions already behaved before this change (the join from `company.forfait`
to `forfait.forfait_name` fails, so the limit reads as unknown and the
function returns false) — this work makes that behavior actually enforced
server-side and consistent, rather than inventing new behavior.

Everything else a company already has — existing job postings, existing
medical certificates, payroll records, time entries, performance data,
candidate pipelines — remains fully readable and editable. Nothing in this
change makes existing data read-only, because the task's "read-only, no new
actions" recommendation only applies to the three features that actually have
plan-based capacity/flags. See below for why the rest isn't touched.

## What's intentionally left ungated, and why

The task's assumed structure (starter = payroll + attendance, pro = +
performance + wellbeing, etc.) does not match reality: **the `forfait` table
has no column distinguishing plans for these features at all** — every
company, regardless of plan or even with `forfait IS NULL`, has identical
database-level access to:

- **Payroll** (`api/payroll/*`)
- **Time & attendance** (`api/timeclock/*`)
- **Absences** (no API — client queries `leave_requests` directly via RLS)
- **Performance management** (`api/performance/*`)
- **Tickets** (`api/tickets/*`)
- **Onboarding / user management** (`api/import-users`, `api/users/*`)
- **Recruitment pipeline actions on existing candidates/positions** (`recruitment-step`, `candidates/*`, `positions-public`, `positions-private`, `analyse-cv`, `analyse-massive`) — only *creating a new open position* is capacity-limited; everything downstream of an already-open position is not.
- **AI interview assistant** (`interview-assistant`, `interview-question`, `interview-conclude`, `interviews`) — metered per-call via `used_ai_credits`/`included_ai_credits` (already enforced, orthogonal to this work), not plan-gated as a feature.

Per the task's own instruction ("leave those ungated and flagged rather than
guessing"), none of these were gated. Doing so would require a product
decision (which tier gets what) and a schema change (new columns on
`forfait`) — inventing that mapping without real data would be guessing, not
implementing.

## Explicitly out of scope (per task constraints), flagged for follow-up

- **`openedpositions` RLS still has catch-all `USING (true)` policies**
  (`"Allow all updates"`, `"Allow public insert"`) found while tracing the
  open-positions gate. Not fixed here — same class of issue as the
  `medical_certificates`/`candidats` RLS fixes done earlier in this project,
  but scoped to position creation/editing rather than candidate data, and
  "Allow public insert" might be an intentional public job-posting flow
  rather than a bug. Needs its own review before touching.
- **No Stripe `customer.subscription.deleted` webhook handler.** The webhook
  route handles `checkout.session.completed`, `invoice.payment_succeeded`,
  and `invoice.payment_failed`, but not subscription deletion/expiry events
  from Stripe's side. If a subscription lapses through Stripe directly
  (rather than via the app's own cancel button, which does correctly null out
  `forfait`), `company.forfait` will keep its old paid value indefinitely and
  the company will keep full paid access. This is a billing-sync gap, not a
  feature-gating logic gap — flagged, not fixed, since the task scope
  excludes redesigning billing.
- **Centralized authorization layer.** Per task instruction #5, the existing
  ad hoc per-route admin/company checks were not touched. `hasFeatureAccess()`
  was added alongside them, called with whatever `companyId` each route
  already resolves — it does not fix how (or whether) each route verifies
  the caller actually belongs to that company.

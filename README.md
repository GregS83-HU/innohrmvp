# HRInno

HRInno is a multi-tenant HR platform built with Next.js 15 (App Router) and Supabase (Postgres,
Auth, Storage). Each company is a tenant scoped by `company_id`/RLS. Core modules: recruitment
(job postings, AI-assisted CV scoring and candidate interview generation), an AI wellbeing
chatbot (PERMA-based happiness check-ins), time & attendance, absences (including medical
certificate upload with OCR extraction), and performance management (goals and pulse
check-ins). Access to plan-gated modules is enforced server-side per request, not just hidden in
the UI. Billing runs through Stripe; plan limits and feature flags live in the `forfait` table
and are read live on every check, not cached at deploy time.

For product-level details (target audience, pricing, roadmap, known limitations), see
[`docs/product-brief.md`](docs/product-brief.md). For how the plan-gating layer, the
onboarding gate, and the data retention job actually work, see
[`ARCHITECTURE.md`](ARCHITECTURE.md).

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a `.env.local` with the environment variables listed below, pointing at a Supabase
project with this app's schema and RLS policies applied. `npm run lint` runs ESLint;
`npx tsc --noEmit` type-checks the project.

## Environment variables

Names only — see your team's secrets manager for values. Grouped by what they configure:

**Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**App URLs**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_ORIGIN`
- `NEXT_PUBLIC_APP_URL`

**AI / OCR providers**
- `OPENROUTER_API_KEY`
- `OCRSPACE_API_KEY`

**Stripe (billing)**
- `STRIPE_SECRET_KEY`
- `STRIPE_SECRET_KEY_TEST` (optional — the webhook route accepts both live and test-mode events if set)
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_SECRET_TEST` (optional, pairs with the above)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Email**
- `RESEND_API_KEY`

**Security / misc**
- `ENCRYPTION_KEY` (encrypts per-company SMTP credentials at rest — see `lib/encryption.ts`)
- `IP_SALT` (hashes visitor IPs for the anonymous happiness-session flow)
- `CRON_SECRET` (authenticates Vercel Cron requests to the scheduled jobs — see ARCHITECTURE.md)
- `CALENDLY_ONBOARDING_URL` (booking link sent in onboarding emails)

`VERCEL_URL` and `VERCEL_OIDC_TOKEN` are provisioned automatically by Vercel and don't need to be
set locally.

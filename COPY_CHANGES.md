# Copy & Homepage/Pricing Changes

Frontend and copy only — no backend logic, entitlements, or Stripe integration touched.

## What changed

**Homepage hero** ([src/app/jobs/[slug]/Home/page.tsx](src/app/jobs/[slug]/Home/page.tsx), rendered at both `/` and `/jobs/[slug]/Home`):
- Replaced the generic "HR was never as easy as now!" hero with one leading on the free Job Assistant (CV scoring, no account needed), with a primary CTA to `/job-assistant`.
- Added a new "For employers" section below the fold introducing the full platform (recruitment, payroll, time & attendance, absences, performance) as what a company gets once a candidate becomes a lead, with a CTA to the new `/pricing` page.
- Reframed the three feature cards from generic "CV Analysis / Wellness / Team Management" to "AI Recruitment Pipeline / Payroll & Time Tracking / Workplace Wellness" so they describe the employer-side platform rather than duplicating the Job Assistant pitch.
- Removed the large standalone logo image that used to sit at the top of the hero — the header already shows the logo on every page, and dropping it gets to the value proposition faster. This wasn't asked for explicitly; flagging it as a judgment call.
- Softened "Anonymous & Secure" (wellbeing feature badge) to "Anonymous & Confidential" — "Secure" reads as an implicit security claim that isn't backed by any stated certification.

**New pricing page** ([src/app/pricing/page.tsx](src/app/pricing/page.tsx), route: `/pricing`):
- Three-column Free / Momentum / Infinity layout using the real limits (positions, medical certificate uploads/month, AI credits, wellbeing chatbot inclusion) and real HUF prices (see "Prices used" below).
- States plainly that plan limits apply only to job postings, medical certificate uploads, and the wellbeing chatbot — not to payroll, time & attendance, absences, or performance, which are identical on every plan. This matches `GATING_SUMMARY.md`.
- Includes the requested data-retention note, worded from what's actually shipped (`lib/entitlements.ts`, see `WEBHOOK_AND_GATING_FIX.md`): downgrading never deletes or hides existing data, only new creation above the new plan's limit is paused.

**Navigation**: added a "Pricing" link next to the existing "Job Assistant" link in [components/Header.tsx](components/Header.tsx) (desktop + mobile), visible on public pages only (same visibility rule as the existing Job Assistant link).

**Minimal design system** (per the task — a starting point, not a rebrand):
- [src/app/globals.css](src/app/globals.css): added a `@theme` block with a brand indigo/violet scale and an accent emerald scale — colors already used ad hoc throughout the app (gradients, the Job Assistant's emerald branding), now formalized as reusable tokens (`brand-*`, `accent-*`).
- [src/app/layout.tsx](src/app/layout.tsx): loads "Sora" (headings) and "Inter" (body) via `next/font/google`, replacing the default Arial/Helvetica fallback stack.
- Applied only on the homepage and pricing page per the task's scope ("don't restructure other pages") — the rest of the app still uses its existing styling and will pick up the new fonts/colors only where it already references Tailwind defaults that inherit from `body`.

**i18n**: all new copy added to `messages/en.json`, `messages/fr.json`, and `messages/hu.json` (existing `home.*` keys updated, new `home.forEmployers.*`, `pricing.*`, and `header.pricing` keys added).

## Prices used — please verify before shipping

Task said to pull real prices from Stripe rather than invent them. I did, using the Stripe CLI, and found something worth your attention:

- **Momentum: 20 000 Ft/month. Infinity: 45 000 Ft/month.** (Hungarian Forint, not USD — that's the actual currency configured on both Stripe price objects.)
- **These prices are used on the pricing page and are confirmed accurate against live Stripe products** ("HR Inno - Momentum" / "HR Inno - Infinity", `livemode: true`).
- **However, the `stripe_price_id` values currently stored in the `forfait` table point to *test-mode* Stripe prices with the same amounts**, not these live ones. I did not touch this (Stripe integration is out of scope here), but it means actual checkout for Momentum/Infinity may currently fail in production if it's calling Stripe with a live secret key against a test-mode price ID — worth having someone check `create-subscription`/`create-portal-session` against the real `forfait.stripe_price_id` values and correcting them to the live price IDs (`price_1S9ezYBqOCxgBpW2elkKzqUB` for Momentum, `price_1S9ezpBqOCxgBpW26j6WvxOE` for Infinity) if so.
- Free is $0 / 0 Ft — no Stripe price exists for it, consistent with the rest of the app.

## Translation quality — flag for review

- **French copy**: written directly, reasonably confident in quality.
- **Hungarian copy**: best-effort translation, not from a native or professional Hungarian speaker. Given the app's Hungarian-market signals (HUF pricing, `hu.json` already exists, OCR language set to Hungarian elsewhere in the codebase), this is a real audience — recommend a native speaker review `messages/hu.json`'s new `home.hero.*`, `home.forEmployers.*`, `home.features.*`, and `pricing.*` keys before this ships.

## Other things worth knowing

- `<meta name="description">` in `src/app/layout.tsx` still reads "HR was never as easy as NOW" (the old tagline) — this is SEO/social-preview metadata, separate from the visible hero, and wasn't changed since that felt like a decision worth flagging rather than making silently. Update it to match if you want consistency.
- The old `home.cta.*` translation keys (title/subtitle/getStarted/contactUs) are no longer referenced — they backed a CTA section that was already commented out in the code before this change, and the new hero/for-employers CTAs replace its purpose. Left in place rather than deleted; safe to clean up later.
- `.claude/launch.json` was added so the dev server could be previewed and verified in-browser as part of this work (per the "test UI changes in a browser" requirement) — it's tooling config, not app code.

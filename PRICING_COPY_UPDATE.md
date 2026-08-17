# Pricing Copy Update: Capability-Based Tiers

Updates every place pricing/plan copy is shown to reflect the new
capability-based structure from `MODULE_GATING_FIX.md` (payroll, time &
attendance, and absences gated to Momentum/Infinity by employee count;
performance management gated to Infinity only). No compliance claims, no
self-serve-signup claims, no invented numbers — same constraints as before.

## Files changed

### innohrmvp (in-app)

- **`src/app/pricing/page.tsx`** — `PLAN_LIMITS` now carries `employeeCap`,
  `hrOps` (`'locked' | 'included'`), and `performance`
  (`'locked' | 'notIncluded' | 'included'`) per plan, replacing the single
  shared "Full HR platform" bullet that used to run under all three cards
  (and was simply false since the module-gating fix — every plan does
  *not* include the full platform anymore). Free's job-posting cap
  corrected 3→2 to match the already-live `forfait` table. Free's two
  locked bullets render with a lock icon and "preview only" copy;
  Momentum's missing performance module renders as a plain "not included"
  (its own real, working plan minus one module — not a preview);
  Infinity's two capability bullets state the 100-employee cap and a new
  note beneath the card links to `https://www.hrinno.hu/#contact-form`
  (the marketing site's existing contact section — no new contact channel
  invented) for "more than 100 employees."
- **`messages/en.json` / `fr.json` / `hu.json`** — rewrote the `pricing`
  block: `subtitle`, each plan's `tagline`, removed `features.fullPlatform`,
  added `features.hrOpsIncluded` / `hrOpsLocked` /
  `performanceIncluded` / `performanceLocked` / `performanceNotIncluded`,
  and `infinity.contactNote` / `infinity.contactLink`. The existing
  `pricing.dataNote` ("downgrading never deletes your data") and
  `pricing.priceNote` were left untouched, per the task.
- **`messages/en.json` / `fr.json` / `hu.json`** — `home.forEmployers.subtitle`
  rewritten so Free reads as a trial, not an ops tool ("Try it free — then
  upgrade to run real payroll..." instead of listing payroll/attendance/
  absences/performance as if universally included). `home.features.teamManagement.description`
  and `.badge` updated the same way (badge changed from the now-misleading
  "One Platform" to "Momentum & Infinity"). `src/app/page.tsx` itself
  wasn't touched — this was a pure copy change, no JSX/structure change
  needed there.

### hrinno-marketing (separate repo)

- **`locales/en.ts` / `fr.ts` / `hu.ts`** — same `pricing` block rewrite as
  the in-app messages files: subtitle, taglines, removed `feat_fullPlatform`,
  added `feat_hrOpsIncluded` / `feat_hrOpsLocked` /
  `feat_performanceIncluded` / `feat_performanceLocked` /
  `feat_performanceNotIncluded` / `infinity_contactNote`.
- **`app/page.tsx`** — the inline plan array (`free`/`momentum`/`infinity`)
  gained `employeeCap`/`hrOps`/`performance` fields mirroring the in-app
  page; Free's `positions` corrected 3→2; the shared "full platform" bullet
  replaced with the same two capability bullets (payroll/attendance/
  absences, then performance), using a new `Lock` icon import for Free's
  locked state and the site's own existing convention (dimmed `Check`
  rather than an `X`) for Momentum's plain "not included" performance
  line, to match how this site already handles its wellbeing bullet rather
  than introducing a new icon language. Infinity's card gets the same
  "more than 100 employees, contact us" note, using the existing
  `#contact-form` anchor already on this same page (not a new link).

## ROI calculator: not changed, and here's why

Investigated whether it "assumes the old caps or doesn't account for
employee count" per the task's trigger condition. Traced its actual logic
(`app/page.tsx`): the calculator's inputs are `employees`, `hoursSaved`,
and `hourlyRate`, computing `totalSavings = employees × hoursSaved ×
hourlyRate`. But the visible labels and copy (`"Open Positions / Month"`,
`"Hours Saved / Position"`, `"Recruiter Hourly Rate"`) make clear this is
actually a **recruitment-screening time-savings calculator** — `employees`
is an internally-confusing variable name for what the UI presents as
*positions opened per month*, not company headcount. It has never had
anything to do with the payroll/attendance/absences/performance employee
caps, before or after this change — the old caps weren't baked into it,
and the new ones don't need to be either. Its logic is not miscalibrated
by this restructuring.

**What this means for the task's instructions**: literally, the calculator
"doesn't account for employee count as a variable" in the sense of company
headcount relevant to the new Momentum (≤20) / Infinity (≤100) tiers — but
that's because it was never designed to answer "which plan do you need,"
only "how much recruiting time does AI screening save you." Building that
different, genuinely new calculator — one that takes real company
headcount, maps it to a plan and its cost, and shows ROI net of the
subscription price — would be legitimate, valuable, non-trivial new logic,
exactly the kind of thing the task said not to guess at in this session.
**Not built here.** Flagging it as a real follow-up: a second, separate
"which plan do I need" calculator (or an extension of this one) would need
product input on what "time saved by payroll/attendance automation" should
even assume before it could be built responsibly — guessing at hours-saved
assumptions for a module some visitors have never used would be exactly
the kind of rough guess that erodes trust.

**One thing that was NOT changed and should be double-checked**: the
`employees` slider's range (1–50) was left as-is, since it represents
positions/month, not headcount — extending it to 100 to "match Infinity's
cap" would have been a real error (conflating two different meanings of
"employees"), not a fix.

## Verification

- `npx tsc --noEmit` clean in both repos after all changes.
- All three `messages/*.json` files in innohrmvp parse as valid JSON after
  editing.
- Ran the actual dev server and loaded `/pricing` and `/` in-browser
  (French locale, the session default): confirmed via the rendered
  accessibility tree that every plan card shows the correct capability
  bullets, the Infinity "100+ employees" note links to
  `https://www.hrinno.hu/#contact-form`, and the existing data-retention
  and price notes are still present, word-for-word unchanged.
- hrinno-marketing was verified by type-check and reading the edited
  source directly (its own dev server wasn't started this session — the
  JSX mirrors the in-app page's already-verified structure closely enough,
  and both use the same `t.pricing.*`/locale-driven pattern already proven
  correct in the in-app check, to rely on that plus a clean type-check
  rather than spinning up a second server for a copy-only change).

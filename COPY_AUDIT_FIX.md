# Copy Audit Fix — Phase 1

Scope: find and replace stale "HR was never as easy as now!" / "Revolutionize your
human resources..." positioning copy left over from before the homepage rewrite.
Copy only — no backend/RLS changes (see `RLS_POLICY_FIX.md` for Phase 2).

## Fixed

**[src/app/layout.tsx](src/app/layout.tsx)** — the root `<meta name="description">`, which every route inherits (no other page defines its own `metadata`/`generateMetadata` that overrides it, except the three noted below). This is the only place the stale tagline appeared in a live, served location.

- Before: `"HR was never as easy as NOW"`
- After: `"Get your CV scored free with AI — no account needed. HRInno also runs recruitment, payroll, time & attendance, absences, and performance for growing teams."` (155 characters — within the 150–160 target)

Leads with the Job Assistant hook, closes with the platform payoff, matching the homepage hero's positioning without just pasting the full hero copy.

## Checked, not stale — no change needed

- **`/pricing`** ([src/app/pricing/page.tsx](src/app/pricing/page.tsx)) and **`/jobs/[slug]` dashboard** ([src/app/jobs/[slug]/Home/page.tsx](src/app/jobs/[slug]/Home/page.tsx)) — searched for the old tagline and close variants ("Revolutionize...", "AI-powered tools for recruitment...", "workplace happiness assessment"). Neither defines its own metadata (both inherit the now-fixed root layout description) or contains the stale copy in visible content.
- **`components/Footer.tsx`** — legal/copyright links only, no positioning copy.
- **Other `metadata`/`generateMetadata` exports found in the app** (`src/app/jobs/[slug]/openedpositions/page.tsx`, `src/app/jobs/[slug]/feedback/page.tsx`, `src/app/jobs/[slug]/cv-analyse/page.tsx`) — all page-specific and already appropriate to their own content (job board title, demo feedback, dynamic CV-analysis metadata). None reference the old generic HR positioning.
- **Open Graph tags / Twitter Card meta** — searched the whole app; **none exist anywhere**, so there's nothing stale to fix. Flagging as an absence, not a bug: the site currently has no `openGraph`/`twitter` fields at all, so social shares/link previews fall back to whatever the platform infers. Adding them wasn't in scope here (nothing to "replace"), but worth a follow-up if social sharing appearance matters.

## Found but deliberately not changed — flagged for a decision

**`/ObsoleteHome`** ([src/app/ObsoleteHome/page.tsx](src/app/ObsoleteHome/page.tsx)) is a real, deployed, publicly reachable route (confirmed in the production build output — `○ /ObsoleteHome`) despite its name. Nothing in the app links to it internally, but it's not gated or redirected either, so it's live to anyone who has the URL or finds it indexed. It's the old pre-rewrite homepage component, left in place under this name during the earlier redesign rather than deleted.

Its situation is mixed, not simply "stale":
- Its hero (`t('home.hero.title')`, `.titleHighlight`, `.titleEnd`, `.subtitle`) reads the **same translation keys** the current homepage now uses — so it already, incidentally, displays the **new** Job Assistant copy, not the old tagline.
- Its lower CTA section still calls `t('home.cta.title')` / `.subtitle` / `.getStarted` / `.contactUs`, which **are** still the old generic copy ("Ready to Transform Your HR?" / "Join the future of human resources with our AI-powered platform...") — these keys were never updated because the current homepage stopped using that CTA section entirely when it was rewritten.

Net effect: this one orphaned page currently shows a mismatched mashup — new hero, old CTA — which is arguably worse than uniformly stale. I didn't fix it because the page's own name and its complete lack of internal links suggest it was meant to be retired, not maintained in sync going forward; "fixing" its copy could read as endorsing keeping it around. Three real options, needing a decision rather than a guess:
1. Delete the route entirely (and the now-unused `home.cta.*` translation keys, which nothing else references).
2. Redirect `/ObsoleteHome` to `/`.
3. If it's actually still needed for something (A/B test, old bookmark support, etc.), update its CTA section to match current positioning like everything else in this fix.

**Dead backup files** — found via the same search, confirmed unreachable (Next.js requires the exact filename `page.tsx`/`layout.tsx`; none of these match, so they're never routed):
- `src/app/layout.tsx - backup`
- `src/app/ObsoleteHome/page copy.tsx`
- `src/app/jobs/[slug]/Home/page.tsx - backup`

All three still contain the old tagline, but since they're not live code, not touched — consistent with the "obsolete/backup code" item already noted in `docs/product-brief.md`'s Known Limitations. Mentioned here only because the task asked to search "the entire codebase," and these are literal matches worth being aware of even though they don't affect what any real visitor sees.

-- Pricing review found that Core's per-seat formula (25,000 + 1,000/employee)
-- crosses over to be MORE expensive than Growth's (40,000 + 750/employee)
-- past a certain headcount, despite Growth including strictly more features.
-- An account must never be able to sit in that zone, so headcount is no
-- longer uncapped - Core is hard-capped at 30 employees, and Growth requires
-- at least 31 to subscribe. This supersedes the "uncapped on both tiers"
-- decision made earlier in the same pricing overhaul.
--
-- Enforcement is in two places, both reusing/extending existing mechanisms:
-- 1. lib/entitlements.ts's hasFeatureAccess("company.addEmployee") capacity
--    check already existed (built during the original overhaul, then made a
--    no-op by setting every plan's max_employees to NULL) - restoring
--    max_employees = 30 on Core here reactivates it, blocking any new
--    employee add/reactivation once Core is at 30.
-- 2. A new min_employees column backs a checkout-time eligibility check
--    (src/app/api/stripe/create-subscription/route.ts) so a company can't
--    self-serve subscribe to Growth below 31 employees, or to Core above 30.
--
-- No forced downgrade exists for a Growth account that shrinks below 31 -
-- explicitly out of scope (confirmed decision, see docs/product-brief.md
-- Section 18).

update public.forfait
set max_employees = 30
where forfait_name = 'Core';

alter table public.forfait
  add column if not exists min_employees integer;

alter table public.forfait
  add constraint forfait_min_employees_positive
  check (min_employees is null or min_employees > 0);

comment on column public.forfait.min_employees is 'Minimum active employee count required to self-serve subscribe to this plan (checked at checkout, not retroactively enforced against an existing subscriber that shrinks below it). NULL = no floor.';

update public.forfait
set min_employees = 31
where forfait_name = 'Growth';

-- Growth repricing (40,000 base / 750 per-seat, up from 35,000 / 700) means
-- new Stripe Price objects are required - Prices are immutable in Stripe, so
-- the old ones are archived and replaced (via transfer_lookup_key), not
-- edited in place (see scripts/stripe-setup-pricing.mjs's ensurePrice()).
-- The price ids below are TEST-MODE ids from re-running that script - before
-- applying this migration against a LIVE/production Supabase project,
-- re-run the script with a live-mode STRIPE_SECRET_KEY and replace these
-- with its live-mode output, same caveat as the original overhaul migration.
-- stripe_product_id_base is untouched - the Growth Base Product's identity
-- doesn't change, only its Prices do.
update public.forfait
set base_fee_huf = 40000,
    per_seat_fee_huf = 750,
    stripe_price_id_base_monthly = 'price_1UFFFmBqOCxgBpW2OTbFV3lv',
    stripe_price_id_seat_monthly = 'price_1UFFFnBqOCxgBpW2QYsXtOJy',
    stripe_price_id_base_annual = 'price_1UFFFoBqOCxgBpW2KcSG22E1',
    stripe_price_id_seat_annual = 'price_1UFFFoBqOCxgBpW2C26rf5iH'
where forfait_name = 'Growth';

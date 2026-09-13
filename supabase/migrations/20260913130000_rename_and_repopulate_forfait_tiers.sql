-- Renames Momentum -> Core and Infinity -> Growth in place (plain UPDATE,
-- forfait_name has no FK constraint - it's matched by text value from
-- company.forfait and the various entitlement_* SQL functions), and
-- populates the new pricing/feature columns added by
-- 20260913120000_pricing_overhaul_schema.sql. Safe as a straight rename
-- because there are zero real customers/subscriptions yet - no data
-- migration for existing subscribers is needed.
--
-- The price/product-id UPDATEs below are currently filled in with TEST-MODE
-- ids, produced by running scripts/stripe-setup-pricing.mjs against the
-- sk_test_ key in .env.local. Before applying this migration against a
-- LIVE/production Supabase project, re-run that script with a live-mode
-- STRIPE_SECRET_KEY and replace the ids below with its printed live-mode
-- output - applying it with test-mode ids against a live Stripe account's
-- webhook/checkout flow would fail closed (checkout/webhook code fails
-- closed on an unresolvable price/product id) rather than silently
-- misbehave, but no company would be able to subscribe until corrected.
--
-- Employee headcount is uncapped on both paid tiers going forward - a
-- product decision made because per-seat billing already makes cost scale
-- with headcount, so a hard cap serves no purpose beyond forcing an
-- artificial "contact us" wall. max_employees is set to NULL for both rows
-- (same "no cap" meaning it already carries for Free) rather than removing
-- the column, since it's still read by lib/entitlements.ts and the
-- company.addEmployee capacity check simply becomes a permanent pass-through
-- for every real plan.

update public.forfait
set forfait_name = 'Core'
where forfait_name = 'Momentum';

update public.forfait
set forfait_name = 'Growth'
where forfait_name = 'Infinity';

-- Core: recruitment, time & attendance, absences, medical certificate
-- uploads (all already true on Momentum) - performance management, the AI
-- wellbeing chatbot, and advanced reporting are Growth-only, so explicitly
-- false here even if Momentum previously had a different value for any of
-- them.
update public.forfait
set max_employees = null,
    access_performance = false,
    access_happy_check = false,
    access_attendance_absences = true,
    access_advanced_reporting = false,
    base_fee_huf = 25000,
    per_seat_fee_huf = 1000,
    stripe_price_id_base_monthly = 'price_1UFEsnBqOCxgBpW2J7T0374f',
    stripe_price_id_seat_monthly = 'price_1UFEsoBqOCxgBpW21jTQHOuz',
    stripe_price_id_base_annual = 'price_1UFEsoBqOCxgBpW2cPn6yoYd',
    stripe_price_id_seat_annual = 'price_1UFEspBqOCxgBpW20ng1J67s',
    stripe_price_id_onboarding = 'price_1UFEstBqOCxgBpW2l6hmTRHI',
    stripe_product_id_base = 'prod_VFkN5H67bnew1R'
where forfait_name = 'Core';

-- Growth: everything in Core, plus performance management, the AI wellbeing
-- chatbot, and advanced reporting.
update public.forfait
set max_employees = null,
    access_performance = true,
    access_happy_check = true,
    access_attendance_absences = true,
    access_advanced_reporting = true,
    base_fee_huf = 35000,
    per_seat_fee_huf = 700,
    stripe_price_id_base_monthly = 'price_1UFEsqBqOCxgBpW2kzPiVQN7',
    stripe_price_id_seat_monthly = 'price_1UFEsrBqOCxgBpW2AG7RS3Q0',
    stripe_price_id_base_annual = 'price_1UFEsrBqOCxgBpW2Z4A32BjU',
    stripe_price_id_seat_annual = 'price_1UFEssBqOCxgBpW24yFM1b0u',
    stripe_price_id_onboarding = 'price_1UFEstBqOCxgBpW2l6hmTRHI',
    stripe_product_id_base = 'prod_VFkNtJI93EyTwr'
where forfait_name = 'Growth';

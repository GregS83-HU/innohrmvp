-- Schema for the Core/Growth per-seat pricing overhaul (see
-- docs/product-brief.md, Section 11, for the business context).
-- Every column added here is nullable and has zero effect on existing
-- behavior until the follow-up migration
-- (20260913130000_rename_and_repopulate_forfait_tiers.sql) populates it -
-- this migration is pure schema so it can land independently of the Stripe
-- setup script's output.
--
-- Base fee and per-seat fee are billed as two separate Stripe subscription
-- items (not graduated/tiered pricing on one Price) so the per-seat item's
-- quantity can track the company's real employee count 1:1. Each tier's
-- base and seat Prices live on two DIFFERENT Stripe Products (not just two
-- Prices of one Product) because the founding-customer discount coupon is
-- scoped via Coupon.applies_to.products, which scopes by Product - if base
-- and seat shared a Product, the coupon could no longer discount the base
-- fee only.

alter table public.forfait
  add column if not exists stripe_price_id_base_monthly text,
  add column if not exists stripe_price_id_seat_monthly text,
  add column if not exists stripe_price_id_base_annual text,
  add column if not exists stripe_price_id_seat_annual text,
  -- Same value on both the Core and Growth rows - the one-time onboarding
  -- fee is identical regardless of tier, so it's duplicated per row rather
  -- than introducing a separate one-row config table for a single value.
  add column if not exists stripe_price_id_onboarding text,
  -- The base-fee Product id (not a Price id) - needed to scope the
  -- founding-customer Coupon's applies_to.products, and to resolve which
  -- plan a subscription is on by matching a subscription item's
  -- price.product rather than juggling 4 separate price-id columns.
  add column if not exists stripe_product_id_base text,
  -- Cached HUF amounts for display without a live Stripe round-trip on
  -- every page load - same rationale as the existing numeric limit columns
  -- (max_opened_position etc.) already on this table. Source of truth for
  -- actual billing is still the Stripe Price objects above; these can drift
  -- if someone reprices directly in the Stripe Dashboard without updating
  -- this table, same accepted risk as the existing stripe_price_id column.
  add column if not exists base_fee_huf numeric,
  add column if not exists per_seat_fee_huf numeric,
  -- Growth-only advanced reporting. Deliberately its own column rather than
  -- reusing access_performance - the two features (performance management,
  -- advanced reporting) have no product reason to always travel together
  -- beyond both happening to be Growth-only today, unlike
  -- access_attendance_absences which already intentionally shares one
  -- column across two FeatureKeys because those two always move together.
  add column if not exists access_advanced_reporting boolean not null default false;

comment on column public.forfait.stripe_price_id_base_monthly is 'Monthly recurring Price id for this tier''s flat base fee subscription item.';
comment on column public.forfait.stripe_price_id_seat_monthly is 'Monthly recurring Price id for this tier''s per-employee subscription item. Quantity on this item is kept in sync with the company''s active employee count by lib/billing/syncEmployeeSeats.ts.';
comment on column public.forfait.stripe_price_id_base_annual is 'Annual recurring Price id for the base fee, priced at 15% off the annualized monthly base fee.';
comment on column public.forfait.stripe_price_id_seat_annual is 'Annual recurring Price id for the per-employee fee, priced at 15% off the annualized monthly per-seat fee.';
comment on column public.forfait.stripe_price_id_onboarding is 'One-time Price id for the 60,000 HUF onboarding fee, charged once at signup via a Checkout Session line item. Identical value on every paid forfait row.';
comment on column public.forfait.stripe_product_id_base is 'Stripe Product id (not Price id) for this tier''s base-fee line - used to resolve plan from a subscription item (match item.price.product) and to scope the founding-customer coupon''s applies_to.products so the discount can only ever apply to a base-fee item.';
comment on column public.forfait.base_fee_huf is 'Cached flat monthly base fee in HUF, for display. Source of truth is the Stripe Price referenced by stripe_price_id_base_monthly.';
comment on column public.forfait.per_seat_fee_huf is 'Cached monthly per-employee fee in HUF, for display. Source of truth is the Stripe Price referenced by stripe_price_id_seat_monthly.';
comment on column public.forfait.access_advanced_reporting is 'Whether this plan includes advanced reporting/analytics. False on Free and Core.';

alter table public.company
  -- Subscription item ids for the two recurring components - needed so
  -- lib/billing/syncEmployeeSeats.ts and the founding-discount admin route
  -- can act on the right item without re-listing subscription items on
  -- every call.
  add column if not exists stripe_base_item_id text,
  add column if not exists stripe_seat_item_id text,
  add column if not exists billing_interval text,
  add column if not exists onboarding_fee_paid_at timestamp with time zone,
  add column if not exists founding_discount_coupon_id text,
  add column if not exists founding_discount_applied_at timestamp with time zone;

alter table public.company
  add constraint company_billing_interval_check
  check (billing_interval is null or billing_interval in ('month', 'year'));

comment on column public.company.stripe_base_item_id is 'Stripe SubscriptionItem id for this company''s base-fee line. Nulled on cancellation alongside stripe_subscription_id/forfait.';
comment on column public.company.stripe_seat_item_id is 'Stripe SubscriptionItem id for this company''s per-employee line - its quantity is kept in sync with the active employee count. Nulled on cancellation.';
comment on column public.company.billing_interval is 'Which recurring interval the active subscription is on (''month'' or ''year''), read off the subscription''s Price at webhook time. Null when there is no active subscription.';
comment on column public.company.onboarding_fee_paid_at is 'When the one-time onboarding fee invoice was paid. Checked before including the onboarding Price line item on a future resubscribe checkout, so it is never charged twice.';
comment on column public.company.founding_discount_coupon_id is 'Stripe Coupon id manually applied to this company''s base-fee subscription item by a super admin, if any. See src/app/api/admin/billing/founding-discount/route.ts.';
comment on column public.company.founding_discount_applied_at is 'When the founding-customer discount was applied. Checked before calling Stripe again, since setting a subscription item''s discounts array replaces it wholesale rather than stacking.';

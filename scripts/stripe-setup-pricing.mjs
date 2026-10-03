// Idempotent setup script for the Core/Growth per-seat pricing overhaul.
// Creates the Stripe Products/Prices/Coupons this pricing model needs, and
// deactivates the old flat-fee Momentum/Infinity Prices/Products (Stripe
// doesn't allow hard-deleting a Price or Product once it's been used).
//
// Safe to re-run: every Price is looked up by a stable `lookup_key` before
// creating, and every Product is looked up by `metadata.hrinno_component`
// before creating, so a partial or repeated run won't create duplicates.
//
// This script does NOT touch this app's database or write any env vars -
// it only talks to Stripe. Run it once per Stripe mode/environment (test,
// then live), copy the printed `UPDATE forfait SET ...` block into
// supabase/migrations/20260913130000_rename_and_repopulate_forfait_tiers.sql
// in place of the REPLACE_ME_* placeholders, then apply that migration.
//
// Usage:
//   node scripts/stripe-setup-pricing.mjs
// Reads STRIPE_SECRET_KEY from .env.local (via dotenv) or the environment -
// whichever mode that key belongs to (test/live) is the mode this script
// creates objects in, same convention as every other Stripe route in this
// app (each reads the single STRIPE_SECRET_KEY env var for its environment).

import { config as loadEnv } from "dotenv";
import Stripe from "stripe";

// Next.js convention is .env.local, not dotenv's default .env - load that
// explicitly (falling back to .env if present) so this script reads the
// same env file the app itself does.
loadEnv({ path: ".env.local" });
loadEnv();

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY is not set (checked .env.local and the environment). Aborting.");
  process.exit(1);
}

const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" });

// HUF is not a zero-decimal currency for Stripe API purposes in this
// account - confirmed against the existing app code, which already divides
// live Stripe `unit_amount` values by 100 for display
// (src/app/jobs/[slug]/subscription/page.tsx: `formatPrice = (price) =>
// (price/100).toLocaleString()`), and the existing Momentum/Infinity live
// Price ids (20,000 / 45,000 HUF) were created with unit_amount 2000000 /
// 4500000. So every amount below is real HUF * 100.
const HUF = (amount) => Math.round(amount * 100);

// Annual amounts are 15% off the annualized monthly total - Stripe has no
// "X% off Y" relationship between Prices, so this is computed by hand here,
// once, rather than at checkout time.
const annualize = (monthlyHuf) => Math.round(monthlyHuf * 12 * 0.85);

const TIERS = {
  core: {
    label: "Core",
    baseMonthlyHuf: 25000,
    seatMonthlyHuf: 1000,
  },
  growth: {
    label: "Growth",
    baseMonthlyHuf: 40000,
    seatMonthlyHuf: 750,
  },
};

const ONBOARDING_FEE_HUF = 60000;

// ---------------------------------------------------------------------------
// Idempotent helpers
// ---------------------------------------------------------------------------

async function findProductByComponent(component) {
  // No Product-level lookup_key equivalent exists in the Stripe API the way
  // Prices have one, so idempotency here is metadata-based: list active
  // products and match on our own tag. Pagination is fine at this account's
  // scale (a handful of pricing-related products, not hundreds).
  for await (const product of stripe.products.list({ limit: 100 })) {
    if (product.metadata?.hrinno_component === component) return product;
  }
  return null;
}

async function ensureProduct(component, name) {
  const existing = await findProductByComponent(component);
  if (existing) {
    console.log(`[skip] Product "${name}" already exists: ${existing.id}`);
    return existing;
  }
  const product = await stripe.products.create({
    name,
    metadata: { hrinno_component: component },
  });
  console.log(`[created] Product "${name}": ${product.id}`);
  return product;
}

async function ensurePrice(lookupKey, params) {
  // Deliberately NOT filtering by active:true here - a lookup_key is held by
  // at most one Price regardless of that Price's active status (confirmed
  // against the live API: creating a second Price with an in-use lookup_key
  // is rejected even when the holder is already inactive), so an
  // active-only search could miss the current holder and retry a doomed
  // plain create.
  const existingList = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  const existing = existingList.data[0];
  if (existing) {
    const wantedInterval = params.recurring?.interval ?? null;
    const existingInterval = existing.recurring?.interval ?? null;
    if (existing.active && existing.unit_amount === params.unit_amount && existingInterval === wantedInterval) {
      console.log(`[skip] Price "${lookupKey}" already exists and matches: ${existing.id}`);
      return existing;
    }
    // Prices are immutable in Stripe - a real pricing change (e.g. this
    // session's Growth base/seat repricing) can't be applied in place, and a
    // lookup_key is only ever held by one Price at a time (confirmed via the
    // Stripe API: creating a second Price with an in-use lookup_key is
    // rejected outright - archiving the old Price first does NOT free it).
    // `transfer_lookup_key: true` on the new Price is Stripe's documented
    // mechanism for exactly this: atomically move the lookup_key from the
    // old Price to the new one in the same create call. The old Price is
    // then explicitly archived below for dashboard hygiene, since it no
    // longer needs to be reachable by lookup_key.
    //
    // Safe with zero real customers: nobody is currently subscribed to the
    // Price being replaced. If this script is ever re-run to change a price
    // AFTER real customers exist, this does NOT migrate their existing
    // subscription items off the old (now-archived) Price - that would need
    // a separate, deliberate migration step, not a rerun of this script.
    console.log(`[replacing] Price "${lookupKey}" changed (was ${existing.unit_amount}, now ${params.unit_amount}) - transferring lookup_key from ${existing.id}`);
    const price = await stripe.prices.create({ ...params, lookup_key: lookupKey, transfer_lookup_key: true });
    await stripe.prices.update(existing.id, { active: false });
    console.log(`[created] Price "${lookupKey}": ${price.id} (old price ${existing.id} archived)`);
    return price;
  }
  const price = await stripe.prices.create({ ...params, lookup_key: lookupKey });
  console.log(`[created] Price "${lookupKey}": ${price.id}`);
  return price;
}

async function ensureCoupon(id, params) {
  try {
    const existing = await stripe.coupons.retrieve(id);
    console.log(`[skip] Coupon "${id}" already exists`);
    return existing;
  } catch (err) {
    if (err?.code !== "resource_missing") throw err;
  }
  const coupon = await stripe.coupons.create({ id, ...params });
  console.log(`[created] Coupon "${id}"`);
  return coupon;
}

async function deactivateByForfaitName(forfaitName) {
  // Best-effort: find prices whose product name matches the old plan and
  // deactivate both. Matched by product name since the old
  // create-subscription/webhook code only ever stored a bare
  // forfait.stripe_price_id, with no metadata tag to look up by - this is a
  // one-time cleanup, not an ongoing idempotency mechanism.
  const products = await stripe.products.list({ limit: 100 });
  const matches = products.data.filter((p) =>
    p.name.toLowerCase().includes(forfaitName.toLowerCase())
  );
  for (const product of matches) {
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });
    for (const price of prices.data) {
      if (!price.active) continue;
      try {
        await stripe.prices.update(price.id, { active: false });
        console.log(`[deactivated] Price ${price.id} on product "${product.name}"`);
      } catch (err) {
        // A Price currently set as its Product's default_price can't be
        // archived on its own. Deactivating the Product below is enough to
        // stop it appearing anywhere customer-facing (Checkout requires an
        // active Product), so this is a soft-fail, not a script abort.
        console.log(`[info] Could not deactivate price ${price.id} (likely the product's default_price) - deactivating the product instead: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (product.active) {
      await stripe.products.update(product.id, { active: false });
      console.log(`[deactivated] Product "${product.name}" (${product.id})`);
    }
  }
  if (matches.length === 0) {
    console.log(`[info] No Stripe product found matching "${forfaitName}" to deactivate.`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Running against Stripe account in ${secretKey.startsWith("sk_live") ? "LIVE" : "TEST"} mode.\n`);

  const results = {};

  for (const [key, tier] of Object.entries(TIERS)) {
    // Base fee and per-seat fee MUST be different Products (not just
    // different Prices of one Product) - the founding-customer coupon is
    // scoped via Coupon.applies_to.products, which scopes by Product. If
    // base and seat shared a Product, the coupon could no longer discount
    // the base fee only.
    const baseProduct = await ensureProduct(`${key}_base`, `HRInno ${tier.label} - Base`);
    const seatProduct = await ensureProduct(`${key}_seats`, `HRInno ${tier.label} - Per-employee`);

    const baseMonthly = await ensurePrice(`${key}_base_monthly`, {
      product: baseProduct.id,
      currency: "huf",
      unit_amount: HUF(tier.baseMonthlyHuf),
      recurring: { interval: "month" },
    });
    const seatMonthly = await ensurePrice(`${key}_seat_monthly`, {
      product: seatProduct.id,
      currency: "huf",
      unit_amount: HUF(tier.seatMonthlyHuf),
      recurring: { interval: "month" },
    });
    const baseAnnual = await ensurePrice(`${key}_base_annual`, {
      product: baseProduct.id,
      currency: "huf",
      unit_amount: HUF(annualize(tier.baseMonthlyHuf)),
      recurring: { interval: "year" },
    });
    const seatAnnual = await ensurePrice(`${key}_seat_annual`, {
      product: seatProduct.id,
      currency: "huf",
      unit_amount: HUF(annualize(tier.seatMonthlyHuf)),
      recurring: { interval: "year" },
    });

    results[key] = {
      baseProductId: baseProduct.id,
      baseMonthlyPriceId: baseMonthly.id,
      seatMonthlyPriceId: seatMonthly.id,
      baseAnnualPriceId: baseAnnual.id,
      seatAnnualPriceId: seatAnnual.id,
    };
  }

  const onboardingProduct = await ensureProduct("onboarding_fee", "HRInno - Onboarding Fee");
  const onboardingPrice = await ensurePrice("onboarding_fee_onetime", {
    product: onboardingProduct.id,
    currency: "huf",
    unit_amount: HUF(ONBOARDING_FEE_HUF),
    // No `recurring` key at all = a one-time Price, chargeable via a
    // Checkout Session line item mixed into a subscription-mode session.
  });

  // Founding-customer discount: fixed 30%/40% coupons rather than an
  // arbitrary percent per deal, so the discount is auditable/consistent.
  // `applies_to.products` restricts which Products this coupon can ever
  // discount (both base-fee Products, never the seat or onboarding
  // Products) - defense in depth on top of the admin route always applying
  // it to the base subscription item specifically, never at the
  // subscription level. `max_redemptions` is a per-coupon safety ceiling;
  // since this is applied manually (never a public promo code), staying
  // within the intended 10-15 total signups across both coupons is a
  // manual/ops discipline, not something Stripe enforces jointly across two
  // separate coupon objects.
  await ensureCoupon("founding_customer_30", {
    // Stripe caps Coupon.name at 40 characters.
    name: "Founding Customer - 30% base, 12mo",
    percent_off: 30,
    duration: "repeating",
    duration_in_months: 12,
    max_redemptions: 15,
    applies_to: { products: [results.core.baseProductId, results.growth.baseProductId] },
  });
  await ensureCoupon("founding_customer_40", {
    name: "Founding Customer - 40% base, 12mo",
    percent_off: 40,
    duration: "repeating",
    duration_in_months: 12,
    max_redemptions: 15,
    applies_to: { products: [results.core.baseProductId, results.growth.baseProductId] },
  });

  console.log("\nDeactivating old flat-fee plans...");
  await deactivateByForfaitName("Momentum");
  await deactivateByForfaitName("Infinity");

  console.log("\n" + "=".repeat(78));
  console.log("Copy this block into the UPDATE statements in");
  console.log("supabase/migrations/20260913130000_rename_and_repopulate_forfait_tiers.sql");
  console.log("in place of the REPLACE_ME_* placeholders:");
  console.log("=".repeat(78) + "\n");

  console.log(`-- Core`);
  console.log(`stripe_price_id_base_monthly = '${results.core.baseMonthlyPriceId}',`);
  console.log(`stripe_price_id_seat_monthly = '${results.core.seatMonthlyPriceId}',`);
  console.log(`stripe_price_id_base_annual = '${results.core.baseAnnualPriceId}',`);
  console.log(`stripe_price_id_seat_annual = '${results.core.seatAnnualPriceId}',`);
  console.log(`stripe_price_id_onboarding = '${onboardingPrice.id}',`);
  console.log(`stripe_product_id_base = '${results.core.baseProductId}'`);
  console.log(``);
  console.log(`-- Growth`);
  console.log(`stripe_price_id_base_monthly = '${results.growth.baseMonthlyPriceId}',`);
  console.log(`stripe_price_id_seat_monthly = '${results.growth.seatMonthlyPriceId}',`);
  console.log(`stripe_price_id_base_annual = '${results.growth.baseAnnualPriceId}',`);
  console.log(`stripe_price_id_seat_annual = '${results.growth.seatAnnualPriceId}',`);
  console.log(`stripe_price_id_onboarding = '${onboardingPrice.id}',`);
  console.log(`stripe_product_id_base = '${results.growth.baseProductId}'`);
  console.log("\n" + "=".repeat(78));
  console.log("Founding-customer coupons created: founding_customer_30, founding_customer_40");
  console.log("(apply manually via /api/admin/billing/founding-discount, never as a public promo code)");
}

main().catch((err) => {
  console.error("\nSetup script failed:", err);
  process.exit(1);
});

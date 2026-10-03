// Shared Stripe client for the pricing-overhaul code (checkout creation,
// seat sync, founding-discount admin route). Existing routes each
// instantiate their own `new Stripe(process.env.STRIPE_SECRET_KEY!)` without
// passing `apiVersion` - stripe-node defaults that to the version bundled
// with the installed SDK version (see node_modules/stripe/cjs/apiVersion.js)
// and sends it on every request regardless, so this isn't a behavior change,
// just making explicit what was already true. Pinned rather than left
// implicit because this overhaul exercises newer API surface (multi-item
// subscriptions, item-level discounts, product-scoped coupons) where a
// silent SDK upgrade changing the implicit default would be worth noticing.
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

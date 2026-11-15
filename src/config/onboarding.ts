// Optional "assisted onboarding call" add-on, offered in the self-onboarding
// wizard and on the subscription page. Display value only - the amount
// actually billed is the one-time Stripe Price in
// forfait.stripe_price_id_onboarding (see scripts/stripe-setup-pricing.mjs).
export const ASSISTED_ONBOARDING_FEE_HUF = 60000;

// Annual billing is 15% off the annualized monthly total - same formula as
// scripts/stripe-setup-pricing.mjs and the subscription page.
export const ANNUAL_DISCOUNT = 0.15;

export function annualizedIfNeeded(monthlyHuf: number, interval: 'month' | 'year'): number {
  return interval === 'year' ? Math.round(monthlyHuf * 12 * (1 - ANNUAL_DISCOUNT)) : monthlyHuf;
}

-- The forfait table's stripe_price_id values for Momentum and Infinity
-- pointed to test-mode Stripe prices (price_1S9fz0BqOCxgBpW2AsHOWVii /
-- price_1S9fzIBqOCxgBpW2TkYzispP) with the same amounts (20,000 / 45,000
-- HUF) as the real live-mode "HR Inno - Momentum" / "HR Inno - Infinity"
-- Stripe products, but not usable by a live-mode Stripe API call - meaning
-- checkout for either paid plan would fail in production. Found while
-- pulling real prices for the new /pricing page (see COPY_CHANGES.md);
-- corrected here to the live-mode price IDs, verified directly against
-- Stripe (stripe prices retrieve ... --live).
--
-- No application code changes needed - create-subscription,
-- create-portal-session, and the Stripe webhook already read this column,
-- they just had the wrong value to read.

update forfait set stripe_price_id = 'price_1S9ezYBqOCxgBpW2elkKzqUB' where forfait_name = 'Momentum';
update forfait set stripe_price_id = 'price_1S9ezpBqOCxgBpW26j6WvxOE' where forfait_name = 'Infinity';

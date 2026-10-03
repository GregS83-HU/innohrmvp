// Keeps a company's Stripe per-seat subscription item quantity equal to its
// real active employee count. Called from every place that adds or removes
// an employee (src/app/api/signup, users/users-creation, import-users,
// users/update-status) rather than being wired into a shared insert helper -
// those routes each do their own ad hoc company_to_users write, and adding
// one call at the end of each is less churn than extracting a new shared
// insert path across all three just for this.
//
// Deliberately fails soft: a company on the Free plan (no subscription), a
// subscription that hasn't been created/synced by the webhook yet, or a
// stale stripe_seat_item_id pointing at an item Stripe no longer has (e.g.
// the subscription was canceled directly in the Dashboard) should never
// turn an employee add/remove into a 500 for the caller. Every failure path
// here just logs and returns.
import { createClient } from "@supabase/supabase-js";
import { stripe } from "../stripe/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function syncEmployeeSeats(companyId: string | number): Promise<void> {
  try {
    const { data: company } = await supabase
      .from("company")
      .select("stripe_seat_item_id")
      .eq("id", companyId)
      .single();

    if (!company?.stripe_seat_item_id) {
      // No active subscription (Free plan, or between checkout and the
      // webhook populating this column) - nothing to sync yet.
      return;
    }

    const { count } = await supabase
      .from("company_to_users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_active", true);

    await stripe.subscriptionItems.update(company.stripe_seat_item_id, {
      quantity: Math.max(count ?? 0, 0),
      proration_behavior: "create_prorations",
      // A subscription in "past_due" (mid dunning-grace-period, see
      // company.grace_until) can't be assumed to have a chargeable payment
      // method right now - allow_incomplete lets the quantity update land
      // and any resulting proration ride along on the next successful
      // invoice, instead of this call throwing or attempting an immediate
      // charge against a card that just failed.
      payment_behavior: "allow_incomplete",
    });
  } catch (err) {
    console.error(`syncEmployeeSeats: failed to sync seat quantity for company ${companyId}`, err);
  }
}

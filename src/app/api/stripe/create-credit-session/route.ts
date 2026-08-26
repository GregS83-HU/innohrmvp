import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { requireCompanyAdmin } from "../../../../../lib/authz";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { price_id, credits, return_url } = await req.json();

    if (!price_id || !credits) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // company_id is derived from the caller's own session/membership below -
    // never trusted from the request body. Buying AI credits charges the
    // target company's Stripe customer, so this requires the caller to be
    // an admin of that company.
    const authCheck = await requireCompanyAdmin(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    if (authCheck.companyId === undefined) {
      return NextResponse.json({ error: "Company not found" }, { status: 500 });
    }
    const company_id = authCheck.companyId;

    // Fetch Stripe customer ID for this company
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: company, error } = await supabase
      .from("company")
      .select("stripe_customer_id")
      .eq("id", company_id)
      .single();

    if (error || !company?.stripe_customer_id) {
      console.error("Company not found or missing stripe_customer_id", error);
      return NextResponse.json({ error: "Invalid company" }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: company.stripe_customer_id,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${return_url}?success_credit=true`,
      cancel_url: `${return_url}?canceled_credit=true`,
      metadata: {
        company_id,
        credits,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    let message = "Unknown error";

    if (err instanceof Error) {
      message = err.message;
    }

    console.error("create-credit-session error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

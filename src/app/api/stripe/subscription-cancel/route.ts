import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { company_id } = await req.json()
  if (!company_id) return NextResponse.json({ error: "Missing company_id" }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Get the company's current subscription
  const { data: company } = await supabase
    .from("company")
    .select("stripe_subscription_id")
    .eq("id", company_id)
    .single()

  if (!company?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
  }

  // 2) Cancel the subscription immediately
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(company.stripe_subscription_id)

    // 3) Update Supabase
    await supabase.from("company").update({
      stripe_subscription_id: null,
      forfait: null,
    }).eq("id", company_id)

    return NextResponse.json({
      canceled: true,
      canceled_at: canceledSubscription.canceled_at,
    })
  } catch (err: unknown) {
  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
}
}

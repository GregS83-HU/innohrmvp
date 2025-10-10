// app/api/stripe/webhook/route.ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook signature unknown error"
    console.error("❌ Webhook signature verification failed:", msg)
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 🔒 Idempotency guard
  const { data: existing, error: existingError } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle()

  if (existing) {
    console.log("ℹ️ Stripe event already processed:", event.id)
    return NextResponse.json({ received: true })
  }

  await supabase.from("stripe_events").insert({ id: event.id, type: event.type }).select()

  try {
    // ----------------------------
    // Checkout Session Completed
    // ----------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      if (!session.subscription) {
        console.log("ℹ️ No subscription in session, skipping update")
        return NextResponse.json({ received: true })
      }

      const subscriptionId = session.subscription as string
      const customerId = session.customer as string
      const companyId = session.metadata?.company_id

      if (!companyId) {
        console.log("ℹ️ No company_id in session metadata, skipping update")
        return NextResponse.json({ received: true })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id

      const { data: forfait, error: forfaitError } = await supabase
        .from("forfait")
        .select("id, forfait_name")
        .eq("stripe_price_id", priceId)
        .single()

      if (forfaitError || !forfait) {
        console.log("ℹ️ No matching forfait found for priceId", priceId)
      } else {
        await supabase
          .from("company")
          .update({
            forfait: forfait.forfait_name,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            grace_until: null,
          })
          .eq("id", companyId)

        console.log(`✅ Company ${companyId} subscribed to ${forfait.forfait_name}`)
      }
    }

    // ----------------------------
    // Invoice Payment Succeeded
    // ----------------------------
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null
      }

      if (!invoice.subscription) {
        console.log("ℹ️ Invoice without subscription, skipping")
        return NextResponse.json({ received: true })
      }

      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription.id

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id

      if (!customerId) {
        console.log("ℹ️ No customer found for invoice, skipping")
        return NextResponse.json({ received: true })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id

      // Find company via Stripe customer metadata or DB
      let companyId: string | null = null
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer.deleted) companyId = customer.metadata?.company_id || null

      if (!companyId) {
        const { data: company, error: companyError } = await supabase
          .from("company")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!companyError && company) companyId = company.id.toString()
      }

      const { data: forfait, error: forfaitError } = await supabase
        .from("forfait")
        .select("forfait_name")
        .eq("stripe_price_id", priceId)
        .single()

      if (companyId && forfait) {
        await supabase
          .from("company")
          .update({
            forfait: forfait.forfait_name,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            grace_until: null,
          })
          .eq("id", companyId)

        console.log(`✅ Updated company ${companyId} to plan: ${forfait.forfait_name}`)
      }
    }

    // ----------------------------
    // Invoice Payment Failed
    // ----------------------------
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id

      if (!customerId) return NextResponse.json({ received: true })

      const customer = await stripe.customers.retrieve(customerId)
      let companyId: string | null = null
      if (!customer.deleted) companyId = customer.metadata?.company_id || null

      if (!companyId) {
        const { data: company, error: companyError } = await supabase
          .from("company")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!companyError && company) companyId = company.id.toString()
      }

      if (companyId) {
        const graceUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabase.from("company").update({ grace_until: graceUntil }).eq("id", companyId)

        console.log(`⚠️ Payment failed → company ${companyId} has grace until ${graceUntil}`)
      }
    }
  } catch (err: unknown) {
    console.error("❌ Webhook handling error:", err)
    return NextResponse.json({ error: "Internal webhook error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

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
  if (err instanceof Error) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.error("❌ Webhook signature verification failed with unknown error:", err)
  return NextResponse.json({ error: "Webhook Error: Unknown error" }, { status: 400 })
}

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ✅ Handle checkout completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const subscriptionId = session.subscription as string
    const customerId = session.customer as string
    const companyId = session.metadata?.company_id

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    const { data: forfait } = await supabase
      .from("forfait")
      .select("id, forfait_name")
      .eq("stripe_price_id", priceId)
      .single()

    if (companyId && forfait) {
      await supabase
        .from("company")
        .update({
          forfait: forfait.forfait_name,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
        })
        .eq("id", companyId)

      console.log(`✅ Company ${companyId} subscribed to ${forfait.forfait_name}`)
    }
  }

  // ✅ Handle successful payments
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
      console.log("ℹ️ No customer found for invoice")
      return NextResponse.json({ received: true })
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    // Find company via Stripe customer metadata or DB
    let companyId: string | null = null
    const customer = await stripe.customers.retrieve(customerId)

    if (!customer.deleted) {
      companyId = customer.metadata?.company_id || null
    }

    if (!companyId) {
      const { data: company } = await supabase
        .from("company")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (company) companyId = company.id.toString()
    }

    // Find plan by Stripe price_id
    const { data: forfait } = await supabase
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
        })
        .eq("id", companyId)

      console.log(`✅ Updated company ${companyId} to plan: ${forfait.forfait_name}`)
    }
  }

  // ✅ Handle failed payments → reset to Free
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id

    if (!customerId) return NextResponse.json({ received: true })

    const customer = await stripe.customers.retrieve(customerId)

    let companyId: string | null = null
    if (!customer.deleted) {
      companyId = customer.metadata?.company_id || null
    }

    if (!companyId) {
      const { data: company } = await supabase
        .from("company")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (company) companyId = company.id.toString()
    }

    if (companyId) {
      await supabase
        .from("company")
        .update({ forfait: "Free" })
        .eq("id", companyId)

      console.log(`⚠️ Reset company ${companyId} to Free due to payment failure`)
    }
  }

  return NextResponse.json({ received: true })
}

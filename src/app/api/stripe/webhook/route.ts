  // app/api/stripe/webhook/route.ts
  import Stripe from "stripe"
  import { NextResponse } from "next/server"
  import { createClient, SupabaseClient } from "@supabase/supabase-js"

  export const runtime = "nodejs"

  const stripeLive = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const stripeTest = process.env.STRIPE_SECRET_KEY_TEST ? new Stripe(process.env.STRIPE_SECRET_KEY_TEST) : null

  // The live-mode and test-mode "HRInno" webhook destinations both point at
  // this same production URL (Vercel's Preview/Production env var scoping
  // is per-deployment, not per-request, so it can't tell live vs test
  // events apart here - both land on the same running Production
  // deployment). Each destination signs with its own secret, AND any
  // follow-up Stripe API call (customers.retrieve, subscriptions.retrieve)
  // needs the matching mode's API secret key - a live-mode key can't look
  // up a test-mode object ("No such customer: ...; a similar object exists
  // in test mode, but a live mode key was used"), and vice versa. So
  // verification returns both the parsed event and the Stripe client whose
  // secret matched, and the rest of the handler must use that client for
  // every subsequent Stripe API call, not the live one by default.
  function verifyStripeEvent(body: string, sig: string): { event: Stripe.Event; stripe: Stripe } {
    const candidates: Array<{ secret: string; stripe: Stripe }> = [
      { secret: process.env.STRIPE_WEBHOOK_SECRET!, stripe: stripeLive },
    ]
    if (process.env.STRIPE_WEBHOOK_SECRET_TEST && stripeTest) {
      candidates.push({ secret: process.env.STRIPE_WEBHOOK_SECRET_TEST, stripe: stripeTest })
    }

    let lastErr: unknown
    for (const { secret, stripe: client } of candidates) {
      try {
        // constructEvent is pure signature verification against the given
        // secret - it doesn't call the network, so which client instance
        // it's invoked on doesn't matter, only the secret does.
        const event = stripeLive.webhooks.constructEvent(body, sig, secret)
        return { event, stripe: client }
      } catch (err) {
        lastErr = err
      }
    }
    throw lastErr
  }

  // Same company-lookup pattern as the invoice.payment_succeeded/failed
  // handlers below: prefer the Stripe customer's metadata.company_id, fall
  // back to matching company.stripe_customer_id in the DB. Clears the plan
  // the same way src/app/api/stripe/subscription-cancel/route.ts already
  // does for an in-app cancellation, so both paths converge on the same
  // "no active subscription" state.
  async function clearCompanyPlanForSubscription(
    supabase: SupabaseClient,
    stripe: Stripe,
    subscription: Stripe.Subscription
  ) {
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id

    if (!customerId) return

    let companyId: string | null = null
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer.deleted) companyId = customer.metadata?.company_id || null

    if (!companyId) {
      const { data: company } = await supabase
        .from("company")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()
      if (company) companyId = company.id.toString()
    }

    if (!companyId) {
      console.log("ℹ️ Subscription deleted/canceled but no matching company found for customer", customerId)
      return
    }

    // Only clear the plan if this event is about the company's currently
    // tracked subscription. Guards against a delayed/out-of-order webhook
    // for an old subscription wiping out access the company already
    // re-subscribed for under a new subscription id.
    const { data: company } = await supabase
      .from("company")
      .select("stripe_subscription_id")
      .eq("id", companyId)
      .single()

    if (company?.stripe_subscription_id && company.stripe_subscription_id !== subscription.id) {
      console.log(`ℹ️ Ignoring stale subscription event for company ${companyId}: event is for ${subscription.id}, company is on ${company.stripe_subscription_id}`)
      return
    }

    await supabase
      .from("company")
      .update({
        stripe_subscription_id: null,
        forfait: null,
        stripe_base_item_id: null,
        stripe_seat_item_id: null,
        billing_interval: null,
      })
      .eq("id", companyId)

    console.log(`✅ Company ${companyId} subscription ended on Stripe's side → forfait cleared`)
  }

  // Resolves which forfait (Core/Growth) a subscription is on, and which of
  // its two recurring items is the base-fee item vs the per-seat item, by
  // matching each item's price.product against forfait.stripe_product_id_base
  // - a single Product-id comparison per candidate row, rather than matching
  // 4 separate price-id columns. The onboarding fee is a one-time Price, so
  // it never appears in subscription.items (Stripe adds a one-time Checkout
  // line item to the first invoice only, not as a subscription item) - every
  // subscription created by this app has exactly two recurring items, base
  // and seat, in either order.
  type PlanResolution = {
    forfaitName: string
    billingInterval: "month" | "year"
    baseItemId: string
    seatItemId: string
    onboardingPriceId: string | null
  }

  async function resolvePlanFromSubscription(
    supabase: SupabaseClient,
    subscription: Stripe.Subscription
  ): Promise<PlanResolution | null> {
    const { data: forfaitRows } = await supabase
      .from("forfait")
      .select("forfait_name, stripe_product_id_base, stripe_price_id_onboarding")
      .not("stripe_product_id_base", "is", null)

    if (!forfaitRows) return null

    const items = subscription.items.data
    for (const item of items) {
      const productId = typeof item.price.product === "string" ? item.price.product : item.price.product?.id
      const match = forfaitRows.find((row) => row.stripe_product_id_base === productId)
      if (!match) continue

      const interval = item.price.recurring?.interval
      if (interval !== "month" && interval !== "year") continue

      const seatItem = items.find((other) => other.id !== item.id)
      if (!seatItem) continue

      return {
        forfaitName: match.forfait_name,
        billingInterval: interval,
        baseItemId: item.id,
        seatItemId: seatItem.id,
        onboardingPriceId: match.stripe_price_id_onboarding,
      }
    }

    return null
  }

  export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") as string

    // Verify Stripe webhook signature
    let event: Stripe.Event
    let stripe: Stripe
    try {
      ;({ event, stripe } = verifyStripeEvent(body, sig))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Webhook signature unknown error"
      console.error("❌ Webhook signature verification failed:", msg)
      return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Idempotency guard
    const { data: existing } = await supabase
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

        // Fetch metadata
        const companyId = session.metadata?.company_id
        const credits = session.metadata?.credits ? parseInt(session.metadata.credits) : null
        const subscriptionId = session.subscription as string | undefined
        const customerId = session.customer as string | undefined

        if (!companyId) {
          console.log("ℹ️ No company_id in session metadata, skipping")
        } else {
          // ----- Handle AI Credits Purchase -----
          if (credits) {
            const { data: company, error } = await supabase
              .from("company")
              .select("used_ai_credits")
              .eq("id", companyId)
              .single()
            console.log("credits bought:", credits)
            console.log("current credits:" , company?.used_ai_credits)

            if (!error && company) {
              const currentCredits = company.used_ai_credits || 0
              await supabase
                .from("company")
                .update({ used_ai_credits: currentCredits - credits })
                .eq("id", companyId)

              console.log(`✅ Added ${credits} AI credits to company ${companyId}`)
            }
          }

          // ----- Handle Subscription Purchase -----
          if (subscriptionId && customerId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const resolved = await resolvePlanFromSubscription(supabase, subscription)

            if (resolved) {
              await supabase
                .from("company")
                .update({
                  forfait: resolved.forfaitName,
                  stripe_subscription_id: subscriptionId,
                  stripe_customer_id: customerId,
                  stripe_base_item_id: resolved.baseItemId,
                  stripe_seat_item_id: resolved.seatItemId,
                  billing_interval: resolved.billingInterval,
                  grace_until: null,
                })
                .eq("id", companyId)

              console.log(`✅ Company ${companyId} subscribed to ${resolved.forfaitName} (${resolved.billingInterval}ly)`)
            } else {
              console.log("ℹ️ Could not resolve a forfait plan from subscription", subscriptionId)
            }
          }
        }
      }

      // ----------------------------
      // Invoice Payment Succeeded
      // ----------------------------
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null
        }

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!subscriptionId || !customerId) return NextResponse.json({ received: true })

        // Find company by customer metadata or database
        let companyId: string | null = null
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted) companyId = customer.metadata?.company_id || null

        if (!companyId) {
          const { data: company } = await supabase
            .from("company")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          if (company) companyId = company.id.toString()
        }

        // Update subscription info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const resolved = await resolvePlanFromSubscription(supabase, subscription)

        if (companyId && resolved) {
          const update: Record<string, unknown> = {
            forfait: resolved.forfaitName,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            stripe_base_item_id: resolved.baseItemId,
            stripe_seat_item_id: resolved.seatItemId,
            billing_interval: resolved.billingInterval,
            grace_until: null,
          }

          // The onboarding fee is a one-time Price mixed into the
          // subscription-mode Checkout Session's line items, so it lands as
          // a line item on the FIRST invoice of a brand-new subscription -
          // billing_reason is Stripe's own documented, reliable signal for
          // "this invoice created the subscription", more robust than
          // inferring "first invoice" any other way.
          if (
            invoice.billing_reason === "subscription_create" &&
            resolved.onboardingPriceId &&
            invoice.lines.data.some((line) => line.pricing?.price_details?.price === resolved.onboardingPriceId)
          ) {
            update.onboarding_fee_paid_at = new Date().toISOString()
          }

          await supabase
            .from("company")
            .update(update)
            .eq("id", companyId)

          console.log(`✅ Updated company ${companyId} to plan: ${resolved.forfaitName}`)
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

        // Find company
        let companyId: string | null = null
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted) companyId = customer.metadata?.company_id || null

        if (!companyId) {
          const { data: company } = await supabase
            .from("company")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          if (company) companyId = company.id.toString()
        }

        if (companyId) {
          const graceUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          await supabase.from("company").update({ grace_until: graceUntil }).eq("id", companyId)

          console.log(`⚠️ Payment failed → company ${companyId} has grace until ${graceUntil}`)
        }
      }

      // ----------------------------
      // Subscription Deleted (canceled on Stripe's side - e.g. dunning
      // exhausted retries, or canceled directly in the Stripe Dashboard,
      // rather than through this app's own cancel button)
      // ----------------------------
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription
        await clearCompanyPlanForSubscription(supabase, stripe, subscription)
      }

      // ----------------------------
      // Subscription Updated - only acted on when the update itself
      // represents a cancellation (status flips to "canceled"). Stripe can
      // report a cancellation via this event slightly ahead of, or instead
      // of, "customer.subscription.deleted" depending on timing. Other
      // status transitions (e.g. "past_due", "unpaid" after failed payment
      // retries) are intentionally left alone here - that's already covered
      // by the grace_until mechanism in the invoice.payment_failed handler
      // above, and turning those into an immediate downgrade would be new
      // behavior beyond syncing forfait to Stripe's actual cancellation.
      //
      // Quantity changes on the per-seat item (from
      // lib/billing/syncEmployeeSeats.ts) also land here as non-cancellation
      // updates. Deliberately not acted on: this app's own seat-sync helper
      // is what initiates those changes and already writes the resulting
      // state straight to the DB at the call site, so this event is purely
      // confirmatory for that case - reacting to it here would race the
      // helper's own write rather than add information.
      // ----------------------------
      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription
        if (subscription.status === "canceled") {
          await clearCompanyPlanForSubscription(supabase, stripe, subscription)
        }
      }
    } catch (err: unknown) {
      console.error("❌ Webhook handling error:", err)
      return NextResponse.json({ error: "Internal webhook error" }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  }

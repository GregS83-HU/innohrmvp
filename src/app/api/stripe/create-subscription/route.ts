// api/stripe/create-subscription/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCompanyAdmin } from '../../../../../lib/authz'
import { stripe } from '../../../../../lib/stripe/client'

const VALID_TIERS = ['Core', 'Growth'] as const
type Tier = (typeof VALID_TIERS)[number]

export async function POST(req: Request) {
  try {
    const { tier, interval, return_url } = await req.json()

    if (!VALID_TIERS.includes(tier) || (interval !== 'month' && interval !== 'year') || !return_url) {
      return NextResponse.json(
        { error: "Missing or invalid parameters: 'tier' (Core|Growth), 'interval' (month|year), and 'return_url' are required" },
        { status: 400 }
      )
    }

    // company_id is derived from the caller's own session/membership below -
    // never trusted from the request body. Starting a subscription checkout
    // is a billing action, so it requires the caller to be an admin of the
    // company being subscribed.
    const authCheck = await requireCompanyAdmin(req)
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    if (authCheck.companyId === undefined) {
      return NextResponse.json({ error: 'Company not found' }, { status: 500 })
    }
    const company_id = authCheck.companyId

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data: company } = await supabase
      .from('company')
      .select('stripe_customer_id, stripe_subscription_id, onboarding_fee_paid_at')
      .eq('id', company_id)
      .single()

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    // Switching tier/interval or resubscribing an active subscription isn't
    // supported by this endpoint yet - it would create a second, duplicate
    // Stripe subscription rather than modifying the existing one. Manage an
    // existing subscription via the customer portal (create-portal-session)
    // until a proration-aware plan-swap is built.
    if (company.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'This company already has an active subscription. Use the billing portal to make changes.' },
        { status: 409 }
      )
    }

    const { data: forfait } = await supabase
      .from('forfait')
      .select(
        'stripe_price_id_base_monthly, stripe_price_id_seat_monthly, stripe_price_id_base_annual, stripe_price_id_seat_annual, stripe_price_id_onboarding, min_employees, max_employees'
      )
      .eq('forfait_name', tier as Tier)
      .single()

    if (!forfait) {
      return NextResponse.json({ error: `Unknown plan "${tier}"` }, { status: 400 })
    }

    const basePriceId = interval === 'month' ? forfait.stripe_price_id_base_monthly : forfait.stripe_price_id_base_annual
    const seatPriceId = interval === 'month' ? forfait.stripe_price_id_seat_monthly : forfait.stripe_price_id_seat_annual

    if (!basePriceId || !seatPriceId) {
      return NextResponse.json(
        { error: `Plan "${tier}" is not fully configured for ${interval}ly billing yet` },
        { status: 500 }
      )
    }

    // Seed the seat item's quantity with the company's current active
    // employee count - lib/billing/syncEmployeeSeats.ts keeps it in sync
    // from here on as employees are added/removed.
    const { count: employeeCount } = await supabase
      .from('company_to_users')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company_id)
      .eq('is_active', true)

    // Core's per-seat formula crosses over to cost more than Growth's past a
    // certain headcount despite Growth including strictly more features - an
    // account must never be able to subscribe into that zone in the first
    // place. Enforced here as a hard rule (not just plan-card copy): Core
    // requires at most max_employees (30), Growth requires at least
    // min_employees (31). Checked before any Stripe customer/session is
    // created. Free has no bounds set on either column, so this is a no-op
    // for it.
    const count = employeeCount ?? 0
    if (forfait.max_employees !== null && count > forfait.max_employees) {
      return NextResponse.json(
        { error: `${tier} is only available for accounts with up to ${forfait.max_employees} employees. Your company has ${count} - subscribe to Growth instead.` },
        { status: 409 }
      )
    }
    if (forfait.min_employees !== null && count < forfait.min_employees) {
      return NextResponse.json(
        { error: `${tier} is only available for accounts with at least ${forfait.min_employees} employees. Your company has ${count} - subscribe to Core instead.` },
        { status: 409 }
      )
    }

    let customerId = company.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { company_id: company_id.toString() } })
      customerId = customer.id
      await supabase.from('company').update({ stripe_customer_id: customerId }).eq('id', company_id)
    }

    const lineItems: { price: string; quantity: number }[] = [
      { price: basePriceId, quantity: 1 },
      { price: seatPriceId, quantity: Math.max(count, 1) },
    ]

    // Onboarding fee is a one-time Price mixed into this subscription-mode
    // Checkout Session - Stripe adds it as an invoice item on the
    // subscription's first invoice automatically. Only included if it
    // hasn't already been paid, so a resubscribe never charges it twice.
    if (forfait.stripe_price_id_onboarding && !company.onboarding_fee_paid_at) {
      lineItems.push({ price: forfait.stripe_price_id_onboarding, quantity: 1 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: lineItems,
      // Deliberately off: the founding-customer coupons are real Stripe
      // objects scoped to specific products, but they're applied manually
      // by a super admin directly to a subscription's base-fee item (see
      // /api/admin/billing/founding-discount), never redeemed as a public
      // promo code. Leaving self-serve promo code entry on here would let
      // anyone who learns a code apply it at checkout across every line
      // item's applicable product, not just the intended one.
      allow_promotion_codes: false,
      success_url: `${return_url}${return_url.includes('?') ? '&' : '?'}success=true`,
      cancel_url: `${return_url}${return_url.includes('?') ? '&' : '?'}canceled=true`,
      metadata: {
        company_id: company_id.toString(),
        tier,
        interval,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: unknown) {
    console.error("Stripe checkout creation error:", err)

    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

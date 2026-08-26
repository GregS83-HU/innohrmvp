// api/stripe/create-subscription/route.ts
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCompanyAdmin } from '../../../../../lib/authz'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { price_id, return_url } = await req.json()

    if (!price_id || !return_url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
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

    // Fetch company and create Stripe customer if needed
    const { data: company } = await supabase
      .from('company')
      .select('stripe_customer_id')
      .eq('id', company_id)
      .single()

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    let customerId = company.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { company_id } })
      customerId = customer.id
      await supabase.from('company').update({ stripe_customer_id: customerId }).eq('id', company_id)
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${return_url}${return_url.includes('?') ? '&' : '?'}success=true`,
      cancel_url: `${return_url}${return_url.includes('?') ? '&' : '?'}canceled=true`,
      metadata: {
      company_id: company_id.toString(),
  }
    })

    //return NextResponse.json({ url: session.url })
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

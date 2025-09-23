import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const runtime = "nodejs"

export async function GET() {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10, expand: ["data.product"] })

    const formatted = prices.data.map(p => ({
      id: p.id,
      name: (p.product as Stripe.Product).name,
      price: p.unit_amount ?? 0,
    }))

    return NextResponse.json({ prices: formatted })
 } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 })
  }
}

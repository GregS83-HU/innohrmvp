import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { company_id, return_url } = await request.json()

    if (!company_id) return NextResponse.json({ error: "Missing company_id" }, { status: 400 })

    console.log("create-portal-session company_id:", company_id, "return_url:", return_url)

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    )

    // Load company
    const { data: company, error: companyError } = await supabase
      .from("company")
      .select("stripe_customer_id")
      .eq("id", company_id)
      .single()

    if (companyError || !company) {
      console.error("Supabase error:", companyError)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json({ error: "Company does not have a Stripe customer ID" }, { status: 400 })
    }

    // Create Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: return_url || process.env.NEXT_PUBLIC_APP_ORIGIN || "https://yourapp.com",
    })

    console.log("Stripe portal session created:", session.id)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe portal error:", err)
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 400 })
  }
}

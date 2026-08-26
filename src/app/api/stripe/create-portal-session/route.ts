import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireCompanyAdmin } from "../../../../../lib/authz"

export const runtime = "nodejs"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { return_url } = await request.json()

    // company_id is derived from the caller's own session/membership, never
    // trusted from the request body - a billing-portal session grants full
    // control over the target company's payment methods and invoices, so
    // this requires the caller to be an admin of that company.
    const authCheck = await requireCompanyAdmin(request)
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    if (authCheck.companyId === undefined) {
      return NextResponse.json({ error: "Company not found" }, { status: 500 })
    }
    const company_id = authCheck.companyId

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
  } catch (err: unknown) {
  console.error("Stripe portal error:", err)

  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 400 })
}
}

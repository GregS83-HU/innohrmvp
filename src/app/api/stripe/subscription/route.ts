import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { requireCompanyMember } from "../../../../../lib/authz"

export async function GET(request: Request) {
  try {
    // company_id is derived from the caller's own session/membership below -
    // never trusted from the query string. Read-only, so any authenticated
    // member of the company (not just an admin) may view its plan/status.
    const authCheck = await requireCompanyMember(request)
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    if (authCheck.companyId === undefined) {
      return NextResponse.json({ error: "Company not found" }, { status: 500 })
    }
    const company_id = authCheck.companyId

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: company, error: supabaseError } = await supabase
      .from("company")
      .select("forfait, stripe_subscription_id, billing_interval, onboarding_fee_paid_at")
      .eq("id", company_id)
      .single()

    if (supabaseError) {
      console.error("Supabase error:", supabaseError)
      return NextResponse.json({ error: supabaseError.message }, { status: 500 })
    }

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    let status: "Active" | "Pending" | "Inactive" = "Inactive"

    if (company.forfait) {
      status = company.stripe_subscription_id ? "Active" : "Pending"
    }

    const { count: employeeCount } = await supabase
      .from("company_to_users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company_id)
      .eq("is_active", true)

    return NextResponse.json({
      subscription: {
        plan: company.forfait || "None",
        status,
        billingInterval: company.billing_interval,
        hasStripeSubscription: !!company.stripe_subscription_id,
        onboardingFeePaid: !!company.onboarding_fee_paid_at,
        employeeCount: employeeCount ?? 0,
      }
    })

  } catch (error) {
    console.error("Unexpected error in subscription endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
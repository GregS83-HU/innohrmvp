// src/lib/credits.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the expected shape of your joined query result
interface Forfait {
  included_ai_credits: number | null;
}

interface CompanyWithForfait {
  id: string;
  forfait_id: number | null;
  used_ai_credits: number;
  forfait?: Forfait | Forfait[] | null;
}

/**
 * Consumes 1 AI credit from the company if available.
 * Returns true if the company still has credits left, false if none remain.
 */
export async function consumeCredit(companyId: string): Promise<boolean> {
  // Fetch company and related forfait
  const { data: company, error: companyErr } = await supabaseAdmin
    .from("companies")
    .select(
      "id, forfait_id, used_ai_credits, forfait:forfait_id (included_ai_credits)"
    )
    .eq("id", companyId)
    .single<CompanyWithForfait>();

  if (companyErr || !company) {
    console.error("Company not found or query error:", companyErr);
    throw new Error("Company not found");
  }

  // Handle Supabase's array vs object behaviour
  let includedCredits = 0;
  if (Array.isArray(company.forfait)) {
    includedCredits = company.forfait[0]?.included_ai_credits ?? 0;
  } else if (company.forfait && company.forfait.included_ai_credits) {
    includedCredits = company.forfait.included_ai_credits;
  }

  const used = company.used_ai_credits ?? 0;

  if (used >= includedCredits) {
    console.warn(`Company ${companyId} has no remaining AI credits.`);
    return false; // no remaining credits
  }

  // Increment usage
  const { error: updateError } = await supabaseAdmin
    .from("companies")
    .update({ used_ai_credits: used + 1 })
    .eq("id", companyId);

  if (updateError) {
    console.error("Failed to update used_ai_credits:", updateError);
    throw updateError;
  }

  return true;
}

/**
 * (Optional helper) Get remaining AI credits for a company.
 */
export async function getRemainingCredits(companyId: string): Promise<number> {
  const { data: company, error } = await supabaseAdmin
    .from("companies")
    .select(
      "used_ai_credits, forfait:forfait_id (included_ai_credits)"
    )
    .eq("id", companyId)
    .single<CompanyWithForfait>();

  if (error || !company) throw new Error("Company not found");

  let includedCredits = 0;
  if (Array.isArray(company.forfait)) {
    includedCredits = company.forfait[0]?.included_ai_credits ?? 0;
  } else if (company.forfait && company.forfait.included_ai_credits) {
    includedCredits = company.forfait.included_ai_credits;
  }

  const used = company.used_ai_credits ?? 0;
  return Math.max(includedCredits - used, 0);
}

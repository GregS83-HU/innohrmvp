// Server-side feature-gating helper. See src/config/entitlements.ts for the
// feature -> DB check mapping, and GATING_SUMMARY.md for the full audit.
import { createClient } from "@supabase/supabase-js";
import { FEATURE_RULES, type FeatureKey } from "../src/config/entitlements";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type EntitlementReason =
  | "no_subscription"
  | "plan_limit_reached"
  | "not_included_in_plan"
  | "unknown_plan";

export type EntitlementResult =
  | { allowed: true; plan: string }
  | { allowed: false; reason: EntitlementReason; plan: string | null };

/**
 * Checks whether a company's current plan (`company.forfait`) grants access
 * to `feature`. A company with no active subscription (`forfait` is null -
 * this is what src/app/api/stripe/subscription-cancel/route.ts sets on
 * cancellation, and what a company has before ever subscribing) is always
 * denied for gated features, matching how the existing
 * can_open_new_position/can_add_medical_certificate/can_access_happy_check
 * Postgres functions already behave (the join to `forfait` fails, so the
 * limit reads as NULL and the check fails closed).
 */
export async function hasFeatureAccess(
  companyId: string | number,
  feature: FeatureKey
): Promise<EntitlementResult> {
  const { data: company, error: companyError } = await supabase
    .from("company")
    .select("forfait")
    .eq("id", companyId)
    .single();

  if (companyError || !company) {
    return { allowed: false, reason: "no_subscription", plan: null };
  }

  if (!company.forfait) {
    return { allowed: false, reason: "no_subscription", plan: null };
  }

  const rule = FEATURE_RULES[feature];
  const { data: rpcResult, error: rpcError } = await supabase.rpc(rule.rpc, {
    p_company_id: companyId,
  });

  if (rpcError) {
    console.error(`Entitlement check failed for ${feature} (company ${companyId}):`, rpcError.message);
    return { allowed: false, reason: "unknown_plan", plan: company.forfait };
  }

  if (rpcResult === true) {
    return { allowed: true, plan: company.forfait };
  }

  if (rpcResult === null || rpcResult === undefined) {
    // The DB function's join from company.forfait to forfait.forfait_name
    // found no matching row - the plan name on the company doesn't match
    // any known plan (data drift), not a real "false" answer.
    return { allowed: false, reason: "unknown_plan", plan: company.forfait };
  }

  return {
    allowed: false,
    reason: rule.kind === "flag" ? "not_included_in_plan" : "plan_limit_reached",
    plan: company.forfait,
  };
}

/** Standard 403 body for API routes when hasFeatureAccess() denies access. */
export function entitlementErrorBody(feature: FeatureKey, result: Extract<EntitlementResult, { allowed: false }>) {
  return {
    error: "Upgrade required",
    code: "UPGRADE_REQUIRED" as const,
    feature,
    reason: result.reason,
    plan: result.plan,
  };
}

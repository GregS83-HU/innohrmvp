// Server-side feature-gating helper. See src/config/entitlements.ts for the
// feature -> DB check mapping, and GATING_SUMMARY.md for the full audit.
import { createClient } from "@supabase/supabase-js";
import { FEATURE_RULES, type FeatureKey } from "../src/config/entitlements";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The plan a company falls back to with no active subscription - both
// before ever subscribing and after cancellation/expiry (forfait becomes
// null in both cases; see subscription-cancel/route.ts and the
// customer.subscription.deleted webhook handler). "No plan" and "Free plan"
// are treated as identical, permanently - not a grace period.
const FALLBACK_PLAN_NAME = "Free";

export type EntitlementReason =
  | "no_subscription"
  | "plan_limit_reached"
  | "not_included_in_plan"
  | "unknown_plan";

export type EntitlementResult =
  | { allowed: true; plan: string }
  | { allowed: false; reason: EntitlementReason; plan: string | null };

type ForfaitRow = {
  forfait_name: string;
  max_opened_position: number | null;
  max_medical_certificates: number | null;
  access_happy_check: boolean | null;
};

/**
 * Checks whether a company's current plan (`company.forfait`) grants access
 * to `feature`. This only decides whether a NEW item can be created
 * (a new open position, a new certificate upload, a new chatbot session) -
 * it is never used to gate reads, edits, or closes of existing records, so
 * downgrading a plan can never retroactively hide or block data a company
 * already has. That's a property of *where this function is called from*
 * (only the creation routes), not something this function enforces itself.
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

  const planName = company.forfait || FALLBACK_PLAN_NAME;

  const { data: forfait, error: forfaitError } = await supabase
    .from("forfait")
    .select("forfait_name, max_opened_position, max_medical_certificates, access_happy_check")
    .eq("forfait_name", planName)
    .single<ForfaitRow>();

  if (forfaitError || !forfait) {
    // Either an unknown plan name on the company (data drift), or - in the
    // unexpected case the Free row itself is missing/renamed - no fallback
    // to resolve to at all. Fail closed either way.
    console.error(`Entitlement check: no forfait row for plan "${planName}" (company ${companyId})`, forfaitError?.message);
    return { allowed: false, reason: "unknown_plan", plan: company.forfait };
  }

  const rule = FEATURE_RULES[feature];

  if (rule.kind === "flag") {
    if (forfait.access_happy_check) {
      return { allowed: true, plan: forfait.forfait_name };
    }
    return { allowed: false, reason: "not_included_in_plan", plan: forfait.forfait_name };
  }

  // Capacity check: count existing rows and compare against this plan's
  // max. This mirrors can_open_new_position/can_add_medical_certificate
  // exactly (same criteria, same monthly window) so behavior for a company
  // with a real, named plan is unchanged - reusing those RPCs would be
  // simpler, but they resolve the plan via `company.forfait = forfait_name`
  // in SQL, which can't be made to fall back to Free for a company whose
  // `forfait` is genuinely null in the DB without either rewriting the
  // functions or writing "Free" into that column, neither of which this
  // fix does.
  const max = rule.rpc === "can_open_new_position" ? forfait.max_opened_position : forfait.max_medical_certificates;
  if (max === null) {
    return { allowed: false, reason: "unknown_plan", plan: forfait.forfait_name };
  }

  const currentCount = await countExistingForCapacityCheck(rule.rpc, companyId);
  if (currentCount < max) {
    return { allowed: true, plan: forfait.forfait_name };
  }

  return { allowed: false, reason: "plan_limit_reached", plan: forfait.forfait_name };
}

async function countExistingForCapacityCheck(
  rpc: "can_open_new_position" | "can_add_medical_certificate",
  companyId: string | number
): Promise<number> {
  if (rpc === "can_open_new_position") {
    const nowIso = new Date().toISOString();
    const { count } = await supabase
      .from("openedpositions")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .or(`position_end_date.is.null,position_end_date.gt.${nowIso}`);
    return count ?? 0;
  }

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  const { count } = await supabase
    .from("medical_certificates")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", startOfMonth)
    .lt("created_at", startOfNextMonth);
  return count ?? 0;
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

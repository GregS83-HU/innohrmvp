// Single source of truth for "which feature requires what plan".
//
// The actual limits/flags per plan are NOT duplicated here - they live in
// the `forfait` table (columns: max_opened_position, max_medical_certificates,
// access_happy_check) and are evaluated live via the can_open_new_position(),
// can_add_medical_certificate(), and can_access_happy_check() Postgres
// functions (see supabase_schema.sql). Hardcoding the numeric limits into
// this file would create a second source of truth that drifts the moment
// someone edits a plan's limits in Supabase without a code deploy.
//
// What this file DOES own: the mapping from a feature key used in app code
// to the DB function that decides access, plus display copy for paywall UI.
// See GATING_SUMMARY.md for the full audit of what is and isn't gated.

export type FeatureKey =
  | "recruitment.openPosition"
  | "medicalCertificates.upload"
  | "happiness.chatbot";

export type EntitlementCheck =
  // Capacity check: compares a live count against a per-plan max column.
  | { kind: "capacity"; rpc: "can_open_new_position" | "can_add_medical_certificate" }
  // Boolean flag check: reads a per-plan boolean column.
  | { kind: "flag"; rpc: "can_access_happy_check" };

export const FEATURE_RULES: Record<FeatureKey, EntitlementCheck> = {
  "recruitment.openPosition": { kind: "capacity", rpc: "can_open_new_position" },
  "medicalCertificates.upload": { kind: "capacity", rpc: "can_add_medical_certificate" },
  "happiness.chatbot": { kind: "flag", rpc: "can_access_happy_check" },
};

// Copy shown in upgrade prompts / paywall states. Plan names must match
// `forfait.forfait_name` values exactly (confirmed against the live table:
// Free, Momentum, Infinity - see GATING_SUMMARY.md).
export const FEATURE_COPY: Record<FeatureKey, { title: string; limitReached: string; notIncluded: string; noSubscription: string }> = {
  "recruitment.openPosition": {
    title: "Open job positions",
    limitReached: "You've reached your plan's limit of open job positions. Close an existing position or upgrade to open more.",
    notIncluded: "Opening job positions isn't included in your current plan.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to open job positions.",
  },
  "medicalCertificates.upload": {
    title: "Medical certificate uploads",
    limitReached: "You've reached your plan's monthly limit of medical certificate uploads. Upgrade to add more this month.",
    notIncluded: "Medical certificate uploads aren't included in your current plan.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to upload medical certificates.",
  },
  "happiness.chatbot": {
    title: "AI wellbeing chatbot",
    limitReached: "This plan doesn't include the AI wellbeing chatbot.",
    notIncluded: "The AI wellbeing chatbot isn't included in your current plan (Momentum and Infinity only).",
    noSubscription: "Your company doesn't have an active plan. Subscribe to a plan that includes the AI wellbeing chatbot.",
  },
};

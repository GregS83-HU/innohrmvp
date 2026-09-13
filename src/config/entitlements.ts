// Single source of truth for "which feature requires what plan".
//
// The actual limits/flags per plan are NOT duplicated here - they live in
// the `forfait` table (columns: max_opened_position, max_medical_certificates,
// access_happy_check, access_attendance_absences, access_performance,
// max_employees) and are evaluated live by hasFeatureAccess() in
// lib/entitlements.ts. Hardcoding the numeric limits into this file would
// create a second source of truth that drifts the moment someone edits a
// plan's limits in Supabase without a code deploy.
//
// What this file DOES own: the mapping from a feature key used in app code
// to the DB column(s) that decide access, plus display copy for paywall UI.
// See GATING_SUMMARY.md for the original three features, and
// MODULE_GATING_FIX.md for attendance/absences/performance and the
// employee seat cap added afterward.

export type FeatureKey =
  | "recruitment.openPosition"
  | "medicalCertificates.upload"
  | "happiness.chatbot"
  | "attendance.use"
  | "absences.use"
  | "performance.use"
  | "company.addEmployee"
  | "support.tickets"
  | "reporting.advanced";

export type EntitlementCheck =
  // Capacity check: compares a live count against a per-plan max column.
  | { kind: "capacity"; rpc: "can_open_new_position" | "can_add_medical_certificate" | "can_add_employee" }
  // Boolean flag check: reads a per-plan boolean column.
  | { kind: "flag"; rpc: "can_access_happy_check" | "can_use_attendance_absences" | "can_use_performance" | "can_use_support_tickets" | "can_use_advanced_reporting" };

// Features that require company.onboarding_completed = true, on top of
// whatever plan check applies - regardless of forfait, a company that
// signed up self-serve stays locked out of these until our team flips the
// flag after a manual setup call. Recruitment (job postings) is
// deliberately NOT in this set: it stays usable immediately after
// self-serve signup, subject only to plan limits.
//
// medicalCertificates.upload was originally placed here as a TEMPORARY
// compliance safeguard rather than a training/complexity gate: certificate
// uploads used to send employee health data to third-party AI/OCR services
// (OCR.Space, OpenRouter) for automated extraction, with only best-effort
// redaction and unreviewed subprocessor terms. That AI/OCR step has since
// been removed entirely - a certificate is now stored and its details
// entered manually by a company admin, with no third-party AI/OCR service
// ever seeing the document or its contents. The original rationale for
// gating this specific feature on onboarding no longer applies; it remains
// in this set for now only because removing it is a separate product
// decision that hasn't been made, not because of any current AI/OCR risk.
// support.tickets is deliberately NOT in this set: unlike the five features
// above, it's usable immediately after self-serve signup (same treatment as
// recruitment.openPosition), subject only to the plan check below.
export const ONBOARDING_GATED_FEATURES: ReadonlySet<FeatureKey> = new Set([
  "attendance.use",
  "absences.use",
  "performance.use",
  "happiness.chatbot",
  "medicalCertificates.upload",
]);

export const FEATURE_RULES: Record<FeatureKey, EntitlementCheck> = {
  "recruitment.openPosition": { kind: "capacity", rpc: "can_open_new_position" },
  "medicalCertificates.upload": { kind: "capacity", rpc: "can_add_medical_certificate" },
  "happiness.chatbot": { kind: "flag", rpc: "can_access_happy_check" },
  // Time & attendance and absences are gated together by a single forfait
  // column (access_attendance_absences) - they're always enabled/disabled
  // as a set in every plan tier described in MODULE_GATING_FIX.md, so two
  // FeatureKeys share one DB flag rather than two redundant columns that
  // could drift out of sync.
  "attendance.use": { kind: "flag", rpc: "can_use_attendance_absences" },
  "absences.use": { kind: "flag", rpc: "can_use_attendance_absences" },
  "performance.use": { kind: "flag", rpc: "can_use_performance" },
  // Gates ADDING a new employee (company_to_users insert) against the
  // plan's max_employees seat cap. Deliberately NOT checked on every
  // attendance/absences/performance action - existing employees keep full
  // access to those modules even if the company is later over its cap
  // (e.g. after a downgrade), matching the same "never punish existing
  // data" principle used for job postings. See MODULE_GATING_FIX.md.
  "company.addEmployee": { kind: "capacity", rpc: "can_add_employee" },
  // Support tickets are gated by their own flag, not shared with any other
  // module - unlike attendance/absences, ticket access doesn't naturally
  // pair with another feature's plan boundary.
  "support.tickets": { kind: "flag", rpc: "can_use_support_tickets" },
  // Growth-only. Its own DB column rather than reusing access_performance -
  // the two features have no product reason to always travel together
  // beyond both happening to be Growth-only today.
  "reporting.advanced": { kind: "flag", rpc: "can_use_advanced_reporting" },
};

// Copy shown in upgrade prompts / paywall states. Plan names must match
// `forfait.forfait_name` values exactly (confirmed against the live table:
// Free, Core, Growth).
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
    notIncluded: "The AI wellbeing chatbot is available on Growth.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Growth to use the AI wellbeing chatbot.",
  },
  "attendance.use": {
    title: "Time & attendance",
    limitReached: "Time & attendance isn't usable on your current plan.",
    notIncluded: "Time & attendance is available on Core and Growth.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Core or Growth to use time & attendance.",
  },
  "absences.use": {
    title: "Absences",
    limitReached: "Absence management isn't usable on your current plan.",
    notIncluded: "Absence management is available on Core and Growth.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Core or Growth to use absence management.",
  },
  "performance.use": {
    title: "Performance management",
    limitReached: "Performance management isn't usable on your current plan.",
    notIncluded: "Performance management (goals, pulse check-ins) is available on Growth.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Growth to use performance management.",
  },
  "company.addEmployee": {
    title: "Add employee",
    limitReached: "You've reached your plan's included employee count. Upgrade to add more employees.",
    notIncluded: "Adding employees isn't included in your current plan.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to a plan to add employees.",
  },
  "support.tickets": {
    title: "Support tickets",
    limitReached: "Submitting new support tickets isn't usable on your current plan.",
    notIncluded: "Submitting support tickets is available on Core and Growth plans.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Core or Growth to submit support tickets.",
  },
  "reporting.advanced": {
    title: "Advanced reporting",
    limitReached: "Advanced reporting isn't usable on your current plan.",
    notIncluded: "Advanced reporting is available on Growth.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Growth to use advanced reporting.",
  },
};

// Shared copy for any ONBOARDING_GATED_FEATURES feature blocked because
// company.onboarding_completed is false - same message regardless of which
// module it is or what plan the company is on, since the reason is always
// "no setup call yet", not a plan limitation.
export const ONBOARDING_REQUIRED_MESSAGE = "Available after your onboarding call.";

// medicalCertificates.upload no longer has a feature-specific reason to
// show here: certificate review is manual-entry-only now (see
// ONBOARDING_GATED_FEATURES), so the generic message applies to it the same
// as the other onboarding-gated modules.
export function getOnboardingRequiredMessage(feature: FeatureKey): string {
  return ONBOARDING_REQUIRED_MESSAGE;
}

// Core is hard-capped at 30 employees: past that point Core's per-seat
// formula (25,000 + 1,000/employee) crosses over to cost more than Growth's
// (40,000 + 750/employee), which also includes strictly more features - an
// account must never be able to sit in that zone. Growth has no upper cap
// (max_employees is null), so this branch only ever fires for Core; the
// generic message below remains for Free, where it's currently unreachable
// (Free has no employee cap either) but kept as the fallback.
export function getAddEmployeeLimitMessage(plan: string | null): string {
  if (plan === "Core") {
    return "You've reached Core's 30-employee limit. Upgrade to Growth to add more employees.";
  }
  return FEATURE_COPY["company.addEmployee"].limitReached;
}

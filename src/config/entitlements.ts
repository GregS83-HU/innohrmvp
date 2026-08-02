// Single source of truth for "which feature requires what plan".
//
// The actual limits/flags per plan are NOT duplicated here - they live in
// the `forfait` table (columns: max_opened_position, max_medical_certificates,
// access_happy_check, access_payroll_attendance_absences, access_performance,
// max_employees) and are evaluated live by hasFeatureAccess() in
// lib/entitlements.ts. Hardcoding the numeric limits into this file would
// create a second source of truth that drifts the moment someone edits a
// plan's limits in Supabase without a code deploy.
//
// What this file DOES own: the mapping from a feature key used in app code
// to the DB column(s) that decide access, plus display copy for paywall UI.
// See GATING_SUMMARY.md for the original three features, and
// MODULE_GATING_FIX.md for payroll/attendance/absences/performance and the
// employee seat cap added afterward.

export type FeatureKey =
  | "recruitment.openPosition"
  | "medicalCertificates.upload"
  | "happiness.chatbot"
  | "payroll.use"
  | "attendance.use"
  | "absences.use"
  | "performance.use"
  | "company.addEmployee";

export type EntitlementCheck =
  // Capacity check: compares a live count against a per-plan max column.
  | { kind: "capacity"; rpc: "can_open_new_position" | "can_add_medical_certificate" | "can_add_employee" }
  // Boolean flag check: reads a per-plan boolean column.
  | { kind: "flag"; rpc: "can_access_happy_check" | "can_use_payroll_attendance_absences" | "can_use_performance" };

// Features that require company.onboarding_completed = true, on top of
// whatever plan check applies - regardless of forfait, a company that
// signed up self-serve stays locked out of these until our team flips the
// flag after a manual setup call. Recruitment (job postings) and medical
// certificates are deliberately NOT in this set: those stay usable
// immediately after self-serve signup, subject only to plan limits.
export const ONBOARDING_GATED_FEATURES: ReadonlySet<FeatureKey> = new Set([
  "payroll.use",
  "attendance.use",
  "absences.use",
  "performance.use",
  "happiness.chatbot",
]);

export const FEATURE_RULES: Record<FeatureKey, EntitlementCheck> = {
  "recruitment.openPosition": { kind: "capacity", rpc: "can_open_new_position" },
  "medicalCertificates.upload": { kind: "capacity", rpc: "can_add_medical_certificate" },
  "happiness.chatbot": { kind: "flag", rpc: "can_access_happy_check" },
  // Payroll, time & attendance, and absences are gated together by a single
  // forfait column (access_payroll_attendance_absences) - they're always
  // enabled/disabled as a set in every plan tier described in
  // MODULE_GATING_FIX.md, so three FeatureKeys share one DB flag rather than
  // three redundant columns that could drift out of sync.
  "payroll.use": { kind: "flag", rpc: "can_use_payroll_attendance_absences" },
  "attendance.use": { kind: "flag", rpc: "can_use_payroll_attendance_absences" },
  "absences.use": { kind: "flag", rpc: "can_use_payroll_attendance_absences" },
  "performance.use": { kind: "flag", rpc: "can_use_performance" },
  // Gates ADDING a new employee (company_to_users insert) against the
  // plan's max_employees seat cap. Deliberately NOT checked on every
  // payroll/attendance/absences/performance action - existing employees
  // keep full access to those modules even if the company is later over
  // its cap (e.g. after a downgrade), matching the same "never punish
  // existing data" principle used for job postings. See MODULE_GATING_FIX.md.
  "company.addEmployee": { kind: "capacity", rpc: "can_add_employee" },
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
  "payroll.use": {
    title: "Payroll",
    limitReached: "Payroll isn't usable on your current plan.",
    notIncluded: "Payroll is available on Momentum and Infinity, for up to your plan's included employee count.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Momentum or Infinity to use payroll.",
  },
  "attendance.use": {
    title: "Time & attendance",
    limitReached: "Time & attendance isn't usable on your current plan.",
    notIncluded: "Time & attendance is available on Momentum and Infinity, for up to your plan's included employee count.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Momentum or Infinity to use time & attendance.",
  },
  "absences.use": {
    title: "Absences",
    limitReached: "Absence management isn't usable on your current plan.",
    notIncluded: "Absence management is available on Momentum and Infinity, for up to your plan's included employee count.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Momentum or Infinity to use absence management.",
  },
  "performance.use": {
    title: "Performance management",
    limitReached: "Performance management isn't usable on your current plan.",
    notIncluded: "Performance management (goals, pulse check-ins) is available on Infinity only, for up to your plan's included employee count.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to Infinity to use performance management.",
  },
  "company.addEmployee": {
    title: "Add employee",
    // Overridden for Infinity by getAddEmployeeMessage() below - this
    // generic copy is for Free/Momentum, where upgrading is the answer.
    limitReached: "You've reached your plan's included employee count. Upgrade to add more employees.",
    notIncluded: "Adding employees isn't included in your current plan.",
    noSubscription: "Your company doesn't have an active plan. Subscribe to a plan to add employees.",
  },
};

// Shared copy for any ONBOARDING_GATED_FEATURES feature blocked because
// company.onboarding_completed is false - same message regardless of which
// module it is or what plan the company is on, since the reason is always
// "no setup call yet", not a plan limitation.
export const ONBOARDING_REQUIRED_MESSAGE = "Available after your onboarding call.";

// Infinity has no higher self-serve tier, so hitting its employee cap isn't
// a plain "upgrade" prompt - it should route to a custom quote conversation
// instead. Centralized here so every consumer (API error body, UI) shows
// the same message rather than each re-implementing the Infinity special
// case. See MODULE_GATING_FIX.md.
export function getAddEmployeeLimitMessage(plan: string | null): string {
  if (plan === "Infinity") {
    return "You've reached the Infinity plan's included employee count (100). This isn't self-serve above 100 employees - contact us for a custom quote.";
  }
  return FEATURE_COPY["company.addEmployee"].limitReached;
}

// Read-only "would this be allowed" check, backed by the same
// hasFeatureAccess() used to actually enforce creation server-side. Exists
// so client-side pre-check UI (e.g. the new-position and medical-certificate
// upload pages) gets the same answer as the enforcement itself, including
// the Free-tier fallback for a company with no active subscription -
// calling the can_open_new_position/can_add_medical_certificate/
// can_access_happy_check RPCs directly, as those pages did before, does not
// know about that fallback and fails closed on a null `forfait`.
//
// company_id is derived from the caller's own session/membership below -
// never trusted from the query string, matching the enforcement routes this
// mirrors (create-subscription, medical-certificates/confirm, etc.), which
// derive it the same way. Both current callers (new-position and
// medical-certificate upload pages) already only ever check their own
// company's entitlement, so this doesn't change what either page sees.
import { NextRequest, NextResponse } from "next/server";
import { hasFeatureAccess, resolveCompanyIdForUser } from "../../../../../lib/entitlements";
import { requireAuthenticatedUser } from "../../../../../lib/authz";
import type { FeatureKey } from "../../../../config/entitlements";

const VALID_FEATURES: FeatureKey[] = [
  "recruitment.openPosition",
  "medicalCertificates.upload",
  "happiness.chatbot",
];

export async function GET(req: NextRequest) {
  const feature = req.nextUrl.searchParams.get("feature") as FeatureKey | null;

  if (!feature || !VALID_FEATURES.includes(feature)) {
    return NextResponse.json({ error: "a valid feature is required" }, { status: 400 });
  }

  const identity = await requireAuthenticatedUser(req);
  if (!identity.authorized) {
    return NextResponse.json({ error: identity.error }, { status: identity.status });
  }

  const companyId = await resolveCompanyIdForUser(identity.userId);
  if (!companyId) {
    return NextResponse.json({ error: "No company associated with your account" }, { status: 403 });
  }

  const result = await hasFeatureAccess(companyId, feature);
  return NextResponse.json(result);
}

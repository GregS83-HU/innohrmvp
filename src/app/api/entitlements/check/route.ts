// Read-only "would this be allowed" check, backed by the same
// hasFeatureAccess() used to actually enforce creation server-side. Exists
// so client-side pre-check UI (e.g. the new-position and medical-certificate
// upload pages) gets the same answer as the enforcement itself, including
// the Free-tier fallback for a company with no active subscription -
// calling the can_open_new_position/can_add_medical_certificate/
// can_access_happy_check RPCs directly, as those pages did before, does not
// know about that fallback and fails closed on a null `forfait`.
import { NextRequest, NextResponse } from "next/server";
import { hasFeatureAccess } from "../../../../../lib/entitlements";
import type { FeatureKey } from "../../../../config/entitlements";

const VALID_FEATURES: FeatureKey[] = [
  "recruitment.openPosition",
  "medicalCertificates.upload",
  "happiness.chatbot",
];

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("company_id");
  const feature = req.nextUrl.searchParams.get("feature") as FeatureKey | null;

  if (!companyId || !feature || !VALID_FEATURES.includes(feature)) {
    return NextResponse.json({ error: "company_id and a valid feature are required" }, { status: 400 });
  }

  const result = await hasFeatureAccess(companyId, feature);
  return NextResponse.json(result);
}

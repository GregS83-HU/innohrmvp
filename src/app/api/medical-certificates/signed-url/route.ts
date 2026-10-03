// src/app/api/medical-certificates/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAuthenticatedUser, requireCompanyAdmin } from '../../../../../lib/authz';
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SIGNED_URL_EXPIRY_SECONDS = 60 * 10; // 10 minutes

function resolveStoragePath(certificateFile: string): string {
  if (certificateFile.startsWith("{")) {
    try {
      const parsed = JSON.parse(certificateFile);
      return parsed.path || parsed.signedUrl || certificateFile;
    } catch {
      return certificateFile;
    }
  }
  return certificateFile;
}

export async function POST(req: NextRequest) {
  try {
    // Order preserved from the original implementation: verify the caller's
    // identity, validate the request body, *then* check admin role + company.
    const identity = await requireAuthenticatedUser(req);
    if (!identity.authorized) {
      return NextResponse.json({ error: identity.error }, { status: identity.status });
    }

    const { certificate_ids } = (await req.json()) as { certificate_ids?: number[] };
    if (!Array.isArray(certificate_ids) || certificate_ids.length === 0) {
      return NextResponse.json({ error: "certificate_ids is required" }, { status: 400 });
    }

    const authCheck = await requireCompanyAdmin(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { data: certificates, error: certError } = await supabase
      .from("medical_certificates")
      .select("id, certificate_file")
      .in("id", certificate_ids)
      .eq("company_id", authCheck.companyId);

    if (certError) {
      return NextResponse.json({ error: "Error fetching certificates" }, { status: 500 });
    }

    const urls: Record<number, string> = {};

    for (const cert of certificates ?? []) {
      if (!cert.certificate_file) continue;
      const path = resolveStoragePath(cert.certificate_file);

      const { data: signed, error: signErr } = await supabase.storage
        .from("medical-certificates")
        .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

      if (!signErr && signed?.signedUrl) {
        urls[cert.id] = signed.signedUrl;
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("Signed URL generation error:", safeErrorInfo(err));
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

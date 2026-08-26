// src/app/api/medical-certificates/signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { certificate_ids } = (await req.json()) as { certificate_ids?: number[] };
    if (!Array.isArray(certificate_ids) || certificate_ids.length === 0) {
      return NextResponse.json({ error: "certificate_ids is required" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("is_admin, is_super_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || (!profile.is_admin && !profile.is_super_admin)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("company_to_users")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "No company associated with your account" }, { status: 403 });
    }

    const { data: certificates, error: certError } = await supabase
      .from("medical_certificates")
      .select("id, certificate_file")
      .in("id", certificate_ids)
      .eq("company_id", membership.company_id);

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

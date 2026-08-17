// src/app/api/candidates/signed-cv-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SIGNED_URL_EXPIRY_SECONDS = 60 * 10; // 10 minutes

// cv_file historically stored a full (now-expired) 1h signed URL rather than
// a storage path. Support both so old rows keep working.
function resolveCvStoragePath(cvFile: string): string | null {
  if (cvFile.startsWith("http")) {
    const match = cvFile.match(/\/object\/(?:sign|public)\/cvs\/([^?]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
  return cvFile;
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

    const { candidate_ids } = (await req.json()) as { candidate_ids?: number[] };
    if (!Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return NextResponse.json({ error: "candidate_ids is required" }, { status: 400 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("company_to_users")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "No company associated with your account" }, { status: 403 });
    }

    // A candidate is only visible to a user if they applied to a position
    // owned by that user's company.
    const { data: links, error: linksError } = await supabase
      .from("position_to_candidat")
      .select("candidat_id, openedpositions!inner(company_id)")
      .in("candidat_id", candidate_ids)
      .eq("openedpositions.company_id", membership.company_id);

    if (linksError) {
      return NextResponse.json({ error: "Error verifying candidate access" }, { status: 500 });
    }

    const allowedCandidateIds = new Set((links ?? []).map((l) => l.candidat_id));

    const { data: candidates, error: candidatesError } = await supabase
      .from("candidats")
      .select("id, cv_file")
      .in("id", Array.from(allowedCandidateIds));

    if (candidatesError) {
      return NextResponse.json({ error: "Error fetching candidates" }, { status: 500 });
    }

    const urls: Record<number, string> = {};

    for (const candidate of candidates ?? []) {
      if (!candidate.cv_file) continue;
      const path = resolveCvStoragePath(candidate.cv_file);
      if (!path) continue;

      const { data: signed, error: signErr } = await supabase.storage
        .from("cvs")
        .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

      if (!signErr && signed?.signedUrl) {
        urls[candidate.id] = signed.signedUrl;
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("CV signed URL generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

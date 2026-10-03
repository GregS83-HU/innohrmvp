// src/app/api/candidate-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeErrorInfo } from '../../../../lib/logSafe';
import { requireSelf } from '../../../../lib/authz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 }
    );
  }

  const auth = await requireSelf(req, user_id);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Use the same RPC function that your analyse-massive uses
    const { data: candidats, error } = await supabase.rpc(
      "get_company_candidates",
      { user_uuid: user_id }
    );

    if (error) {
      console.error("Error fetching candidates:", safeErrorInfo(error));
      return NextResponse.json(
        { error: "Failed to fetch candidate count" },
        { status: 500 }
      );
    }

    const count = candidats?.length || 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unexpected error:", safeErrorInfo(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
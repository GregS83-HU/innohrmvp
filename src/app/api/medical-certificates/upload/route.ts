// src/app/api/medical-certificates/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // évite le cache
export const maxDuration = 60; // Vercel: laisse le temps à l'OCR

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("company_id") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!companyId) return NextResponse.json({ error: "Missing company_id" }, { status: 400 });

    // Ici, ton code OCR / Supabase upload reste identique...
    // Par exemple, upload dans Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `uploads/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("medical-certificates")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Retourne juste un résultat simulé pour tester
    return NextResponse.json({
      success: true,
      extracted_data: {
        employee_name: "John Doe",
        sickness_start_date: "2025-09-01",
        sickness_end_date: "2025-09-05",
        doctor_name: "Dr. Smith",
      },
      filePath,
      companyId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: (err as Error)?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

// src/app/api/medical-certificates/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/next"

export const dynamic = "force-dynamic"; // évite le cache
export const maxDuration = 60; // Vercel: laisse le temps à l'OCR

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OCR.Space renvoie ce type de structure
type OCRSpaceResponse = {
  OCRExitCode: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ParsedResults?: Array<{
    ParsedText?: string;
    ErrorMessage?: string | string[];
  }>;
};

type CertificateData = {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  raw?: string;
};

function sanitizeFileName(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

// Tente d'extraire un JSON depuis un texte (au cas où le LLM renvoie du texte autour)
function safeExtractJson(text: string): CertificateData | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return {
      employee_name: parsed.employee_name ?? "not recognised",
      sickness_start_date: parsed.sickness_start_date ?? "not recognised",
      sickness_end_date: parsed.sickness_end_date ?? "not recognised",
      raw: text,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OCRSPACE_API_KEY) {
      return NextResponse.json({ error: "Missing OCRSPACE_API_KEY" }, { status: 500 });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("company_id") as string | null; // AJOUT: récupération du company_id

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Détection type fichier
    const fileType = file.type;
    const isPdf = fileType === "application/pdf";
    const isImage = fileType.startsWith("image/");

    if (!isPdf && !isImage) {
      return NextResponse.json({ error: "File must be an image or PDF" }, { status: 400 });
    }

    // 1) Upload dans Supabase Storage avec le company_id dans le chemin
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = sanitizeFileName(file.name);
    const filePath = `uploads/${companyId}/${Date.now()}_${safeName}`; // MODIFICATION: inclure company_id dans le chemin

    const { error: uploadError } = await supabase.storage
      .from("medical-certificates")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase
      .storage.from("medical-certificates")
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl ?? null;

    const { data: signed, error: signErr } = await supabase
      .storage.from("medical-certificates")
      .createSignedUrl(filePath, 60 * 5);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: "Could not create signed URL for OCR" }, { status: 500 });
    }

    // 2) Appel OCR.Space
    const params = new URLSearchParams();
    params.set("url", signed.signedUrl);
    params.set("language", "hun");
    params.set("detectOrientation", "true");
    params.set("isOverlayRequired", "false");
    params.set("isTable", "true");
    params.set("scale", "true");
    params.set("OCREngine", "1");

    if (isPdf) {
      params.set("filetype", "pdf"); // OCR.Space gère les PDF
    }

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCRSPACE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const ocrJson = (await ocrRes.json()) as OCRSpaceResponse;

    if (!ocrRes.ok || !ocrJson || ocrJson.OCRExitCode !== 1 || ocrJson.IsErroredOnProcessing) {
      const msg =
        (Array.isArray(ocrJson?.ErrorMessage) ? ocrJson.ErrorMessage.join("; ") : ocrJson?.ErrorMessage) ||
        "OCR failed";
      return NextResponse.json({ error: `OCR error: ${msg}` }, { status: 502 });
    }

    const rawText =
      (ocrJson.ParsedResults ?? [])
        .map((r) => r?.ParsedText ?? "")
        .join("\n")
        .trim() || "";

//console.log("Raw PDF:", rawText)

    // 3) Extraction JSON via OpenRouter
    const extractPrompt = `
You will receive raw OCR text from a Hungarian medical certificate. Be Careful, the language of the certificate may vary.
I would like to return from this raw text: 
The name (in the file it will first name and last name together), the starting date of sickness, the end date of sickness
Extract the following fields and return STRICT JSON, nothing else:
{
  "employee_name": string | null,
  "sickness_start_date": "YYYY-MM-DD" | null,
  "sickness_end_date": "YYYY-MM-DD" | null
}
Rules:
- If a field is missing, set it to "not recognised".
- Try to normalize dates to YYYY-MM-DD if possible.
- Do not include any explanation. Only output JSON.

OCR TEXT:
---
${rawText}
---`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.1,
      }),
    });

    const aiJson = await aiRes.json();
    const candidateText = aiJson?.choices?.[0]?.message?.content ?? "";
    let structured: CertificateData | null = safeExtractJson(candidateText);
    console.log("JSON from AI:", candidateText)

    if (!structured) {
      structured = {
        employee_name: "not recognised",
        sickness_start_date: "not recognised",
        sickness_end_date: "not recognised",
        raw: candidateText || null,
      };
    }

    return NextResponse.json({
      success: true,
      company_id: companyId, // AJOUT: retourner le company_id dans la réponse
      storage_path: filePath,
      //signed_url: signed.signedUrl,
      public_url: publicUrl,
      raw_text: rawText,
      extracted_data: structured,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: (err as Error)?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
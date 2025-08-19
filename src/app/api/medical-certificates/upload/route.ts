// src/app/api/medical-certificates/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";       // évite le cache
export const maxDuration = 60;                // Vercel: laisse le temps à l'OCR

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

function sanitizeFileName(filename: string) {
  return filename
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

// Tente d’extraire un JSON depuis un texte (au cas où le LLM renvoie du texte autour)
function safeExtractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1) Upload dans Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = sanitizeFileName(file.name);
    const filePath = `uploads/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("medical-certificates")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // URL publique "théorique" (utile pour debug/retours).
    const { data: publicUrlData } = supabase
      .storage.from("medical-certificates")
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl ?? null;

    // 2) URL signée (5 minutes) pour que OCR.Space puisse télécharger le fichier, même si le bucket est privé
    const { data: signed, error: signErr } = await supabase
      .storage.from("medical-certificates")
      .createSignedUrl(filePath, 60 * 5);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: "Could not create signed URL for OCR" }, { status: 500 });
    }

    // 3) Appel OCR.Space avec l’URL signée
    const params = new URLSearchParams();
    // NB: on passe la clé dans le header, pas besoin de la remettre dans le body.
    params.set("url", signed.signedUrl);
    params.set("language", "hun"); 
    params.set("detectOrientation", "true");  
    params.set("isOverlayRequired", "false");
    params.set("isTable", "true");          // utile pour les tableaux/dates
    params.set("scale", "true");
    params.set("OCREngine", "1");      

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCRSPACE_API_KEY,             // <- important
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const ocrJson = (await ocrRes.json()) as OCRSpaceResponse;
    console.log("OCR JSON:", ocrJson)

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


    console.log("OCR RAWTEXT:", rawText) 
    // 4) Extraction JSON structurée via OpenRouter (texte OCR → JSON)
    const extractPrompt = `
You will receive raw OCR text from a Hungarian medical certificate. Be careful, the language is Hungarian. 
I would like to return from this raw text: 
The name (in the file it will first name and last name together), the starting date of sickness, the end date of sickness
Extract the following fields and return STRICT JSON, nothing else:
{
  "employee_name": string | null,
  "sickness_start_date": "YYYY-MM-DD" | null,
  "sickness_end_date": "YYYY-MM-DD" | null,
  "doctor_name": string | null
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
        // modèle texte-only ; choisis celui que tu utilises déjà si besoin
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.1,
      }),
    });

    const aiJson = await aiRes.json();
    const candidateText = aiJson?.choices?.[0]?.message?.content ?? "";
    let structured = safeExtractJson(candidateText);
    console.log("Retour AI:", structured)

    // Fallback minimal si l’IA n’a pas renvoyé de JSON valide
    if (!structured) {
      structured = {
        firstname: null,
        lastname: null,
        sickness_start_date: null,
        sickness_end_date: null,
        doctor_name: null,
        raw: candidateText || null,
      };
    }

    // 5) Retour au front (on n’insère PAS encore en DB : tu lances l’insert après confirmation)
    return NextResponse.json({
      success: true,
      storage_path: filePath,
      // Utile pour que le front puisse afficher/télécharger le document pendant 5 min :
      signed_url: signed.signedUrl,
      // URL publique (peut être invalide si le bucket est privé) :
      public_url: publicUrl,
      raw_text: rawText,
      extracted_data: structured,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

// src/app/api/analyse-massive/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { consumeCredit } from "../../../../lib/credit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// === Utility: Analyse a CV with the AI model ===
async function analyseCvWithAi(
  cvText: string,
  jobDescription: string,
  jobDescriptionDetailed: string
) {
  const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description détaillée du poste ciblé:

${jobDescriptionDetailed || jobDescription}

Analyze the CV only against the provided job description with extreme rigor.
Do not guess, assume, or infer any skill, experience, or qualification that is not explicitly written in the CV.
Be critical: even a single missing core requirement should significantly lower the score.
If the CV shows little or no direct relevance, the score must be 3 or lower.
Avoid “benefit of the doubt” scoring.

Your output must strictly follow this structure:

Profile Summary – short and factual, based only on what is explicitly written in the CV.

Direct Skill Matches – list only the job-relevant skills that are directly evidenced in the CV.

Critical Missing Requirements – list each key requirement from the job description that is missing or insufficient in the CV.

Alternative Suitable Roles – suggest other roles the candidate may fit based on their actual CV content.

Final Verdict – clear and decisive statement on whether this candidate should be considered.

Scoring Rules (Extremely Strict):

9–10 → Perfect fit: all key requirements explicitly met with proven, recent experience.
7–8 → Strong potential: almost all requirements met; only minor gaps.
5–6 → Marginal: some relevant experience but several major gaps. Unlikely to succeed without major upskilling.
Below 5 → Not suitable: lacks multiple essential requirements or background is in a different field.

Mandatory principles:
Never award a score above 5 unless the CV matches at least 80% of the core requirements.
When in doubt, choose the lower score.
Always provide concrete examples from the CV to justify the score.
Keep tone professional, concise, and free from speculation.

Please finish your analysis with 3 key questions that the recruiter should ask during the first interview.

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

Analysis should be in perfect English.
`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  const completion = await res.json();
  const rawResponse = completion.choices?.[0]?.message?.content ?? "";
  const match = rawResponse.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse JSON IA invalide");
  return JSON.parse(match[0]);
}

// === SSE Endpoint for "Analyse Massive" ===
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const position_id_str = url.searchParams.get("position_id");
  const user_id = url.searchParams.get("user_id");
  const company_id = url.searchParams.get("company_id");

  if (!position_id_str) {
    return new Response(JSON.stringify({ error: "position_id requis" }), {
      status: 400,
    });
  }
  if (!user_id) {
    return new Response(JSON.stringify({ error: "user_id requis" }), {
      status: 400,
    });
  }
  if (!company_id) {
    return new Response(JSON.stringify({ error: "company_id requis" }), {
      status: 400,
    });
  }

  const positionId = Number(position_id_str);
  if (isNaN(positionId)) {
    return new Response(JSON.stringify({ error: "position_id invalide" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // === Step 1: Load position details ===
        const { data: position, error: posErr } = await supabase
          .from("openedpositions")
          .select("*")
          .eq("id", positionId)
          .single();

        if (posErr || !position) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Position non trouvée",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // === Step 2: Load company candidates ===
        const { data: candidats, error: candErr } = await supabase.rpc(
          "get_company_candidates",
          { user_uuid: user_id }
        );

        if (candErr) {
          console.error("Erreur RPC get_company_candidates:", candErr);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Impossible de récupérer les candidats",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        if (!candidats || candidats.length === 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                matched: 0,
                total: 0,
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // === Step 3: Iterate over candidates one by one ===
        let matched = 0;

        for (let i = 0; i < candidats.length; i++) {
          const candidat = candidats[i];

          try {
            // ✅ Check AI credit availability
            const ok = await consumeCredit(company_id);
            if (!ok) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    error:
                      "Plus de crédits AI disponibles. Analyse interrompue.",
                  })}\n\n`
                )
              );
              break;
            }

            // ✅ Run analysis
            const { score, analysis } = await analyseCvWithAi(
              candidat.cv_text,
              position.position_description,
              position.position_description_detailed
            );

            if (score >= 7) {
              matched++;
            }

            // ✅ Store result
            await supabase.from("position_to_candidat").upsert({
              position_id: positionId,
              candidat_id: candidat.id,
              candidat_score: score,
              candidat_ai_analyse: analysis,
              source: "Analyse from Database",
              candidat_next_step: score < 5 ? "1" : "0",
            });

            // ✅ Send progress event
            const progress = Math.floor(((i + 1) / candidats.length) * 100);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  progress,
                  candidat_id: candidat.id,
                  score,
                })}\n\n`
              )
            );
          } catch (err) {
            console.error(`Erreur analyse CV ${candidat.id}:`, err);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  candidat_id: candidat.id,
                  error: (err as Error).message,
                })}\n\n`
              )
            );
          }
        }

        // === Step 4: End of stream ===
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              matched,
              total: candidats.length,
            })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        console.error("Erreur serveur analyse massive:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: "Erreur serveur pendant l'analyse massive",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

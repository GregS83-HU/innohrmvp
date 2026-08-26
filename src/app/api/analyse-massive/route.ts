// src/app/api/analyse-massive/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { consumeCredit } from "../../../../lib/credit";
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from "../../../../lib/prompts";
import { safeErrorInfo } from '../../../../lib/logSafe';

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
  // Fetch prompt from database
  const promptTemplate = await getPrompt('massive_cv_analysis');
  
  // Fill in variables - use detailed description if available, otherwise fall back to regular
  const prompt = fillPromptVariables(promptTemplate, {
    cvText,
    jobDescriptionDetailed: jobDescriptionDetailed || jobDescription
  });

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
        // === Step 0: Verify prompt availability before starting ===
        try {
          await getPrompt('massive_cv_analysis');
        } catch (error) {
          if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
            console.error('Prompt unavailable:', error.message);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: "AI tool is currently unavailable. Please try again later.",
                })}\n\n`
              )
            );
            controller.close();
            return;
          }
          throw error;
        }

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
          console.error("Erreur RPC get_company_candidates:", safeErrorInfo(candErr));
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
              candidat_next_step: score < 7 ? "1" : "0",
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
            console.error(`Erreur analyse CV ${candidat.id}:`, safeErrorInfo(err));
            
            // Check if it's a prompt error
            if (err instanceof PromptNotFoundError || err instanceof PromptDatabaseError) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    error: "AI tool is currently unavailable. Analysis interrupted.",
                  })}\n\n`
                )
              );
              break; // Stop processing if prompt system fails
            }
            
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
        console.error("Erreur serveur analyse massive:", safeErrorInfo(err));
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
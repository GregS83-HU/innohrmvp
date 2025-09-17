// src/app/api/analyse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parsePdfBuffer } from '../../../../lib/parsePdfSafe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fallback API call with different model
async function callOpenRouterAPIWithModel(prompt: string, context = '', model = 'openai/gpt-3.5-turbo') {
  try {
    console.log(`Making fallback API call for ${context} with model ${model}...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
        'X-Title': 'CV Analysis App',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    const responseText = await response.text();
    console.log(`Fallback API response for ${context} (status: ${response.status}):`, responseText.substring(0, 500) + '...');

    if (!response.ok) {
      throw new Error(`Fallback API call failed for ${context}: ${response.status} ${response.statusText}`);
    }

    let completion;
    try {
      completion = JSON.parse(responseText);
    } catch {
      throw new Error(`Fallback API returned invalid JSON for ${context}`);
    }

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error(`Invalid fallback API response structure for ${context}`);
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error(`Error in fallback API call for ${context}:`, error);
    throw error;
  }
}

// Robust JSON extraction
function extractAndParseJSON(rawResponse: string, context = '') {
  const trimmed = rawResponse.trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  // Regex pour extraire le premier objet JSON complet
  const match = trimmed.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  if (!match) {
    console.error(`No JSON found in ${context} response:`, rawResponse);
    throw new Error(`No valid JSON found in ${context} response`);
  }

  try {
    return JSON.parse(match[0]);
  } catch (parseError) {
    console.error(`Invalid JSON in ${context} response:`, match[0]);
    throw new Error(`Invalid JSON structure in ${context} response`);
  }
}

// Main API call function
async function callOpenRouterAPI(prompt: string, context = '', model = 'mistralai/mistral-7b-instruct') {
  try {
    console.log(`Making API call for ${context} with model ${model}...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
        'X-Title': 'CV Analysis App',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    const responseText = await response.text();
    console.log(`Raw API response for ${context} (status: ${response.status}):`, responseText.substring(0, 500) + '...');

    if (!response.ok) {
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
        throw new Error(`API returned HTML error page for ${context}. Check API key and endpoint status.`);
      }
      throw new Error(`API call failed for ${context}: ${response.status} ${response.statusText}`);
    }

    let completion;
    try {
      completion = JSON.parse(responseText);
    } catch {
      throw new Error(`API returned invalid JSON for ${context}`);
    }

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error(`Invalid API response structure for ${context}`);
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error(`Error in callOpenRouterAPI for ${context}:`, error);
    throw error;
  }
}

// Sanitize filenames
function sanitizeFileName(filename: string) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const positionId = formData.get('positionId') as string;
    const source = formData.get('source') as string || 'Candidate Upload';

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = await parsePdfBuffer(buffer);

    const safeFileName = sanitizeFileName(file.name);
    const filePath = `cvs/${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Échec upload CV' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(filePath);
    const cvFileUrl = publicUrlData.publicUrl;

    // Prompt HR analysis (strict JSON)
    const hrPrompt = `
Strictly respond with JSON only, nothing else.
You are a strict HR expert. You will have a job description and the CV of the candidate applying to the position

${cvText}

This is the detailed description of the job description. 
${jobDescription}

Analyze the CV only against the provided job description with extreme rigor.
Do not guess, assume, or infer any skill, experience, or qualification that is not explicitly written in the CV.
Be critical: even a single missing core requirement should significantly lower the score.
If the CV shows little or no direct relevance, the score must be 3 or lower.
Avoid "benefit of the doubt" scoring.

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

J'aimerais aussi que tu détectes le nom, le prénom, l'adresse email et le numéro du téléphone du client

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": "string",
  "candidat_firstname": "string",
  "candidat_lastname": "string",
  "candidat_email": "string",
  "candidat_phone": "string"
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

La réponse doit etre en anglais parfait

End of JSON.
`;

    // Prompt Candidate Feedback (strict JSON)
    const candidateFeedbackPrompt = `
Strictly respond with JSON only, nothing else.
Tu es un consultant en carrière bienveillant. Voici un CV d'un candidat :

${cvText}

Voici la description du poste pour lequel il/elle a postulé:

${jobDescription}

Provide constructive and encouraging feedback directly to the candidate. Your goal is to help them understand how their profile matches the position and give actionable advice for improvement.

Structure your response as follows and make it easy to read:

**Your Strengths**
- Highlight the positive aspects of their CV that align with the position
- Mention transferable skills and relevant experiences

**Areas for Development**
- Identify skill gaps in a supportive way
- Suggest specific ways to address these gaps (training, certifications, projects, etc.)

**Career Advice**
- Provide constructive suggestions for their career path
- Mention alternative positions that might be a good fit
- Give tips for improving their CV or application

**Next Steps**
- Actionable recommendations they can implement immediately
- Resources or learning paths they could pursue

Keep the tone:
- Professional but warm and encouraging
- Constructive rather than critical
- Focused on growth opportunities
- Honest but supportive

Respond only with a valid JSON in this format:
{
  "feedback": "string containing the full feedback message"
}
IMPORTANT: Respond with nothing other than this JSON.

The response must be in perfect English.

End of JSON.
`;

    // === HR Analysis ===
    let hrRawResponse;
    try {
      hrRawResponse = await callOpenRouterAPI(hrPrompt, 'HR analysis');
    } catch {
      hrRawResponse = await callOpenRouterAPIWithModel(hrPrompt, 'HR analysis', 'openai/gpt-3.5-turbo');
    }

    console.log('HR raw response:', hrRawResponse);
    const hrData = extractAndParseJSON(hrRawResponse, 'HR analysis');
    const { score, analysis, candidat_firstname, candidat_lastname, candidat_email, candidat_phone } = hrData;

    // === Candidate Feedback ===
    let candidateRawResponse;
    try {
      candidateRawResponse = await callOpenRouterAPI(candidateFeedbackPrompt, 'candidate feedback');
    } catch {
      candidateRawResponse = await callOpenRouterAPIWithModel(candidateFeedbackPrompt, 'candidate feedback', 'openai/gpt-3.5-turbo');
    }

    console.log('Candidate feedback raw response:', candidateRawResponse);
    const candidateData = extractAndParseJSON(candidateRawResponse, 'candidate feedback');
    const { feedback } = candidateData;

    // === Insert into Database ===
    const { data: candidate, error: insertError } = await supabase
      .from('candidats')
      .insert({
        candidat_firstname,
        candidat_lastname,
        cv_text: cvText,
        cv_file: cvFileUrl,
        candidat_email,
        candidat_phone
      })
      .select()
      .single();

    if (insertError || !candidate) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Échec enregistrement candidat' }, { status: 500 });
    }

    const { error: relationError } = await supabase
      .from('position_to_candidat')
      .insert({
        position_id: positionId,
        candidat_id: candidate.id,
        candidat_score: score,
        candidat_ai_analyse: analysis,
        source
      });

    if (relationError) {
      console.error('Relation insert error:', relationError);
      return NextResponse.json({ error: 'Échec liaison position/candidat' }, { status: 500 });
    }

    return NextResponse.json({
      score,
      analysis,
      candidateFeedback: feedback
    });
  } catch (aiError: unknown) {
    console.error('AI processing error:', aiError);
    const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI processing error';
    return NextResponse.json({ error: `AI processing failed: ${errorMessage}` }, { status: 500 });
  }
}

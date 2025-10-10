// src/app/api/analyse-cv/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import parsePdfBuffer from '../../../../lib/parsePdfSafe';
import { createClient } from '@supabase/supabase-js';
import { consumeCredit } from '../../../../lib/credit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Optimized API call with faster model and timeout
async function callOpenRouterAPI(prompt: string, context = '', model = 'openai/gpt-3.5-turbo') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout (increased for longer response)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
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
        max_tokens: 3000, // Increased for combined analysis
      }),
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

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
    clearTimeout(timeoutId);
    console.error(`Error in callOpenRouterAPI for ${context}:`, error);
    throw error;
  }
}

// Fallback API call with different model
async function callFallbackAPI(prompt: string, context = '') {
  try {
    // Try Claude Haiku first (fast and reliable)
    return await callOpenRouterAPI(prompt, context, 'anthropic/claude-3-haiku');
  } catch {
    // Then try Mistral Small (faster than 7b-instruct)
    return await callOpenRouterAPI(prompt, context, 'mistralai/mistral-small');
  }
}

// Robust JSON extraction
function extractAndParseJSON(rawResponse: string, context = '') {
  const trimmed = rawResponse.trim();
  
  try {
    return JSON.parse(trimmed);
  } catch {}

  // Extract first complete JSON object
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

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF
    const fullCvText = await parsePdfBuffer(buffer);
    console.log("Parsed CV length:", fullCvText.length);
    
    // Optimize PDF text length for faster processing
    const MAX_CV_LENGTH = 8000;
    const cvText = fullCvText.length > MAX_CV_LENGTH 
      ? fullCvText.substring(0, MAX_CV_LENGTH) + '...[truncated]'
      : fullCvText;

    // Start file upload in parallel
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `cvs/${Date.now()}_${safeFileName}`;
    
    const uploadPromise = supabase.storage
      .from('cvs')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

    // ===  SINGLE COMBINED AI PROMPT ===
    const combinedPrompt = `
You are an expert recruiter and career consultant. Analyze this CV against the job requirements and provide BOTH a recruiter analysis AND candidate feedback.

CV: ${cvText}

Job Requirements: ${jobDescription}

IMPORTANT: Respond in the SAME LANGUAGE as the CV (detect the language from the CV text).

Provide your response as JSON with this EXACT structure:
{
  "score": number,
  "analysis": "string",
  "candidateFeedback": "string",
  "candidat_firstname": "string",
  "candidat_lastname": "string",
  "candidat_email": "string",
  "candidat_phone": "string"
}

SCORING RULES (be strict and critical):
- 9-10: Perfect match, all requirements met excellently
- 7-8: Strong fit, most requirements met well
- 5-6: Marginal fit, some key gaps
- <5: Unsuitable, missing core requirements

FOR "analysis" FIELD (Recruiter perspective - STRICT and CRITICAL tone):
Write a professional analysis for the recruiter covering:
1. Key strengths relevant to the position (be specific)\\n\\n
2. Critical gaps or concerns (be honest about weaknesses)\\n\\n
3. Overall fit assessment (realistic evaluation)\\n\\n
4. THREE KEY INTERVIEW QUESTIONS the recruiter should ask to validate the match\\n\\n

Use \\n\\n to separate paragraphs for readability.
Be direct, critical, and focus on job fit. Don't sugarcoat weaknesses.

FOR "candidateFeedback" FIELD (Candidate perspective - ENCOURAGING and CONSTRUCTIVE tone):
Write a supportive message for the candidate with:
1. Personal greeting using their first and last name\\n\\n
2. Strengths paragraph highlighting their relevant experience and skills\\n\\n
3. Development areas with specific, actionable improvement suggestions\\n\\n
4. Career advice mentioning alternative suitable roles if relevant\\n\\n
5. Next steps with concrete recommendations\\n\\n
Finish only with "Best regards." 

Use \\n\\n to separate paragraphs for readability.
Be kind, professional, encouraging, and actionable. Focus on growth and opportunity.

CANDIDATE DATA EXTRACTION:
Extract the candidate's first name, last name, email, and phone number from the CV.
If any field is not found, use empty string "".

Remember: Write EVERYTHING in the same language as the CV!
`;
   

    // === CHECK AI CREDITS BEFORE ANALYSIS ===
    const companyId = formData.get('company_id')?.toString();

    if (!companyId) {
      return NextResponse.json({ error: 'Missing company ID (needed to check AI credits).' }, { status: 400 });
    }

    const ok = await consumeCredit(companyId);
    if (!ok) {
      return NextResponse.json({ error: 'You have no remaining AI credits this month.' }, { status: 402 });
    }


    // === SINGLE AI CALL ===
    console.log('Starting combined AI analysis...');
    
    const rawResponse = await callOpenRouterAPI(combinedPrompt, 'combined analysis')
      .catch(() => callFallbackAPI(combinedPrompt, 'combined analysis'));

    console.log('AI analysis completed');

    // Parse response
    const aiData = extractAndParseJSON(rawResponse, 'combined analysis');
    const { 
      score, 
      analysis, 
      candidateFeedback,
      candidat_firstname, 
      candidat_lastname, 
      candidat_email, 
      candidat_phone 
    } = aiData;

    // Validate required fields
    if (!score || !analysis || !candidateFeedback) {
      throw new Error('Missing required fields in AI response');
    }

    // Wait for file upload to complete
    const { error: uploadError } = await uploadPromise;

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Échec upload CV' }, { status: 500 });
    }

    // Signed URL valid for 1 hour (3600 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('cvs')
      .createSignedUrl(filePath, 60 * 60);

    if (signedUrlError || !signedUrlData) {
      throw new Error("Failed to create signed URL for CV");
    }

    const cvFileUrl = signedUrlData.signedUrl;

    // === Database Operations ===
    const { data: candidate, error: insertError } = await supabase
      .from('candidats')
      .insert({
        candidat_firstname,
        candidat_lastname,
        cv_text: fullCvText,
        cv_file: cvFileUrl,
        candidat_email,
        candidat_phone,
        candidat_gdpr_consent_date: new Date().toISOString()
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
        candidat_next_step: score < 5 ? "1" : "0",
        source
      });

    if (relationError) {
      console.error('Relation insert error:', relationError);
      return NextResponse.json({ error: 'Échec liaison position/candidat' }, { status: 500 });
    }

    return NextResponse.json({
      score,
      analysis,
      candidateFeedback
    });

  } catch (aiError: unknown) {
    console.error('AI processing error:', aiError);
    const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI processing error';
    return NextResponse.json({ error: `AI processing failed: ${errorMessage}` }, { status: 500 });
  }
}
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

/**
 * Create notifications for all admins in the company when a CV is uploaded
 */
async function notifyAdminsOfNewCV(
  positionId: string,
  positionName: string,
  companyId: string
) {
  try {
    const { data: companyAdmins, error: adminError } = await supabase
      .from('company_to_users')
      .select(`
        user_id,
        users!inner(
          id,
          is_admin
        )
      `)
      .eq('company_id', companyId);

    if (adminError || !companyAdmins || companyAdmins.length === 0) {
      console.log('No users found for company:', companyId);
      return { success: true, message: 'No users to check' };
    }

    const adminUsers = companyAdmins
      .filter(cu => {
        const users = Array.isArray(cu.users) ? cu.users[0] : cu.users;
        return users?.is_admin === true;
      })
      .map(cu => {
        const users = Array.isArray(cu.users) ? cu.users[0] : cu.users;
        return users?.id;
      })
      .filter(Boolean);

    if (adminUsers.length === 0) {
      return { success: true, message: 'No admin users to notify' };
    }

    const notifications = adminUsers.map(adminId => ({
      type: 'cv_uploaded',
      title: 'New CV Uploaded',
      message: `New CV uploaded for ${positionName}`,
      position_id: positionId,
      recipient_id: adminId,
      read: false,
      created_at: new Date().toISOString()
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating CV upload notifications:', notificationError);
      return { success: false, error: notificationError };
    }

    console.log(`✅ Created ${notifications.length} CV upload notifications`);
    return { success: true, count: notifications.length };
  } catch (err) {
    console.error('Failed to notify admins of new CV:', err);
    return { success: false, error: err };
  }
}

/**
 * Create notification for the position manager when a CV is uploaded
 */
async function notifyManagerOfNewCV(
  positionId: string,
  positionName: string,
  managerId: string | null
) {
  try {
    if (!managerId) {
      console.log('No manager assigned to position:', positionId);
      return { success: true, message: 'No manager to notify' };
    }

    const notification = {
      type: 'cv_uploaded',
      title: 'New CV for Your Position',
      message: `A new CV has been uploaded for ${positionName}`,
      position_id: positionId,
      recipient_id: managerId,
      read: false,
      created_at: new Date().toISOString()
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notification);

    if (notificationError) {
      console.error('Error creating manager CV notification:', notificationError);
      return { success: false, error: notificationError };
    }

    console.log(`✅ Created manager notification for user ${managerId}`);
    return { success: true };
  } catch (err) {
    console.error('Failed to notify manager of new CV:', err);
    return { success: false, error: err };
  }
}

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
    
    // Fetch position details for notifications
    const { data: positionData, error: positionError } = await supabase
      .from('openedpositions')
      .select('position_name, company_id, manager_id')
      .eq('id', positionId)
      .single();

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
You are an experienced recruiter and career consultant. Analyze this CV against the job requirements and provide BOTH a recruiter analysis AND candidate feedback.

CV: ${cvText}

Job Requirements: ${jobDescription}

IMPORTANT GENERAL RULES:
- Respond in the SAME LANGUAGE as the CV (detect automatically).
- Evaluate candidates as a REAL recruiter would: fairly, pragmatically, and with hiring realism.
- Consider transferable skills and growth potential, but NEVER let them fully compensate for missing core role experience.

----------------------------------------
CORE REQUIREMENTS IDENTIFICATION (CRITICAL STEP)
----------------------------------------
First, extract from the job description:
- The 3 to 5 CORE REQUIREMENTS of the role.
Core requirements are responsibilities or skills that are essential to perform the job independently.

Then, evaluate whether the candidate has:
- DIRECT EXPERIENCE (owned, led, or was accountable for)
- PARTIAL EXPERIENCE (contributed but did not own)
- NO EXPERIENCE

This evaluation MUST directly influence the final score.

----------------------------------------
SCORING GUIDELINES (MANDATORY)
----------------------------------------
- 9–10: Excellent match  
  → Direct experience in ALL core requirements + strong supporting skills

- 7–8: Strong match  
  → Direct experience in MOST core requirements, remaining gaps are minor or trainable

- 6–7: Moderate match with potential  
  → Direct experience in SOME core requirements, others only partially covered

- 5–6: Weak match  
  → Mostly transferable skills, limited direct experience in core requirements

- <5: Poor match  
  → Lacks direct experience in most core requirements

IMPORTANT SCORING RULES:
- If the candidate lacks direct experience in MORE THAN HALF of the core requirements, the score MUST NOT exceed 6.
- Seniority, leadership, or prestige titles MUST NOT override missing core experience.
- Different candidates with different coverage of core requirements SHOULD NOT receive identical scores.

----------------------------------------
OUTPUT FORMAT (STRICT)
----------------------------------------
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

----------------------------------------
FOR "analysis" FIELD (Recruiter perspective – objective and decision-focused):
Write a professional analysis covering:

1. Alignment with core job requirements (explicitly reference them)\\n\\n
2. Key strengths that support performance in the role\\n\\n
3. Gaps or risks that could impact success\\n\\n
4. Overall hiring assessment (hire / consider / reject logic)\\n\\n
5. THREE KEY INTERVIEW QUESTIONS targeting the identified gaps\\n\\n

Tone: factual, realistic, and decision-oriented. Avoid exaggeration.

----------------------------------------
FOR "candidateFeedback" FIELD (Candidate perspective – supportive and constructive):
Write an encouraging message including:

1. Personal greeting using first and last name\\n\\n
2. Clear summary of strengths relevant to the role\\n\\n
3. Development areas with concrete improvement actions\\n\\n
4. Career guidance, including adjacent or alternative roles if relevant\\n\\n
5. Practical next steps (skills, experience, CV improvements)\\n\\n

Finish ONLY with:
"Best regards."

Tone: professional, motivating, and actionable.

----------------------------------------
CANDIDATE DATA EXTRACTION:
Extract the candidate's first name, last name, email, and phone number from the CV.
If not found, use empty string "".

FINAL REMINDER:
Write EVERYTHING in the same language as the CV.
`;
   

    // === CHECK AI CREDITS BEFORE ANALYSIS ===
    const companySlug = formData.get('companySlug')?.toString();
    console.log('FormData keys:', Array.from(formData.keys()));

    // === Fetch company_id from Supabase ===
    const { data: company, error: companyError } = await supabase
      .from('company')
      .select('id')
      .eq('slug', companySlug)
      .single();

    if (companyError) {
      console.error('Error fetching company_id:', companyError);
      return new Response(JSON.stringify({ error: 'Could not find company.' }), { status: 400 });
    }

    const companyId = company.id;
    console.log('Resolved company_id:', companyId);

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
        candidat_gdpr_consent_date: new Date().toISOString(),
        candidat_ai_consent_date: new Date().toISOString()
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

    // Notify admins and manager of new CV upload
    if (positionData) {
      // Notify all admins
      await notifyAdminsOfNewCV(
        positionId,
        positionData.position_name,
        positionData.company_id.toString()
      );

      // Notify the position manager
      await notifyManagerOfNewCV(
        positionId,
        positionData.position_name,
        positionData.manager_id
      );
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
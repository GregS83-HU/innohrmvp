// src/app/api/analyse-cv/route.ts
// CHANGE FROM ORIGINAL: return candidateId, cvText, and candidateFirstName in the response
// so the client can pass them to the InterviewChat component.
// Search for "// NEW:" comments to find all changes.

export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import parsePdfBuffer from '../../../../lib/parsePdfSafe';
import { createClient } from '@supabase/supabase-js';
import { consumeCredit } from '../../../../lib/credit';
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../lib/prompts';
import { safeErrorInfo } from '../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

async function callOpenRouterAPI(prompt: string, context = '', model = '  ') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

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
        max_tokens: 3000,
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
    console.error(`Error in callOpenRouterAPI for ${context}:`, safeErrorInfo(error));
    throw error;
  }
}

async function callFallbackAPI(prompt: string, context = '') {
  try {
    return await callOpenRouterAPI(prompt, context, 'anthropic/claude-3-haiku');
  } catch {
    return await callOpenRouterAPI(prompt, context, 'mistralai/mistral-small');
  }
}

function extractAndParseJSON(rawResponse: string, context = '') {
  const trimmed = rawResponse.trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const match = trimmed.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  if (!match) {
    // Don't log the full AI response — it's derived from the candidate's CV
    // and the job description, so it can contain candidate-identifying
    // text. A short snippet + length is enough to spot a malformed-output
    // pattern (e.g. the model wrapping JSON in markdown fences); if that's
    // not enough to diagnose a recurring failure, revisit this rather than
    // going back to logging the full text.
    console.error(`No JSON found in ${context} response (length ${rawResponse.length}): "${rawResponse.slice(0, 80)}..."`);
    throw new Error(`No valid JSON found in ${context} response`);
  }

  try {
    return JSON.parse(match[0]);
  } catch (parseError) {
    console.error(
      `Invalid JSON in ${context} response (length ${match[0].length}): "${match[0].slice(0, 80)}..."`,
      parseError instanceof Error ? parseError.message : parseError
    );
    throw new Error(`Invalid JSON structure in ${context} response`);
  }
}

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

    if (!positionId) {
      return NextResponse.json({ error: 'Position ID requis.' }, { status: 400 });
    }

    // Public, unauthenticated endpoint (candidates apply without logging
    // in) - there is no caller identity to check. The fix here is instead:
    // verify positionId refers to a real position at all (previously this
    // was never checked - a bogus positionId still created a candidate and
    // a position_to_candidat row), and derive the company being billed for
    // AI credits from THAT position's own company_id, rather than trusting
    // a separately-supplied companySlug that could name a different
    // company than positionId actually belongs to.
    const { data: positionData, error: positionError } = await supabase
      .from('openedpositions')
      .select('position_name, company_id, manager_id')
      .eq('id', positionId)
      .single();

    if (positionError || !positionData) {
      return NextResponse.json({ error: 'Position introuvable.' }, { status: 404 });
    }

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fullCvText = await parsePdfBuffer(buffer);
    console.log("Parsed CV length:", fullCvText.length);

    const MAX_CV_LENGTH = 8000;
    const cvText = fullCvText.length > MAX_CV_LENGTH
      ? fullCvText.substring(0, MAX_CV_LENGTH) + '...[truncated]'
      : fullCvText;

    const safeFileName = sanitizeFileName(file.name);
    const filePath = `cvs/${Date.now()}_${safeFileName}`;

    const uploadPromise = supabase.storage
      .from('cvs')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

    // companyId comes from the position record fetched above, not from a
    // separately client-supplied companySlug (see comment above).
    const companyId = positionData.company_id;
    console.log('Resolved company_id from position:', companyId);

    const ok = await consumeCredit(companyId);
    if (!ok) {
      return NextResponse.json({ error: 'You have no remaining AI credits this month.' }, { status: 402 });
    }

    console.log('Fetching CV analysis prompt from database...');

    let promptTemplate: string;
    try {
      promptTemplate = await getPrompt('cv_analysis_combined');
    } catch (error) {
      if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
        console.error('Failed to load prompt:', error.message);
        return NextResponse.json({
          error: 'AI tool is currently unavailable. Please try again later.'
        }, { status: 503 });
      }
      throw error;
    }

    const combinedPrompt = fillPromptVariables(promptTemplate, {
      cvText,
      jobDescription
    });

    console.log('Starting combined AI analysis...');

    const rawResponse = await callOpenRouterAPI(combinedPrompt, 'combined analysis')
      .catch(() => callFallbackAPI(combinedPrompt, 'combined analysis'));

    console.log('AI analysis completed');

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

    if (!score || !analysis || !candidateFeedback) {
      throw new Error('Missing required fields in AI response');
    }

    const { error: uploadError } = await uploadPromise;

    if (uploadError) {
      console.error('Supabase upload error:', safeErrorInfo(uploadError));
      return NextResponse.json({ error: 'Échec upload CV' }, { status: 500 });
    }

    const { data: candidate, error: insertError } = await supabase
      .from('candidats')
      .insert({
        candidat_firstname,
        candidat_lastname,
        cv_text: fullCvText,
        cv_file: filePath,
        candidat_email,
        candidat_phone,
        candidat_gdpr_consent_date: new Date().toISOString(),
        candidat_ai_consent_date: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !candidate) {
      console.error('Database insert error:', safeErrorInfo(insertError));
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
      console.error('Relation insert error:', safeErrorInfo(relationError));
      return NextResponse.json({ error: 'Échec liaison position/candidat' }, { status: 500 });
    }

    if (positionData) {
      await notifyAdminsOfNewCV(
        positionId,
        positionData.position_name,
        positionData.company_id.toString()
      );

      await notifyManagerOfNewCV(
        positionId,
        positionData.position_name,
        positionData.manager_id
      );
    }

    return NextResponse.json({
      score,
      analysis,
      candidateFeedback,
      // NEW: return candidate data needed for the interview chat
      candidateId: candidate.id,
      cvText: fullCvText,
      candidateFirstName: candidat_firstname ?? '',
    });

  } catch (aiError: unknown) {
    console.error('AI processing error:', safeErrorInfo(aiError));
    const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI processing error';
    return NextResponse.json({ error: `AI processing failed: ${errorMessage}` }, { status: 500 });
  }
}
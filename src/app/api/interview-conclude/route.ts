// src/app/api/interview-conclude/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { safeErrorInfo } from '../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
}

async function callOpenRouterAPI(prompt: string, model = 'openai/gpt-3.5-turbo') {
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
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`API call failed: ${response.status}`);

    const completion = await response.json();
    return completion.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function extractAndParseJSON(rawResponse: string) {
  const trimmed = rawResponse.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  const match = trimmed.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  if (!match) throw new Error('No valid JSON found in response');

  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const {
      cvText,
      jobDescription,
      positionName,
      conversationHistory,
      candidateId,
      positionId,
      language,
    } = await req.json();

    if (!conversationHistory || !candidateId || !positionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const historyText = (conversationHistory as Message[])
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n');

    const languageInstruction = language
      ? `IMPORTANT: The summary field must be written in this language: ${language}.`
      : '';

    const prompt = `You are a senior HR recruiter evaluating a virtual job interview. Analyze the full conversation and produce a structured assessment.

${languageInstruction}

POSITION: ${positionName}
JOB DESCRIPTION: ${jobDescription}

CANDIDATE CV:
${cvText ? cvText.substring(0, 2000) : 'Not available'}

FULL INTERVIEW CONVERSATION:
${historyText}

TASK: Evaluate the candidate's interview performance and return a JSON object with exactly these fields:
- "score": integer from 1 to 10 (10 = exceptional fit, 1 = very poor fit), based on quality and relevance of answers
- "summary": a professional HR summary paragraph (4-6 sentences) covering: communication quality, relevant experience demonstrated, motivation, key strengths and weaknesses revealed during the interview, and overall recommendation. Write this in the language specified above.

Respond ONLY with valid JSON, no markdown, no backticks, no preamble.
Example: {"score": 7, "summary": "The candidate demonstrated..."}`;

    const rawResponse = await callOpenRouterAPI(prompt)
      .catch(() => callOpenRouterAPI(prompt, 'anthropic/claude-3-haiku'));

    const { score, summary } = extractAndParseJSON(rawResponse);

    if (!score || !summary) {
      throw new Error('Missing score or summary in AI response');
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('position_to_candidat')
      .update({
        interview_score: score,
        interview_summary: summary,
      })
      .eq('candidat_id', candidateId)
      .eq('position_id', positionId);

    if (updateError) {
      console.error('DB update error:', safeErrorInfo(updateError));
      return NextResponse.json({ error: 'Failed to save interview results' }, { status: 500 });
    }

    return NextResponse.json({ score, summary });
  } catch (error) {
    console.error('Interview conclude error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Failed to conclude interview' }, { status: 500 });
  }
}
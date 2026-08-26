// src/app/api/interview-question/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { safeErrorInfo } from '../../../../lib/logSafe';

interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
}

async function callOpenRouterAPI(prompt: string, model = 'openai/gpt-3.5-turbo') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        temperature: 0.7,
        max_tokens: 600,
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

function extractAndParseJSON(raw: string) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, positionName, conversationHistory, questionNumber, language } = await req.json();

    if (!cvText || !jobDescription || questionNumber === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const historyText = (conversationHistory as Message[])
      .map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n');

    const languageInstruction = language
      ? `IMPORTANT: You MUST respond entirely in this language: ${language}. Every field — question and all suggestions — must be in that language.`
      : '';

    const prompt = `You are conducting a professional job interview. Generate question ${questionNumber} out of 10 for this candidate, along with 3 suggested answers they can choose from.

${languageInstruction}

POSITION: ${positionName}
JOB DESCRIPTION: ${jobDescription}

CANDIDATE CV SUMMARY:
${cvText.substring(0, 3000)}

CONVERSATION SO FAR:
${historyText || 'No questions asked yet.'}

INSTRUCTIONS FOR THE QUESTION:
- Tailor it directly to this candidate's CV background and this specific role
- Build naturally on the conversation so far
- Vary question types: behavioral ("Tell me about a time..."), situational ("How would you handle..."), technical, motivational, or competency-based
- Keep it concise, clear, and professional
- Do NOT number it or add preamble like "Question 5:" — just the question itself

INSTRUCTIONS FOR THE 3 SUGGESTED ANSWERS:
- Write exactly 3 answers in first person, as if the candidate is speaking
- Each answer should be 1-3 sentences — substantial but not too long
- They must be specific to the question and the role, NOT generic filler
- Do NOT label them or give any hint about which is good or bad — just write the answer text
- Order them RANDOMLY so the candidate cannot guess which is best by position

The 3 answers must be:
1. THE BEST ANSWER: demonstrates deep understanding, concrete experience, and exactly what a top candidate for this specific role would say. It should be specific, confident, and show real expertise or the right mindset.
2. THE AVERAGE ANSWER: sounds reasonable and professional but is vague, lacks concrete examples, or shows only surface-level understanding. A candidate giving this answer would not be filtered out but would not stand out either.
3. THE WRONG ANSWER: plausible enough that a candidate might genuinely choose it, but reveals a misunderstanding of the role, a red flag attitude, or a significant skills gap. It should NOT be obviously absurd — it should look like something a real but unsuitable candidate would say.

Respond ONLY with valid JSON in this exact format, no markdown, no backticks:
{"question": "...", "suggestions": ["...", "...", "..."]}`;

    const raw = await callOpenRouterAPI(prompt)
      .catch(() => callOpenRouterAPI(prompt, 'anthropic/claude-3-haiku'));

    const parsed = extractAndParseJSON(raw);

    if (!parsed.question || !Array.isArray(parsed.suggestions) || parsed.suggestions.length < 3) {
      throw new Error('Invalid response structure from AI');
    }

    return NextResponse.json({
      question: parsed.question.trim(),
      suggestions: parsed.suggestions.map((s: string) => s.trim()).slice(0, 3),
    });
  } catch (error) {
    console.error('Interview question error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
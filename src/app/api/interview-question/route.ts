// src/app/api/interview-question/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';

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
        max_tokens: 300,
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
      ? `IMPORTANT: You MUST respond in this language: ${language}. Do not use any other language.`
      : '';

    const prompt = `You are conducting a professional job interview. Your task is to generate question number ${questionNumber} out of 10 for a candidate.

${languageInstruction}

POSITION: ${positionName}
JOB DESCRIPTION: ${jobDescription}

CANDIDATE CV SUMMARY:
${cvText.substring(0, 3000)}

CONVERSATION SO FAR:
${historyText || 'No questions asked yet.'}

INSTRUCTIONS:
- Generate ONE single interview question for question ${questionNumber}/10
- The question must be DIRECTLY tailored to this specific candidate's background from their CV and this specific role
- Build naturally on the conversation so far — reference or follow up on previous answers when relevant
- Vary question types across the interview: mix behavioral ("Tell me about a time..."), situational ("How would you handle..."), technical (role-specific knowledge), motivational ("Why..."), and competency-based questions
- Keep it concise, clear, and professional
- Do NOT number the question or add any preamble like "Question 10:" — just write the question itself
- Do NOT add any closing remarks or next steps in the question

Respond with ONLY the question text, nothing else.`;

    const question = await callOpenRouterAPI(prompt)
      .catch(() => callOpenRouterAPI(prompt, 'anthropic/claude-3-haiku'));

    return NextResponse.json({ question: question.trim() });
  } catch (error) {
    console.error('Interview question error:', error);
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
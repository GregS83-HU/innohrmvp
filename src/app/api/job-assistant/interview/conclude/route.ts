import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { safeErrorInfo } from '../../../../../../lib/logSafe';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', hu: 'Hungarian', fr: 'French' };

export async function POST(req: NextRequest) {
  try {
    const { answeredQuestions, jobDescription, roleTitle, cvText, locale = 'en' } = await req.json();
    const language = LANGUAGE_NAMES[locale] || 'English';

    if (!answeredQuestions || answeredQuestions.length === 0) {
      return NextResponse.json({ error: 'Answered questions are required' }, { status: 400 });
    }

    const avgScore = Math.round(
      answeredQuestions.reduce((sum: number, q: { score: number }) => sum + q.score, 0) / answeredQuestions.length
    );

    // Include the already-computed per-question feedback — don't make the model re-infer it
    const questionsContext = answeredQuestions
      .map((q: {
        question: string;
        type: string;
        score: number;
        userAnswer: string;
        feedback: {
          strengths: string[];
          improvements: string[];
          quickFeedback: string;
        };
      }, i: number) => `Q${i + 1} [${q.type}] — Score: ${q.score}/100
Question: ${q.question}
Answer: ${q.userAnswer?.substring(0, 400)}
Coach feedback: ${q.feedback?.quickFeedback || ''}
Strengths shown: ${q.feedback?.strengths?.join('; ') || '—'}
Needs work: ${q.feedback?.improvements?.join('; ') || '—'}`)
      .join('\n\n---\n\n');

    const cvContext = cvText
      ? `CANDIDATE BACKGROUND (from CV):\n${cvText.substring(0, 1200)}`
      : 'CANDIDATE BACKGROUND: Not provided.';

    const prompt = `You are a senior interview coach writing a post-interview coaching report.
IMPORTANT: Write ALL text content in ${language}. Only JSON keys stay in English.

ROLE APPLIED FOR: ${roleTitle}
AVERAGE SCORE: ${avgScore}/100

${cvContext}

JOB REQUIREMENTS:
${jobDescription?.substring(0, 600)}

DETAILED INTERVIEW PERFORMANCE (with per-question coaching notes):
${questionsContext}

Your report must be SPECIFIC to this candidate — reference their actual answers, their background from the CV, 
and the concrete gaps identified in the per-question feedback above. 
Do NOT produce generic advice that could apply to any candidate.

Respond ONLY with valid JSON:
{
  "overallScore": ${avgScore},
  "overallVerdict": "<Strongly Recommend|Recommend|Borderline|Not Recommended in ${language}>",
  "executiveSummary": "<3-4 sentences referencing their specific answers and background in ${language}>",
  "performanceByType": {
    "behavioral": { "avgScore": <0-100>, "comment": "<comment grounded in their actual behavioral answers in ${language}>" },
    "technical": { "avgScore": <0-100>, "comment": "<comment grounded in their actual technical answers in ${language}>" },
    "motivational": { "avgScore": <0-100>, "comment": "<comment grounded in their actual motivational answers in ${language}>" },
    "situational": { "avgScore": <0-100>, "comment": "<comment grounded in their actual situational answers in ${language}>" }
  },
  "topStrengths": ["<specific strength with example from their answers>", "<specific strength>", "<specific strength>"],
  "criticalImprovements": ["<specific gap with reference to which question(s) revealed it>", "<specific gap>", "<specific gap>"],
  "coachingPlan": [
    {
      "area": "<area directly tied to a weakness seen in the interview>",
      "priority": "<High|Medium|Low>",
      "advice": "<advice that references their actual answer patterns in ${language}>",
      "practiceExercise": "<concrete exercise tailored to their specific gaps in ${language}>"
    }
  ],
  "interviewReadiness": "<Not Ready|Needs More Practice|Almost Ready|Ready in ${language}>",
  "encouragingClose": "<2 sentences referencing something specific and positive from their interview in ${language}>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Interview conclude error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Failed to generate coaching report. Please try again.' }, { status: 500 });
  }
}
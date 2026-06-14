import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', hu: 'Hungarian', fr: 'French' };

export async function POST(req: NextRequest) {
  try {
    const { answeredQuestions, jobDescription, roleTitle, locale = 'en' } = await req.json();
    const language = LANGUAGE_NAMES[locale] || 'English';

    if (!answeredQuestions || answeredQuestions.length === 0) {
      return NextResponse.json({ error: 'Answered questions are required' }, { status: 400 });
    }

    const avgScore = Math.round(
      answeredQuestions.reduce((sum: number, q: { score: number }) => sum + q.score, 0) / answeredQuestions.length
    );

    const questionsContext = answeredQuestions
      .map((q: { question: string; type: string; score: number; userAnswer: string }, i: number) =>
        `Q${i + 1} [${q.type}] (Score: ${q.score}/100): ${q.question}\nAnswer: ${q.userAnswer?.substring(0, 200)}`
      )
      .join('\n\n');

    const prompt = `You are a senior interview coach. Provide a comprehensive coaching report for this candidate after their mock interview.

IMPORTANT: Write ALL text content in ${language}. Only JSON keys stay in English.

ROLE APPLIED FOR: ${roleTitle}
AVERAGE INTERVIEW SCORE: ${avgScore}/100

INTERVIEW PERFORMANCE SUMMARY:
${questionsContext}

JOB REQUIREMENTS CONTEXT:
${jobDescription?.substring(0, 800)}

Respond ONLY with a valid JSON object:
{
  "overallScore": ${avgScore},
  "overallVerdict": "<Strongly Recommend|Recommend|Borderline|Not Recommended — translated in ${language}>",
  "executiveSummary": "<3-4 sentences in ${language}>",
  "performanceByType": {
    "behavioral": { "avgScore": <0-100>, "comment": "<1-2 sentences in ${language}>" },
    "technical": { "avgScore": <0-100>, "comment": "<1-2 sentences in ${language}>" },
    "motivational": { "avgScore": <0-100>, "comment": "<1-2 sentences in ${language}>" },
    "situational": { "avgScore": <0-100>, "comment": "<1-2 sentences in ${language}>" }
  },
  "topStrengths": ["<strength 1 in ${language}>", "<strength 2 in ${language}>", "<strength 3 in ${language}>"],
  "criticalImprovements": ["<improvement 1 in ${language}>", "<improvement 2 in ${language}>", "<improvement 3 in ${language}>"],
  "coachingPlan": [
    {
      "area": "<area in ${language}>",
      "priority": "<High|Medium|Low>",
      "advice": "<2-3 sentences in ${language}>",
      "practiceExercise": "<concrete exercise in ${language}>"
    }
  ],
  "interviewReadiness": "<Not Ready|Needs More Practice|Almost Ready|Ready — translated in ${language}>",
  "encouragingClose": "<2 sentences in ${language}>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Interview conclude error:', error);
    return NextResponse.json({ error: 'Failed to generate coaching report. Please try again.' }, { status: 500 });
  }
}
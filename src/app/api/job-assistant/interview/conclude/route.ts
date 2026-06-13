import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { answeredQuestions, jobDescription, roleTitle } = await req.json();

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

ROLE APPLIED FOR: ${roleTitle}
AVERAGE INTERVIEW SCORE: ${avgScore}/100

INTERVIEW PERFORMANCE SUMMARY:
${questionsContext}

JOB REQUIREMENTS CONTEXT:
${jobDescription?.substring(0, 800)}

Respond ONLY with a valid JSON object:
{
  "overallScore": ${avgScore},
  "overallVerdict": "<Strongly Recommend|Recommend|Borderline|Not Recommended>",
  "executiveSummary": "<3-4 sentences overall assessment of interview performance>",
  "performanceByType": {
    "behavioral": { "avgScore": <0-100>, "comment": "<1-2 sentences>" },
    "technical": { "avgScore": <0-100>, "comment": "<1-2 sentences>" },
    "motivational": { "avgScore": <0-100>, "comment": "<1-2 sentences>" },
    "situational": { "avgScore": <0-100>, "comment": "<1-2 sentences>" }
  },
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalImprovements": ["<must-fix area 1>", "<must-fix area 2>", "<must-fix area 3>"],
  "coachingPlan": [
    {
      "area": "<skill or area to develop>",
      "priority": "<High|Medium|Low>",
      "advice": "<specific, actionable advice in 2-3 sentences>",
      "practiceExercise": "<concrete exercise or action they can do this week>"
    }
  ],
  "interviewReadiness": "<Not Ready|Needs More Practice|Almost Ready|Ready>",
  "encouragingClose": "<2 sentences of genuine encouragement tailored to their performance>"
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
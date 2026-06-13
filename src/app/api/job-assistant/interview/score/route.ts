import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question, questionType, idealAnswerPoints, userAnswer, jobDescription } = await req.json();

    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const prompt = `You are an expert interview coach. Score the candidate's answer to this interview question.

QUESTION TYPE: ${questionType}
QUESTION: ${question}
IDEAL ANSWER POINTS: ${idealAnswerPoints?.join(', ')}
JOB CONTEXT: ${jobDescription?.substring(0, 500)}

CANDIDATE'S ANSWER:
${userAnswer}

Respond ONLY with a valid JSON object:
{
  "score": <number 0-100>,
  "scoreLabel": "<Excellent|Good|Average|Needs Improvement|Poor>",
  "strengths": ["<strength of their answer 1>", "<strength 2>"],
  "improvements": ["<what they missed or could improve 1>", "<improvement 2>"],
  "quickFeedback": "<2-3 sentences of direct, constructive feedback on this specific answer>",
  "betterPhrasing": "<1-2 sentences suggesting how they could rephrase a key part of their answer>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Interview score error:', error);
    return NextResponse.json({ error: 'Scoring failed. Please try again.' }, { status: 500 });
  }
}
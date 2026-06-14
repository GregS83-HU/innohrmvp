import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', hu: 'Hungarian', fr: 'French' };

export async function POST(req: NextRequest) {
  try {
    const { question, questionType, idealAnswerPoints, userAnswer, jobDescription, locale = 'en' } = await req.json();
    const language = LANGUAGE_NAMES[locale] || 'English';

    if (!question || !userAnswer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const prompt = `You are an expert interview coach. Score the candidate's answer to this interview question.

IMPORTANT: Write ALL text content (scoreLabel, strengths, improvements, feedback, phrasing) in ${language}. Only JSON keys stay in English.

QUESTION TYPE: ${questionType}
QUESTION: ${question}
IDEAL ANSWER POINTS: ${idealAnswerPoints?.join(', ')}
JOB CONTEXT: ${jobDescription?.substring(0, 500)}

CANDIDATE'S ANSWER:
${userAnswer}

Respond ONLY with a valid JSON object:
{
  "score": <number 0-100>,
  "scoreLabel": "<Excellent|Good|Average|Needs Improvement|Poor — translated in ${language}>",
  "strengths": ["<strength 1 in ${language}>", "<strength 2 in ${language}>"],
  "improvements": ["<improvement 1 in ${language}>", "<improvement 2 in ${language}>"],
  "quickFeedback": "<2-3 sentences of direct constructive feedback in ${language}>",
  "betterPhrasing": "<1-2 sentences suggesting better phrasing in ${language}>"
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
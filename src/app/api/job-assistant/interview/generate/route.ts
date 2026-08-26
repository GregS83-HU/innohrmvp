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
    const { cvText, jobDescription, locale = 'en' } = await req.json();
    const language = LANGUAGE_NAMES[locale] || 'English';

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV and job description are required' }, { status: 400 });
    }

    const prompt = `You are a senior hiring manager conducting a job interview. Based on the candidate's CV and the job description, generate exactly 10 interview questions.

Mix question types:
- 3 behavioral questions (past experience, "Tell me about a time...")
- 3 technical/skills questions specific to the role
- 2 motivational questions (why this role, career goals)
- 2 situational questions ("How would you handle...")

IMPORTANT: Write ALL text content (questions, assessments, answer points, suggested answers, tips) in ${language}. Only JSON keys stay in English.

CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with a valid JSON object in this exact format:
{
  "questions": [
    {
      "id": 1,
      "type": "<behavioral|technical|motivational|situational>",
      "question": "<the interview question in ${language}>",
      "whatWeAssess": "<1 sentence in ${language}: what this question evaluates>",
      "idealAnswerPoints": ["<key point 1 in ${language}>", "<key point 2 in ${language}>", "<key point 3 in ${language}>"],
      "suggestedAnswer": "<a strong sample answer in ${language} of 3-4 sentences>"
    }
  ],
  "roleTitle": "<extracted job title from the job description>",
  "interviewTips": ["<tip 1 in ${language}>", "<tip 2 in ${language}>", "<tip 3 in ${language}>"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Interview generate error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Failed to generate interview questions. Please try again.' }, { status: 500 });
  }
}
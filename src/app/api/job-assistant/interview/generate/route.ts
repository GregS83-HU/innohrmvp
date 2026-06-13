import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription } = await req.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV and job description are required' }, { status: 400 });
    }

    const prompt = `You are a senior hiring manager conducting a job interview. Based on the candidate's CV and the job description, generate exactly 10 interview questions.

Mix question types:
- 3 behavioral questions (past experience, "Tell me about a time...")
- 3 technical/skills questions specific to the role
- 2 motivational questions (why this role, career goals)
- 2 situational questions ("How would you handle...")

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
      "question": "<the interview question>",
      "whatWeAssess": "<1 sentence: what this question evaluates>",
      "idealAnswerPoints": ["<key point 1>", "<key point 2>", "<key point 3>"],
      "suggestedAnswer": "<a strong sample answer of 3-4 sentences that the candidate could use as inspiration>"
    }
  ],
  "roleTitle": "<extracted job title from the job description>",
  "interviewTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
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

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Interview generate error:', error);
    return NextResponse.json({ error: 'Failed to generate interview questions. Please try again.' }, { status: 500 });
  }
}
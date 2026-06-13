import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cvFile = formData.get('cv') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;

    if (!cvFile || !jobDescription) {
      return NextResponse.json({ error: 'CV file and job description are required' }, { status: 400 });
    }

    // Parse PDF
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const cvText = pdfData.text;

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF. Please ensure the CV is not scanned.' }, { status: 400 });
    }

    const prompt = `You are an expert HR consultant and career coach. Analyze this CV against the job description and provide a detailed assessment.

CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with a valid JSON object in this exact format:
{
  "overallScore": <number 0-100>,
  "cvText": "<the full extracted CV text, preserving structure>",
  "breakdown": {
    "skillsMatch": { "score": <0-100>, "comment": "<2 sentences>" },
    "experienceMatch": { "score": <0-100>, "comment": "<2 sentences>" },
    "educationMatch": { "score": <0-100>, "comment": "<2 sentences>" },
    "keywordsMatch": { "score": <0-100>, "comment": "<2 sentences>" },
    "overallPresentation": { "score": <0-100>, "comment": "<2 sentences>" }
  },
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "topGaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "summary": "<3-4 sentence overall assessment>"
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

    const result = JSON.parse(jsonMatch[0]);
    result.cvText = cvText; // Always use the real parsed text

    return NextResponse.json(result);
  } catch (error) {
    console.error('Job assistant analyze error:', error);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
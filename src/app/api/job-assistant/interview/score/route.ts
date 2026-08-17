import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hu: 'Hungarian',
  fr: 'French',
};

export async function POST(req: NextRequest) {
  try {
    const {
      question,
      questionType,
      idealAnswerPoints,
      userAnswer,
      jobDescription,
      cvSummary,        // ← NEW: parsed CV data (skills, experience, etc.)
      locale = 'en',
    } = await req.json();

    const language = LANGUAGE_NAMES[locale] || 'English';

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Build CV context block — only injected if available
    const cvContext = cvSummary
      ? `
CANDIDATE PROFILE (from their CV):
- Skills: ${cvSummary.skills?.join(', ') || 'Not provided'}
- Years of experience: ${cvSummary.yearsOfExperience || 'Unknown'}
- Most recent role: ${cvSummary.mostRecentRole || 'Unknown'}
- Key achievements: ${cvSummary.keyAchievements?.join('; ') || 'None listed'}
- Education: ${cvSummary.education || 'Not provided'}

Use this profile to:
1. Identify which of their real experiences they FAILED to mention in their answer
2. Make the "betterPhrasing" example reference their ACTUAL background (not a generic answer)
3. Point out missed opportunities to leverage their specific strengths`
      : `CANDIDATE PROFILE: Not provided. Give general coaching advice.`;

    // Format ideal points as a numbered list so the model weighs them properly
    const idealPointsFormatted = idealAnswerPoints?.length
      ? idealAnswerPoints
          .map((point: string, i: number) => `  ${i + 1}. ${point}`)
          .join('\n')
      : '  (No ideal points provided — use your judgment for this question type)';

    const prompt = `You are an expert interview coach evaluating a ${questionType} interview question.
Write ALL text in ${language}. Only JSON keys stay in English.

━━━ CONTEXT ━━━
QUESTION: ${question}
QUESTION TYPE: ${questionType}

WHAT A STRONG ANSWER LOOKS LIKE (ideal points):
${idealPointsFormatted}

JOB DESCRIPTION (excerpt):
${jobDescription?.substring(0, 600) || 'Not provided'}

${cvContext}

━━━ CANDIDATE'S ANSWER ━━━
${userAnswer}

━━━ SCORING INSTRUCTIONS ━━━
Score how well the answer covers the ideal points above.
- "strengths": what they DID cover well from the ideal points
- "improvements": which ideal points are MISSING or underdeveloped
- "quickFeedback": direct 2-3 sentence coach note referencing the ideal points gap
- "betterPhrasing": rewrite their answer to be stronger — it MUST:
    • Cover the same ground as the ideal points
    • If CV data is available, incorporate their specific background/achievements
    • Match the level of specificity of the ideal points (if ideal points are generic, be generic; if detailed, be detailed)
    • Sound natural for the candidate, not like a template

Respond ONLY with valid JSON:
{
  "score": <0-100>,
  "scoreLabel": "<Excellent|Good|Average|Needs Improvement|Poor in ${language}>",
  "strengths": ["<what they covered from ideal points>"],
  "improvements": ["<which ideal points are missing or weak>"],
  "quickFeedback": "<2-3 sentences referencing the ideal points gap in ${language}>",
  "betterPhrasing": "<rewritten answer aligned with ideal points, using their CV background if available, in ${language}>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini', // upgraded from gpt-3.5-turbo
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }, // enforces valid JSON output
    });

    const raw = completion.choices[0]?.message?.content || '';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback regex for models that ignore response_format
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: 'Failed to parse AI response' },
          { status: 500 }
        );
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Interview score error:', error);
    return NextResponse.json(
      { error: 'Scoring failed. Please try again.' },
      { status: 500 }
    );
  }
}
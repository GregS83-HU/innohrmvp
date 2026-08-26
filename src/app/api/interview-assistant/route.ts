import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPrompts, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../lib/prompts'
import { safeErrorInfo } from '../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Language mapping for AI prompts
const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'French',
  hu: 'Hungarian',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ro: 'Romanian',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, candidat_id, position_id, interview_id, notes, locale = 'en' } = body

    // Get the language name for the AI prompt
    const languageName = languageNames[locale] || 'English'

    const { data: candidat, error: candErr } = await supabase
      .from('candidats')
      .select('cv_text, candidat_firstname, candidat_lastname')
      .eq('id', candidat_id)
      .single()

    if (candErr || !candidat) {
      console.error('[Interview Assistant] Candidate not found', safeErrorInfo(candErr))
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const { data: position, error: posErr } = await supabase
      .from('openedpositions')
      .select('position_description, position_description_detailed')
      .eq('id', position_id)
      .single()

    if (posErr || !position) {
      console.error('[Interview Assistant] Position not found', posErr)
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Fetch recruitment step
    const { data: positionCandidat, error: pcErr } = await supabase
      .from('position_to_candidat')
      .select('candidat_next_step')
      .eq('position_id', position_id)
      .eq('candidat_id', candidat_id)
      .single()

    if (pcErr || !positionCandidat || !positionCandidat.candidat_next_step) {
      console.error('[Interview Assistant] Recruitment step not found', safeErrorInfo(pcErr))
      return NextResponse.json({ error: 'Recruitment step not found' }, { status: 404 })
    }

    const { data: recruitmentStep, error: stepErr } = await supabase
      .from('recruitment_steps')
      .select('step_name')
      .eq('id', positionCandidat.candidat_next_step)
      .single()

    if (stepErr || !recruitmentStep) {
      console.error('[Interview Assistant] Step name not found', stepErr)
      return NextResponse.json({ error: 'Step name not found' }, { status: 404 })
    }

    let prompt = ''
    let aiMode = ''
    let promptName = ''

    // Determine which prompt to use
    if (mode === 'questions') {
      aiMode = 'questions'
      promptName = 'interview_questions_generation'
    } else if (mode === 'summary') {
      aiMode = 'summary'
      promptName = 'interview_summary_generation'
    } else {
      console.error('[Interview Assistant] Invalid mode:', mode)
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Fetch prompt from database
    try {
      const promptTemplate = await getPrompts([promptName]);
      const template = promptTemplate[promptName];
      
      const candidateName = `${candidat.candidat_firstname} ${candidat.candidat_lastname}`;
      const jobDescription = position.position_description_detailed || position.position_description;
      
      if (mode === 'questions') {
        prompt = fillPromptVariables(template, {
          languageName,
          candidateName,
          cvText: candidat.cv_text,
          jobDescription,
          stepName: recruitmentStep.step_name
        });
      } else if (mode === 'summary') {
        prompt = fillPromptVariables(template, {
          languageName,
          candidateName,
          cvText: candidat.cv_text,
          jobDescription,
          stepName: recruitmentStep.step_name,
          notes: notes || ''
        });
      }
    } catch (error) {
      if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
        console.error('[Interview Assistant] Failed to load prompt:', error.message);
        return NextResponse.json({ 
          error: 'AI tool is currently unavailable. Please try again later.' 
        }, { status: 503 });
      }
      throw error;
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid AI output')

    const parsed = JSON.parse(match[0])

    // Save results to the specific interview
    if (aiMode === 'questions') {
      await supabase
        .from('interviews')
        .update({ questions: parsed })
        .eq('id', interview_id)
    } else if (aiMode === 'summary') {
      await supabase
        .from('interviews')
        .update({ 
          notes, 
          summary: parsed 
        })
        .eq('id', interview_id)
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[Interview Assistant] Error occurred:', safeErrorInfo(error))
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
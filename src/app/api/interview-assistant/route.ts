import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      console.error('[Interview Assistant] Candidate not found', candErr)
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
      console.error('[Interview Assistant] Recruitment step not found', pcErr)
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

    if (mode === 'questions') {
      aiMode = 'questions'
      prompt = `
You are an HR expert preparing a job interview.

IMPORTANT: Generate all content in ${languageName}. All questions must be in ${languageName}.

Candidate: ${candidat.candidat_firstname} ${candidat.candidat_lastname}

CV:
${candidat.cv_text}

Job:
${position.position_description_detailed}

Current recruitment step: ${recruitmentStep.step_name}

Generate 6–8 precise, role-specific questions tailored for the "${recruitmentStep.step_name}" stage.
Return ONLY valid JSON in this exact format (with all text in ${languageName}):
{
  "questions": [
    { "category": "technical", "text": "..." },
    { "category": "behavioral", "text": "..." }
  ]
}
`
    } else if (mode === 'summary') {
      aiMode = 'summary'
      prompt = `
You are an HR assistant.

IMPORTANT: Generate all content in ${languageName}. The entire summary, strengths, weaknesses, cultural fit assessment, and recommendations must be in ${languageName}.

Candidate: ${candidat.candidat_firstname} ${candidat.candidat_lastname}

CV:
${candidat.cv_text}

Job:
${position.position_description_detailed}

Current recruitment step: ${recruitmentStep.step_name}

Recruiter notes:
${notes}

Generate a structured interview summary for the "${recruitmentStep.step_name}" stage and recommend the next step.
Return ONLY valid JSON in this exact format (with all text in ${languageName} including the category titles):
{
  "summary": "detailed summary in ${languageName}",
  "strengths": ["strength 1 in ${languageName}", "strength 2 in ${languageName}"],
  "weaknesses": ["weakness 1 in ${languageName}", "weakness 2 in ${languageName}"],
  "cultural_fit": "cultural fit assessment in ${languageName}",
  "recommendation": "recommendation in ${languageName}",
  "next_step_recommendation": "next step recommendation in ${languageName}",
  "score": number
}
`
    } else {
      console.error('[Interview Assistant] Invalid mode:', mode)
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
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
    console.error('[Interview Assistant] Error occurred:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, candidat_id, position_id, interview_id, notes } = body

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

    let prompt = ''
    let aiMode = ''

    if (mode === 'questions') {
      aiMode = 'questions'
      prompt = `
You are an HR expert preparing a job interview.

CV:
${candidat.cv_text}

Job:
${position.position_description_detailed}

Generate 6–8 precise, role-specific questions in JSON:
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

CV:
${candidat.cv_text}

Job:
${position.position_description_detailed}

Recruiter notes:
${notes}

Generate a structured interview summary:
{
  "summary": string,
  "strengths": [string],
  "weaknesses": [string],
  "cultural_fit": string,
  "recommendation": string,
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
      // Update the specific interview with questions
      await supabase
        .from('interviews')
        .update({ questions: parsed })
        .eq('id', interview_id)
    } else if (aiMode === 'summary') {
      // Update the specific interview with notes and summary
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
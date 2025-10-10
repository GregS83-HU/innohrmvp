import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const candidat_id = searchParams.get('candidat_id')
  if (!candidat_id) return NextResponse.json([], { status: 200 })

  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('candidat_id', candidat_id)
    .order('interview_datetime', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { position_id, candidat_id, recruiter_id, interview_datetime, duration_minutes, location } = body

    console.log('[Planning API] Incoming body:', body)

    const { data, error } = await supabase
      .from('interviews')
      .insert([{ position_id, candidat_id, recruiter_id, interview_datetime, duration_minutes, location }])
      .select()
      .single()

    if (error) {
      console.error('[Planning API] Supabase insert error:', error)
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }

    console.log('[Planning API] Inserted interview:', data)
    return NextResponse.json(data)

  } catch (err: unknown) {
    console.error('[Planning API] Exception:', err)
    
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status, notes, ai_summary } = body

    const { data, error } = await supabase
      .from('interviews')
      .update({ status, notes, ai_summary })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)

  } catch (err: unknown) {
    console.error('[Planning API] PATCH Exception:', err)
    
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
    }
  }
}

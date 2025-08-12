import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { candidat_id, comment } = await request.json()

  if (!candidat_id) {
    return NextResponse.json({ error: 'Missing candidat_id' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('position_to_candidat')
    .update({ candidat_comment: comment })
    .eq('candidat_id', candidat_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Comment updated successfully' })
}

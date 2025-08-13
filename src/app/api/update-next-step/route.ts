import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { candidat_id, step_name } = await request.json()

    if (!candidat_id) {
      return NextResponse.json({ error: 'candidat_id manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('position_to_candidat')
      .update({ candidat_next_step: step_name === '' ? null : step_name })
      .eq('candidat_id', candidat_id)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mise à jour réussie' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

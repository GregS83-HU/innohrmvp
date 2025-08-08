// src/app/api/stats/[positionId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // On utilise la service key pour lecture complète
)

export async function GET(
  request: Request,
  { params }: { params: { positionId: string } }
) {
  const { positionId } = params

  const { data, error } = await supabase
    .from('position_to_candidate')
    .select(`
      score,
      candidats (
        firstname,
        lastname,
        cv
      )
    `)
    .eq('position_id', positionId)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur récupération stats' }, { status: 500 })
  }

  return NextResponse.json({ candidates: data })
}
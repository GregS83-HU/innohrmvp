// src/app/api/stats/[positionId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // On utilise la service key pour lecture complète
)

/*
export async function GET(
  request: Request,
  { params }: { params: { positionId: string } }
) {
  const { positionId } = params */

  export async function GET(request: Request) {
  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const positionId = segments[segments.length - 1]

  if (!positionId) {
    return NextResponse.json({ error: 'Position ID manquant' }, { status: 400 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { data: position, error: positionError } = await supabase
    .from('openedpositions')
    .select('company_id')
    .eq('id', positionId)
    .single()

  if (positionError || !position) {
    return NextResponse.json({ error: 'Position not found' }, { status: 404 })
  }

  const { data: membership, error: membershipError } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('company_id', position.company_id)
    .single()

  if (membershipError || !membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_ai_analyse,
      source,
      candidat_id,
      candidat_comment,
      candidat_next_step,
      source,
      candidats (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file, 
        created_at
      )
    `)
    .eq('position_id', positionId)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur récupération stats' }, { status: 500 })
  }

  return NextResponse.json({ candidates: data })
}
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') // Doit matcher ton param dans l'URL

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = createServerComponentClient({ cookies: () => cookies() })

  // Récupérer le company_id de l'utilisateur
  const { data: companyLink, error: errorCompany } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single() // on attend un seul enregistrement

  if (errorCompany) {
    return NextResponse.json({ error: errorCompany.message }, { status: 500 })
  }

  if (!companyLink) {
    return NextResponse.json({ positions: [] })
  }

  // Récupérer les positions liées à cette compagnie
  const { data: positions, error: errorPositions } = await supabase
    .from('openedpositions')
    .select(`*, company:company_id (company_logo)`)
    .eq('company_id', companyLink.company_id)

  if (errorPositions) {
    return NextResponse.json({ error: errorPositions.message }, { status: 500 })
  }

  return NextResponse.json({ positions: positions || [] })
}

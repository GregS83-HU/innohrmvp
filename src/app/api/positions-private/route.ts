import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
 
  
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const now = new Date().toISOString()

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = createServerComponentClient({ cookies: () => cookies() })

  // Get the user's company_id
  const { data: companyLink, error: errorCompany } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single()

  console.log('🏢 Company Link:', companyLink)

  if (errorCompany) {
    return NextResponse.json({ error: errorCompany.message }, { status: 500 })
  }

  if (!companyLink) {
    return NextResponse.json({ positions: [] })
  }

  // Get the user's role from users table
  const { data: userData, error: errorUser } = await supabase
    .from('users')
    .select('is_manager, is_admin')
    .eq('id', userId)
    .single()

  console.log('👔 User Data:', userData)

  if (errorUser) {
    return NextResponse.json({ error: errorUser.message }, { status: 500 })
  }

  // Build the query - IMPORTANT: Inclure manager_id dans le select
  const query = supabase
    .from('openedpositions')
    .select(`
      *,
      manager_id,
      company:company_id (company_logo, company_name, slug)
    `)
    .eq('company_id', companyLink.company_id)
    .or(`position_end_date.is.null,position_end_date.gt.${now}`)

  console.log('🔍 Is Manager:', userData.is_manager)
  console.log('🔍 Is Admin:', userData.is_admin)

  // Managers voient TOUTES les positions de leur company (pas de filtre)
  // Ils verront différents boutons selon qu'ils soient assignés ou non
  
  const { data: positions, error: errorPositions } = await query

  console.log('📊 Positions found:', positions?.length || 0)
  
  if (positions && positions.length > 0) {
    console.log('🔍 First position sample:', {
      id: positions[0].id,
      position_name: positions[0].position_name,
      manager_id: positions[0].manager_id
    })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (errorPositions) {
    return NextResponse.json({ error: errorPositions.message }, { status: 500 })
  }

  return NextResponse.json({ positions: positions || [] })
}
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

  if (errorUser) {
    return NextResponse.json({ error: errorUser.message }, { status: 500 })
  }

  // Build the query
  let query = supabase
    .from('openedpositions')
    .select(`*, company:company_id (company_logo, company_name, slug)`)
    .eq('company_id', companyLink.company_id)
    .or(`position_end_date.is.null,position_end_date.gt.${now}`)

  // If user is a manager (but not an admin), filter by manager_id
  if (userData.is_manager && !userData.is_admin) {
    query = query.eq('manager_id', userId)
  }

  // If user is admin or regular user, they see all positions from their company
  // (no additional filtering needed)

  const { data: positions, error: errorPositions } = await query

  if (errorPositions) {
    return NextResponse.json({ error: errorPositions.message }, { status: 500 })
  }

  return NextResponse.json({ positions: positions || [] })
}
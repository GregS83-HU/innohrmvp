import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  console.log("Public GET start")
  const { data, error } = await supabase
    .from('openedpositions')
    .select(`*, company:company_id (company_logo)`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ positions: data || [] })
}

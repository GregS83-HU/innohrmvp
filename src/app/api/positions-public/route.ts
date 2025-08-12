import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const now = new Date().toISOString();

  const { data, error } = await supabase
  .from('openedpositions')
  .select(`*, company:company_id (company_logo)`)
  .or(`position_end_date.is.null,position_end_date.gt.${now}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ positions: data || [] })
}

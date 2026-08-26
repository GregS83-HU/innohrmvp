import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { requireCompanyMemberSession } from '../../../../lib/authz'
import { safeErrorInfo } from '../../../../lib/logSafe';

export async function POST(request: Request) {
  try {
    const { positionId } = await request.json()

    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Defense-in-depth: this route previously relied entirely on the
    // "Company members can update own positions" RLS policy (see
    // supabase/migrations/20260801000000_secure_openedpositions_rls.sql).
    // This app-level check mirrors that same policy's predicate so the
    // route is no longer a single point of failure if it's ever switched to
    // a service-role client (which bypasses RLS) — the RLS policy itself is
    // untouched and still the enforcing layer underneath.
    const { data: position, error: positionLookupError } = await supabase
      .from('openedpositions')
      .select('company_id')
      .eq('id', positionId)
      .single()

    if (positionLookupError || !position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    const authCheck = await requireCompanyMemberSession(supabase, position.company_id)
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    console.log("ID to close:",positionId)

    const {data, error } = await supabase
      .from('openedpositions')
      .update({ position_end_date: new Date().toISOString() })
      .eq('id', positionId)
      .select();

    if (error) {
      console.error('Supabase update error:', safeErrorInfo(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Rows updated count:", data?.length ?? 0)

    return NextResponse.json({ message: 'Position closed' })
  } catch (error) {
    console.error('Unexpected error:', safeErrorInfo(error))
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
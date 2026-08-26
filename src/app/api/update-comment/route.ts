import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { requireCompanyMemberSession } from '../../../../lib/authz'

export async function POST(request: Request) {
  const { candidat_id, comment } = await request.json()

  if (!candidat_id) {
    return NextResponse.json({ error: 'Missing candidat_id' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Defense-in-depth: this route previously relied entirely on the
  // "Company members can update own position candidates" RLS policy (see
  // supabase/migrations/20260731103500_secure_candidates_rls.sql). This
  // app-level check mirrors that same policy's predicate — does at least
  // one position linking to this candidate belong to the caller's own
  // company — so the route is no longer a single point of failure if it's
  // ever switched to a service-role client. The RLS policy itself is
  // untouched and still the enforcing layer underneath.
  const authCheck = await requireCompanyMemberSession(supabase)
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  const { data: links, error: linksError } = await supabase
    .from('position_to_candidat')
    .select('candidat_id, openedpositions!inner(company_id)')
    .eq('candidat_id', candidat_id)
    .eq('openedpositions.company_id', authCheck.companyId)

  if (linksError) {
    return NextResponse.json({ error: linksError.message }, { status: 500 })
  }
  if (!links || links.length === 0) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { error } = await supabase
    .from('position_to_candidat')
    .update({ candidat_comment: comment })
    .eq('candidat_id', candidat_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Comment updated successfully' })
}

import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { requireCompanyMemberSession } from '../../../../lib/authz'
import { safeErrorInfo } from '../../../../lib/logSafe';

export async function POST(request: Request) {
  try {
    const { candidat_id, step_id } = await request.json()  // Changed from step_name to step_id

    if (!candidat_id) {
      return NextResponse.json({ error: 'candidat_id manquant' }, { status: 400 })
    }

    const supabase = createServerClient()

    // This route previously used the service-role client with no auth check
    // of any kind - unlike its sibling update-comment/route.ts, which at
    // least inherited RLS protection via the cookie-scoped client, this one
    // had none at all (service-role bypasses RLS entirely). Now uses the
    // cookie-scoped client (so the "Company members can update own position
    // candidates" RLS policy applies) plus an explicit app-level check
    // mirroring that same policy, matching update-comment's pattern exactly.
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
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }
    if (!links || links.length === 0) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { error } = await supabase
      .from('position_to_candidat')
      .update({ candidat_next_step: step_id === null ? null : step_id })  // Use step_id instead
      .eq('candidat_id', candidat_id)

    if (error) {
      console.error('Erreur mise à jour:', safeErrorInfo(error))
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mise à jour réussie' })
  } catch (e) {
    console.error('Erreur serveur:', safeErrorInfo(e))
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
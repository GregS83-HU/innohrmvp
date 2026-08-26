// Server-side entry point for creating a leave request. Absences has no
// other API route - the rest of the module reads/updates leave_requests
// directly from the client against RLS - but plan gating needs a real
// server-side check, so leave-request *creation* specifically goes through
// this route instead of a direct client insert. See MODULE_GATING_FIX.md.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasFeatureAccess, entitlementErrorBody, resolveCompanyIdForUser } from '../../../../../lib/entitlements';
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, leave_type_id, start_date, end_date, total_days, reason, manager_id } = body as {
      user_id?: string;
      leave_type_id?: string;
      start_date?: string;
      end_date?: string;
      total_days?: number;
      reason?: string;
      manager_id?: string | null;
    };

    if (!user_id || !leave_type_id || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const companyId = await resolveCompanyIdForUser(user_id);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found for this user' }, { status: 400 });
    }

    const entitlement = await hasFeatureAccess(companyId, 'absences.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('absences.use', entitlement), { status: 403 });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        reason,
        manager_id: manager_id ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Leave request creation error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Lightweight status endpoint for the client-side locked/hidden UI split
// used by the payroll/attendance/absences/performance pages and the
// dashboard nav grid. Not itself an enforcement point - the real
// enforcement is server-side in each write route (see MODULE_GATING_FIX.md).
// This just tells the UI what to show.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasFeatureAccess } from '../../../../../lib/entitlements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: companyLink, error: companyLinkError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (companyLinkError || !companyLink) {
      return NextResponse.json({ error: 'Company not found for this user' }, { status: 404 });
    }

    const [payroll, performance, companyRow] = await Promise.all([
      hasFeatureAccess(companyLink.company_id, 'payroll.use'),
      hasFeatureAccess(companyLink.company_id, 'performance.use'),
      supabase.from('company').select('onboarding_completed').eq('id', companyLink.company_id).single(),
    ]);

    return NextResponse.json({
      isAdmin: !!userData.is_admin,
      companyId: companyLink.company_id,
      plan: payroll.plan ?? performance.plan ?? null,
      // These already fold in the onboarding gate (hasFeatureAccess checks
      // it first) - a company that's on Momentum/Infinity but not yet
      // onboarded gets `false` here just like a company on Free would.
      // `onboardingCompleted` is exposed separately so the UI can tell
      // "not in your plan" apart from "not onboarded yet" for messaging.
      payrollAttendanceAbsencesEnabled: payroll.allowed,
      performanceEnabled: performance.allowed,
      onboardingCompleted: !!companyRow.data?.onboarding_completed,
    });
  } catch (error) {
    console.error('Entitlement status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { UpdateAllowanceRequest } from '../../../../../../types/payroll';
import { hasFeatureAccess, entitlementErrorBody, resolveCompanyIdForUser } from '../../../../../../lib/entitlements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !error && data?.is_admin;
}

/**
 * PUT /api/payroll/allowances/[id]
 */
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const currentUserId = url.searchParams.get('current_user_id');
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    if (!(await isAdmin(currentUserId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const companyId = await resolveCompanyIdForUser(currentUserId);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 });
    }
    const entitlement = await hasFeatureAccess(companyId, 'payroll.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('payroll.use', entitlement), { status: 403 });
    }

    const pathSegments = url.pathname.split('/');
    const allowanceId = pathSegments[pathSegments.length - 1];

    const body: UpdateAllowanceRequest = await req.json();

    const { data, error } = await supabase
      .from('employee_allowances')
      .update(body)
      .eq('id', allowanceId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Allowance updated successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/payroll/allowances/[id]
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const currentUserId = url.searchParams.get('current_user_id');
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    if (!(await isAdmin(currentUserId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const companyId = await resolveCompanyIdForUser(currentUserId);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 });
    }
    const entitlement = await hasFeatureAccess(companyId, 'payroll.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('payroll.use', entitlement), { status: 403 });
    }

    const pathSegments = url.pathname.split('/');
    const allowanceId = pathSegments[pathSegments.length - 1];

    const { error } = await supabase
      .from('employee_allowances')
      .delete()
      .eq('id', allowanceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Allowance deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

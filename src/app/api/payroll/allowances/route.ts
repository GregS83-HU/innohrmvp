// src/app/api/payroll/allowances/route.ts
// GET: Get allowances for a payroll record
// POST: Create new allowance

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateAllowanceRequest } from '../../../../../types/payroll';
import { hasFeatureAccess, entitlementErrorBody, resolveCompanyIdForUser } from '../../../../../lib/entitlements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payroll/allowances?payroll_id=xxx
 * Get allowances for a payroll record
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payrollId = searchParams.get('payroll_id');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!payrollId) {
      return NextResponse.json(
        { error: 'payroll_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('employee_allowances')
      .select('*')
      .eq('payroll_id', payrollId)
      .order('created_at', { ascending: false });

    // Filter by period if specified
    if (year && month) {
      query = query.or(
        `is_recurring.eq.true,and(effective_year.eq.${year},effective_month.eq.${month})`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching allowances:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/payroll/allowances
 * Create new allowance
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('current_user_id');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'current_user_id is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', currentUserId)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const companyId = await resolveCompanyIdForUser(currentUserId);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 });
    }
    const entitlement = await hasFeatureAccess(companyId, 'payroll.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('payroll.use', entitlement), { status: 403 });
    }

    const body: CreateAllowanceRequest = await request.json();

    // Validate required fields
    if (!body.payroll_id || !body.allowance_type || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: payroll_id, allowance_type, amount' },
        { status: 400 }
      );
    }

    // Validate amount
    if (body.amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Create allowance
    const { data, error } = await supabase
      .from('employee_allowances')
      .insert({
        ...body,
        currency: body.currency || 'HUF',
        tax_treatment: body.tax_treatment || 'fully_taxable',
        is_recurring: body.is_recurring || false,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating allowance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Allowance created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
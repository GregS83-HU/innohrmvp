// src/app/api/payroll/periods/close/route.ts
// POST: Close a payroll period
// PUT: Reopen a closed period

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { hasFeatureAccess, entitlementErrorBody, resolveCompanyIdForUser } from '../../../../../../lib/entitlements';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payroll/periods/close
 * Close a payroll period (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country_code, year, month, closed_by, closed_reason, last_export_id } = body;

    // Validate required fields
    if (!country_code || !year || !month || !closed_by) {
      return NextResponse.json(
        { error: 'Missing required fields: country_code, year, month, closed_by' },
        { status: 400 }
      );
    }

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', closed_by)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const companyId = await resolveCompanyIdForUser(closed_by);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 });
    }
    const entitlement = await hasFeatureAccess(companyId, 'payroll.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('payroll.use', entitlement), { status: 403 });
    }

    // Check if period is already closed
    const { data: existingClosure } = await supabase
      .from('payroll_period_closures')
      .select('*')
      .eq('country_code', country_code)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existingClosure && existingClosure.status === 'closed') {
      return NextResponse.json(
        { error: 'This period is already closed' },
        { status: 400 }
      );
    }

    // Close the period
    const closureData = {
      country_code,
      year,
      month,
      status: 'closed',
      closed_at: new Date().toISOString(),
      closed_by,
      closed_reason: closed_reason || `${getMonthName(month)} ${year} payroll finalized`,
      last_export_id: last_export_id || null,
    };

    let result;
    if (existingClosure) {
      // Update existing record
      const { data, error } = await supabase
        .from('payroll_period_closures')
        .update(closureData)
        .eq('id', existingClosure.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating period closure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('payroll_period_closures')
        .insert(closureData)
        .select()
        .single();

      if (error) {
        console.error('Error creating period closure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: `Period ${getMonthName(month)} ${year} has been closed`,
      data: result,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/payroll/periods/close
 * Reopen a closed payroll period (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { country_code, year, month, reopened_by, reopen_reason } = body;

    // Validate required fields
    if (!country_code || !year || !month || !reopened_by || !reopen_reason) {
      return NextResponse.json(
        { error: 'Missing required fields: country_code, year, month, reopened_by, reopen_reason' },
        { status: 400 }
      );
    }

    // Validate reopen reason
    if (reopen_reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reopen reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', reopened_by)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const companyId = await resolveCompanyIdForUser(reopened_by);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 });
    }
    const entitlement = await hasFeatureAccess(companyId, 'payroll.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('payroll.use', entitlement), { status: 403 });
    }

    // Check if period exists and is closed
    const { data: existingClosure, error: fetchError } = await supabase
      .from('payroll_period_closures')
      .select('*')
      .eq('country_code', country_code)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (fetchError || !existingClosure) {
      return NextResponse.json(
        { error: 'No closure record found for this period' },
        { status: 404 }
      );
    }

    if (existingClosure.status !== 'closed') {
      return NextResponse.json(
        { error: 'This period is not closed' },
        { status: 400 }
      );
    }

    // Reopen the period
    const { data, error } = await supabase
      .from('payroll_period_closures')
      .update({
        status: 'reopened',
        reopened_at: new Date().toISOString(),
        reopened_by,
        reopen_reason,
      })
      .eq('id', existingClosure.id)
      .select()
      .single();

    if (error) {
      console.error('Error reopening period:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Period ${getMonthName(month)} ${year} has been reopened`,
      data,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}
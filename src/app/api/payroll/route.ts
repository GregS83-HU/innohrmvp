// src/app/api/payroll/route.ts
// GET: List all payroll records
// POST: Create new payroll record

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreatePayrollRequest, EmployeePayroll } from '../../../../types/payroll';
import { hasFeatureAccess, entitlementErrorBody, resolveCompanyIdForUser } from '../../../../lib/entitlements';

/**
 * GET /api/payroll
 * List all payroll records (admin only)
 * Query params:
 * - country_code: Filter by country
 * - is_active: Filter by active status
 * - department: Filter by department
 */
export async function GET(request: NextRequest) {
  try {
   const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
    // Check if user is admin
  /*  const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }*/

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country_code');
    const isActive = searchParams.get('is_active');
   // const department = searchParams.get('department');
    const userId = searchParams.get('user_id');

    // Build query
    let query = supabase
      .from('employee_payroll')
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname,
          is_manager
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
   /* if (department) {
      query = query.eq('department', department);
    }*/
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payroll records:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data.length }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/payroll
 * Create new payroll record (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
    
    // Check if user is admin
  /*  const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    } */

    // Parse request body
    const body: CreatePayrollRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.country_code || !body.employment_type ||
        !body.contract_type || !body.salary_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Plan gating: payroll must be enabled for the employee's company plan.
    const companyId = await resolveCompanyIdForUser(body.user_id);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found for this employee' }, { status: 400 });
    }
    const entitlement = await hasFeatureAccess(companyId, 'payroll.use');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('payroll.use', entitlement), { status: 403 });
    }

    // Check if user already has active payroll record
    const { data: existingPayroll, error: checkError } = await supabase
      .from('employee_payroll')
      .select('id')
      .eq('user_id', body.user_id)
      .eq('is_active', true)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing payroll:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingPayroll) {
      return NextResponse.json(
        { error: 'User already has an active payroll record' },
        { status: 400 }
      );
    }

    // Verify country exists
    const { data: country, error: countryError } = await supabase
      .from('payroll_countries')
      .select('country_code')
      .eq('country_code', body.country_code)
      .eq('is_active', true)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Invalid or inactive country code' },
        { status: 400 }
      );
    }

    // Prepare payroll data
    const payrollData = {
      user_id: body.user_id,
      country_code: body.country_code,
      employment_type: body.employment_type,
      contract_type: body.contract_type,
      contract_start_date: body.contract_start_date,
      contract_end_date: body.contract_end_date || null,
      position_title: body.position_title,
      department: body.department || null,
      work_location: body.work_location || null,
      weekly_hours: body.weekly_hours,
      salary_amount: body.salary_amount,
      salary_currency: body.salary_currency || 'HUF',
      salary_period: body.salary_period || 'monthly',
      payment_method: body.payment_method || 'bank_transfer',
      bank_account_iban: body.bank_account_iban || null,
      bank_name: body.bank_name || null,
      country_specific_data: body.country_specific_data || {},
      benefits: body.benefits || [],
      is_active: true,
      created_by: body.user_id,
      updated_by: body.user_id,
    };

    // Insert payroll record
    const { data, error } = await supabase
      .from('employee_payroll')
      .insert(payrollData)
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname
        )
      `)
      .single();

    if (error) {
      console.error('Error creating payroll record:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data, 
      message: 'Payroll record created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
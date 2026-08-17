// src/app/api/payroll/grid/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { EmploymentType } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GridParams {
  country_code: string;
  page?: number;
  page_size?: number;
  search?: string;
  department?: string;
  employment_type?: EmploymentType;
  status?: 'active' | 'inactive' | 'all';
  sort_by?: 'name' | 'salary' | 'department' | 'position';
  sort_order?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: GridParams = {
      country_code: searchParams.get('country_code') || 'HU',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '50'),
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      employment_type: (searchParams.get('employment_type') as EmploymentType) || undefined,
      status: (searchParams.get('status') as 'active' | 'inactive' | 'all') || 'active',
      sort_by: (searchParams.get('sort_by') as 'name' | 'salary' | 'department' | 'position') || 'name',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    };

    // Build base query
    let query = supabase
      .from('employee_payroll')
      .select(`
        id,
        user_id,
        country_code,
        employment_type,
        contract_type,
        contract_start_date,
        contract_end_date,
        position_title,
        department,
        salary_amount,
        salary_currency,
        weekly_hours,
        is_active,
        termination_date,
        country_specific_data,
        users!employee_payroll_user_id_fkey(
          id,
          user_firstname,
          user_lastname
        )
      `, { count: 'exact' })
      .eq('country_code', params.country_code);

    // Apply status filter
    if (params.status === 'active') query = query.eq('is_active', true);
    else if (params.status === 'inactive') query = query.eq('is_active', false);

    // Apply search filter
    if (params.search?.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      query = query.or(`
        users.user_firstname.ilike.${searchTerm},
        users.user_lastname.ilike.${searchTerm},
        position_title.ilike.${searchTerm},
        department.ilike.${searchTerm}
      `);
    }

    // Apply department filter
    if (params.department) query = query.eq('department', params.department);

    // Apply employment type filter
    if (params.employment_type) query = query.eq('employment_type', params.employment_type);

    // Apply sorting (except name)
    if (params.sort_by === 'salary') {
      query = query.order('salary_amount', { ascending: params.sort_order === 'asc' });
    } else if (params.sort_by === 'department') {
      query = query.order('department', { ascending: params.sort_order === 'asc', nullsFirst: false });
    } else if (params.sort_by === 'position') {
      query = query.order('position_title', { ascending: params.sort_order === 'asc' });
    }

    // Apply pagination
    const page = params.page || 1;
    const pageSize = params.page_size || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data: payrollData, error: dataError, count } = await query;

    if (dataError) {
      console.error('Error fetching grid data:', dataError);
      return NextResponse.json({ error: dataError.message }, { status: 500 });
    }

    let enrichedData = payrollData || [];

    
    // Fetch allowances, deductions, validation issues (same as before)
    const payrollIds = enrichedData.map(p => p.id);
    let allowancesData: Record<string, unknown>[] = [];
    let deductionsData: Record<string, unknown>[] = [];
    if (payrollIds.length) {
      const { data: allowances } = await supabase.from('employee_allowances').select('*').in('payroll_id', payrollIds);
      allowancesData = allowances || [];
      const { data: deductions } = await supabase.from('employee_deductions').select('*').in('payroll_id', payrollIds).eq('is_active', true);
      deductionsData = deductions || [];
    }

    const userIds = enrichedData.map(p => p.user_id);
    let validationIssues: Record<string, unknown>[] = [];
    if (userIds.length) {
      const { data: issues } = await supabase.from('payroll_validation_issues').select('user_id, severity').in('user_id', userIds);
      validationIssues = issues || [];
    }

    // Enrich data
    enrichedData = enrichedData.map(payroll => {
      const empAllowances = (allowancesData as Array<{ payroll_id: string; amount: number }>).filter(a => a.payroll_id === payroll.id);
      const totalAllowances = empAllowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
      const empDeductions = (deductionsData as Array<{ payroll_id: string; amount: number }>).filter(d => d.payroll_id === payroll.id);
      const totalDeductions = empDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const empIssues = (validationIssues as Array<{ user_id: string; severity: string }>).filter(i => i.user_id === payroll.user_id);
      const hasCritical = empIssues.some(i => i.severity === 'CRITICAL');
      const hasWarning = empIssues.some(i => i.severity === 'WARNING');
      let validationStatus: 'valid' | 'warning' | 'error' = 'valid';
      if (hasCritical) validationStatus = 'error';
      else if (hasWarning) validationStatus = 'warning';

      return {
        ...payroll,
        total_allowances: totalAllowances,
        total_deductions: totalDeductions,
        allowances_count: empAllowances.length,
        deductions_count: empDeductions.length,
        allowances: empAllowances,
        deductions: empDeductions,
        validation_status: validationStatus,
        validation_issues_count: empIssues.length,
      };
    });

    // Unique departments
    const { data: departments } = await supabase
      .from('employee_payroll')
      .select('department')
      .eq('country_code', params.country_code)
      .not('department', 'is', null)
      .order('department');

    const uniqueDepartments = [...new Set(departments?.map(d => d.department).filter(Boolean) || [])];

    return NextResponse.json({
      data: enrichedData,
      pagination: {
        page,
        page_size: pageSize,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / pageSize),
        has_next: (count || 0) > to + 1,
        has_previous: page > 1,
      },
      filters: {
        departments: uniqueDepartments,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// src/app/api/payroll/bulk/route.ts
// POST: Perform bulk operations on multiple employees

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { AllowanceType, DeductionType, TaxTreatment } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BulkOperation = 
  | 'salary_increase'
  | 'add_allowance'
  | 'add_deduction'
  | 'change_department'
  | 'update_field';

interface BulkOperationRequest {
  operation: BulkOperation;
  payroll_ids: string[];
  current_user_id: string;
  
  // For salary increase
  salary_change?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  
  // For add allowance
  allowance?: {
    allowance_type: AllowanceType;
    amount: number;
    currency?: string;
    tax_treatment?: TaxTreatment;
    is_recurring?: boolean;
    effective_month?: number;
    effective_year?: number;
    description?: string;
  };
  
  // For add deduction
  deduction?: {
    deduction_type: DeductionType;
    amount: number;
    currency?: string;
    total_amount?: number;
    installment_count?: number;
    start_month?: number;
    start_year?: number;
    description?: string;
  };
  
  // For change department
  new_department?: string;
  
  // For generic field update
  field_updates?: Record<string, string | number | boolean>;
}

/**
 * POST /api/payroll/bulk
 * Perform bulk operations on selected employees
 */
export async function POST(request: NextRequest) {
  try {
    const body: BulkOperationRequest = await request.json();

    // Validate required fields
    if (!body.operation || !body.payroll_ids || body.payroll_ids.length === 0 || !body.current_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: operation, payroll_ids, current_user_id' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', body.current_user_id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ payroll_id: string; error: string }> = [];

    // Execute operation based on type
    switch (body.operation) {
      case 'salary_increase':
        if (!body.salary_change) {
          return NextResponse.json({ error: 'salary_change is required' }, { status: 400 });
        }

        for (const payrollId of body.payroll_ids) {
          try {
            // Get current salary
            const { data: payroll } = await supabase
              .from('employee_payroll')
              .select('salary_amount')
              .eq('id', payrollId)
              .single();

            if (!payroll) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: 'Payroll not found' });
              continue;
            }

            const currentSalary = Number(payroll.salary_amount) || 0;
            let newSalary = currentSalary;

            if (body.salary_change.type === 'percentage') {
              newSalary = currentSalary * (1 + body.salary_change.value / 100);
            } else {
              newSalary = currentSalary + body.salary_change.value;
            }

            // Update salary
            const { error } = await supabase
              .from('employee_payroll')
              .update({
                salary_amount: Math.round(newSalary),
                updated_by: body.current_user_id,
              })
              .eq('id', payrollId);

            if (error) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: error.message });
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            errors.push({ payroll_id: payrollId, error: String(err) });
          }
        }
        break;

      case 'add_allowance':
        if (!body.allowance) {
          return NextResponse.json({ error: 'allowance is required' }, { status: 400 });
        }

        for (const payrollId of body.payroll_ids) {
          try {
            const { error } = await supabase
              .from('employee_allowances')
              .insert({
                payroll_id: payrollId,
                allowance_type: body.allowance.allowance_type,
                amount: body.allowance.amount,
                currency: body.allowance.currency || 'HUF',
                tax_treatment: body.allowance.tax_treatment || 'fully_taxable',
                is_recurring: body.allowance.is_recurring || false,
                effective_month: body.allowance.effective_month,
                effective_year: body.allowance.effective_year,
                description: body.allowance.description,
                created_by: body.current_user_id,
              });

            if (error) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: error.message });
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            errors.push({ payroll_id: payrollId, error: String(err) });
          }
        }
        break;

      case 'add_deduction':
        if (!body.deduction) {
          return NextResponse.json({ error: 'deduction is required' }, { status: 400 });
        }

        for (const payrollId of body.payroll_ids) {
          try {
            const { error } = await supabase
              .from('employee_deductions')
              .insert({
                payroll_id: payrollId,
                deduction_type: body.deduction.deduction_type,
                amount: body.deduction.amount,
                currency: body.deduction.currency || 'HUF',
                total_amount: body.deduction.total_amount,
                installment_count: body.deduction.installment_count,
                remaining_amount: body.deduction.total_amount || body.deduction.amount,
                installments_remaining: body.deduction.installment_count,
                start_month: body.deduction.start_month,
                start_year: body.deduction.start_year,
                description: body.deduction.description,
                is_active: true,
                is_completed: false,
                created_by: body.current_user_id,
              });

            if (error) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: error.message });
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            errors.push({ payroll_id: payrollId, error: String(err) });
          }
        }
        break;

      case 'change_department':
        if (!body.new_department) {
          return NextResponse.json({ error: 'new_department is required' }, { status: 400 });
        }

        const { error: deptError, count: deptCount } = await supabase
          .from('employee_payroll')
          .update({
            department: body.new_department,
            updated_by: body.current_user_id,
          })
          .in('id', body.payroll_ids);

        if (deptError) {
          return NextResponse.json({ error: deptError.message }, { status: 500 });
        }

        successCount = deptCount || 0;
        break;

      case 'update_field':
        if (!body.field_updates) {
          return NextResponse.json({ error: 'field_updates is required' }, { status: 400 });
        }

        const { error: updateError, count: updateCount } = await supabase
          .from('employee_payroll')
          .update({
            ...body.field_updates,
            updated_by: body.current_user_id,
          })
          .in('id', body.payroll_ids);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        successCount = updateCount || 0;
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      total_processed: body.payroll_ids.length,
      success_count: successCount,
      error_count: errorCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Bulk operation completed: ${successCount} succeeded, ${errorCount} failed`,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// src/app/api/payroll/[id]/route.ts
// GET: Get specific payroll record
// PUT: Update payroll record
// DELETE: Soft delete payroll record

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdatePayrollRequest } from '../../../../../types/payroll';

/**
 * GET /api/payroll/[id]
 * Get specific payroll record with history (admin only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get current_user_id from query parameters
        const { searchParams } = new URL(request.url);
        const currentUserId = searchParams.get('current_user_id');

        if (!currentUserId) {
            return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', currentUserId)
            .single();

        if (userError || !userData?.is_admin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const payrollId = params.id;

        // Get payroll record
        const { data: payroll, error: payrollError } = await supabase
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
            .eq('id', payrollId)
            .single();

        if (payrollError) {
            console.error('Error fetching payroll:', payrollError);
            return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
        }

        // Get history
        const { data: history, error: historyError } = await supabase
            .from('employee_payroll_history')
            .select('*')
            .eq('payroll_id', payrollId)
            .order('change_date', { ascending: false });

        if (historyError) {
            console.error('Error fetching history:', historyError);
            // Continue even if history fetch fails
        }

        return NextResponse.json({
            data: payroll,
            history: history || []
        }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/payroll/[id]
 * Update payroll record (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get current_user_id from query parameters
        const { searchParams } = new URL(request.url);
        const currentUserId = searchParams.get('current_user_id');

        if (!currentUserId) {
            return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', currentUserId)
            .single();

        if (userError || !userData?.is_admin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const payrollId = params.id;
        const body: UpdatePayrollRequest = await request.json();

        // Verify payroll record exists
        const { data: existingPayroll, error: checkError } = await supabase
            .from('employee_payroll')
            .select('*')
            .eq('id', payrollId)
            .single();

        if (checkError || !existingPayroll) {
            return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
        }

        // Build update object (only update provided fields)
type PayrollUpdateData = {
  updated_by: string;
} & Partial<UpdatePayrollRequest>; // Partial already allows undefined

const updateData: PayrollUpdateData = {
  updated_by: currentUserId,
};

// List of fields allowed to update
const allowedFields: (keyof UpdatePayrollRequest)[] = [
  'employment_type',
  'contract_type',
  'contract_start_date',
  'contract_end_date',
  'position_title',
  'department',
  'work_location',
  'weekly_hours',
  'salary_amount',
  'salary_currency',
  'salary_period',
  'payment_method',
  'bank_account_iban',
  'bank_name',
  'country_specific_data',
  'benefits',
  'is_active',
  'termination_date',
  'termination_reason',
];

// Map allowed fields from request body to updateData
allowedFields.forEach(field => {
  const value = body[field];
  if (value !== undefined) {
    // Type assertion fixes the error
    (updateData[field] as UpdatePayrollRequest[keyof UpdatePayrollRequest]) = value;
  }
});



        // Validate termination logic
        if (body.is_active === false && !body.termination_date) {
            return NextResponse.json(
                { error: 'Termination date is required when setting is_active to false' },
                { status: 400 }
            );
        }

        // Update payroll record
        const { data, error } = await supabase
            .from('employee_payroll')
            .update(updateData)
            .eq('id', payrollId)
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
            console.error('Error updating payroll:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data,
            message: 'Payroll record updated successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/payroll/[id]
 * Soft delete payroll record (sets is_active to false) (admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get current_user_id from query parameters
        const { searchParams } = new URL(request.url);
        const currentUserId = searchParams.get('current_user_id');

        if (!currentUserId) {
            return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', currentUserId)
            .single();

        if (userError || !userData?.is_admin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const payrollId = params.id;

        // Soft delete by setting is_active to false
        const { data, error } = await supabase
            .from('employee_payroll')
            .update({
                is_active: false,
                termination_date: new Date().toISOString().split('T')[0],
                updated_by: currentUserId
            })
            .eq('id', payrollId)
            .select()
            .single();

        if (error) {
            console.error('Error deleting payroll:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Payroll record deactivated successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
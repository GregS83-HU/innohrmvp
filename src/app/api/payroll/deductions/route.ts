// src/app/api/payroll/deductions/route.ts
// GET: Get deductions for a payroll record
// POST: Create new deduction

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateDeductionRequest } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payroll/deductions?payroll_id=xxx
 * Get deductions for a payroll record
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payrollId = searchParams.get('payroll_id');

    if (!payrollId) {
      return NextResponse.json(
        { error: 'payroll_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('employee_deductions')
      .select('*')
      .eq('payroll_id', payrollId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deductions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/payroll/deductions
 * Create new deduction
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

    const body: CreateDeductionRequest = await request.json();

    // Validate required fields
    if (!body.payroll_id || !body.deduction_type || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: payroll_id, deduction_type, amount' },
        { status: 400 }
      );
    }

    // Calculate remaining amount if installments
    const remaining_amount = body.total_amount || body.amount;
    const installments_remaining = body.installment_count;

    // Create deduction
    const { data, error } = await supabase
      .from('employee_deductions')
      .insert({
        ...body,
        currency: body.currency || 'HUF',
        remaining_amount,
        installments_remaining,
        is_active: true,
        is_completed: false,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deduction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Deduction created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
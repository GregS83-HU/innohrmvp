// src/app/api/payroll/allowances/[id]/route.ts
// PUT: Update allowance
// DELETE: Delete allowance

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateAllowanceRequest } from '../../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PUT /api/payroll/allowances/[id]
 * Update allowance
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const allowanceId = params.id;
    const body: UpdateAllowanceRequest = await request.json();

    const { data, error } = await supabase
      .from('employee_allowances')
      .update(body)
      .eq('id', allowanceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating allowance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Allowance updated successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/payroll/allowances/[id]
 * Delete allowance
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const allowanceId = params.id;

    const { error } = await supabase
      .from('employee_allowances')
      .delete()
      .eq('id', allowanceId);

    if (error) {
      console.error('Error deleting allowance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Allowance deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
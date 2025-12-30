// src/app/api/payroll/by-user/[userId]/route.ts
// GET: Get payroll record by user_id

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payroll/by-user/[userId]
 * Get payroll record for a specific user (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const userId = params.userId;

    // Get payroll record for this user
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
      .eq('user_id', userId)
      .eq('is_active', true) // Only get active payroll records
      .single();

    if (payrollError) {
      // If no payroll found, return 404
      if (payrollError.code === 'PGRST116') {
        return NextResponse.json({ 
          data: null,
          message: 'No payroll record found for this user'
        }, { status: 404 });
      }
      
      console.error('Error fetching payroll:', payrollError);
      return NextResponse.json({ error: payrollError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: payroll
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
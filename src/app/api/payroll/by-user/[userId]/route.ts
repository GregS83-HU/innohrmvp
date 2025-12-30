// src/app/api/payroll/by-user/[userId]/route.ts
// GET: Get payroll record by user_id

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Utility: Get Supabase client with service role
 */
const getSupabaseClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * Utility: Extract userId and current_user_id from request
 */
const extractParams = (request: NextRequest) => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const userId = segments[segments.length - 1];
  const currentUserId = url.searchParams.get('current_user_id');
  return { userId, currentUserId };
};

/**
 * Utility: Check if user is admin
 */
const checkAdmin = async (supabase: ReturnType<typeof getSupabaseClient>, userId: string) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !error && userData?.is_admin;
};

/**
 * GET /api/payroll/by-user/[userId]
 * Get payroll record for a specific user (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { userId, currentUserId } = extractParams(request);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(supabase, currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

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
      .eq('is_active', true)
      .single();

    if (payrollError) {
      // If no payroll found, return 404
      return NextResponse.json({
        data: null,
        message: 'No payroll record found for this user'
      }, { status: 404 });
    }

    return NextResponse.json({ data: payroll }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

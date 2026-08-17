// src/app/api/payroll/periods/status/route.ts
// GET: Get status of payroll periods

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payroll/periods/status
 * Get status of one or multiple payroll periods (admin only)
 * 
 * Query params:
 * - current_user_id: UUID (required)
 * - country_code: string (optional, filter by country)
 * - year: number (optional, filter by year)
 * - month: number (optional, filter by month - requires year)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('current_user_id');
    const countryCode = searchParams.get('country_code');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

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

    // If specific period requested, use the helper function
    if (countryCode && year && month) {
      const { data, error } = await supabase
        .rpc('get_period_status', {
          p_country_code: countryCode,
          p_year: parseInt(year),
          p_month: parseInt(month)
        });

      if (error) {
        console.error('Error fetching period status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        country_code: countryCode,
        year: parseInt(year),
        month: parseInt(month),
        status: data[0] || { status: 'open' },
      }, { status: 200 });
    }

    // Otherwise, get all periods matching filters
    let query = supabase
      .from('payroll_period_closures')
      .select(`
        *,
        closed_by_user:users!payroll_period_closures_closed_by_fkey(
          id,
          user_firstname,
          user_lastname
        ),
        reopened_by_user:users!payroll_period_closures_reopened_by_fkey(
          id,
          user_firstname,
          user_lastname
        )
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching period closures:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      periods: data || [],
      count: data?.length || 0,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
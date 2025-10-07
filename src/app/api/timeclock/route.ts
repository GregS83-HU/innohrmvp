// /app/api/timeclock/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Default shift if none assigned
const DEFAULT_SHIFT = {
  start_time: '09:00:00',
  end_time: '17:00:00'
};

// -------------------
// Helper Functions
// -------------------

async function getUserCompany(userId: string) {
  const { data, error } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('User company not found');
  return data.company_id;
}

async function getUserActiveShift(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('user_shifts')
    .select(`
      shift_id,
      work_shifts (
        start_time,
        end_time,
        shift_name
      )
    `)
    .eq('user_id', userId)
    .lte('effective_from', today)
    .or(`effective_until.is.null,effective_until.gte.${today}`)
    .single();

  if (data?.work_shifts) {
    return data.work_shifts;
  }
  
  return DEFAULT_SHIFT;
}

async function getTodayTimeEntry(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('clock_in', startOfDay)
    .lte('clock_in', endOfDay)
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

function calculateExpectedTimes(shift: any) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const expectedClockIn = new Date(`${today}T${shift.start_time}`);
  const expectedClockOut = new Date(`${today}T${shift.end_time}`);
  
  return {
    expected_clock_in: expectedClockIn.toISOString(),
    expected_clock_out: expectedClockOut.toISOString()
  };
}

// -------------------
// GET - Fetch today's status and history
// -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'status' or 'history'

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (action === 'status') {
      // Get today's clock status
      const todayEntry = await getTodayTimeEntry(userId);
      const shift = await getUserActiveShift(userId);

      return NextResponse.json({
        success: true,
        clockedIn: todayEntry && !todayEntry.clock_out,
        todayEntry,
        shift
      });
    }

    if (action === 'history') {
      // Get last 30 days of entries
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('clock_in', thirtyDaysAgo.toISOString())
        .order('clock_in', { ascending: false })
        .limit(50);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        entries: data
      });
    }

    if (action === 'summary') {
      // Get current week summary
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('time_entries')
        .select('total_hours, regular_hours, overtime_hours, is_late')
        .eq('user_id', userId)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      if (error) throw error;

      const summary = {
        totalHours: data.reduce((sum, entry) => sum + (Number(entry.total_hours) || 0), 0),
        regularHours: data.reduce((sum, entry) => sum + (Number(entry.regular_hours) || 0), 0),
        overtimeHours: data.reduce((sum, entry) => sum + (Number(entry.overtime_hours) || 0), 0),
        onTimeDays: data.filter(entry => !entry.is_late).length,
        lateDays: data.filter(entry => entry.is_late).length,
        totalDays: data.length
      };

      return NextResponse.json({
        success: true,
        summary
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('GET /api/timeclock error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time clock data' },
      { status: 500 }
    );
  }
}

// -------------------
// POST - Clock In/Out
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body; // action: 'clock_in' or 'clock_out'

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    // Get user's company
    const companyId = await getUserCompany(userId);

    // Check today's entry
    const todayEntry = await getTodayTimeEntry(userId);

    // -------------------
    // CLOCK IN
    // -------------------
    if (action === 'clock_in') {
      // Prevent double clock-in
      if (todayEntry && !todayEntry.clock_out) {
        return NextResponse.json(
          { error: 'You are already clocked in today' },
          { status: 400 }
        );
      }

      // Get user's shift
      const shift = await getUserActiveShift(userId);
      const expectedTimes = calculateExpectedTimes(shift);

      // Create new time entry
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: userId,
          company_id: companyId,
          clock_in: new Date().toISOString(),
          expected_clock_in: expectedTimes.expected_clock_in,
          expected_clock_out: expectedTimes.expected_clock_out,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Clocked in successfully',
        entry: data
      });
    }

    // -------------------
    // CLOCK OUT
    // -------------------
    if (action === 'clock_out') {
      // Must be clocked in first
      if (!todayEntry || todayEntry.clock_out) {
        return NextResponse.json(
          { error: 'You must clock in first' },
          { status: 400 }
        );
      }

      // Update with clock out time
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          clock_out: new Date().toISOString()
        })
        .eq('id', todayEntry.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Clocked out successfully',
        entry: data
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST /api/timeclock error:', error);
    return NextResponse.json(
      { error: 'Failed to process time clock action' },
      { status: 500 }
    );
  }
}
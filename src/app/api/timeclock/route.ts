// /app/api/timeclock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// -------------------
// Types
// -------------------
interface WorkShift {
  start_time: string;
  end_time: string;
  shift_name?: string;
}

interface TimeEntry {
  id: string;
  user_id: string;
  company_id?: string;
  clock_in: string;
  clock_out?: string | null;
  expected_clock_in?: string;
  expected_clock_out?: string;
  total_hours?: number;
  regular_hours?: number;
  overtime_hours?: number;
  is_late?: boolean;
  status?: string;
}

// -------------------
// Supabase Client
// -------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Default shift if none assigned
const DEFAULT_SHIFT: WorkShift = {
  start_time: '09:00:00',
  end_time: '17:00:00'
};

// -------------------
// Helper Functions
// -------------------

// Type guard
function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object';
}

async function getUserCompany(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single();

  if (error || !data?.company_id) throw new Error('User company not found');
  return data.company_id;
}

// Safely handle relation returning array or object
async function getUserActiveShift(userId: string): Promise<WorkShift> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
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
    .maybeSingle();

  if (error) {
    console.error('Error fetching user shift:', error);
    return DEFAULT_SHIFT;
  }

  if (!data || !('work_shifts' in data)) {
    return DEFAULT_SHIFT;
  }

  const rawWorkShifts = (data as Record<string, unknown>).work_shifts;

  // Case 1: Array
  if (Array.isArray(rawWorkShifts) && rawWorkShifts.length > 0 && isObject(rawWorkShifts[0])) {
    const raw = rawWorkShifts[0];
    const start_time =
      typeof raw.start_time === 'string' ? raw.start_time : DEFAULT_SHIFT.start_time;
    const end_time =
      typeof raw.end_time === 'string' ? raw.end_time : DEFAULT_SHIFT.end_time;
    const shift_name =
      typeof raw.shift_name === 'string' ? raw.shift_name : undefined;
    return { start_time, end_time, shift_name };
  }

  // Case 2: Single object
  if (isObject(rawWorkShifts)) {
    const raw = rawWorkShifts;
    const start_time =
      typeof raw.start_time === 'string' ? raw.start_time : DEFAULT_SHIFT.start_time;
    const end_time =
      typeof raw.end_time === 'string' ? raw.end_time : DEFAULT_SHIFT.end_time;
    const shift_name =
      typeof raw.shift_name === 'string' ? raw.shift_name : undefined;
    return { start_time, end_time, shift_name };
  }

  // Fallback
  return DEFAULT_SHIFT;
}

async function getTodayTimeEntry(userId: string): Promise<TimeEntry | null> {
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

  return data as TimeEntry | null;
}

function calculateExpectedTimes(shift: WorkShift) {
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
// GET - Fetch today's status, history, or summary
// -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'status' | 'history' | 'summary'

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (action === 'status') {
      const todayEntry = await getTodayTimeEntry(userId);
      const shift = await getUserActiveShift(userId);

      return NextResponse.json({
        success: true,
        clockedIn: !!(todayEntry && !todayEntry.clock_out),
        todayEntry,
        shift
      });
    }

    if (action === 'history') {
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
        entries: data as TimeEntry[]
      });
    }

    if (action === 'summary') {
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
// POST - Clock In / Clock Out
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body as { userId?: string; action?: 'clock_in' | 'clock_out' };

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    const companyId = await getUserCompany(userId);
    const todayEntry = await getTodayTimeEntry(userId);

    if (action === 'clock_in') {
      if (todayEntry && !todayEntry.clock_out) {
        return NextResponse.json(
          { error: 'You are already clocked in today' },
          { status: 400 }
        );
      }

      const shift = await getUserActiveShift(userId);
      const expectedTimes = calculateExpectedTimes(shift);

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
        entry: data as TimeEntry
      });
    }

    if (action === 'clock_out') {
      if (!todayEntry || todayEntry.clock_out) {
        return NextResponse.json(
          { error: 'You must clock in first' },
          { status: 400 }
        );
      }

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
        entry: data as TimeEntry
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

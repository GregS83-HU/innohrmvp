// /app/api/timeclock/manager/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// -------------------
// TypeScript types
// -------------------
interface TeamMember {
  user_id: string;
  first_name: string;
  last_name: string;
  manager_id: string;
  todayStatus?: 'clocked_in' | 'clocked_out' | 'not_started';
  todayEntry?: {
    id: number;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
    is_late: boolean;
  } | null;
  weeklyHours?: number;
}

interface PendingEntry {
  id: number;
  user_id: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  is_late: boolean;
  is_overtime: boolean;
  employee_notes: string | null;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

// -------------------
// Helper: get team members via Supabase function
// -------------------
async function getTeamMembers(managerId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .rpc('get_team_members_by_manager', { manager_uuid: managerId });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  // Ensure data is an array
  if (!data) return [];
  return Array.isArray(data) ? data : [];
}

// -------------------
// GET Handler
// -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    const action = searchParams.get('action');

    if (!managerId) return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });

    // -------------------
    // Team Today
    // -------------------
    if (action === 'team-today') {
      const teamMembers = await getTeamMembers(managerId);

      if (teamMembers.length === 0) {
        return NextResponse.json({ success: true, teamMembers: [] });
      }

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const userIds = teamMembers.map((m) => m.user_id);

      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('*')
        .in('user_id', userIds)
        .gte('clock_in', startOfDay.toISOString())
        .lte('clock_in', endOfDay.toISOString());

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyEntries } = await supabase
        .from('time_entries')
        .select('user_id, total_hours')
        .in('user_id', userIds)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      const teamData: TeamMember[] = teamMembers.map((m: TeamMember) => {
        const todayEntry = todayEntries?.find((e) => e.user_id === m.user_id) ?? null;
        const weeklyHours =
          weeklyEntries
            ?.filter((e) => e.user_id === m.user_id)
            .reduce((sum, e) => sum + (Number(e.total_hours) || 0), 0) ?? 0;

        const todayStatus: 'clocked_in' | 'clocked_out' | 'not_started' = todayEntry
          ? todayEntry.clock_out
            ? 'clocked_out'
            : 'clocked_in'
          : 'not_started';

        return {
          ...m,
          todayEntry,
          weeklyHours,
          todayStatus,
        };
      });

      return NextResponse.json({ success: true, teamMembers: teamData });
    }

    // -------------------
    // Pending Approvals
    // -------------------
   if (action === 'pending-approvals') {
  const teamMembers = await getTeamMembers(managerId);
  if (teamMembers.length === 0) return NextResponse.json({ success: true, entries: [] });

  const userIds = teamMembers.map((m) => m.user_id);

  // Récupère SEULEMENT les time_entries, sans join
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .in('user_id', userIds)
    .eq('status', 'pending')
    .not('clock_out', 'is', null)
    .order('clock_in', { ascending: false })
    .limit(50);

  if (error) throw error;

  // Map manuellement avec les données de teamMembers
  const entries: PendingEntry[] = data.map((e) => {
    const member = teamMembers.find(m => m.user_id === e.user_id);
    return {
      ...e,
      user_profiles: {
        first_name: member?.first_name || 'Unknown',
        last_name: member?.last_name || 'User',
      },
    };
  });

  return NextResponse.json({ success: true, entries });
}

    // -------------------
    // Team Summary
    // -------------------
    if (action === 'team-summary') {
      const teamMembers = await getTeamMembers(managerId);
      if (teamMembers.length === 0) {
        return NextResponse.json({
          success: true,
          summary: { totalEmployees: 0, totalHours: 0, avgHoursPerEmployee: 0, lateCount: 0, overtimeCount: 0 },
        });
      }

      const userIds = teamMembers.map((m) => m.user_id);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyData } = await supabase
        .from('time_entries')
        .select('total_hours, is_late, is_overtime')
        .in('user_id', userIds)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      const summary = {
        totalEmployees: teamMembers.length,
        totalHours: weeklyData?.reduce((sum, e) => sum + (Number(e.total_hours) || 0), 0) ?? 0,
        avgHoursPerEmployee: 0,
        lateCount: weeklyData?.filter((e) => e.is_late).length ?? 0,
        overtimeCount: weeklyData?.filter((e) => e.is_overtime).length ?? 0,
      };
      summary.avgHoursPerEmployee = summary.totalHours / (teamMembers.length || 1);

      return NextResponse.json({ success: true, summary });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/timeclock/manager error:', error);
    return NextResponse.json({ error: 'Failed to fetch manager data' }, { status: 500 });
  }
}

// -------------------
// POST Handler
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { managerId, action, entryId, status, managerNotes } = body as {
      managerId: string;
      action: string;
      entryId: number;
      status: 'approved' | 'rejected';
      managerNotes?: string;
    };

    if (!managerId) return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });

    if (action === 'approve-entry') {
      if (!entryId || !status) return NextResponse.json({ error: 'Entry ID and status required' }, { status: 400 });

      const { data: entry } = await supabase
        .from('time_entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

      if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

      const teamMembers = await getTeamMembers(managerId);
      if (!teamMembers.some((m) => m.user_id === entry.user_id)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          status,
          manager_notes: managerNotes || null,
          approved_by: managerId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, message: `Time entry ${status}`, entry: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/timeclock/manager error:', error);
    return NextResponse.json({ error: 'Failed to process manager action' }, { status: 500 });
  }
}
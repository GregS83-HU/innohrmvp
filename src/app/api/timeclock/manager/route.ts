// /app/api/timeclock/manager/route.ts
// Manager-specific endpoints using your existing get_user_manager function

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// -------------------
// Helper: Get team members for this manager
// -------------------
async function getTeamMembers(managerId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, first_name, last_name, email')
    .eq('manager_id', managerId);

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return data || [];
}

// -------------------
// GET - Fetch team data or pending approvals
// -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    const action = searchParams.get('action');

    if (!managerId) {
      return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });
    }

    // Get today's team status
    if (action === 'team-today') {
      const teamMembers = await getTeamMembers(managerId);

      if (teamMembers.length === 0) {
        return NextResponse.json({
          success: true,
          teamMembers: []
        });
      }

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Get today's entries for all team members
      const userIds = teamMembers.map(m => m.user_id);
      
      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('*')
        .in('user_id', userIds)
        .gte('clock_in', startOfDay)
        .lte('clock_in', endOfDay);

      // Get weekly hours for all team members
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyEntries } = await supabase
        .from('time_entries')
        .select('user_id, total_hours')
        .in('user_id', userIds)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      // Combine data
      const teamData = teamMembers.map(member => {
        const todayEntry = todayEntries?.find(e => e.user_id === member.user_id);
        const weeklyHours = weeklyEntries
          ?.filter(e => e.user_id === member.user_id)
          .reduce((sum, e) => sum + (Number(e.total_hours) || 0), 0) || 0;

        let todayStatus: 'clocked_in' | 'clocked_out' | 'not_started' = 'not_started';
        
        if (todayEntry) {
          todayStatus = todayEntry.clock_out ? 'clocked_out' : 'clocked_in';
        }

        return {
          ...member,
          todayStatus,
          todayEntry: todayEntry || null,
          weeklyHours
        };
      });

      return NextResponse.json({
        success: true,
        teamMembers: teamData
      });
    }

    // Get pending approvals for team
    if (action === 'pending-approvals') {
      const teamMembers = await getTeamMembers(managerId);

      if (teamMembers.length === 0) {
        return NextResponse.json({
          success: true,
          entries: []
        });
      }

      const userIds = teamMembers.map(m => m.user_id);

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          user_profiles!inner(first_name, last_name, email)
        `)
        .in('user_id', userIds)
        .eq('status', 'pending')
        .not('clock_out', 'is', null)
        .order('clock_in', { ascending: false })
        .limit(50);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        entries: data
      });
    }

    // Get team weekly summary
    if (action === 'team-summary') {
      const teamMembers = await getTeamMembers(managerId);

      if (teamMembers.length === 0) {
        return NextResponse.json({
          success: true,
          summary: {
            totalEmployees: 0,
            totalHours: 0,
            avgHoursPerEmployee: 0,
            lateCount: 0,
            overtimeCount: 0
          }
        });
      }

      const userIds = teamMembers.map(m => m.user_id);
      
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('time_entries')
        .select('total_hours, is_late, is_overtime')
        .in('user_id', userIds)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      const summary = {
        totalEmployees: teamMembers.length,
        totalHours: data?.reduce((sum, e) => sum + (Number(e.total_hours) || 0), 0) || 0,
        avgHoursPerEmployee: 0,
        lateCount: data?.filter(e => e.is_late).length || 0,
        overtimeCount: data?.filter(e => e.is_overtime).length || 0
      };

      summary.avgHoursPerEmployee = summary.totalHours / (teamMembers.length || 1);

      return NextResponse.json({
        success: true,
        summary
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('GET /api/timeclock/manager error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manager data' },
      { status: 500 }
    );
  }
}

// -------------------
// POST - Approve or reject time entries
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { managerId, action, entryId, status, managerNotes } = body;

    if (!managerId) {
      return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });
    }

    // Approve/reject time entry
    if (action === 'approve-entry') {
      if (!entryId || !status) {
        return NextResponse.json(
          { error: 'Entry ID and status required' },
          { status: 400 }
        );
      }

      // Verify the entry belongs to this manager's team
      const { data: entry } = await supabase
        .from('time_entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      // Check if this user reports to the manager
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('manager_id')
        .eq('user_id', entry.user_id)
        .single();

      if (!userProfile || userProfile.manager_id !== managerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Update the entry
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          status,
          manager_notes: managerNotes || null,
          approved_by: managerId,
          approved_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Time entry ${status}`,
        entry: data
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('POST /api/timeclock/manager error:', error);
    return NextResponse.json(
      { error: 'Failed to process manager action' },
      { status: 500 }
    );
  }
}
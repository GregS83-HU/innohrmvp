'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { Calendar, Download, ArrowLeft, Loader2, Users, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import YearCalendarGrid from '../../../../../../components/absence/Calendar/year_calendar_grid';
import CalendarLegend from '../../../../../../components/absence/Calendar/calendar_legend';
import CalendarLeaveModal from '../../../../../../components/absence/Calendar/calendar_leave_modal';
import { LeaveBalance, LeaveRequest } from '../../../../../../types/absence';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Match the types that YearCalendarGrid expects internally
interface CalendarDataForGrid {
  leave_requests: {
    id: string;
    start_date: string;
    end_date: string;
    leave_type_color?: string;
    leave_type_name_hu?: string;
    status?: 'pending' | 'approved';
    reason?: string;
  }[];
}

interface TeamDataForGrid {
  team_size: number;
  team_leaves: {
    user_id: string;
    employee_name: string;
    start_date: string;
    end_date: string;
    leave_type_name_hu?: string;
    status?: 'pending' | 'approved';
  }[];
}

// For internal state, use the full types from absence.ts
interface CalendarData {
  leave_requests: LeaveRequest[];
  leave_balances: LeaveBalance[];
}

interface TeamLeaveFromDB {
  user_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

interface TeamData {
  team_size: number;
  team_leaves: TeamLeaveFromDB[];
}

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'my' | 'manager'>('my');
  const [isManager, setIsManager] = useState(false);
  const [companyId, setCompanyId] = useState<string | undefined>();

  const [calendarData, setCalendarData] = useState<CalendarData | undefined>();
  const [teamData, setTeamData] = useState<TeamData | undefined>();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ start: Date; end: Date } | undefined>();

  // --- Fetch current user ---
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: directReports } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('manager_id', user.id)
        .limit(1);
      setIsManager((directReports?.length || 0) > 0);

      const { data: companyData } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      setCompanyId(companyData?.company_id?.toString() || undefined);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  }, []);

  // --- Fetch calendar data ---
  const fetchCalendarData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      if (viewMode === 'my') {
        const { data, error } = await supabase.rpc('get_calendar_data', {
          user_id_param: currentUser.id,
          year_param: selectedYear
        });
        if (error) throw error;

        const parsed: CalendarData = typeof data === 'string' ? JSON.parse(data) : data;
        setCalendarData(parsed);
      } else {
        const { data, error } = await supabase.rpc('get_team_calendar_data', {
          manager_id_param: currentUser.id,
          year_param: selectedYear
        });
        if (error) throw error;

        const parsed: TeamData = typeof data === 'string' ? JSON.parse(data) : data;
        setTeamData(parsed);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedYear, viewMode]);

  // Transform data to match YearCalendarGrid's expected types
  const transformCalendarDataForGrid = (): CalendarDataForGrid | undefined => {
    if (!calendarData) return undefined;
    
    return {
      leave_requests: calendarData.leave_requests.map(req => ({
        id: req.id,
        start_date: req.start_date,
        end_date: req.end_date,
        leave_type_color: req.leave_type_color,
        leave_type_name_hu: req.leave_type_name_hu,
        status: (req.status === 'pending' || req.status === 'approved') ? req.status : 'approved',
        reason: req.reason
      }))
    };
  };

  const transformTeamDataForGrid = (): TeamDataForGrid | undefined => {
    if (!teamData) return undefined;
    
    return {
      team_size: teamData.team_size,
      team_leaves: teamData.team_leaves.map(leave => ({
        user_id: leave.user_id,
        employee_name: leave.employee_name,
        start_date: leave.start_date,
        end_date: leave.end_date,
        leave_type_name_hu: leave.leave_type_name_hu,
        status: (leave.status === 'pending' || leave.status === 'approved') ? leave.status : 'approved'
      }))
    };
  };

  // --- Export functions ---
  const exportToPDF = () => window.print();

  const exportToICal = () => {
    if (!calendarData?.leave_requests) return;
    const approvedLeaves = calendarData.leave_requests.filter(l => l.status === 'approved');
    const icalContent: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Absence Management//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    approvedLeaves.forEach(l => {
      const start = new Date(l.start_date);
      const end = new Date(l.end_date);
      icalContent.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${start.toISOString().split('T')[0].replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${end.toISOString().split('T')[0].replace(/-/g, '')}`,
        `SUMMARY:${l.leave_type_name_hu}`,
        `DESCRIPTION:${l.reason || ''}`,
        `UID:${l.id}@absencemanagement`,
        'END:VEVENT'
      );
    });
    icalContent.push('END:VCALENDAR');
    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave_calendar_${selectedYear}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDateSelection = (start: Date, end: Date) => {
    setSelectedDates({ start, end });
    setShowLeaveModal(true);
  };

  const handleLeaveSuccess = () => {
    setShowLeaveModal(false);
    setSelectedDates(undefined);
    fetchCalendarData();
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);
  useEffect(() => { if (currentUser) fetchCalendarData(); }, [currentUser, fetchCalendarData]);

  if (loading && !calendarData && !teamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 print:bg-white print:p-0">
      <div className="max-w-[1800px] mx-auto">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar View</h1>
              <p className="text-gray-600">Year-round absence overview</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {isManager && (
              <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                <button onClick={() => setViewMode('my')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewMode === 'my' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                  <UserIcon className="w-4 h-4 inline mr-1" /> My View
                </button>
                <button onClick={() => setViewMode('manager')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewMode === 'manager' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Users className="w-4 h-4 inline mr-1" /> Team View
                </button>
              </div>
            )}

            {viewMode === 'my' && (
              <>
                <button onClick={exportToPDF} className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                  <Download className="w-4 h-4 inline mr-1" /> PDF
                </button>
                <button onClick={exportToICal} className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                  <Download className="w-4 h-4 inline mr-1" /> iCal
                </button>
              </>
            )}
          </div>
        </div>

        <CalendarLegend viewMode={viewMode} leaveTypes={calendarData?.leave_balances || []} />

        {viewMode === 'my' && calendarData?.leave_balances && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4 print:hidden">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Leave Balances</h3>
            <div className="flex flex-wrap gap-4">
              {calendarData.leave_balances.map(b => (
                <div key={b.leave_type_id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.leave_type_color }} />
                  <span className="text-sm text-gray-600">{b.leave_type_name_hu}: <span className="font-semibold text-gray-900 ml-1">{b.remaining_days}/{b.total_days}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'manager' && teamData && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4 print:hidden">
            <p className="text-sm text-gray-600">
              Managing <span className="font-semibold text-gray-900">{teamData.team_size}</span> team member{teamData.team_size !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <YearCalendarGrid
          year={selectedYear}
          viewMode={viewMode}
          calendarData={transformCalendarDataForGrid()}
          teamData={transformTeamDataForGrid()}
          onDateSelection={handleDateSelection}
        />

        {showLeaveModal && selectedDates && companyId && currentUser && (
          <CalendarLeaveModal
            isOpen={showLeaveModal}
            onClose={() => { setShowLeaveModal(false); setSelectedDates(undefined); }}
            onSuccess={handleLeaveSuccess}
            companyId={companyId}
            currentUser={currentUser}
            prefilledDates={selectedDates}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
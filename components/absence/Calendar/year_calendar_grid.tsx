// File: components/absence/Calendar/year_calendar_grid.tsx
import React, { useState } from 'react';
import CalendarDay, { CalendarLeave } from './calendar_day';
import ManagerHeatmapCell, { TeamLeave } from './manager_heatmap_cell';

interface LeaveRequest {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  leave_type_color?: string;
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved';
  reason?: string;
}

interface TeamLeaveRequest {
  user_id: string;
  employee_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved';
}

interface CalendarData {
  leave_requests: LeaveRequest[];
}

interface TeamData {
  team_size: number;
  team_leaves: TeamLeaveRequest[];
}

interface YearCalendarGridProps {
  year: number;
  viewMode: 'my' | 'manager';
  calendarData?: CalendarData;
  teamData?: TeamData;
  onDateSelection: (start: Date, end: Date) => void;
}

const YearCalendarGrid: React.FC<YearCalendarGridProps> = ({
  year,
  viewMode,
  calendarData,
  teamData,
  onDateSelection
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);

  const monthsHu = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  const weekDaysHu = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

  const today = new Date();

  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Hungarian public holidays
  const getHungarianHolidays = (year: number): Date[] => {
    const holidays: Date[] = [
      new Date(year, 0, 1),
      new Date(year, 2, 15),
      new Date(year, 4, 1),
      new Date(year, 7, 20),
      new Date(year, 9, 23),
      new Date(year, 10, 1),
      new Date(year, 11, 25),
      new Date(year, 11, 26),
    ];

    const easter = calculateEaster(year);
    holidays.push(
      new Date(easter.getTime() + 86400000), // Easter Monday
      new Date(easter.getTime() + 49 * 86400000) // Whit Monday
    );

    return holidays;
  };

  const calculateEaster = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  };

  const holidays = getHungarianHolidays(year);
  const isHoliday = (date: Date): boolean => holidays.some(h => h.getDate() === date.getDate() && h.getMonth() === date.getMonth());

  const getDaysInMonth = (month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleMouseDown = (date: Date | null) => {
    if (!date || viewMode === 'manager') return;
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleMouseEnter = (date: Date | null) => {
    if (!isDragging || !date || !dragStart) return;
    setDragEnd(date);
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;

    setIsDragging(false);

    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;

    onDateSelection(start, end);

    setDragStart(null);
    setDragEnd(null);
  };

  const isInDragRange = (date: Date | null): boolean => {
    if (!date || !dragStart || !dragEnd) return false;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    return date >= start && date <= end;
  };

  const getLeaveForDate = (date: Date): CalendarLeave[] => {
    if (!calendarData?.leave_requests) return [];

    return calendarData.leave_requests
      .filter(req => {
        const start = parseLocalDate(req.start_date);
        const end = parseLocalDate(req.end_date);
        return date >= start && date <= end;
      })
      .map(req => ({
        id: req.id,
        start_date: req.start_date,
        end_date: req.end_date,
        leave_type_color: req.leave_type_color || '#ffffff',
        leave_type_name_hu: req.leave_type_name_hu || 'Unknown',
        status: req.status || 'approved',
        reason: req.reason,
      }));
  };

  const getTeamAbsenceForDate = (date: Date): TeamLeave[] => {
    if (!teamData?.team_leaves) return [];
    return teamData.team_leaves
      .filter(leave => {
        const start = parseLocalDate(leave.start_date);
        const end = parseLocalDate(leave.end_date);
        return date >= start && date <= end;
      })
      .map(leave => ({
        user_id: leave.user_id,
        employee_name: leave.employee_name,
        start_date: leave.start_date,
        end_date: leave.end_date,
        leave_type_name_hu: leave.leave_type_name_hu || 'Unknown',
        status: leave.status || 'approved'
      }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4"
         onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {monthsHu.map((monthName, monthIndex) => {
        const days = getDaysInMonth(monthIndex);

        return (
          <div key={monthName} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 print:break-inside-avoid">
            <h3 className="font-bold text-gray-900 mb-3 text-center">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDaysHu.map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, dayIndex) => {
                if (!date) return <div key={`empty-${dayIndex}`} className="aspect-square" />;

                const leaves = viewMode === 'my' ? getLeaveForDate(date) : [];
                const teamAbsences = viewMode === 'manager' ? getTeamAbsenceForDate(date) : [];
                const inRange = isInDragRange(date);
                const todayFlag = isSameDay(date, today);

                if (viewMode === 'manager') {
                  return (
                    <ManagerHeatmapCell
                      key={date.toISOString()}
                      date={date}
                      teamSize={teamData?.team_size || 0}
                      absences={teamAbsences}
                      isWeekend={isWeekend(date)}
                      isHoliday={isHoliday(date)}
                      isToday={todayFlag}
                    />
                  );
                }

                return (
                  <CalendarDay
                    key={date.toISOString()}
                    date={date}
                    leaves={leaves}
                    isWeekend={isWeekend(date)}
                    isHoliday={isHoliday(date)}
                    isInDragRange={inRange}
                    isDragging={isDragging}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    isToday={todayFlag}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default YearCalendarGrid;

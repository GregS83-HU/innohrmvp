import React, { useState, useRef } from 'react';
import CalendarDay from './calendar_day';
import ManagerHeatmapCell from './manager_heatmap_cell';

interface YearCalendarGridProps {
  year: number;
  viewMode: 'my' | 'manager';
  calendarData: any;
  teamData: any;
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsHu = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDaysHu = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

  // Helper function to parse date strings without timezone conversion
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to compare dates by day only (ignoring time)
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Get Hungarian public holidays
  const getHungarianHolidays = (year: number): Date[] => {
    // Fixed holidays
    const holidays = [
      new Date(year, 0, 1),   // New Year
      new Date(year, 2, 15),  // National Day
      new Date(year, 4, 1),   // Labour Day
      new Date(year, 7, 20),  // St. Stephen's Day
      new Date(year, 9, 23),  // 1956 Revolution
      new Date(year, 10, 1),  // All Saints' Day
      new Date(year, 11, 25), // Christmas Day
      new Date(year, 11, 26)  // Boxing Day
    ];

    // Easter-based holidays (simplified calculation)
    const easter = calculateEaster(year);
    holidays.push(
      new Date(easter.getTime() + 86400000),  // Easter Monday
      new Date(easter.getTime() + 49 * 86400000) // Whit Monday
    );

    return holidays;
  };

  const today = new Date();

  // Simplified Easter calculation (Computus)
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

  const isHoliday = (date: Date): boolean => {
    return holidays.some(h => 
      h.getDate() === date.getDate() && 
      h.getMonth() === date.getMonth()
    );
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Get days in month
  const getDaysInMonth = (month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Get day of week (0=Sunday, 1=Monday, etc)
    let firstDayOfWeek = firstDay.getDay();
    // Convert to Monday=0 format
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null as any);
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Handle mouse down on date
  const handleMouseDown = (date: Date | null) => {
    if (!date || viewMode === 'manager') return;
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  // Handle mouse enter on date
  const handleMouseEnter = (date: Date | null) => {
    if (!isDragging || !date || !dragStart) return;
    setDragEnd(date);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;
    
    setIsDragging(false);
    
    // Determine start and end dates (in case user dragged backwards)
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    
    onDateSelection(start, end);
    
    setDragStart(null);
    setDragEnd(null);
  };

  // Check if date is in drag range
  const isInDragRange = (date: Date | null): boolean => {
    if (!date || !dragStart || !dragEnd) return false;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    return date >= start && date <= end;
  };

  // Get leave data for a specific date
  const getLeaveForDate = (date: Date) => {
    if (!calendarData?.leave_requests) return [];
    
    return calendarData.leave_requests.filter((req: any) => {
      const start = parseLocalDate(req.start_date);
      const end = parseLocalDate(req.end_date);
      
      // Compare dates by day only
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      return dateOnly >= startOnly && dateOnly <= endOnly;
    });
  };

  // Get team absence for a specific date
  const getTeamAbsenceForDate = (date: Date) => {
    if (!teamData?.team_leaves) return [];
    
    return teamData.team_leaves.filter((leave: any) => {
      const start = parseLocalDate(leave.start_date);
      const end = parseLocalDate(leave.end_date);
      
      // Compare dates by day only
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      return dateOnly >= startOnly && dateOnly <= endOnly;
    });
  };

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {months.map((month, monthIndex) => {
        const days = getDaysInMonth(monthIndex);
        
        return (
          <div 
            key={month} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 print:break-inside-avoid"
          >
            {/* Month Header */}
            <h3 className="font-bold text-gray-900 mb-3 text-center">
              {monthsHu[monthIndex]}
            </h3>

            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDaysHu.map((day) => (
                <div 
                  key={day} 
                  className="text-xs font-medium text-gray-500 text-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, dayIndex) => {
                if (!date) {
                  return <div key={`empty-${dayIndex}`} className="aspect-square" />;
                }

                const leaves = viewMode === 'my' ? getLeaveForDate(date) : [];
                const teamAbsences = viewMode === 'manager' ? getTeamAbsenceForDate(date) : [];
                const isInRange = isInDragRange(date);
                const isToday = isSameDay(date, today);

                if (viewMode === 'manager') {
                  return (
                    <ManagerHeatmapCell
                      key={date.toISOString()}
                      date={date}
                      teamSize={teamData?.team_size || 0}
                      absences={teamAbsences}
                      isWeekend={isWeekend(date)}
                      isHoliday={isHoliday(date)}
                      isToday={isToday}
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
                    isInDragRange={isInRange}
                    isDragging={isDragging}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    isToday={isToday}
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
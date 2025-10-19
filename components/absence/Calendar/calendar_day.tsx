import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';

interface CalendarDayProps {
  date: Date;
  leaves: Leave[];
  isWeekend: boolean;
  isHoliday: boolean;
  isInDragRange: boolean;
  isDragging: boolean;
  isToday: boolean;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
}

interface Leave {
  leave_type_color: string;
  status: 'pending' | 'approved'; // expand if you have more statuses
  leave_type_name_hu: string;
  reason?: string;
}

export interface CalendarLeave {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  leave_type_color: string;
  leave_type_name_hu: string;
  status: 'pending' | 'approved';
  reason?: string;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  leaves,
  isWeekend,
  isHoliday,
  isInDragRange,
  isDragging,
  isToday,
  onMouseDown,
  onMouseEnter
}) => {
  const { t } = useLocale();
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if there are overlapping leaves (error state)
  const hasOverlap = leaves.length > 1;

  // Get the primary leave color
  const getBackgroundColor = () => {
    if (hasOverlap) {
      return '#ff0000'; // Bright red for overlap error
    }
    
    if (leaves.length === 1) {
      return leaves[0].leave_type_color;
    }
    
    if (isHoliday) {
      return '#e9d5ff'; // Purple for holidays
    }
    
    if (isWeekend) {
      return '#f3f4f6'; // Gray for weekends
    }
    
    return '#ffffff'; // White for regular days
  };

  // Get border style based on status
  const getBorderStyle = () => {
    if (hasOverlap) {
      return '2px solid #dc2626'; // Red border for overlap
    }
    
    if (leaves.length === 1) {
      const leave = leaves[0];
      if (leave.status === 'pending') {
        return '2px dashed #9ca3af'; // Dashed for pending
      }
      return '2px solid #d1d5db'; // Solid for approved
    }
    
    return '1px solid #e5e7eb'; // Default border
  };

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const dayNumber = date.getDate();
  const backgroundColor = getBackgroundColor();
  const borderStyle = getBorderStyle();

  // Check if date is in the past
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className="relative aspect-square"
      onMouseDown={() => onMouseDown(date)}
      onMouseEnter={() => onMouseEnter(date)}
      onMouseOver={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          w-full h-full rounded flex items-center justify-center text-xs font-medium
          transition-all duration-150 cursor-pointer select-none
          ${isInDragRange ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${isDragging ? 'cursor-grabbing' : 'hover:shadow-md'}
          ${isPast ? 'opacity-60' : ''}
          ${isToday ? 'bg-green-700 text-white font-bold' : ''}
          print:cursor-default
        `}
        style={{
          backgroundColor,
          border: borderStyle
        }}
      >
        <span className={`
          ${isWeekend || isHoliday ? 'text-gray-600' : 'text-gray-900'}
          ${hasOverlap ? 'text-white font-bold' : ''}
        `}>
          {dayNumber}
        </span>

        {/* Holiday indicator */}
        {isHoliday && !hasOverlap && (
          <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-purple-600">
            {t('calendarDay.holidayIndicator')}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (leaves.length > 0 || isHoliday) && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none print:hidden">
          <div className="space-y-1">
            <p className="font-semibold">{formatDate(date)}</p>
            
            {isHoliday && (
              <p className="text-purple-300">{t('calendarDay.tooltip.publicHoliday')}</p>
            )}
            
            {hasOverlap && (
              <p className="text-red-300 font-bold">{t('calendarDay.tooltip.overlappingLeaves')}</p>
            )}
            
            {leaves.map((leave, index) => (
              <div key={index} className="space-y-0.5">
                <p className="font-medium">{leave.leave_type_name_hu}</p>
                <p className="text-gray-300 text-[10px]">
                  {leave.status === 'pending' 
                    ? t('calendarDay.tooltip.statusPending') 
                    : t('calendarDay.tooltip.statusApproved')}
                </p>
                {leave.reason && (
                  <p className="text-gray-400 text-[10px] italic">{leave.reason}</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
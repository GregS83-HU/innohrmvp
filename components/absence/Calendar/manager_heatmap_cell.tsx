import React, { useState } from 'react';

interface ManagerHeatmapCellProps {
  date: Date;
  teamSize: number;
  absences: any[];
  isWeekend: boolean;
  isHoliday: boolean;
  isToday: boolean;
}

const ManagerHeatmapCell: React.FC<ManagerHeatmapCellProps> = ({
  date,
  teamSize,
  absences,
  isWeekend,
  isHoliday,
  isToday
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate absence percentage
  const calculateAbsencePercentage = (): number => {
    if (teamSize === 0) return 0;
    
    // Count unique employees absent on this date
    const uniqueEmployees = new Set(absences.map(a => a.user_id));
    return (uniqueEmployees.size / teamSize) * 100;
  };

  // Get background color based on percentage
  const getBackgroundColor = (percentage: number): string => {
    if (isWeekend) {
      return '#f3f4f6'; // Gray for weekends
    }
    
    if (percentage === 0) {
      return '#ffffff'; // White - no absences
    } else if (percentage <= 20) {
      return '#fed7aa'; // Light orange - 1-20%
    } else if (percentage <= 40) {
      return '#fb923c'; // Dark orange - 21-40%
    } else {
      return '#f87171'; // Red - >40%
    }
  };

  const percentage = calculateAbsencePercentage();
  const backgroundColor = getBackgroundColor(percentage);
  const dayNumber = date.getDate();

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group absences by employee
  const getAbsentEmployees = () => {
    const employeeMap = new Map();
    
    absences.forEach(absence => {
      if (!employeeMap.has(absence.user_id)) {
        employeeMap.set(absence.user_id, {
          name: absence.employee_name,
          leaves: []
        });
      }
      employeeMap.get(absence.user_id).leaves.push(absence);
    });
    
    return Array.from(employeeMap.values());
  };

  const absentEmployees = getAbsentEmployees();

  return (
    <div
      className="relative aspect-square"
      onMouseOver={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="w-full h-full rounded flex items-center justify-center text-xs font-medium border border-gray-200 transition-all"
        style={{ backgroundColor }}
      >
        <span className={`${isWeekend ? 'text-gray-600' : 'text-gray-900'}`}>
          {dayNumber}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && absences.length > 0 && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-max pointer-events-none print:hidden">
          <div className="space-y-1">
            <p className="font-semibold">{formatDate(date)}</p>
            
            <p className="text-orange-300">
              {absentEmployees.length} of {teamSize} absent ({Math.round(percentage)}%)
            </p>
            
            <div className="border-t border-gray-700 mt-2 pt-2 space-y-1.5">
              {absentEmployees.map((employee, index) => (
                <div key={index}>
                  <p className="font-medium">{employee.name}</p>
                  {employee.leaves.map((leave: any, leaveIndex: number) => (
                    <p key={leaveIndex} className="text-gray-400 text-[10px]">
                      • {leave.leave_type_name_hu} 
                      {leave.status === 'pending' && ' (Pending)'}
                    </p>
                  ))}
                </div>
              ))}
            </div>
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

export default ManagerHeatmapCell;
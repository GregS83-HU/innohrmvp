import React from 'react';

interface CalendarLegendProps {
  viewMode: 'my' | 'manager';
  leaveTypes: any[];
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({ viewMode, leaveTypes }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Legend</h3>
      
      {viewMode === 'my' ? (
        <div className="space-y-3">
          {/* Leave Type Colors */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Leave Types:</p>
            <div className="flex flex-wrap gap-3">
              {leaveTypes.map((type) => (
                <div key={type.leave_type_id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: type.leave_type_color }}
                  />
                  <span className="text-xs text-gray-700">{type.leave_type_name_hu}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Indicators */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Status:</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-blue-100" />
                <span className="text-xs text-gray-700">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400 bg-yellow-50" />
                <span className="text-xs text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-100" />
                <span className="text-xs text-gray-700">Overlap Error</span>
              </div>
            </div>
          </div>

          {/* Special Days */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Special Days:</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                <span className="text-xs text-gray-700">Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-purple-600">H</span>
                </div>
                <span className="text-xs text-gray-700">Public Holiday</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-2">Team Absence Levels:</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-300" />
              <span className="text-xs text-gray-700">0% (No absences)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200" />
              <span className="text-xs text-gray-700">1-20%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-300 border border-orange-400" />
              <span className="text-xs text-gray-700">21-40%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400 border border-red-500" />
              <span className="text-xs text-gray-700">&gt;40% (High absence)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
              <span className="text-xs text-gray-700">Weekend</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">Hover over days to see team member names</p>
        </div>
      )}
    </div>
  );
};

export default CalendarLegend;
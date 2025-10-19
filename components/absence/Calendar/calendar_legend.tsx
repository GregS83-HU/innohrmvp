import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

interface LeaveType {
  leave_type_id: string;
  leave_type_color: string;
  leave_type_name_hu: string;
}

interface CalendarLegendProps {
  viewMode: 'my' | 'manager';
  leaveTypes: LeaveType[];
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({ viewMode, leaveTypes }) => {
  const { t } = useLocale();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('calendarLegend.title')}</h3>
      
      {viewMode === 'my' ? (
        <div className="space-y-3">
          {/* Leave Type Colors */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.myView.leaveTypes')}</p>
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
            <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.myView.status')}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-blue-100" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.statusApproved')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400 bg-yellow-50" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.statusPending')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-100" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.statusOverlapError')}</span>
              </div>
            </div>
          </div>

          {/* Special Days */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.myView.specialDays')}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.weekend')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-purple-600">H</span>
                </div>
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.publicHoliday')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.managerView.teamAbsenceLevels')}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-300" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.noAbsences')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.lowAbsence')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-300 border border-orange-400" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.mediumAbsence')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400 border border-red-500" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.highAbsence')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.weekend')}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">{t('calendarLegend.managerView.hoverHint')}</p>
        </div>
      )}
    </div>
  );
};

export default CalendarLegend;
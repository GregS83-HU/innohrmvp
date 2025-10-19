// File: components/absence/LeaveBalances.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { CalendarDays } from 'lucide-react';
import { LeaveBalance } from '../../types/absence';

const LeaveBalances: React.FC<{ balances: LeaveBalance[] }> = ({ balances }) => {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        {t('leaveBalances.title', { year: currentYear })}
      </h2>
      {balances.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('leaveBalances.noBalances')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((balance) => (
            <div
              key={balance.leave_type_id}
              className="border rounded-xl p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: balance.leave_type_color + '30' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: balance.leave_type_color }}
                />
                <h3 className="font-semibold text-gray-900 text-sm">
                  {balance.leave_type_name_hu}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('leaveBalances.fields.total')}</span>
                  <span className="font-medium">{balance.total_days} {t('leaveBalances.fields.days')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('leaveBalances.fields.used')}</span>
                  <span className="font-medium text-red-600">{balance.used_days} {t('leaveBalances.fields.days')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('leaveBalances.fields.pending')}</span>
                  <span className="font-medium text-orange-600">{balance.pending_days} {t('leaveBalances.fields.days')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">{t('leaveBalances.fields.remaining')}</span>
                  <span className="font-bold text-green-600">{balance.remaining_days} {t('leaveBalances.fields.days')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveBalances;
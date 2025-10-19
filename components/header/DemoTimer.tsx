// components/Header/DemoTimer.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { Clock } from 'lucide-react';

interface DemoTimerProps {
  isDemoMode: boolean;
  isDemoExpired: boolean;
  demoTimeLeft: number | null;
  formatTime: (seconds: number) => string;
}

export const DemoTimer: React.FC<DemoTimerProps> = ({
  isDemoMode,
  isDemoExpired,
  demoTimeLeft,
  formatTime
}) => {
  const { t } = useLocale();

  if (!isDemoMode && !isDemoExpired) return null;

  const timerBarColor = isDemoExpired
    ? 'bg-gradient-to-r from-red-600 to-red-700'
    : demoTimeLeft && demoTimeLeft < 300 // Less than 5 minutes
    ? 'bg-gradient-to-r from-red-400 to-orange-500'
    : 'bg-gradient-to-r from-orange-400 to-red-500';

  const timerMessage = isDemoExpired
    ? t('demoTimer.expired')
    : t('demoTimer.active', { time: demoTimeLeft ? formatTime(demoTimeLeft) : '00:00' });

  return (
    <div className={`${timerBarColor} text-white px-4 py-2`}>
      <div className="max-w-8xl mx-auto flex items-center justify-center gap-3">
        <Clock className="w-4 h-4" />
        <span className="font-semibold text-sm">
          {timerMessage}
        </span>
        {!isDemoExpired && (
          <div className="hidden sm:block text-xs opacity-90">
            {t('demoTimer.autoCloseWarning')}
          </div>
        )}
      </div>
    </div>
  );
};
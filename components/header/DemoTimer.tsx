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

  // Quiet status strip: amber while the demo runs, red once it is about
  // to expire (or has expired). Color carries the meaning, not decoration.
  const urgent = isDemoExpired || (demoTimeLeft !== null && demoTimeLeft < 300);
  const timerBarColor = urgent
    ? 'bg-red-50 text-red-800 border-red-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  const timerMessage = isDemoExpired
    ? t('demoTimer.expired')
    : t('demoTimer.active', { time: demoTimeLeft ? formatTime(demoTimeLeft) : '00:00' });

  return (
    <div className={`${timerBarColor} border-b px-4 py-2`}>
      <div className="max-w-8xl mx-auto flex items-center justify-center gap-3">
        <Clock className="w-4 h-4" />
        <span className="font-semibold text-sm">
          {timerMessage}
        </span>
        {!isDemoExpired && (
          <div className="hidden sm:block text-xs opacity-80">
            {t('demoTimer.autoCloseWarning')}
          </div>
        )}
      </div>
    </div>
  );
};
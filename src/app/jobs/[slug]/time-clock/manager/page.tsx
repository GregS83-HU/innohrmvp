'use client';

import ManagerTimeClockDashboard from '../../../../../../components/timeclock/ManagerTimeClockDashboard';
import { useSession } from '@supabase/auth-helpers-react';
import { useLocale } from 'i18n/LocaleProvider';

export default function Page() {
  const { t } = useLocale();
  const session = useSession();

  if (session === undefined) {
    // session is still loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('managerTimeClockPage.loading')}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('managerTimeClockPage.loginRequired')}</p>
      </div>
    );
  }

  const managerId = session.user.id;
  console.log("manager_id:", managerId);
  const managerName = session.user.user_metadata?.full_name || t('managerTimeClockPage.defaultManagerName');

  return <ManagerTimeClockDashboard managerId={managerId} managerName={managerName} />;
}
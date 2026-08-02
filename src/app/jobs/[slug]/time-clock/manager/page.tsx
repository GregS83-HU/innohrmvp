'use client';

import ManagerTimeClockDashboard from '../../../../../../components/timeclock/ManagerTimeClockDashboard';
import { useSession } from '@supabase/auth-helpers-react';
import { useLocale } from 'i18n/LocaleProvider';
import { useParams } from 'next/navigation';
import { useModuleAccess } from '../../../../../../hooks/useModuleAccess';
import LockedModuleNotice from '../../../../../../components/entitlements/LockedModuleNotice';

export default function Page() {
  const { t } = useLocale();
  const session = useSession();
  const params = useParams();
  const slug = params.slug as string;
  const moduleAccess = useModuleAccess(session?.user?.id);

  if (session === undefined || moduleAccess.loading) {
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

  // Locked preview for admins on a plan that doesn't include attendance.
  // Non-admins should never reach this page (hidden from their nav), but
  // the same check applies defensively either way. See MODULE_GATING_FIX.md.
  if (!moduleAccess.payrollAttendanceAbsencesEnabled) {
    if (!moduleAccess.isAdmin) return null;
    return (
      <div className="min-h-screen p-8">
        <LockedModuleNotice
          feature="attendance.use"
          plan={moduleAccess.plan}
          upgradeHref={moduleAccess.onboardingCompleted ? `/jobs/${slug}/subscription` : `/jobs/${slug}/contact`}
          reason={moduleAccess.onboardingCompleted ? 'plan' : 'onboarding'}
        />
      </div>
    );
  }

  const managerId = session.user.id;
  const managerName = session.user.user_metadata?.full_name || t('managerTimeClockPage.defaultManagerName');

  return <ManagerTimeClockDashboard managerId={managerId} managerName={managerName} />;
}
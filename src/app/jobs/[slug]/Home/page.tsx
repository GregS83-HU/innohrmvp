'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Briefcase, Plus, Smile, BarChart3, Stethoscope, Target, Users, CalendarClock,
  CreditCard, UserCog, TicketPlus, AlertTriangle, CheckCircle, LogIn, Rocket, ChevronRight,
} from 'lucide-react';
import { useLocale } from '../../../../i18n/LocaleProvider';
import { useParams } from 'next/navigation';
import { useHeaderLogic } from '../../../../../hooks/useHeaderLogic';
import { LoginModal } from '../../../../../components/header/';
import { useModuleAccess } from '../../../../../hooks/useModuleAccess';
import { buttonClass, cardClass, eyebrowClass, iconTileClass, pageClass } from '../../../../../components/ui/styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Private SaaS entry point for a specific, already-onboarded company -
// reached only by someone who already knows their company's slug (e.g.
// /jobs/acme-corp). Not a marketing/candidate page - see
// src/app/page.tsx for the public homepage. Shows company branding and
// either a login prompt or a role-aware dashboard of quick links.
export default function HomePage() {
  const { t } = useLocale();
  const params = useParams();
  const slug = params?.slug as string;

  const {
    isLoginOpen, setIsLoginOpen,
    login, setLogin,
    password, setPassword,
    user,
    error,
    companyLogo,
    companyId,
    isDemoExpired,
    companySlug,
    buildLink,
    handleLogin,
  } = useHeaderLogic();

  const [companyName, setCompanyName] = useState<string>('');
  const [showDemoDisclaimer, setShowDemoDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const isAdmin = useMemo(() => !!user && user.is_admin, [user]);
  const isManagerOrAdmin = useMemo(() => !!user && (user.is_manager || user.is_admin), [user]);
  // Admins always see attendance/absences/performance tiles (locked
  // preview at the destination page if the plan doesn't include them);
  // everyone else only sees them when the plan actually includes them -
  // see MODULE_GATING_FIX.md.
  const moduleAccess = useModuleAccess(user?.id);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('company')
      .select('company_name')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data?.company_name) setCompanyName(data.company_name);
      });
  }, [slug]);

  useEffect(() => {
    // Check if slug is "demo" and if disclaimer hasn't been accepted in this session
    if (slug === 'demo') {
      const sessionKey = 'demo_disclaimer_accepted';
      const hasAccepted = sessionStorage.getItem(sessionKey);

      if (!hasAccepted) {
        setShowDemoDisclaimer(true);
      }
    }
  }, [slug]);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('demo_disclaimer_accepted', 'true');
    setShowDemoDisclaimer(false);
  };

  // Tiles are grouped by area of work rather than colored individually:
  // one accent color for every tile, and the grouping carries the meaning.
  type DashboardGroup = 'recruitment' | 'time' | 'engagement' | 'admin';
  type DashboardCard = { href: string; label: string; icon: React.ElementType; group: DashboardGroup };

  const cards: DashboardCard[] = useMemo(() => {
    if (!user) return [];
    const items: DashboardCard[] = [
      {
        href: buildLink('/openedpositions'),
        label: isManagerOrAdmin ? t('header.yourPositions') : t('header.availablePositions'),
        icon: Briefcase,
        group: 'recruitment',
      },
    ];
    if (isAdmin) {
      items.push({ href: buildLink('/openedpositions/new'), label: t('header.createPosition'), icon: Plus, group: 'recruitment' });
    }
    if (companyId) {
      items.push({ href: buildLink('/happiness-check'), label: t('header.happyCheck'), icon: Smile, group: 'engagement' });
    }
    if (isManagerOrAdmin && (isAdmin || moduleAccess.advancedReportingEnabled)) {
      items.push({ href: buildLink('/openedpositions/analytics'), label: t('header.recruitmentDashboard'), icon: BarChart3, group: 'recruitment' });
    }
    if (isAdmin) {
      items.push({ href: buildLink('/happiness-dashboard'), label: t('header.happinessDashboard'), icon: BarChart3, group: 'engagement' });
      items.push({ href: buildLink('/medical-certificate/list'), label: t('header.listCertificates'), icon: Stethoscope, group: 'time' });
    }
    if (isAdmin || moduleAccess.performanceEnabled) {
      items.push({ href: buildLink('/performance'), label: t('header.myPerformance'), icon: Target, group: 'engagement' });
    }
    if (isManagerOrAdmin && (isAdmin || moduleAccess.performanceEnabled)) {
      items.push({ href: buildLink('/performance/team'), label: t('header.teamPerformance'), icon: Users, group: 'engagement' });
    }
    if (isManagerOrAdmin && (isAdmin || moduleAccess.attendanceAbsencesEnabled)) {
      items.push({ href: buildLink('/time-clock/manager'), label: t('header.timeClockCheck'), icon: CalendarClock, group: 'time' });
    }
    if (isAdmin || moduleAccess.attendanceAbsencesEnabled) {
      items.push({ href: buildLink('/absences'), label: t('header.absences'), icon: CalendarClock, group: 'time' });
    }
    if (isAdmin) {
      items.push({ href: buildLink('/subscription'), label: t('header.manageSubscription'), icon: CreditCard, group: 'admin' });
      items.push({ href: buildLink('/users-creation'), label: t('header.manageUsers'), icon: UserCog, group: 'admin' });
      if (companySlug !== 'demo') {
        items.push({ href: buildLink('/tickets'), label: t('header.supportTickets'), icon: TicketPlus, group: 'admin' });
      }
    }
    return items;
  }, [user, isAdmin, isManagerOrAdmin, companyId, companySlug, buildLink, t, moduleAccess.performanceEnabled, moduleAccess.attendanceAbsencesEnabled, moduleAccess.advancedReportingEnabled]);

  const GROUP_ORDER: DashboardGroup[] = ['recruitment', 'time', 'engagement', 'admin'];
  const groupedCards = GROUP_ORDER
    .map((group) => ({ group, items: cards.filter((c) => c.group === group) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className={`${pageClass} -mx-8 -my-8 px-4`}>

      {/* Demo Disclaimer Modal */}
      {showDemoDisclaimer && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div role="dialog" aria-modal="true" aria-labelledby="demo-disclaimer-title" className="bg-white rounded-xl w-full max-w-xl shadow-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 id="demo-disclaimer-title" className="text-lg font-semibold text-slate-900">{t('home.demo.disclaimer.title')}</h2>
                <p className="text-sm text-slate-500">{t('home.demo.disclaimer.subtitle')}</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-slate-700 leading-relaxed">{t('home.demo.disclaimer.message')}</p>
              <ul className="space-y-2.5">
                {(['point1', 'point2', 'point3'] as const).map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" aria-hidden="true" />
                    {t(`home.demo.disclaimer.${point}`)}
                  </li>
                ))}
              </ul>
              <label htmlFor="demo-consent" className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 cursor-pointer">
                <input
                  id="demo-consent"
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600 flex-shrink-0"
                />
                {t('home.demo.disclaimer.consent')}
              </label>
              <button
                onClick={handleAcceptDisclaimer}
                disabled={!disclaimerAccepted}
                className={buttonClass('primary', 'lg', 'w-full')}
              >
                <CheckCircle className="w-4 h-4" />
                {t('home.demo.disclaimer.accept')}
              </button>
              <p className="text-xs text-slate-500 text-center">{t('home.demo.disclaimer.footer')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center pt-14 pb-16 px-4 w-full">
        {companyLogo && (
          // eslint-disable-next-line @next/next/no-img-element -- customer-uploaded logo on an arbitrary storage host; next/image would need remotePatterns for it
          <img src={companyLogo} alt={companyName || 'Company logo'} className="h-14 object-contain mb-6" />
        )}

        {user ? (
          <div className="w-full max-w-5xl mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
              {t('home.dashboard.welcomeBack', { name: user.firstname })}
            </h1>
            <p className="text-slate-500">
              {companyName ? t('home.dashboard.subtitleCompany', { company: companyName }) : t('home.dashboard.subtitle')}
            </p>
          </div>
        ) : (
          <div className="text-center mb-10 max-w-xl">
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
              {companyName || t('home.dashboard.defaultTitle')}
            </h1>
            <p className="text-slate-500 mb-6">{t('home.dashboard.loginPrompt')}</p>
            <button
              onClick={() => setIsLoginOpen(true)}
              disabled={isDemoExpired}
              className={buttonClass('primary', 'lg')}
            >
              <LogIn className="w-4 h-4" />
              {t('header.login')}
            </button>
          </div>
        )}

        {user && isAdmin && !moduleAccess.loading && !moduleAccess.onboardingCompleted && (
          <div className={`${cardClass} w-full max-w-5xl mb-8 p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-l-brand-600`}>
            <div className={iconTileClass}>
              <Rocket className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{t('onboardingWizard.banner.title')}</p>
              <p className="text-sm text-slate-500">{t('onboardingWizard.banner.message')}</p>
            </div>
            <a href={buildLink('/onboarding')} className={buttonClass('primary', 'md', 'whitespace-nowrap')}>
              {t('onboardingWizard.banner.cta')}
            </a>
          </div>
        )}

        {user && groupedCards.length > 0 && (
          <div className="w-full max-w-5xl space-y-8">
            {groupedCards.map(({ group, items }) => (
              <section key={group} aria-labelledby={`dashboard-group-${group}`}>
                <h2 id={`dashboard-group-${group}`} className={`${eyebrowClass} mb-3`}>
                  {t(`home.dashboard.groups.${group}`)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(({ href, label, icon: Icon }) => (
                    <a
                      key={href + label}
                      href={href}
                      className={`${cardClass} group flex items-center gap-3 p-4 text-slate-800 font-medium hover:border-brand-300 hover:bg-brand-50/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
                    >
                      <span className={iconTileClass}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="flex-1">{label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        login={login}
        setLogin={setLogin}
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
        error={error}
        isDemoExpired={isDemoExpired}
      />
    </div>
  );
}

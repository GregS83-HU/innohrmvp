'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Briefcase, Plus, Smile, BarChart3, Stethoscope, Target, Users, CalendarClock,
  CreditCard, UserCog, TicketPlus, AlertTriangle, CheckCircle, LogIn,
} from 'lucide-react';
import { useLocale } from '../../../../i18n/LocaleProvider';
import { useParams } from 'next/navigation';
import { useHeaderLogic } from '../../../../../hooks/useHeaderLogic';
import { LoginModal } from '../../../../../components/header/';
import { useModuleAccess } from '../../../../../hooks/useModuleAccess';

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
  const isManager = useMemo(() => !!user && user.is_manager && !user.is_admin, [user]);
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

  type DashboardCard = { href: string; label: string; icon: React.ElementType; color: string };

  const cards: DashboardCard[] = useMemo(() => {
    if (!user) return [];
    const items: DashboardCard[] = [
      {
        href: buildLink('/openedpositions'),
        label: isManagerOrAdmin ? t('header.yourPositions') : t('header.availablePositions'),
        icon: Briefcase,
        color: 'purple',
      },
    ];
    if (isAdmin) {
      items.push({ href: buildLink('/openedpositions/new'), label: t('header.createPosition'), icon: Plus, color: 'green' });
    }
    if (companyId) {
      items.push({ href: buildLink('/happiness-check'), label: t('header.happyCheck'), icon: Smile, color: 'yellow' });
    }
    if (isManagerOrAdmin) {
      items.push({ href: buildLink('/openedpositions/analytics'), label: t('header.recruitmentDashboard'), icon: BarChart3, color: 'blue' });
    }
    if (isAdmin) {
      items.push({ href: buildLink('/happiness-dashboard'), label: t('header.happinessDashboard'), icon: BarChart3, color: 'blue' });
      items.push({ href: buildLink('/medical-certificate/list'), label: t('header.listCertificates'), icon: Stethoscope, color: 'blue' });
    }
    if (isAdmin || moduleAccess.performanceEnabled) {
      items.push({ href: buildLink('/performance'), label: t('header.myPerformance'), icon: Target, color: 'orange' });
    }
    if (isManagerOrAdmin && (isAdmin || moduleAccess.performanceEnabled)) {
      items.push({ href: buildLink('/performance/team'), label: t('header.teamPerformance'), icon: Users, color: 'orange' });
    }
    if (isManagerOrAdmin && (isAdmin || moduleAccess.attendanceAbsencesEnabled)) {
      items.push({ href: buildLink('/time-clock/manager'), label: t('header.timeClockCheck'), icon: CalendarClock, color: 'indigo' });
    }
    if (isAdmin || moduleAccess.attendanceAbsencesEnabled) {
      items.push({ href: buildLink('/absences'), label: t('header.absences'), icon: CalendarClock, color: 'indigo' });
    }
    if (isAdmin) {
      items.push({ href: buildLink('/subscription'), label: t('header.manageSubscription'), icon: CreditCard, color: 'teal' });
      items.push({ href: buildLink('/users-creation'), label: t('header.manageUsers'), icon: UserCog, color: 'teal' });
      if (companySlug !== 'demo') {
        items.push({ href: buildLink('/tickets'), label: t('header.supportTickets'), icon: TicketPlus, color: 'teal' });
      }
    }
    return items;
  }, [user, isAdmin, isManagerOrAdmin, companyId, companySlug, buildLink, t, moduleAccess.performanceEnabled, moduleAccess.attendanceAbsencesEnabled]);

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    teal: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-100 -mx-8 -my-8 px-4">

      {/* Demo Disclaimer Modal */}
      {showDemoDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('home.demo.disclaimer.title')}</h2>
                  <p className="text-white text-opacity-90 text-sm">{t('home.demo.disclaimer.subtitle')}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">{t('home.demo.disclaimer.message')}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700 text-sm">{t('home.demo.disclaimer.point1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700 text-sm">{t('home.demo.disclaimer.point2')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700 text-sm">{t('home.demo.disclaimer.point3')}</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                <input
                  id="demo-consent"
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                />
                <label htmlFor="demo-consent" className="text-sm text-gray-700 cursor-pointer">
                  {t('home.demo.disclaimer.consent')}
                </label>
              </div>
              <button
                onClick={handleAcceptDisclaimer}
                disabled={!disclaimerAccepted}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
              >
                <CheckCircle className="w-5 h-5" />
                {t('home.demo.disclaimer.accept')}
              </button>
              <p className="text-xs text-gray-500 text-center">{t('home.demo.disclaimer.footer')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center pt-16 pb-16 px-4 w-full">
        {companyLogo && (
          <img src={companyLogo} alt={companyName || 'Company logo'} className="h-16 object-contain mb-6" />
        )}

        {user ? (
          <div className="text-center mb-10 max-w-2xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {t('home.dashboard.welcomeBack', { name: user.firstname })}
            </h1>
            <p className="text-gray-600">
              {companyName ? t('home.dashboard.subtitleCompany', { company: companyName }) : t('home.dashboard.subtitle')}
            </p>
          </div>
        ) : (
          <div className="text-center mb-10 max-w-xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              {companyName || t('home.dashboard.defaultTitle')}
            </h1>
            <p className="text-gray-600 mb-6">{t('home.dashboard.loginPrompt')}</p>
            <button
              onClick={() => setIsLoginOpen(true)}
              disabled={isDemoExpired}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-accent-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {t('header.login')}
            </button>
          </div>
        )}

        {user && cards.length > 0 && (
          <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards.map(({ href, label, icon: Icon, color }) => (
              <a
                key={href + label}
                href={href}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-6 text-center font-medium shadow-sm hover:shadow-md transition-all ${colorClasses[color]}`}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </a>
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

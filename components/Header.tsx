'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import {
  Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown,
  User, LogOut, Clock, CreditCard, UserCog, TicketPlus, CalendarClock, Target, Users, Users2, BanknoteArrowDown, FileSearch, Tag
} from 'lucide-react';
import { useHeaderLogic } from '../hooks/useHeaderLogic';
import {
  LoginModal, HappyCheckMenuItem, DemoAwareMenuItem, DemoTimer, ForfaitBadge
} from './header/';
import NotificationComponent from './NotificationComponent';
import TimeClockModal from '../components/timeclock/TimeClockModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocale } from 'i18n/LocaleProvider';

export default function Header() {
  const { t } = useLocale();

  const {
    isLoginOpen, setIsLoginOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isHRToolsMenuOpen, setIsHRToolsMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    isUserMenuOpen, setIsUserMenuOpen,
    login, setLogin,
    password, setPassword,
    user,
    error,
    companyLogo,
    companyId,
    companyForfait,
    canAccessHappyCheck,
    demoTimeLeft,
    isDemoMode,
    isDemoExpired,
    hrToolsMenuRef,
    accountMenuRef,
    userMenuRef,
    companySlug,
    buildLink,
    handleLogin,
    handleLogout,
    formatTime,
  } = useHeaderLogic();

  const [isTimeClockOpen, setIsTimeClockOpen] = React.useState(false);
  const [isMobileHRToolsOpen, setIsMobileHRToolsOpen] = React.useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = React.useState(false);

  const isRegularUser = useMemo(() => user && !user.is_manager && !user.is_admin, [user]);
  const isManager = useMemo(() => user && user.is_manager && !user.is_admin, [user]);
  const isAdmin = useMemo(() => user && user.is_admin, [user]);
  const isSuperAdmin = useMemo(() => user && user.is_super_admin === true, [user]);

  const buttonBaseClasses = useMemo(() =>
    'flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap',
    []
  );

  const happyCheckLink = useMemo(() => buildLink('/happiness-check'), [buildLink]);
  const uploadCertificateLink = useMemo(() => buildLink('/medical-certificate/upload'), [buildLink]);
  const manageSubscriptionLink = useMemo(() => buildLink('/subscription'), [buildLink]);
  const manageUsersLink = useMemo(() => buildLink('/users-creation'), [buildLink]);
  const manageticketsLink = useMemo(() => buildLink('/tickets'), [buildLink]);
  const manageabsencesLink = useMemo(() => buildLink('/absences'), [buildLink]);
  const timeclockmanager = useMemo(() => buildLink('/time-clock/manager'), [buildLink]);
  const myperformance = useMemo(() => buildLink('/performance'), [buildLink]);
  const teamperformance = useMemo(() => buildLink('/performance/team'), [buildLink]);
  const manageContactsLink = useMemo(() => buildLink('/contact-submissions'), [buildLink]);
  const manageUsersUpload = useMemo(() => buildLink('/admin/import-users'), [buildLink]);
  const funnelDashboardLink = useMemo(() => buildLink('/admin/funnel'), [buildLink]);
  const payRoll = useMemo(() => buildLink('/payroll'), [buildLink]);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <DemoTimer
          isDemoMode={isDemoMode}
          isDemoExpired={isDemoExpired}
          demoTimeLeft={demoTimeLeft}
          formatTime={formatTime}
        />

        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between w-full mx-auto">

            {/* Logo + Forfait + Language */}
            <div className="flex-shrink-0 flex flex-col items-start gap-1 -ml-2">
              <Link href={companySlug === 'demo' ? `/jobs/demo/contact` : buildLink('/')}>
                <img
                  src={companySlug && companyLogo ? companyLogo : '/HRInnoLogo.jpeg'}
                  alt="Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <ForfaitBadge companyForfait={companyForfait} />
                <div className="hidden sm:flex">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1.5 flex-1 justify-center mx-4 max-w-5xl">

              {/* Available Positions - only in slug context */}
              {companySlug && (
                <DemoAwareMenuItem
                  href={buildLink('/openedpositions')}
                  className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}
                  isDemoExpired={isDemoExpired}
                >
                  <Briefcase className="w-4 h-4" /> {(isManager || isAdmin) ? t('header.yourPositions') : t('header.availablePositions')}
                </DemoAwareMenuItem>
              )}

              {/* Create Position - only in slug context */}
              {companySlug && isAdmin && (
                <DemoAwareMenuItem
                  href={buildLink('/openedpositions/new')}
                  className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700`}
                  isDemoExpired={isDemoExpired}
                >
                  <Plus className="w-4 h-4" /> {t('header.createPosition')}
                </DemoAwareMenuItem>
              )}

              {/* Happy Check - only in slug context */}
              {companySlug && companyId && (
                <HappyCheckMenuItem
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700`}
                  canAccessHappyCheck={canAccessHappyCheck}
                  isDemoExpired={isDemoExpired}
                >
                  <Smile className="w-4 h-4" /> {t('header.happyCheck')}
                </HappyCheckMenuItem>
              )}

              {/* Job Application Assistant - always visible */}
              {!companySlug && (
                <Link
                  href="/job-assistant"
                  className={`${buttonBaseClasses} bg-emerald-50 hover:bg-emerald-100 text-emerald-700`}
                >
                  <FileSearch className="w-4 h-4" /> Job Assistant
                </Link>
              )}

              {/* Pricing - always visible */}
              {!companySlug && (
                <Link
                  href="/pricing"
                  className={`${buttonBaseClasses} bg-brand-50 hover:bg-brand-100 text-brand-700`}
                >
                  <Tag className="w-4 h-4" /> {t('header.pricing')}
                </Link>
              )}

              {/* HR Tools Dropdown - only in slug context */}
              {companySlug && user && (
                <div className="relative" ref={hrToolsMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <Heart className="w-4 h-4" /> {t('header.hrTools')}
                      <ChevronDown className="w-3 h-3" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {t('header.demoExpiredTooltip')}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsHRToolsMenuOpen(!isHRToolsMenuOpen)} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700`}>
                        <Heart className="w-4 h-4" /> {t('header.hrTools')}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHRToolsMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isHRToolsMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('header.hrTools')}</p>
                          </div>
                          {(isManager || isAdmin) && (
                            <Link href={buildLink('/openedpositions/analytics')} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <BarChart3 className="w-4 h-4" /> {t('header.recruitmentDashboard')}
                            </Link>
                          )}
                          {isAdmin && (
                            <HappyCheckMenuItem href={buildLink('/happiness-dashboard')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`} onClick={() => setIsHRToolsMenuOpen(false)} canAccessHappyCheck={canAccessHappyCheck}>
                              <BarChart3 className="w-4 h-4" /> {t('header.happinessDashboard')}
                            </HappyCheckMenuItem>
                          )}
                          {isAdmin && (
                            <Link href={buildLink('/medical-certificate/list')} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <Stethoscope className="w-4 h-4" /> {t('header.listCertificates')}
                            </Link>
                          )}
                          {isAdmin && (
                            <Link href={buildLink('/medical-certificate/download')} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <Stethoscope className="w-4 h-4" /> {t('header.certificatesDownload')}
                            </Link>
                          )}
                          <Link href={myperformance} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-orange-50 text-orange-700 w-full px-4 py-3 border-b border-gray-100`}>
                            <Target className="w-4 h-4" /> {t('header.myPerformance')}
                          </Link>
                          {(isManager || isAdmin) && (
                            <Link href={teamperformance} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-orange-50 text-orange-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <Users className="w-4 h-4" /> {t('header.teamPerformance')}
                            </Link>
                          )}
                          {(isManager || isAdmin) && (
                            <Link href={timeclockmanager} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-indigo-50 text-indigo-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <CalendarClock className="w-4 h-4" /> {t('header.timeClockCheck')}
                            </Link>
                          )}
                          <Link href={manageabsencesLink} onClick={() => setIsHRToolsMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-indigo-50 text-indigo-700 w-full px-4 py-3`}>
                            <CalendarClock className="w-4 h-4" /> {t('header.absences')}
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Manage Account - only in slug context */}
              {companySlug && isAdmin && (
                <div className="relative" ref={accountMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <User className="w-4 h-4" /> {t('header.manageAccount')}
                      <ChevronDown className="w-3 h-3" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {t('header.demoExpiredTooltip')}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700`}>
                        <User className="w-4 h-4" /> {t('header.manageAccount')}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isAccountMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('header.accountManagement')}</p>
                          </div>
                          {companySlug !== 'demo' && (
                            <Link href={manageSubscriptionLink} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <CreditCard className="w-4 h-4" /> {t('header.manageSubscription')}
                            </Link>
                          )}
                          <Link href={manageUsersLink} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3 ${companySlug !== 'demo' ? 'border-b border-gray-100' : ''}`}>
                            <UserCog className="w-4 h-4" /> {t('header.manageUsers')}
                          </Link>
                          {isSuperAdmin && (
                            <Link href={manageContactsLink} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <Users2 className="w-4 h-4" /> {t('header.manageContacts')}
                            </Link>
                          )}
                          {isSuperAdmin && (
                            <Link href={manageUsersUpload} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <Users2 className="w-4 h-4" /> {'User Massive Upload'}
                            </Link>
                          )}
                          {isSuperAdmin && (
                            <Link href={funnelDashboardLink} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <BarChart3 className="w-4 h-4" /> {'Funnel Dashboard'}
                            </Link>
                          )}
                          {isAdmin && (
                            <Link href={payRoll} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3 border-b border-gray-100`}>
                              <BanknoteArrowDown className="w-4 h-4" /> {t('header.payroll')}
                            </Link>
                          )}
                          {companySlug !== 'demo' && (
                            <Link href={manageticketsLink} onClick={() => setIsAccountMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}>
                              <TicketPlus className="w-4 h-4" /> {t('header.supportTickets')}
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notifications - only in slug context */}
              {companySlug && user && (
                <NotificationComponent currentUser={user} companySlug={companySlug} />
              )}

              {/* Mobile language icon */}
              <div className="flex sm:hidden">
                <LanguageSwitcher compact />
              </div>

              {/* Time Clock - only in slug context */}
              {companySlug && user && (
                <button onClick={() => setIsTimeClockOpen(true)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" title={t('header.openTimeClock')}>
                  <Clock className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {/* Demo timer for tablet/mobile */}
              {companySlug && (isDemoMode || isDemoExpired) && (
                <div className={`xl:hidden flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${isDemoExpired ? 'bg-red-100 text-red-800' : demoTimeLeft && demoTimeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                  <Clock className="w-3 h-3" />
                  {isDemoExpired ? t('header.expired') : (demoTimeLeft ? formatTime(demoTimeLeft) : '00:00')}
                </div>
              )}

              {/* Contact Us (demo only) */}
              {companySlug === 'demo' && (
                <DemoAwareMenuItem
                  href={`/jobs/demo/contact`}
                  className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hidden sm:flex`}
                  isDemoExpired={isDemoExpired}
                  isContactUs={true}
                >
                  <User className="w-4 h-4" /> {t('header.contactUs')}
                </DemoAwareMenuItem>
              )}

              {/* Desktop user area - only in slug context */}
              {companySlug && (
                <div className="hidden xl:flex items-center gap-3 min-w-0 flex-shrink">
                  {user ? (
                    <div className="relative min-w-0 flex-1 max-w-[180px]" ref={userMenuRef}>
                      {isDemoExpired ? (
                        <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group min-w-0 w-full`}>
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="truncate min-w-0 flex-1">{user.firstname} {user.lastname}</span>
                          <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {t('header.demoExpiredTooltip')}
                          </div>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`${buttonBaseClasses} bg-gray-50 hover:bg-gray-100 text-gray-700 min-w-0 w-full`}>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="truncate min-w-0 flex-1">{user.firstname} {user.lastname}</span>
                            <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isUserMenuOpen && (
                            <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                              <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm text-gray-600">{t('header.connectedAs')}</p>
                                <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                              </div>
                              <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full px-4 py-3 text-left`}>
                                <LogOut className="w-4 h-4" /> {t('header.logout')}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {companySlug === 'demo' && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setIsLoginOpen(true)}>
                          <span>{t('header.demoProfilesHint')}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                      <button
                        onClick={() => setIsLoginOpen(true)}
                        className={`${buttonBaseClasses} ${isDemoExpired ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        disabled={isDemoExpired}
                      >
                        <User className="w-4 h-4" /> {t('header.login')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile/Tablet menu button */}
              <button className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">

              <div className="flex justify-end mb-3">
                <LanguageSwitcher />
              </div>

              {/* Available Positions - only in slug context */}
              {companySlug && (
                <DemoAwareMenuItem
                  href={buildLink('/openedpositions')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                >
                  <Briefcase className="w-4 h-4" /> {(isManager || isAdmin) ? t('header.yourPositions') : t('header.availablePositions')}
                </DemoAwareMenuItem>
              )}

              {/* Create Position - only in slug context */}
              {companySlug && isAdmin && (
                <DemoAwareMenuItem
                  href={buildLink('/openedpositions/new')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                >
                  <Plus className="w-4 h-4" /> {t('header.createPosition')}
                </DemoAwareMenuItem>
              )}

              {/* Happy Check - only in slug context */}
              {companySlug && companyId && (
                <HappyCheckMenuItem
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700 w-full justify-start`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  canAccessHappyCheck={canAccessHappyCheck}
                  isDemoExpired={isDemoExpired}
                >
                  <Smile className="w-4 h-4" /> {t('header.happyCheck')}
                </HappyCheckMenuItem>
              )}

              {/* Job Application Assistant - always visible */}
              {!companySlug && (
              <Link
                href="/job-assistant"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${buttonBaseClasses} bg-emerald-50 hover:bg-emerald-100 text-emerald-700 w-full justify-start`}
              >
                <FileSearch className="w-4 h-4" /> Job Assistant
              </Link>
              )}

              {/* Pricing - always visible */}
              {!companySlug && (
              <Link
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${buttonBaseClasses} bg-brand-50 hover:bg-brand-100 text-brand-700 w-full justify-start`}
              >
                <Tag className="w-4 h-4" /> {t('header.pricing')}
              </Link>
              )}

              {/* HR Tools - only in slug context */}
              {companySlug && user && (
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => setIsMobileHRToolsOpen(!isMobileHRToolsOpen)}
                    className={`${buttonBaseClasses} ${isDemoExpired ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'} w-full justify-between`}
                    disabled={isDemoExpired}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" /> {t('header.hrTools')}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileHRToolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMobileHRToolsOpen && !isDemoExpired && (
                    <div className="mt-2 ml-4 space-y-2 pb-2">
                      {(isManager || isAdmin) && (
                        <DemoAwareMenuItem href={buildLink('/openedpositions/analytics')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <BarChart3 className="w-4 h-4" /> {t('header.recruitmentDashboard')}
                        </DemoAwareMenuItem>
                      )}
                      {isAdmin && (
                        <HappyCheckMenuItem href={buildLink('/happiness-dashboard')} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start text-sm`} onClick={() => setIsMobileMenuOpen(false)} canAccessHappyCheck={canAccessHappyCheck}>
                          <BarChart3 className="w-4 h-4" /> {t('header.happinessDashboard')}
                        </HappyCheckMenuItem>
                      )}
                      {isAdmin && (
                        <DemoAwareMenuItem href={buildLink('/medical-certificate/list')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <Stethoscope className="w-4 h-4" /> {t('header.listCertificates')}
                        </DemoAwareMenuItem>
                      )}
                      {isAdmin && (
                        <DemoAwareMenuItem href={buildLink('/medical-certificate/download')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <Stethoscope className="w-4 h-4" /> {t('header.certificatesDownload')}
                        </DemoAwareMenuItem>
                      )}
                      <DemoAwareMenuItem href={myperformance} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-orange-50 hover:bg-orange-100 text-orange-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                        <Target className="w-4 h-4" /> {t('header.myPerformance')}
                      </DemoAwareMenuItem>
                      {(isManager || isAdmin) && (
                        <DemoAwareMenuItem href={teamperformance} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-orange-50 hover:bg-orange-100 text-orange-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <Users className="w-4 h-4" /> {t('header.teamPerformance')}
                        </DemoAwareMenuItem>
                      )}
                      {(isManager || isAdmin) && (
                        <DemoAwareMenuItem href={timeclockmanager} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <CalendarClock className="w-4 h-4" /> {t('header.timeClockCheck')}
                        </DemoAwareMenuItem>
                      )}
                      <DemoAwareMenuItem href={manageabsencesLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                        <CalendarClock className="w-4 h-4" /> {t('header.absences')}
                      </DemoAwareMenuItem>
                    </div>
                  )}
                </div>
              )}

              {/* Manage Account - only in slug context */}
              {companySlug && isAdmin && (
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => setIsMobileAccountOpen(!isMobileAccountOpen)}
                    className={`${buttonBaseClasses} ${isDemoExpired ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'} w-full justify-between`}
                    disabled={isDemoExpired}
                  >
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4" /> {t('header.accountManagement')}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileAccountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMobileAccountOpen && !isDemoExpired && (
                    <div className="mt-2 ml-4 space-y-2 pb-2">
                      {companySlug !== 'demo' && (
                        <DemoAwareMenuItem href={manageSubscriptionLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <CreditCard className="w-4 h-4" /> {t('header.manageSubscription')}
                        </DemoAwareMenuItem>
                      )}
                      <DemoAwareMenuItem href={manageUsersLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                        <UserCog className="w-4 h-4" /> {t('header.manageUsers')}
                      </DemoAwareMenuItem>
                      {isSuperAdmin && (
                        <DemoAwareMenuItem href={manageContactsLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <Users2 className="w-4 h-4" /> {t('header.manageContacts')}
                        </DemoAwareMenuItem>
                      )}
                      {companySlug !== 'demo' && (
                        <DemoAwareMenuItem href={manageticketsLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start text-sm`} isDemoExpired={isDemoExpired}>
                          <TicketPlus className="w-4 h-4" /> {t('header.supportTickets')}
                        </DemoAwareMenuItem>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Login/Logout - only in slug context */}
              {companySlug && (
                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full justify-start`}>
                      <LogOut className="w-4 h-4" /> {t('header.logout')}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                      className={`${buttonBaseClasses} ${isDemoExpired ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'} w-full justify-start`}
                      disabled={isDemoExpired}
                    >
                      <User className="w-4 h-4" /> {t('header.login')}
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
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

      {/* Time Clock Modal */}
      {user && (
        <TimeClockModal
          isOpen={isTimeClockOpen}
          onClose={() => setIsTimeClockOpen(false)}
          userId={user.id}
          userName={`${user.firstname} ${user.lastname}`}
        />
      )}
    </>
  );
}
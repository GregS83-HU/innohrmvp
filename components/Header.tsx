'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { 
  Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, 
  User, LogOut, Clock, CreditCard, UserCog, TicketPlus,CalendarClock,  Target, Users 
} from 'lucide-react';
import { useHeaderLogic } from '../hooks/useHeaderLogic';
import { 
  LoginModal, HappyCheckMenuItem, DemoAwareMenuItem, DemoTimer, ForfaitBadge 
} from './header/';
import NotificationComponent from './NotificationComponent';
import TimeClockModal from '../components/timeclock/TimeClockModal';


export default function Header() {
  const {
    // State
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
    
    // Refs
    hrToolsMenuRef,
    accountMenuRef,
    userMenuRef,
    
    // Computed values
    companySlug,
    buildLink,
    
    // Functions
    handleLogin,
    handleLogout,
    formatTime,
  } = useHeaderLogic();

 const [isTimeClockOpen, setIsTimeClockOpen] = React.useState(false);


  // Memoized values
  const buttonBaseClasses = useMemo(() => 
    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap',
    []
  );

  const happyCheckLink = useMemo(() => buildLink('/happiness-check'), [buildLink]);
  const uploadCertificateLink = useMemo(() => buildLink('/medical-certificate/upload'), [buildLink]);
  const manageSubscriptionLink = useMemo(() => buildLink('/subscription'), [buildLink]);
  const manageUsersLink = useMemo(() => buildLink('/users-creation'), [buildLink]);
  const manageticketsLink = useMemo(() => buildLink('/tickets'), [buildLink]);
  const manageabsencesLink = useMemo(() => buildLink('/absences'), [buildLink]);
 // const timeclockadmin = useMemo(() => buildLink('/time-clock/admin'), [buildLink]);
 // const timeclockmanager = useMemo(() => buildLink('/time-clock/manager'), [buildLink]);
 // const timeclockshift = useMemo(() => buildLink('/time-clock/shifts'), [buildLink]);
  const myperformance = useMemo(() => buildLink('/performance'), [buildLink]);
  const teamperformance = useMemo(() => buildLink('/performance/team'), [buildLink]);



  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <DemoTimer 
          isDemoMode={isDemoMode}
          isDemoExpired={isDemoExpired}
          demoTimeLeft={demoTimeLeft}
          formatTime={formatTime}
        />

        <div className="w-full px-4 sm:px-6 lg:px-9 py-4">
          <div className="flex items-center justify-between w-full max-w-8xl mx-auto">
            {/* Logo section */}
            <div className="flex-shrink-0 flex flex-col items-start gap-1 -ml-2">
              <Link href={companySlug === 'demo' ? `/jobs/demo/contact` : buildLink('/')}>
                <img
                  src={companySlug && companyLogo ? companyLogo : '/HRInnoLogo.jpeg'}
                  alt="Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              </Link>
              <ForfaitBadge companyForfait={companyForfait} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-2 flex-1 justify-center mx-8">
              <DemoAwareMenuItem 
                href={buildLink('/openedpositions')}
                className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}
                isDemoExpired={isDemoExpired}
              >
                <Briefcase className="w-4 h-4" /> {user ? 'Your Available Positions' : 'Available Positions'}
              </DemoAwareMenuItem>

              {user && (
                <DemoAwareMenuItem 
                  href={buildLink('/openedpositions/new')}
                  className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700`}
                  isDemoExpired={isDemoExpired}
                >
                  <Plus className="w-4 h-4" /> Create Position
                </DemoAwareMenuItem>
              )}

              {companyId && (
                <HappyCheckMenuItem 
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700`}
                  canAccessHappyCheck={canAccessHappyCheck}
                  isDemoExpired={isDemoExpired}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </HappyCheckMenuItem>
              )}

              {/* HR Tools Dropdown */}
              {user && (
                <div className="relative" ref={hrToolsMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <Heart className="w-4 h-4" /> HR Tools
                      <ChevronDown className="w-3 h-3" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Demo expired - Contact us to continue
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsHRToolsMenuOpen(!isHRToolsMenuOpen)} className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700`}>
                        <Heart className="w-4 h-4" /> HR Tools
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHRToolsMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isHRToolsMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Outils RH</p>
                          </div>

                          <Link href={buildLink('/openedpositions/analytics')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                            <BarChart3 className="w-4 h-4" /> Recruitment Dashboard
                           </Link>

                          <HappyCheckMenuItem
                            href={buildLink('/happiness-dashboard')}
                            className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}
                            onClick={() => setIsHRToolsMenuOpen(false)}
                            canAccessHappyCheck={canAccessHappyCheck}
                          >
                            <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                          </HappyCheckMenuItem>

                          <Link href={buildLink('/medical-certificate/list')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                            <Stethoscope className="w-4 h-4" /> List of Certificates
                          </Link>

                          <Link href={buildLink('/medical-certificate/download')} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3`}>
                            <Stethoscope className="w-4 h-4" /> Certificates Download
                          </Link>

                          <Link 
                            href={myperformance} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <Target className="w-4 h-4" /> My Performance
                          </Link>

                          <Link 
                            href={teamperformance} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <Users className="w-4 h-4" /> Team Performance
                          </Link>

                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Manage Account */}
              {user && companySlug !== 'demo' && (
                <div className="relative" ref={accountMenuRef}>
                  {isDemoExpired ? (
                    <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                      <User className="w-4 h-4" /> Manage Account
                      <ChevronDown className="w-3 h-3" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Demo expired - Contact us to continue
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700`}>
                        <User className="w-4 h-4" /> Manage Account
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isAccountMenuOpen && (
                        <div className="absolute top-full mt-2 left-0 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Account Management</p>
                          </div>

                          <Link 
                            href={manageSubscriptionLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <CreditCard className="w-4 h-4" /> Manage Subscription
                          </Link>

                          <Link 
                            href={manageUsersLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <UserCog className="w-4 h-4" /> Manage your users
                          </Link>

                          <Link 
                            href={manageticketsLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <TicketPlus className="w-4 h-4" /> Support Tickets
                          </Link>

                           <Link 
                            href={manageabsencesLink} 
                            onClick={() => setIsAccountMenuOpen(false)}
                            className={`${buttonBaseClasses} bg-white hover:bg-teal-50 text-teal-700 w-full px-4 py-3`}
                          >
                            <CalendarClock className="w-4 h-4" /> Absences
                          </Link>

                          

                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {!user && companyId && (
                <DemoAwareMenuItem 
                  href={uploadCertificateLink}
                  className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}
                  isDemoExpired={isDemoExpired}
                >
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </DemoAwareMenuItem>
              )}
            </nav>

            {/* Right section - Notifications + User Area + Mobile Menu */}
            <div className="flex items-center gap-3 -mr-2">
              {/* Notifications (only for logged in users) */}
              {user && (
                <NotificationComponent
                  currentUser={user}
                 // isHrinnoAdmin={user?.is_admin === true}
                  companySlug={companySlug}
                />
              )}

              {/* Time Clock icon (only for logged users) */}
                {user && (
                  <button
                    onClick={() => setIsTimeClockOpen(true)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Open Time Clock"
                  >
                    <Clock className="w-5 h-5 text-gray-600" />
                  </button>
                )}


              {/* Demo timer for tablet/mobile */}
              {(isDemoMode || isDemoExpired) && (
                <div className={`xl:hidden flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${
                  isDemoExpired 
                    ? 'bg-red-100 text-red-800' 
                    : demoTimeLeft && demoTimeLeft < 300 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  <Clock className="w-3 h-3" />
                  {isDemoExpired ? 'EXPIRED' : (demoTimeLeft ? formatTime(demoTimeLeft) : '00:00')}
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
                  <User className="w-4 h-4" /> Contact Us
                </DemoAwareMenuItem>
              )}

              {/* Desktop user area */}
              <div className="hidden xl:flex items-center gap-3">
                {companySlug === 'demo' && !user && !isDemoExpired && (
                  <div className="text-blue-700 font-medium text-sm">
                    Login for employer view →
                  </div>
                )}

                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    {isDemoExpired ? (
                      <div className={`${buttonBaseClasses} bg-gray-100 text-gray-400 cursor-not-allowed relative group`}>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="max-w-32 truncate">{user.firstname} {user.lastname}</span>
                        <ChevronDown className="w-3 h-3" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          Demo expired - Contact us to continue
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`${buttonBaseClasses} bg-gray-50 hover:bg-gray-100 text-gray-700`}>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="max-w-32 truncate">{user.firstname} {user.lastname}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isUserMenuOpen && (
                          <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm text-gray-600">Connected as</p>
                              <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                            </div>
                            <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full px-4 py-3 text-left`}>
                              <LogOut className="w-4 h-4" /> Logout
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsLoginOpen(true)} 
                    className={`${buttonBaseClasses} ${
                      isDemoExpired 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={isDemoExpired}
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                )}
              </div>

              {/* Mobile/Tablet menu button */}
              <button 
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <DemoAwareMenuItem 
                href={buildLink('/openedpositions')} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}
                isDemoExpired={isDemoExpired}
              >
                <Briefcase className="w-4 h-4" /> {user ? 'Your Available Positions' : 'Available Positions'}
              </DemoAwareMenuItem>

              {user && (
                <DemoAwareMenuItem 
                  href={buildLink('/openedpositions/new')} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                >
                  <Plus className="w-4 h-4" /> Create Position
                </DemoAwareMenuItem>
              )}

              {companyId && (
                <HappyCheckMenuItem 
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700 w-full justify-start`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  canAccessHappyCheck={canAccessHappyCheck}
                  isDemoExpired={isDemoExpired}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </HappyCheckMenuItem>
              )}

              {user && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outils RH</p>
                  </div>

                  <DemoAwareMenuItem 
                    href={buildLink('/openedpositions/analytics')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <BarChart3 className="w-4 h-4" /> Recruitment Dashboard
                  </DemoAwareMenuItem>

                  <HappyCheckMenuItem
                    href={buildLink('/happiness-dashboard')}
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    canAccessHappyCheck={canAccessHappyCheck}
                  >
                    <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                  </HappyCheckMenuItem>

                  <DemoAwareMenuItem 
                    href={buildLink('/medical-certificate/list')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Stethoscope className="w-4 h-4" /> List of Certificates
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={buildLink('/medical-certificate/download')} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Stethoscope className="w-4 h-4" /> Certificates Download
                  </DemoAwareMenuItem>


                  <DemoAwareMenuItem 
                    href={myperformance}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Target className="w-4 h-4" /> My Performance
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={teamperformance}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <Users className="w-4 h-4" /> Team Performance
                  </DemoAwareMenuItem>

                </>
              )}

              {user && companySlug !== 'demo' && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Management</p>
                  </div>

                  <DemoAwareMenuItem 
                    href={manageSubscriptionLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <CreditCard className="w-4 h-4" /> Manage Subscription
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={manageUsersLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <UserCog className="w-4 h-4" /> Manage your users
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={manageticketsLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <TicketPlus className="w-4 h-4" /> Support Tickets
                  </DemoAwareMenuItem>

                  <DemoAwareMenuItem 
                    href={manageabsencesLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${buttonBaseClasses} bg-teal-50 hover:bg-teal-100 text-teal-700 w-full justify-start`}
                    isDemoExpired={isDemoExpired}
                  >
                    <CalendarClock className="w-4 h-4" /> Absences
                  </DemoAwareMenuItem>
                  

                </>
              )}

              {!user && companyId && (
                <DemoAwareMenuItem 
                  href={uploadCertificateLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}
                  isDemoExpired={isDemoExpired}
                >
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </DemoAwareMenuItem>
              )}

              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full justify-start`}>
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} 
                    className={`${buttonBaseClasses} ${
                      isDemoExpired 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } w-full justify-start`}
                    disabled={isDemoExpired}
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                )}
              </div>
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

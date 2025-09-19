'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, User, LogOut, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Move HappyCheckMenuItem outside to prevent re-creation
const HappyCheckMenuItem = ({ 
  href, 
  children, 
  className,
  onClick,
  canAccessHappyCheck 
}: { 
  href: string; 
  children: React.ReactNode; 
  className: string;
  onClick?: () => void;
  canAccessHappyCheck: boolean | null;
}) => {
  const isDisabled = canAccessHappyCheck === false;
  const isLoading = canAccessHappyCheck === null;
  
  if (isLoading) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-wait relative`}>
        {children}
        <div className="absolute inset-0 bg-gray-200 opacity-20 rounded-xl"></div>
      </div>
    );
  }
  
  if (isDisabled) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Not available in your forfait
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHRToolsMenuOpen, setIsHRToolsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
  const [error, setError] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyForfait, setCompanyForfait] = useState<string | null>(null);
  const [canAccessHappyCheck, setCanAccessHappyCheck] = useState<boolean | null>(null);

  const [demoTimeLeft, setDemoTimeLeft] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expirationHandledRef = useRef(false);
  const happyCheckAccessChecked = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const hrToolsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const slugMatch = useMemo(() => pathname.match(/^\/jobs\/([^/]+)/), [pathname]);
  const companySlug = useMemo(() => slugMatch ? slugMatch[1] : null, [slugMatch]);

  const buttonBaseClasses = useMemo(() => 
    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap',
    []
  );

  // Memoized link builder
  const buildLink = useCallback((basePath: string) => {
    const query = companyId ? `?company_id=${companyId}` : '';
    if (companySlug) {
      if (basePath === '/') return `/jobs/${companySlug}${query}`;
      return `/jobs/${companySlug}${basePath}${query}`;
    }
    return `${basePath}${query}`;
  }, [companyId, companySlug]);

  // Memoized forfait badge
  const forfaitBadge = useMemo(() => {
    switch (companyForfait) {
      case 'Free':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div> Free
          </span>
        );
      case 'Momentum':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shadow-md">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> Momentum
          </span>
        );
      case 'Infinity':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 shadow-lg ring-1 ring-yellow-400">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-md"></div> Infinity
          </span>
        );
      default:
        return null;
    }
  }, [companyForfait]);

  // Memoized format time function
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized links
  const happyCheckLink = useMemo(() => buildLink('/happiness-check'), [buildLink]);
  const uploadCertificateLink = useMemo(() => buildLink('/medical-certificate/upload'), [buildLink]);

  // Check happy check access
  const checkHappyCheckAccess = useCallback(async () => {
    if (!companyId || happyCheckAccessChecked.current) return;
    
    console.log('🔍 Checking happy check access for company_id:', companyId);
    happyCheckAccessChecked.current = true;
    
    try {
      const { data, error } = await supabase.rpc('can_access_happy_check', { p_company_id: companyId });
      
      // Detailed logging
      console.log('📡 Full response:', { data, error });
      console.log('📡 Data details:', {
        data: data,
        dataType: typeof data,
        isNull: data === null,
        isUndefined: data === undefined,
        dataStringified: JSON.stringify(data),
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'not an object'
      });
      console.log('📡 Error details:', {
        error: error,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code
      });
      
      if (error) {
        console.log('❌ There is an error, setting access to false');
        setCanAccessHappyCheck(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanAccessHappyCheck(false);
        return;
      }
      
      // Handle different possible return formats
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        console.log('📊 Data is boolean:', data);
        hasAccess = data;
      } else if (typeof data === 'string') {
        console.log('📊 Data is string:', data);
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        console.log('📊 Data is number:', data);
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        console.log('📊 Data is object, checking properties...');
        // Sometimes Supabase functions return objects, check if there's a result property
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' || // Sometimes it's an array
                   data === true; // Sometimes the object itself is the boolean
        
        console.log('📊 Object access check:', {
          'data.result': data.result,
          'data.can_access': data.can_access,
          'data[0]': data[0],
          'final hasAccess': hasAccess
        });
      }
      
      console.log('✅ Final decision - Setting canAccessHappyCheck to:', hasAccess);
      setCanAccessHappyCheck(hasAccess);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanAccessHappyCheck(false);
    }
  }, [companyId]);

  // Demo slug effect
  useEffect(() => {
    if (companySlug === 'demo') {
      setLogin('demo@hrinno.hu');
      setPassword('demo');
    }
  }, [companySlug]);

  // Demo expiration handler
  const handleDemoExpiration = useCallback(async () => {
    if (expirationHandledRef.current) return;
    expirationHandledRef.current = true;
    
    localStorage.removeItem('demo_start_time');
    localStorage.removeItem('demo_mode_active');

    if (user) {
      try {
        await supabase.auth.signOut();
        setUser(null);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }

    if (companySlug === 'demo') {
      router.push(`/jobs/demo/feedback`);
    } else {
      window.location.href = 'https://www.linkedin.com/in/grégory-saussez';
    }
  }, [user, companySlug, router]);

  // Demo timer effect
  useEffect(() => {
    const DEMO_DURATION = 25 * 60 * 1000;
    const DEMO_START_KEY = 'demo_start_time';
    const DEMO_MODE_KEY = 'demo_mode_active';

    if (companySlug === 'demo') {
      localStorage.setItem(DEMO_MODE_KEY, 'true');

      let demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        demoStartTime = Date.now().toString();
        localStorage.setItem(DEMO_START_KEY, demoStartTime);
      }
    }

    const isDemoActive = companySlug === 'demo' || localStorage.getItem(DEMO_MODE_KEY) === 'true';

    if (isDemoActive) {
      const demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        localStorage.removeItem(DEMO_MODE_KEY);
        setIsDemoMode(false);
        setDemoTimeLeft(null);
        return;
      }

      const startTime = parseInt(demoStartTime);
      const elapsed = Date.now() - startTime;
      const remaining = DEMO_DURATION - elapsed;

      if (remaining <= 0) {
        handleDemoExpiration();
        return;
      }

      setIsDemoMode(true);
      setDemoTimeLeft(Math.ceil(remaining / 1000));

      demoTimerRef.current = setInterval(() => {
        const currentElapsed = Date.now() - startTime;
        const currentRemaining = DEMO_DURATION - currentElapsed;

        if (currentRemaining <= 0) {
          handleDemoExpiration();
          return;
        }

        setDemoTimeLeft(Math.ceil(currentRemaining / 1000));
      }, 1000);

      return () => {
        if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      };
    } else {
      setIsDemoMode(false);
      setDemoTimeLeft(null);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    }
  }, [companySlug, user, handleDemoExpiration]);

  // Fetch functions
  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();
    if (data) setUser({ firstname: data.user_firstname, lastname: data.user_lastname });
  }, []);

  const fetchUserCompanyId = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();
    if (!error && data?.company_id) setCompanyId(data.company_id);
  }, []);

  const fetchCompanyLogoAndId = useCallback(async (slug: string) => {
    const { data } = await supabase
      .from('company')
      .select('company_logo, id, forfait')
      .eq('slug', slug)
      .single();
    setCompanyLogo(data?.company_logo || null);
    setCompanyId(data?.id || null);
    setCompanyForfait(data?.forfait || null);
  }, []);

  // Auth and company data effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const uid = data.session.user.id;
        fetchUserProfile(uid);
        fetchUserCompanyId(uid);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        fetchUserProfile(uid);
        fetchUserCompanyId(uid);
      } else {
        setUser(null);
        if (companySlug) fetchCompanyLogoAndId(companySlug);
      }
    });

    if (companySlug) fetchCompanyLogoAndId(companySlug);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [companySlug, fetchUserProfile, fetchUserCompanyId, fetchCompanyLogoAndId]);

  // Happy check access effect
  useEffect(() => {
    if (companyId) {
      // Reset cache when companyId changes
      happyCheckAccessChecked.current = false;
      setCanAccessHappyCheck(null); // Set to loading state
      checkHappyCheckAccess();
    }
  }, [companyId, checkHappyCheckAccess]);

  // Click outside effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hrToolsMenuRef.current && !hrToolsMenuRef.current.contains(event.target as Node)) {
        setIsHRToolsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event handlers
  const handleLogin = useCallback(async () => {
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: login,
      password,
    });
    if (error) {
      setError('Invalid email or password!');
      return;
    }
    if (data.user) {
      fetchUserProfile(data.user.id);
      fetchUserCompanyId(data.user.id);
      setIsLoginOpen(false);
      const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
      router.push(homeUrl);
    }
  }, [login, password, companySlug, router, fetchUserProfile, fetchUserCompanyId]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    const homeUrl = companySlug ? `/jobs/${companySlug}` : '/';
    router.push(homeUrl);
  }, [companySlug, router]);



  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        {isDemoMode && demoTimeLeft !== null && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2">
            <div className="max-w-8xl mx-auto flex items-center justify-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">
                Demonstration Mode  - Remaining time: {formatTime(demoTimeLeft)}
              </span>
              <div className="hidden sm:block text-xs opacity-90">
                The application will close automatically at the end of the timer
              </div>
            </div>
          </div>
        )}

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
              {forfaitBadge}
            </div>

            {/* Desktop Navigation - hidden on tablet and mobile */}
            <nav className="hidden xl:flex items-center gap-2 flex-1 justify-center mx-8">
              <Link href={buildLink('/openedpositions')} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}>
                <Briefcase className="w-4 h-4" /> {user ? 'Your Available Positions' : 'Available Positions'}
              </Link>

              {user && (
                <Link href={buildLink('/openedpositions/new')} className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700`}>
                  <Plus className="w-4 h-4" /> Create Position
                </Link>
              )}

              {companyId && (
                <HappyCheckMenuItem 
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700`}
                  canAccessHappyCheck={canAccessHappyCheck}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </HappyCheckMenuItem>
              )}

              {user && (
                <div className="relative" ref={hrToolsMenuRef}>
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
                    </div>
                  )}
                </div>
              )}

              {!user && companyId && (
                <Link href={uploadCertificateLink} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}>
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </Link>
              )}
            </nav>

            {/* Right section - User area and mobile menu */}
            <div className="flex items-center gap-3 -mr-2">
              {/* Demo timer for tablet/mobile */}
              {isDemoMode && demoTimeLeft !== null && (
                <div className="xl:hidden flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {formatTime(demoTimeLeft)}
                </div>
              )}

              {/* Contact Us button for demo - positioned in right section */}
              {companySlug === 'demo' && (
                <Link
                  href={`/jobs/demo/contact`}
                  className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hidden sm:flex`}
                >
                  <User className="w-4 h-4" /> Contact Us
                </Link>
              )}

              {/* Desktop user area */}
              <div className="hidden xl:flex items-center gap-3">
                {companySlug === 'demo' && !user && (
                  <div className="text-blue-700 font-medium text-sm">
                    Login for employer view →
                  </div>
                )}

                {user ? (
                  <div className="relative" ref={userMenuRef}>
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
                  </div>
                ) : (
                  <button onClick={() => setIsLoginOpen(true)} className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white`}>
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
              <Link href={buildLink('/openedpositions')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}>
                <Briefcase className="w-4 h-4" /> {user ? 'Your Available Positions' : 'Available Positions'}
              </Link>

              {user && (
                <Link href={buildLink('/openedpositions/new')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700 w-full justify-start`}>
                  <Plus className="w-4 h-4" /> Create Position
                </Link>
              )}

              {companyId && (
                <HappyCheckMenuItem 
                  href={happyCheckLink}
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700 w-full justify-start`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  canAccessHappyCheck={canAccessHappyCheck}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </HappyCheckMenuItem>
              )}

              {user && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outils RH</p>
                  </div>

                  <Link href={buildLink('/openedpositions/analytics')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}>
                    <BarChart3 className="w-4 h-4" /> Recruitment Dashboard
                  </Link>

                  <HappyCheckMenuItem
                    href={buildLink('/happiness-dashboard')}
                    className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    canAccessHappyCheck={canAccessHappyCheck}
                  >
                    <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                  </HappyCheckMenuItem>

                  <Link href={buildLink('/medical-certificate/list')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}>
                    <Stethoscope className="w-4 h-4" /> List of Certificates
                  </Link>
                  
                  <Link href={buildLink('/medical-certificate/download')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full justify-start`}>
                    <Stethoscope className="w-4 h-4" /> Certificates Download
                  </Link>
                  
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-white hover:bg-red-50 text-red-600 w-full justify-start`}>
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}

              {!user && companyId && (
                <Link href={uploadCertificateLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full justify-start`}>
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </Link>
              )}

              {companySlug === 'demo' && (
                <Link
                  href={`/jobs/demo/contact`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${buttonBaseClasses} bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-full justify-start`}
                >
                  <User className="w-4 h-4" /> Contact Us
                </Link>
              )}

              {!user && (
                <div className="relative border-t border-gray-200 pt-2">
                  {companySlug === 'demo' && (
                    <div className="text-center mb-2 text-blue-700 font-medium text-sm">
                      → Login for employer view
                    </div>
                  )}
                  <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white w-full justify-center`}>
                    <User className="w-4 h-4" /> Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-600 mt-1">Connect to your account</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" placeholder="votre@email.com" value={login} onChange={(e) => setLogin(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"/>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-700 text-sm">{error}</p></div>}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={() => setIsLoginOpen(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
              <button onClick={handleLogin} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Connect</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
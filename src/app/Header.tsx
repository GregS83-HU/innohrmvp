'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, User, LogOut, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  // Demo timer state
  const [demoTimeLeft, setDemoTimeLeft] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const hrToolsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const slugMatch = pathname.match(/^\/jobs\/([^/]+)$/);
  const companySlug = slugMatch ? slugMatch[1] : null;

  // Demo timer logic - check both current slug and localStorage
  useEffect(() => {
    const DEMO_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    const DEMO_START_KEY = 'demo_start_time';
    const DEMO_MODE_KEY = 'demo_mode_active';
    
    // If current page is demo slug, activate demo mode
    if (companySlug === 'demo') {
      localStorage.setItem(DEMO_MODE_KEY, 'true');
      
      let demoStartTime = localStorage.getItem(DEMO_START_KEY);
      if (!demoStartTime) {
        demoStartTime = Date.now().toString();
        localStorage.setItem(DEMO_START_KEY, demoStartTime);
      }
    }

    // Check if demo mode is active (either from current page or localStorage)
    const isDemoActive = companySlug === 'demo' || localStorage.getItem(DEMO_MODE_KEY) === 'true';
    
    if (isDemoActive) {
      const demoStartTime = localStorage.getItem(DEMO_START_KEY);
      
      if (!demoStartTime) {
        // Demo mode is active but no start time, clean up
        localStorage.removeItem(DEMO_MODE_KEY);
        setIsDemoMode(false);
        setDemoTimeLeft(null);
        return;
      }

      const startTime = parseInt(demoStartTime);
      const elapsed = Date.now() - startTime;
      const remaining = DEMO_DURATION - elapsed;

      if (remaining <= 0) {
        // Demo expired, redirect immediately and clean up
        localStorage.removeItem(DEMO_START_KEY);
        localStorage.removeItem(DEMO_MODE_KEY);
        window.location.href = 'https://google.com';
        return;
      }

      setIsDemoMode(true);
      setDemoTimeLeft(Math.ceil(remaining / 1000)); // Convert to seconds

      // Start countdown timer
      demoTimerRef.current = setInterval(() => {
        const currentElapsed = Date.now() - startTime;
        const currentRemaining = DEMO_DURATION - currentElapsed;

        if (currentRemaining <= 0) {
          localStorage.removeItem(DEMO_START_KEY);
          localStorage.removeItem(DEMO_MODE_KEY);
          window.location.href = 'https://google.com';
          return;
        }

        setDemoTimeLeft(Math.ceil(currentRemaining / 1000));
      }, 1000);

      return () => {
        if (demoTimerRef.current) {
          clearInterval(demoTimerRef.current);
        }
      };
    } else {
      setIsDemoMode(false);
      setDemoTimeLeft(null);
      if (demoTimerRef.current) {
        clearInterval(demoTimerRef.current);
      }
    }
  }, [companySlug]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) fetchUserProfile(data.session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUserProfile(session.user.id);
      else setUser(null);
    });

    if (companySlug) fetchCompanyLogoAndId(companySlug);

    const handleClickOutside = (event: MouseEvent) => {
      if (hrToolsMenuRef.current && !hrToolsMenuRef.current.contains(event.target as Node)) {
        setIsHRToolsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [companySlug]);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();
    if (data) setUser({ firstname: data.user_firstname, lastname: data.user_lastname });
  };

  const fetchCompanyLogoAndId = async (slug: string) => {
    const { data } = await supabase
      .from('company')
      .select('company_logo, id')
      .eq('slug', slug)
      .single();
    setCompanyLogo(data?.company_logo || null);
    setCompanyId(data?.id || null);
  };

  const handleLogin = async () => {
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
      setIsLoginOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push(companySlug ? `/jobs/${companySlug}` : '/');
  };

  const linkToCompany = (path: string) => companySlug ? `/jobs/${companySlug}${path === '/' ? '' : path}` : path;
  const uploadCertificateLink = `/medical-certificate/upload${companyId ? `?company_id=${companyId}` : ''}`;

  const buttonBaseClasses = 'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md';

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        {/* Demo Timer Banner */}
        {isDemoMode && demoTimeLeft !== null && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2">
            <div className="max-w-8xl mx-auto flex items-center justify-center gap-3">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">
                Mode Démonstration - Temps restant: {formatTime(demoTimeLeft)} - Demo Login: demo@hrinno.hu, pwd: demo
              </span>
              <div className="hidden sm:block text-xs opacity-90">
                L&apos;application se fermera automatiquement à la fin du timer
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-9 py-4">
          <div className="flex items-center justify-between w-full max-w-8xl mx-auto">
            
            {/* LOGO - aligné à gauche */}
            <div className="flex-shrink-0">
              <Link href={linkToCompany('/')}>
                <img
                  src={companySlug && companyLogo ? companyLogo : '/HRInnoLogo.jpeg'}
                  alt="Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              </Link>
            </div>

            {/* NAVIGATION - au centre mais flexible */}
            <nav className="hidden lg:flex items-center gap-3 flex-1 justify-center mx-8">
              <Link href={linkToCompany('/openedpositions')} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}>
                <Briefcase className="w-4 h-4" /> Available Positions
              </Link>

              {user && (
                <Link href={linkToCompany('/openedpositions/new')} className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700`}>
                  <Plus className="w-4 h-4" /> Create Position
                </Link>
              )}

              {!user && (companySlug || companyId) && (
                <Link 
                  href={companySlug ? `/jobs/${companySlug}/happiness-check` : `/happiness-check${companyId ? `?company_id=${companyId}` : ''}`} 
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700`}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </Link>
              )}

              {user && (
                <div className="relative" ref={hrToolsMenuRef}>
                  <button
                    onClick={() => setIsHRToolsMenuOpen(!isHRToolsMenuOpen)}
                    className={`${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 text-blue-700`}
                  >
                    <Heart className="w-4 h-4" /> HR Tools
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHRToolsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isHRToolsMenuOpen && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Outils RH</p>
                      </div>

                      <Link href="/happiness-dashboard" className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                        <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                      </Link>

                      <Link href="/medical-certificate/list" className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3 border-b border-gray-100`}>
                        <Stethoscope className="w-4 h-4" /> List of Certificates
                      </Link>

                      <Link href="/medical-certificate/download" className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full px-4 py-3`}>
                        <Stethoscope className="w-4 h-4" /> Certificates Download
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!user && (companySlug || companyId) && (
                <Link href={uploadCertificateLink} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700`}>
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </Link>
              )}
            </nav>

            {/* LOGIN / USER BLOCK - aligné à droite */}
            <div className="flex-shrink-0 flex items-center gap-2 pr-4 sm:pr-6 lg:pr-8">
              {/* Demo Timer Mobile */}
              {isDemoMode && demoTimeLeft !== null && (
                <div className="lg:hidden flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                  <Clock className="w-3 h-3" />
                  {formatTime(demoTimeLeft)}
                </div>
              )}

              <div className="hidden lg:flex items-center">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`${buttonBaseClasses} bg-gray-50 hover:bg-gray-100 text-gray-700`}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>{user.firstname} {user.lastname}</span>
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
                  // CHANGEMENT ICI : Retirer la condition !companySlug pour afficher le bouton login partout
                  <button onClick={() => setIsLoginOpen(true)} className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white`}>
                    <User className="w-4 h-4" /> Login
                  </button>
                )}
              </div>

              {/* MOBILE BUTTON */}
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <Link href={linkToCompany('/openedpositions')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full`}>
                <Briefcase className="w-4 h-4" /> Available Positions
              </Link>

              {user && (
                <Link href={linkToCompany('/openedpositions/new')} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-green-50 hover:bg-green-100 text-green-700 w-full`}>
                  <Plus className="w-4 h-4" /> Create Position
                </Link>
              )}

              {!user && (companySlug || companyId) && (
                <Link 
                  href={companySlug ? `/jobs/${companySlug}/happiness-check` : `/happiness-check${companyId ? `?company_id=${companyId}` : ''}`} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`${buttonBaseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700 w-full`}
                >
                  <Smile className="w-4 h-4" /> Happy Check
                </Link>
              )}

              {user && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outils RH</p>
                  </div>
                  <Link href="/happiness-dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full`}>
                    <BarChart3 className="w-4 h-4" /> Happiness Dashboard
                  </Link>
                  <Link href="/medical-certificate/list" onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full`}>
                    <Stethoscope className="w-4 h-4" /> List of Certificates
                  </Link>
                  <Link href="/medical-certificate/download" onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-white hover:bg-blue-50 text-blue-700 w-full`}>
                    <Stethoscope className="w-4 h-4" /> Certificates Download
                  </Link>
                </>
              )}

              {!user && (companySlug || companyId) && (
                <Link href={uploadCertificateLink} onClick={() => setIsMobileMenuOpen(false)} className={`${buttonBaseClasses} bg-purple-50 hover:bg-purple-100 text-purple-700 w-full`}>
                  <Stethoscope className="w-4 h-4" /> Upload Certificate
                </Link>
              )}

              {/* AJOUT : Bouton login pour mobile aussi */}
              {!user && (
                <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white w-full`}>
                  <User className="w-4 h-4" /> Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* LOGIN MODAL - CHANGEMENT ICI : Retirer la condition !companySlug */}
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
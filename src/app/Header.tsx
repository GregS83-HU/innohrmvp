'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown, User, LogOut } from 'lucide-react';

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

  const router = useRouter();
  const pathname = usePathname();
  const hrToolsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const slugMatch = pathname.match(/^\/jobs\/([^/]+)$/);
  const companySlug = slugMatch ? slugMatch[1] : null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) fetchUserProfile(data.session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUserProfile(session.user.id);
      else setUser(null);
    });

    if (companySlug) {
      fetchCompanyLogoAndId(companySlug);
    }

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

  const linkToCompany = (path: string) => {
    return companySlug ? `/jobs/${companySlug}${path === '/' ? '' : path}` : path;
  };

  const uploadCertificateLink = `/medical-certificate/upload${companyId ? `?company_id=${companyId}` : ''}`;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between w-full">
            
            {/* LOGO - Complètement à gauche */}
            <div className="flex-shrink-0">
              <Link href={linkToCompany('/')}>
                <img
                  src={companySlug && companyLogo ? companyLogo : '/InnoHRLogo.jpeg'}
                  alt="Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              </Link>
            </div>

            {/* NAVIGATION CENTRALE - Desktop uniquement */}
            <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              
              {/* Available Positions */}
              <Link
                href={linkToCompany('/openedpositions')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Available Positions
              </Link>

              {/* Create Position - Si connecté */}
              {user && (
                <Link
                  href={linkToCompany('/openedpositions/new')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Position
                </Link>
              )}

              {/* Happy Check - Toujours visible */}
              <Link
                href="/happiness-check"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-yellow-50 hover:text-yellow-600 text-gray-700 font-medium transition-colors border border-yellow-200 bg-yellow-50/30"
              >
                <Smile className="w-4 h-4" />
                Happy Check
              </Link>

              {/* HR Tools Menu - Uniquement si connecté */}
              {user && (
                <div className="relative" ref={hrToolsMenuRef}>
                  <button
                    onClick={() => setIsHRToolsMenuOpen(!isHRToolsMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-medium transition-colors border border-blue-200 bg-blue-50/30"
                  >
                    <Heart className="w-4 h-4" />
                    HR Tools
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHRToolsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isHRToolsMenuOpen && (
                    <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Outils RH</p>
                      </div>
                      
                      <Link
                        href="/happiness-dashboard"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors border-b border-gray-100"
                        onClick={() => setIsHRToolsMenuOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Happiness Dashboard</p>
                          <p className="text-xs text-gray-500">Analytics du bien-être</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/medical-certificate/list"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors border-b border-gray-100"
                        onClick={() => setIsHRToolsMenuOpen(false)}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <div>
                          <p className="font-medium">List of Certificates</p>
                          <p className="text-xs text-gray-500">Gestion des certificats</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/medical-certificate/download"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
                        onClick={() => setIsHRToolsMenuOpen(false)}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Certificates Download</p>
                          <p className="text-xs text-gray-500">Téléchargement</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Certificate - Uniquement si PAS connecté et showMedicalMenu */}
              {!user && (companySlug || companyId) && (
                <Link
                  href={uploadCertificateLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  Upload Certificate
                </Link>
              )}
              
            </nav>

            {/* USER MENU - Complètement à droite */}
            <div className="flex-shrink-0 ml-8">
              {/* Menu utilisateur - Desktop */}
              <div className="hidden lg:flex items-center">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-semibold">
                        {user.firstname} {user.lastname}
                      </span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm text-gray-600">Connecté en tant que</p>
                          <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                        </div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  !companySlug && (
                    <button
                      onClick={() => setIsLoginOpen(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Login
                    </button>
                  )
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* MENU MOBILE */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              
              <Link
                href={linkToCompany('/openedpositions')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Available Positions
              </Link>

              {user && (
                <Link
                  href={linkToCompany('/openedpositions/new')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Position
                </Link>
              )}

              <Link
                href="/happiness-check"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-50 text-gray-700 font-medium transition-colors border border-yellow-200"
              >
                <Smile className="w-4 h-4" />
                Happy Check
              </Link>

              {/* HR Tools dans mobile - uniquement si connecté */}
              {user && (
                <>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Outils RH</p>
                  </div>
                  
                  <Link
                    href="/happiness-dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Happiness Dashboard
                  </Link>
                  
                  <Link
                    href="/medical-certificate/list"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    List of Certificates
                  </Link>
                  
                  <Link
                    href="/medical-certificate/download"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Certificates Download
                  </Link>
                </>
              )}

              {/* Upload Certificate pour non connectés */}
              {!user && (companySlug || companyId) && (
                <Link
                  href={uploadCertificateLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  Upload Certificate
                </Link>
              )}

              {/* Section utilisateur mobile */}
              <div className="border-t border-gray-200 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                        <p className="text-sm text-gray-600">Connecté</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  !companySlug && (
                    <button
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Login
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MODAL DE LOGIN */}
      {isLoginOpen && !companySlug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
              <p className="text-gray-600 mt-1">Connectez-vous à votre compte</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setIsLoginOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
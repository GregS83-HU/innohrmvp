'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMedicalMenuOpen, setIsMedicalMenuOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
  const [error, setError] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const medicalMenuRef = useRef<HTMLDivElement>(null);

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
      if (medicalMenuRef.current && !medicalMenuRef.current.contains(event.target as Node)) {
        setIsMedicalMenuOpen(false);
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

  const showMedicalMenu = companySlug || user;

  const uploadCertificateLink = `/medical-certificate/upload${companyId ? `?company_id=${companyId}` : ''}`;

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b relative bg-white">
        <Link href={linkToCompany('/')}>
          <img
            src={companySlug && companyLogo ? companyLogo : '/InnoHRLogo.jpeg'}
            alt="Logo"
            className="h-10 sm:h-12 object-contain"
          />
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link
            href={linkToCompany('/openedpositions')}
            className="hover:text-blue-600 transition cursor-pointer"
          >
            Available Positions
          </Link>
          {user && (
            <Link
              href={linkToCompany('/openedpositions/new')}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              Create a position
            </Link>
          )}

          {showMedicalMenu && (
            <div className="relative" ref={medicalMenuRef}>
              <button
                onClick={() => setIsMedicalMenuOpen(!isMedicalMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-blue-50 text-gray-700 font-medium transition cursor-pointer"
              >
                Medical Certificate
                <svg
                  className={`w-3 h-3 mt-1 transition-transform duration-200 ${
                    isMedicalMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMedicalMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  {/* Upload only visible if NOT logged in */}
                  {!user && (
                    <Link
                      href={uploadCertificateLink}
                      className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition font-medium cursor-pointer"
                      onClick={() => setIsMedicalMenuOpen(false)}
                    >
                      Upload Certificate
                    </Link>
                  )}
                  {user && (
                    <>
                      <Link
                        href="/medical-certificate/list"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition font-medium cursor-pointer"
                        onClick={() => setIsMedicalMenuOpen(false)}
                      >
                        List of Certificates
                      </Link>
                      <Link
                        href="/medical-certificate/download"
                        className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition font-medium cursor-pointer"
                        onClick={() => setIsMedicalMenuOpen(false)}
                      >
                        Certificates Download
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="font-semibold">
                Welcome {user.firstname} {user.lastname}
              </span>
              <button onClick={handleLogout} className="text-blue-600 cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            !companySlug && (
              <button onClick={() => setIsLoginOpen(true)} className="text-blue-600 cursor-pointer">
                Login
              </button>
            )
          )}
        </div>

        <button
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t shadow-md flex flex-col items-center gap-4 py-4 md:hidden z-50">
            <Link href={linkToCompany('/openedpositions')} onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer">
              Available Positions
            </Link>
            {user && (
              <Link
                href={linkToCompany('/openedpositions/new')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer"
              >
                Create a position
              </Link>
            )}

            {/* Upload only if NOT logged in */}
            {showMedicalMenu && !user && (
              <Link
                href={uploadCertificateLink}
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer"
              >
                Upload Certificate
              </Link>
            )}

            {user && (
              <>
                <Link
                  href="/medical-certificate/list"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="cursor-pointer"
                >
                  List of Certificates
                </Link>
                <Link
                  href="/medical-certificate/download"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="cursor-pointer"
                >
                  Certificates Download
                </Link>
              </>
            )}

            {user ? (
              <>
                <span className="font-semibold">Welcome {user.firstname} {user.lastname}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-blue-600 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              !companySlug && (
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-blue-600 cursor-pointer"
                >
                  Login
                </button>
              )
            )}
          </div>
        )}
      </header>

      {isLoginOpen && !companySlug && (
        <div className="fixed top-0 right-0 w-72 h-full bg-white border-l p-4 shadow-lg flex flex-col gap-4 z-50">
          <h2 className="text-xl font-bold">Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="border p-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button onClick={handleLogin} className="bg-blue-600 text-white p-2 rounded-md cursor-pointer">
            Connect
          </button>
          <button
            onClick={() => setIsLoginOpen(false)}
            className="mt-auto text-gray-600 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}

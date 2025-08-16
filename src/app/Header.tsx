'use client';

import { useState, useEffect } from 'react';
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
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Extraire le slug si on est sur /jobs/[slug]
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

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();

    if (data) setUser({ firstname: data.user_firstname, lastname: data.user_lastname });
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
    // Redirige vers la page d'accueil en tenant compte du slug
    router.push(companySlug ? `/jobs/${companySlug}` : '/');
  };

  // Helper pour construire les liens contextuels
  const linkToCompany = (path: string) => {
    return companySlug ? `/jobs/${companySlug}${path === '/' ? '' : path}` : path;
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b relative bg-white">
        {/* Logo */}
        <Link href={linkToCompany('/')}>
          <img src="/InnoHRLogo.jpeg" alt="InnoHR" className="h-10 sm:h-12" />
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-6">
          <Link href={linkToCompany('/')}>Available Positions</Link>
          {user && <Link href={linkToCompany('/new')}>Create a position</Link>}
        </nav>

        {/* Boutons à droite */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="font-semibold">
                Welcome {user.firstname} {user.lastname}
              </span>
              <button onClick={handleLogout} className="text-blue-600">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setIsLoginOpen(true)} className="text-blue-600">
              Login
            </button>
          )}
        </div>

        {/* Bouton Burger (Mobile) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t shadow-md flex flex-col items-center gap-4 py-4 md:hidden z-50">
            <Link href={linkToCompany('/')} onClick={() => setIsMobileMenuOpen(false)}>
              Available Positions
            </Link>
            {user && (
              <Link href={linkToCompany('/new')} onClick={() => setIsMobileMenuOpen(false)}>
                Create a position
              </Link>
            )}
            {user ? (
              <>
                <span className="font-semibold">
                  Welcome {user.firstname} {user.lastname}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-blue-600"
              >
                Login
              </button>
            )}
          </div>
        )}
      </header>

      {/* Drawer Login */}
      {isLoginOpen && (
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
          <button onClick={handleLogin} className="bg-blue-600 text-white p-2">
            Connect
          </button>
          <button
            onClick={() => setIsLoginOpen(false)}
            className="mt-auto text-gray-600"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}

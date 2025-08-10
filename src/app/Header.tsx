'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [login, setLogin] = useState(''); // ici on considère que login = email
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ firstname: string; lastname: string } | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        fetchUserProfile(data.session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUser({ firstname: data.user_firstname, lastname: data.user_lastname });
    }
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
    router.push('/')
  };

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderBottom: '1px solid #ccc',
          position: 'relative',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo - à gauche */}
        <div style={{ flex: '0 0 auto' }}>
          <Link href="/">
            <img src="/InnoHRLogo.jpeg" alt="InnoHR" style={{ height: 50 }} />
          </Link>
        </div>

        {/* Menu - au centre */}
        <nav
          style={{
            flex: '1 1 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
          }}
        >
          <Link href="/">Home</Link>
          <Link href="/openedpositions">Available Positions</Link>
          <Link href="/openedpositions/new">Create a position</Link>
        </nav>

        {/* Login/Welcome - à droite */}
        <div
          style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {user ? (
            <>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                Welcome {user.firstname} {user.lastname}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#0070f3',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#0070f3',
                fontSize: '1rem',
              }}
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Panneau de login (drawer) */}
      {isLoginOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '300px',
            height: '100%',
            backgroundColor: 'white',
            borderLeft: '1px solid #ccc',
            padding: '1rem',
            boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'slideIn 0.3s forwards',
            zIndex: 1000,
          }}
        >
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button
            onClick={handleLogin}
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              padding: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Connect
          </button>
          <button
            onClick={() => setIsLoginOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            Close
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
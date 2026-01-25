// lib/supabaseClient.ts
'use client';

import { createClient } from '@supabase/supabase-js';

// Browser detection
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Custom storage adapter that safely handles SSR
const storage = isBrowser
  ? {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    }
  : {
      getItem: (_key: string) => null,
      setItem: (_key: string, _value: string) => {},
      removeItem: (_key: string) => {},
    };

// 🆕 Enhanced Supabase client with optimal auth configuration
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // ✅ Enable session persistence across browser sessions
      persistSession: true,
      
      // ✅ Store auth tokens in localStorage (survives browser close)
      storage,
      
      // ✅ Auto-refresh tokens before they expire (default: true, but explicit is better)
      autoRefreshToken: true,
      
      // ✅ Detect when user comes back to tab and refresh if needed
      detectSessionInUrl: true,
      
      // ✅ Storage key (can customize if needed)
      storageKey: 'supabase.auth.token',
      
      // 🆕 Flow type for PKCE (more secure, recommended for production)
      flowType: 'pkce'
    },
    
    // 🆕 Global settings
    global: {
      headers: {
        'X-Client-Info': 'hrinno-web-app'
      }
    }
  }
);

// 🆕 Optional: Helper function to check if session is valid
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    return !!session;
  } catch (err) {
    console.error('Failed to validate session:', err);
    return false;
  }
};

// 🆕 Optional: Helper to force session refresh
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
    
    return data.session;
  } catch (err) {
    console.error('Session refresh error:', err);
    return null;
  }
};
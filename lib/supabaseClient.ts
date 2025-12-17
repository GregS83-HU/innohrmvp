/*'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient() */

/*'use client'

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  }
)*/

'use client';

import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  console.log('🔍 URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  console.log('🔍 30 derniers caractères de l\'URL:', url.slice(-30));
  console.log('🔍 30 derniers caractères de la clé:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(-30));
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

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

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage,
    },
  }
);

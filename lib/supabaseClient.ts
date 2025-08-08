// src/lib/supabaseClient.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// ✅ Ceci exporte bien createClient comme prévu dans page.tsx
export function createClient(cookieStore = cookies()) {
  return createServerComponentClient({ cookies: () => cookieStore })
}



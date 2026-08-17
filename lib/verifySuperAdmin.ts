import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verifySuperAdmin(
  request: NextRequest
): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const authToken =
      cookieStore.get('sb-access-token')?.value ||
      cookieStore.get('supabase-auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) return { authorized: false, error: 'No authentication token found' };

    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    if (authError || !user) return { authorized: false, error: 'Invalid authentication token' };

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, is_super_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.is_super_admin !== true) {
      return { authorized: false, error: 'User is not authorized. Super admin access required.' };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    console.error('Authorization error:', error);
    return { authorized: false, error: 'Authorization check failed' };
  }
}

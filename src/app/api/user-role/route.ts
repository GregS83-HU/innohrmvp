import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuthenticatedUser } from '../../../../lib/authz';
import { safeErrorInfo } from '../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Restricted to the caller's own role - never another user's, which the
    // userId query param previously allowed by itself.
    const identity = await requireAuthenticatedUser(request);
    if (!identity.authorized) {
      return NextResponse.json({ error: identity.error }, { status: identity.status });
    }
    if (identity.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch user information from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('is_manager, is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', safeErrorInfo(error));
      return NextResponse.json(
        { error: 'Failed to fetch user role' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      is_manager: user.is_manager || false,
      is_admin: user.is_admin || false,
    });
  } catch (error) {
    console.error('Unexpected error in user-role API:', safeErrorInfo(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
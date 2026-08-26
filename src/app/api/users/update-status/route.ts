// app/api/users/update-status/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId,companyId, isActive } = body;

    console.log('Update status request:', { userId, isActive });

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and active status are required' },
        { status: 400 }
      );
    }

    // Update the user's active status in company_to_users table
    const { data, error } = await supabase
      .from('company_to_users')
      .update({ is_active: isActive })
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .select();

    if (error) {
      console.error('Supabase error:', safeErrorInfo(error));
      return NextResponse.json(
        { 
          error: 'Failed to update user status',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('Update successful:', data);

    return NextResponse.json({ 
      success: true, 
      data,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating user status:', safeErrorInfo(error));
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
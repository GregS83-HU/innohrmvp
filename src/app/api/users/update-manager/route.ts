// app/api/users/update-manager/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCompanyAdmin } from '../../../../../lib/authz';
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, managerId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // The admin's own company is derived from their session below - never
    // trusted from the request body. The target user must also actually
    // belong to that company, or an admin of company A could reassign the
    // manager of a user in company B just by supplying their userId.
    const authCheck = await requireCompanyAdmin(req);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { data: targetMembership, error: targetError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', userId)
      .eq('company_id', authCheck.companyId)
      .single();

    if (targetError || !targetMembership) {
      return NextResponse.json({ error: 'User not found in your company' }, { status: 404 });
    }

    // Check if user_profiles record exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          manager_id: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message || 'Failed to update manager');
      }
    } else {
      // Create new profile if it doesn't exist
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          manager_id: managerId,
        });

      if (error) {
        throw new Error(error.message || 'Failed to create user profile');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error updating manager:', safeErrorInfo(err));

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
  }
}
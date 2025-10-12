// app/api/users-creation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      companyId,
      managerId,
      employmentStartDate,
      isManager = false, // ✅ New field with default false
    } = body;

    // Validate required fields
    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    if (!employmentStartDate) {
      return NextResponse.json(
        { error: 'Employment start date is required' },
        { status: 400 }
      );
    }

    // 1️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    const userId = authData.user.id;

    // 2️⃣ Insert into users table with is_manager flag
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      user_firstname: firstName,
      user_lastname: lastName,
      is_admin: false,
      is_manager: isManager, // ✅ Set the is_manager field
    });

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(userError.message || 'Failed to create user profile');
    }

    // 3️⃣ Link user to company
    const { error: linkError } = await supabase.from('company_to_users').insert({
      user_id: userId,
      company_id: parseInt(companyId, 10),
    });

    if (linkError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('users').delete().eq('id', userId);
      throw new Error(linkError.message || 'Failed to link user to company');
    }

    // 4️⃣ Insert into user_profiles with manager and employment date
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: userId,
      manager_id: managerId,
      employment_start_date: employmentStartDate,
    });

    if (profileError) {
      // Rollback: delete user from all tables
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('company_to_users').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);
      throw new Error(profileError.message || 'Failed to create user profile');
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: unknown) {
    console.error('Error creating user:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
  }
}
// app/api/users-creation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,              // ⚡ use server-only env var
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service_role must never be exposed
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, companyId } = body;

    // 1️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    const userId = authData.user.id;

    // 2️⃣ Insert into users table
    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: userId,
      user_firstname: firstName,
      user_lastname: lastName,
      is_admin: false,
    });

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(userError.message || 'Failed to create user profile');
    }

    // 3️⃣ Link user to company
    const { error: linkError } = await supabaseAdmin.from('company_to_users').insert({
      user_id: userId,
      company_id: parseInt(companyId, 10),
    });

    if (linkError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from('users').delete().eq('id', userId);
      throw new Error(linkError.message || 'Failed to link user to company');
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

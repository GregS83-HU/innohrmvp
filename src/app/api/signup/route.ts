// Self-serve signup: creates a brand-new company + its first admin account,
// unassisted. New companies land on Free (forfait = null) with
// onboarding_completed = false - attendance/absences/performance/the
// wellbeing chatbot stay gated until our team flips that flag after a
// setup call (see lib/entitlements.ts). Recruitment/Job Assistant are NOT
// gated by onboarding, so this route is all a new company needs to start
// using them immediately.
//
// Mirrors the create -> rollback-on-failure pattern already used by
// src/app/api/users/users-creation/route.ts, just with an extra initial
// step (creating the company row itself).
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUniqueCompanySlug } from '../../../../lib/slug';
import { sendOnboardingBookingEmail } from '../../../../lib/email-service';
import { safeErrorInfo } from '../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let companyId: number | null = null;
  let userId: string | null = null;

  try {
    const body = await req.json();
    const { companyName, adminFirstName, adminLastName, email, password } = body;

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!adminFirstName || !adminLastName) {
      return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const slug = await generateUniqueCompanySlug(supabase, companyName);

    // 1. Create the auth user first (email_confirm: true skips email
    // verification - self-serve signup must not require a manual step).
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }
    userId = authData.user.id;

    // 2. Create the company - Free tier by default (forfait: null), locked
    // out of onboarding-gated modules until manually flipped.
    const { data: company, error: companyError } = await supabase
      .from('company')
      .insert({ company_name: companyName.trim(), slug, forfait: null, onboarding_completed: false })
      .select('id, slug')
      .single();
    if (companyError || !company) {
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(companyError?.message || 'Failed to create company');
    }
    companyId = company.id;

    // 3. Create the users row, marked as this company's admin.
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      user_firstname: adminFirstName,
      user_lastname: adminLastName,
      is_admin: true,
      is_manager: false,
    });
    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('company').delete().eq('id', companyId);
      throw new Error(userError.message || 'Failed to create user profile');
    }

    // 4. Link user to company.
    const { error: linkError } = await supabase.from('company_to_users').insert({
      user_id: userId,
      company_id: companyId,
      is_active: true,
    });
    if (linkError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('users').delete().eq('id', userId);
      await supabase.from('company').delete().eq('id', companyId);
      throw new Error(linkError.message || 'Failed to link user to company');
    }

    // 5. Create the user_profiles row (no manager/start date for a
    // self-serve admin - those fields are for employees added later).
    const { error: profileError } = await supabase.from('user_profiles').insert({ user_id: userId });
    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('company_to_users').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);
      await supabase.from('company').delete().eq('id', companyId);
      throw new Error(profileError.message || 'Failed to create user profile');
    }

    // 6. Send the onboarding-call booking email (Calendly link). Best-effort:
    // a failure here must never fail signup itself - the admin already has
    // a working account. No need to re-check onboarding_completed here -
    // the insert above always sets it to false for a brand-new self-serve
    // company, so this route never needs to skip a grandfathered company.
    if (process.env.CALENDLY_ONBOARDING_URL) {
      try {
        const result = await sendOnboardingBookingEmail({
          companyId: company.id,
          to: email,
          adminFirstName,
          companyName: companyName.trim(),
          calendlyUrl: process.env.CALENDLY_ONBOARDING_URL,
        });
        if (result.success) {
          const { error: updateError } = await supabase
            .from('company')
            .update({ onboarding_link_sent_at: new Date().toISOString() })
            .eq('id', company.id);
          if (updateError) console.error('Failed to record onboarding_link_sent_at:', updateError.message);

          const { error: funnelError } = await supabase.from('funnel_events').insert({
            event_type: 'onboarding_link_sent',
            session_id: 'internal_system',
            metadata: { company_id: company.id, slug: company.slug },
          });
          if (funnelError) console.error('Failed to log onboarding_link_sent funnel event:', funnelError.message);
        }
      } catch (emailError) {
        console.error('Failed to send onboarding booking email (signup still succeeded):', safeErrorInfo(emailError));
      }
    } else {
      console.warn('CALENDLY_ONBOARDING_URL is not set - skipping onboarding booking email');
    }

    return NextResponse.json({ success: true, slug: company.slug });
  } catch (err: unknown) {
    console.error('Error during signup:', safeErrorInfo(err));
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
  }
}

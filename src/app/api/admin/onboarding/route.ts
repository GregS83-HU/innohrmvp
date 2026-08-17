// Super-admin-only: view and manually flip company.onboarding_completed.
// This is the only way that flag ever changes - see the self-serve-signup
// migration and lib/entitlements.ts (ONBOARDING_GATED_FEATURES).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySuperAdmin } from '../../../../../lib/verifySuperAdmin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authCheck = await verifySuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('company')
    .select('id, company_name, slug, onboarding_completed, created_at, onboarding_link_sent_at, onboarding_reminder_sent_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load companies for onboarding admin:', error.message);
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 });
  }

  return NextResponse.json({ companies: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const authCheck = await verifySuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const companyId = body?.company_id;
  const onboardingCompleted = body?.onboarding_completed;

  if (!companyId || typeof onboardingCompleted !== 'boolean') {
    return NextResponse.json(
      { error: 'company_id and onboarding_completed (boolean) are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('company')
    .update({ onboarding_completed: onboardingCompleted })
    .eq('id', companyId)
    .select('id, company_name, slug, onboarding_completed')
    .single();

  if (error || !data) {
    console.error('Failed to update onboarding status:', error?.message);
    return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
  }

  if (onboardingCompleted) {
    await supabase.from('funnel_events').insert({
      event_type: 'onboarding_marked_complete',
      session_id: 'internal_admin',
      metadata: { company_id: data.id, slug: data.slug },
    });
  }

  return NextResponse.json({ success: true, company: data });
}

// Super-admin-only: view onboarding status for every company, manually
// override company.onboarding_completed, and mark an optional assisted
// onboarding call as done. Normally onboarding_completed is set
// automatically by self-onboarding (first subscription payment - see
// lib/onboarding/completeSelfOnboarding.ts); the toggle here is a manual
// override for the team.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '../../../../../lib/authz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('company')
    .select(
      'id, company_name, slug, forfait, onboarding_completed, onboarding_completed_at, assisted_onboarding_requested, assisted_call_completed_at, created_at, onboarding_link_sent_at, onboarding_reminder_sent_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load companies for onboarding admin:', error.message);
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 });
  }

  return NextResponse.json({ companies: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const companyId = body?.company_id;
  const onboardingCompleted = body?.onboarding_completed;
  const assistedCallCompleted = body?.assisted_call_completed;

  if (!companyId || (typeof onboardingCompleted !== 'boolean' && typeof assistedCallCompleted !== 'boolean')) {
    return NextResponse.json(
      { error: 'company_id and onboarding_completed (boolean) or assisted_call_completed (boolean) are required' },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {};
  if (typeof onboardingCompleted === 'boolean') update.onboarding_completed = onboardingCompleted;
  if (typeof assistedCallCompleted === 'boolean') {
    update.assisted_call_completed_at = assistedCallCompleted ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from('company')
    .update(update)
    .eq('id', companyId)
    .select(
      'id, company_name, slug, forfait, onboarding_completed, onboarding_completed_at, assisted_onboarding_requested, assisted_call_completed_at, created_at, onboarding_link_sent_at, onboarding_reminder_sent_at'
    )
    .single();

  if (error || !data) {
    console.error('Failed to update onboarding status:', error?.message);
    return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
  }

  if (onboardingCompleted === true) {
    await supabase.from('funnel_events').insert({
      event_type: 'onboarding_marked_complete',
      session_id: 'internal_admin',
      metadata: { company_id: data.id, slug: data.slug },
    });
  }

  return NextResponse.json({ success: true, company: data });
}

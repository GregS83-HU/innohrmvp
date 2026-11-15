// Self-onboarding wizard backend (/jobs/[slug]/onboarding).
//
// GET   - everything the wizard needs in one call: the caller's company,
//         its onboarding/subscription state, active headcount, and the paid
//         plans with their prices and employee ranges.
// PATCH - lets the admin correct the company name during setup.
//
// The company is always derived from the caller's session (company admin),
// never from the URL slug or the request body.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCompanyAdmin } from '../../../../lib/authz';
import { safeErrorInfo } from '../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAID_TIERS = ['Core', 'Growth'];

export async function GET(request: NextRequest) {
  const authCheck = await requireCompanyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }
  if (authCheck.companyId === undefined) {
    return NextResponse.json({ error: 'Company not found' }, { status: 500 });
  }
  const companyId = authCheck.companyId;

  try {
    const [companyRes, countRes, forfaitRes] = await Promise.all([
      supabase
        .from('company')
        .select('id, company_name, slug, forfait, onboarding_completed, stripe_subscription_id, billing_interval, assisted_onboarding_requested, onboarding_fee_paid_at')
        .eq('id', companyId)
        .single(),
      supabase
        .from('company_to_users')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true),
      supabase
        .from('forfait')
        .select('forfait_name, base_fee_huf, per_seat_fee_huf, min_employees, max_employees, access_performance, access_happy_check, access_advanced_reporting, included_ai_credits, max_opened_position, stripe_price_id_onboarding')
        .in('forfait_name', PAID_TIERS),
    ]);

    if (companyRes.error || !companyRes.data) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    if (forfaitRes.error) throw forfaitRes.error;

    const company = companyRes.data;
    const plans = (forfaitRes.data ?? [])
      .map((f) => ({
        name: f.forfait_name as string,
        baseFeeHuf: f.base_fee_huf === null ? null : Number(f.base_fee_huf),
        perSeatFeeHuf: f.per_seat_fee_huf === null ? null : Number(f.per_seat_fee_huf),
        minEmployees: f.min_employees as number | null,
        maxEmployees: f.max_employees as number | null,
        performance: !!f.access_performance,
        wellbeingChatbot: !!f.access_happy_check,
        advancedReporting: !!f.access_advanced_reporting,
        includedAiCredits: (f.included_ai_credits as number | null) ?? 0,
        maxOpenPositions: f.max_opened_position as number | null,
        assistedOnboardingAvailable: !!f.stripe_price_id_onboarding,
      }))
      .sort((a, b) => PAID_TIERS.indexOf(a.name) - PAID_TIERS.indexOf(b.name));

    return NextResponse.json({
      company: {
        name: company.company_name,
        slug: company.slug,
        plan: company.forfait,
        onboardingCompleted: !!company.onboarding_completed,
        hasSubscription: !!company.stripe_subscription_id,
        billingInterval: company.billing_interval,
        assistedOnboardingRequested: !!company.assisted_onboarding_requested,
        onboardingFeePaid: !!company.onboarding_fee_paid_at,
        employeeCount: countRes.count ?? 0,
      },
      plans,
    });
  } catch (err) {
    console.error('Failed to load onboarding state:', safeErrorInfo(err));
    return NextResponse.json({ error: 'Failed to load onboarding state' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await requireCompanyAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }
  if (authCheck.companyId === undefined) {
    return NextResponse.json({ error: 'Company not found' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const companyName = typeof body?.company_name === 'string' ? body.company_name.trim() : '';
  if (!companyName || companyName.length > 120) {
    return NextResponse.json({ error: 'Company name must be between 1 and 120 characters' }, { status: 400 });
  }

  // Only the display name changes - the slug (and so every URL the
  // company already uses) stays the same.
  const { error } = await supabase
    .from('company')
    .update({ company_name: companyName })
    .eq('id', authCheck.companyId);

  if (error) {
    console.error('Failed to update company name:', error.message);
    return NextResponse.json({ error: 'Failed to update company name' }, { status: 500 });
  }
  return NextResponse.json({ success: true, name: companyName });
}

// Super-admin-only cross-company billing overview: plan, employee count,
// billing interval, onboarding-fee-paid status, and founding-discount
// status for every company. Nothing like this existed before the Core/
// Growth per-seat pricing overhaul - the only prior billing view was each
// company's own /jobs/[slug]/subscription page. Mirrors the GET-list shape
// of src/app/api/admin/onboarding/route.ts.

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

  const { data: companies, error } = await supabase
    .from('company')
    .select(
      'id, company_name, slug, forfait, stripe_subscription_id, billing_interval, onboarding_fee_paid_at, founding_discount_coupon_id, founding_discount_applied_at, grace_until, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load companies for billing admin:', error.message);
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 });
  }

  // Employee counts are fetched separately (company_to_users has no
  // company-level aggregate view) and merged in - one count query per
  // company is fine at this account's scale (an admin-only, low-traffic
  // page, not a hot path).
  const companiesWithCounts = await Promise.all(
    (companies ?? []).map(async (company) => {
      const { count } = await supabase
        .from('company_to_users')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_active', true);
      return { ...company, employee_count: count ?? 0 };
    })
  );

  return NextResponse.json({ companies: companiesWithCounts });
}

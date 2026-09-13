// Super-admin-only: manually apply the founding-customer discount (30% or
// 40% off the base fee for 12 months) to one company's subscription. Never
// exposed as a public promotion code - see create-subscription/route.ts,
// which explicitly disables allow_promotion_codes. Mirrors the
// GET-list/PATCH-mutate shape of src/app/api/admin/onboarding/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '../../../../../../lib/authz';
import { stripe } from '../../../../../../lib/stripe/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_COUPONS = ['founding_customer_30', 'founding_customer_40'] as const;

export async function GET(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('company')
    .select('id, company_name, slug, forfait, stripe_subscription_id, stripe_base_item_id, founding_discount_coupon_id, founding_discount_applied_at')
    .not('stripe_subscription_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load companies for founding-discount admin:', error.message);
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
  const couponId = body?.coupon_id;

  if (!companyId || !VALID_COUPONS.includes(couponId)) {
    return NextResponse.json(
      { error: `company_id and coupon_id (one of ${VALID_COUPONS.join(', ')}) are required` },
      { status: 400 }
    );
  }

  const { data: company, error: companyError } = await supabase
    .from('company')
    .select('id, stripe_subscription_id, stripe_base_item_id, founding_discount_applied_at')
    .eq('id', companyId)
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  if (!company.stripe_subscription_id || !company.stripe_base_item_id) {
    return NextResponse.json({ error: 'Company has no active subscription to discount' }, { status: 409 });
  }

  // Idempotency guard, checked BEFORE calling Stripe: setting a subscription
  // item's `discounts` array replaces it wholesale rather than stacking, so
  // a retried/double-submitted request must never call Stripe a second time
  // for the same company.
  if (company.founding_discount_applied_at) {
    return NextResponse.json(
      { error: 'Founding discount already applied to this company', applied_at: company.founding_discount_applied_at },
      { status: 409 }
    );
  }

  try {
    await stripe.subscriptions.update(company.stripe_subscription_id, {
      items: [{ id: company.stripe_base_item_id, discounts: [{ coupon: couponId }] }],
    });
  } catch (err: unknown) {
    console.error('Failed to apply founding discount in Stripe:', err);
    const message = err instanceof Error ? err.message : 'Stripe update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: updated, error: updateError } = await supabase
    .from('company')
    .update({
      founding_discount_coupon_id: couponId,
      founding_discount_applied_at: new Date().toISOString(),
    })
    .eq('id', companyId)
    .select('id, company_name, slug, founding_discount_coupon_id, founding_discount_applied_at')
    .single();

  if (updateError || !updated) {
    console.error('Applied discount in Stripe but failed to record it in Supabase:', updateError?.message);
    return NextResponse.json(
      { error: 'Discount applied in Stripe but failed to record locally - check Stripe and retry is unsafe, fix manually' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, company: updated });
}

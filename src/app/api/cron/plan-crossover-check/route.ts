// Daily cron: for every company on Core whose real active headcount has
// grown past the point where Growth is both cheaper and includes more
// features, sends a one-time, numbers-based notification to the account
// owner. Self-serve stays self-serve - this never switches the plan itself
// (see docs/product-brief.md and the pricing FAQ: "you decide if and when
// to switch"). Mirrors the structure of
// src/app/api/cron/onboarding-reminders/route.ts.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireServiceSecret } from '../../../../../lib/authz';
import {
  getCoreGrowthPricing,
  computeGrowthCrossoverHeadcount,
  monthlyCost,
} from '../../../../../lib/billing/planCrossover';
import { sendPlanCrossoverEmail } from '../../../../../lib/email-service';
import { safeErrorInfo } from '../../../../../lib/logSafe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const authCheck = requireServiceSecret(request, 'CRON_SECRET');
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const pricing = await getCoreGrowthPricing();
  if (!pricing) {
    console.warn('plan-crossover-check: Core/Growth pricing not available in forfait table - skipping sweep');
    return NextResponse.json({ success: true, sent: 0, skipped: 'pricing unavailable' });
  }

  const crossoverHeadcount = computeGrowthCrossoverHeadcount(pricing.core, pricing.growth);
  if (crossoverHeadcount === null) {
    return NextResponse.json({
      success: true,
      sent: 0,
      skipped: 'Growth is not cheaper than Core at any headcount with current pricing',
    });
  }

  try {
    // Only companies not yet notified - this is a one-time nudge, not a
    // recurring reminder (matches the onboarding-reminder-sent pattern).
    const { data: candidates, error } = await supabase
      .from('company')
      .select('id, company_name, slug')
      .eq('forfait', 'Core')
      .is('plan_crossover_notified_at', null);

    if (error) throw error;

    let sent = 0;
    const failures: { company_id: number; error: string }[] = [];

    for (const company of candidates ?? []) {
      try {
        const { data: activeLinks } = await supabase
          .from('company_to_users')
          .select('user_id')
          .eq('company_id', company.id)
          .eq('is_active', true);

        const employeeCount = (activeLinks ?? []).length;
        if (employeeCount < crossoverHeadcount) continue; // hasn't crossed over yet

        const coreCost = monthlyCost(pricing.core, employeeCount);
        const growthCost = monthlyCost(pricing.growth, employeeCount);
        const monthlySavingsHuf = coreCost - growthCost;
        if (monthlySavingsHuf <= 0) continue; // safety guard, shouldn't happen given the check above

        const activeUserIds = (activeLinks ?? []).map((l) => l.user_id);
        if (activeUserIds.length === 0) {
          failures.push({ company_id: company.id, error: 'No active users found' });
          continue;
        }

        const { data: admin } = await supabase
          .from('users')
          .select('id, user_firstname')
          .in('id', activeUserIds)
          .eq('is_admin', true)
          .limit(1)
          .maybeSingle();

        if (!admin) {
          failures.push({ company_id: company.id, error: 'No active admin found' });
          continue;
        }

        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(admin.id);
        if (authError || !authUser.user?.email) {
          failures.push({ company_id: company.id, error: authError?.message || 'No email on admin user' });
          continue;
        }

        const result = await sendPlanCrossoverEmail({
          companyId: company.id,
          to: authUser.user.email,
          adminFirstName: admin.user_firstname || 'there',
          companyName: company.company_name || '',
          employeeCount,
          coreCost,
          growthCost,
          monthlySavingsHuf,
          billingUrl: `https://app.hrinno.hu/jobs/${company.slug}/subscription`,
        });

        if (result.success) {
          const { error: updateError } = await supabase
            .from('company')
            .update({ plan_crossover_notified_at: new Date().toISOString() })
            .eq('id', company.id);
          if (updateError) console.error('Failed to record plan_crossover_notified_at:', updateError.message);
          sent++;
        }
      } catch (err) {
        console.error(`Failed to send plan crossover notification for company ${company.id}:`, safeErrorInfo(err));
        failures.push({
          company_id: company.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const summary = { success: true, checked: (candidates ?? []).length, crossoverHeadcount, sent, failures };
    console.log('Plan crossover sweep completed:', summary);
    return NextResponse.json(summary);
  } catch (err) {
    console.error('Plan crossover sweep failed:', safeErrorInfo(err));
    return NextResponse.json({ error: 'Plan crossover sweep failed' }, { status: 500 });
  }
}

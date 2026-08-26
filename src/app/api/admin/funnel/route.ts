// /app/api/admin/funnel/route.ts
// Super-admin-only funnel counts for a date range: Job Assistant
// completions -> pricing views -> contact form submissions -> onboarded
// companies. See FUNNEL_TRACKING.md.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '../../../../../lib/authz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EVENT_TYPES = [
  'job_assistant_started',
  'job_assistant_completed',
  'pricing_viewed',
  'pricing_cta_clicked',
  'contact_form_submitted',
  'roi_calculator_used',
] as const;

export async function GET(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = searchParams.get('to') || new Date().toISOString();

  const counts: Record<string, number> = {};
  for (const eventType of EVENT_TYPES) {
    const { count, error } = await supabase
      .from('funnel_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', eventType)
      .gte('created_at', from)
      .lte('created_at', to);
    if (error) {
      console.error(`Funnel count error for ${eventType}:`, error.message);
      counts[eventType] = 0;
    } else {
      counts[eventType] = count ?? 0;
    }
  }

  // Plan breakdown for pricing CTA clicks
  const { data: ctaRows } = await supabase
    .from('funnel_events')
    .select('plan')
    .eq('event_type', 'pricing_cta_clicked')
    .gte('created_at', from)
    .lte('created_at', to);
  const ctaByPlan: Record<string, number> = { free: 0, momentum: 0, infinity: 0 };
  for (const row of ctaRows ?? []) {
    if (row.plan && row.plan in ctaByPlan) ctaByPlan[row.plan]++;
  }

  // Source breakdown for contact form submissions
  const { data: contactRows } = await supabase
    .from('funnel_events')
    .select('source')
    .eq('event_type', 'contact_form_submitted')
    .gte('created_at', from)
    .lte('created_at', to);
  const contactBySource: Record<string, number> = {};
  for (const row of contactRows ?? []) {
    const key = row.source || 'unknown';
    contactBySource[key] = (contactBySource[key] ?? 0) + 1;
  }

  // Manually onboarded companies within range, and how many are traceable
  // back to a contact form submission via the close-the-loop column.
  const { data: companiesInRange, count: companiesCount } = await supabase
    .from('company')
    .select('id, onboarded_from_contact_submission_id', { count: 'exact' })
    .gte('created_at', from)
    .lte('created_at', to);

  const onboardedTotal = companiesCount ?? 0;
  const onboardedTracedToContact = (companiesInRange ?? []).filter(
    (c) => c.onboarded_from_contact_submission_id !== null
  ).length;

  return NextResponse.json({
    range: { from, to },
    funnel: {
      jobAssistantStarted: counts['job_assistant_started'],
      jobAssistantCompleted: counts['job_assistant_completed'],
      pricingViewed: counts['pricing_viewed'],
      pricingCtaClicked: counts['pricing_cta_clicked'],
      pricingCtaClickedByPlan: ctaByPlan,
      roiCalculatorUsed: counts['roi_calculator_used'],
      contactFormSubmitted: counts['contact_form_submitted'],
      contactFormSubmittedBySource: contactBySource,
      companiesOnboarded: onboardedTotal,
      companiesOnboardedTracedToContact: onboardedTracedToContact,
    },
  });
}

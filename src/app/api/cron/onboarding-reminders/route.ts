// Daily cron: sends a one-time reminder email (with the Calendly onboarding
// link) to self-serve companies that haven't booked their onboarding call
// within the SLA window. Mirrors the structure of
// src/app/api/cron/data-retention/route.ts (CRON_SECRET auth, thin route
// delegating the actual work).
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addBusinessDays } from '../../../../../lib/businessDays';
import { sendOnboardingReminderEmail } from '../../../../../lib/email-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// One place to change if the reminder SLA changes.
const ONBOARDING_REMINDER_THRESHOLD_BUSINESS_DAYS = 3;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const calendlyUrl = process.env.CALENDLY_ONBOARDING_URL;
  if (!calendlyUrl) {
    console.warn('CALENDLY_ONBOARDING_URL is not set - skipping onboarding reminder sweep');
    return NextResponse.json({ success: true, sent: 0, skipped: 'no CALENDLY_ONBOARDING_URL' });
  }

  try {
    const { data: candidates, error } = await supabase
      .from('company')
      .select('id, company_name, slug, created_at')
      .eq('onboarding_completed', false)
      .is('onboarding_reminder_sent_at', null);

    if (error) throw error;

    const now = new Date();
    const due = (candidates ?? []).filter(
      (company) => addBusinessDays(new Date(company.created_at), ONBOARDING_REMINDER_THRESHOLD_BUSINESS_DAYS) <= now
    );

    let sent = 0;
    const failures: { company_id: number; error: string }[] = [];

    for (const company of due) {
      try {
        const { data: activeLinks } = await supabase
          .from('company_to_users')
          .select('user_id')
          .eq('company_id', company.id)
          .eq('is_active', true);

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

        const adminFirstName = admin.user_firstname || 'there';

        const result = await sendOnboardingReminderEmail({
          companyId: company.id,
          to: authUser.user.email,
          adminFirstName,
          companyName: company.company_name || '',
          calendlyUrl,
        });

        if (result.success) {
          const { error: updateError } = await supabase
            .from('company')
            .update({ onboarding_reminder_sent_at: new Date().toISOString() })
            .eq('id', company.id);
          if (updateError) console.error('Failed to record onboarding_reminder_sent_at:', updateError.message);

          const { error: funnelError } = await supabase.from('funnel_events').insert({
            event_type: 'onboarding_reminder_sent',
            session_id: 'internal_system',
            metadata: { company_id: company.id, slug: company.slug },
          });
          if (funnelError) console.error('Failed to log onboarding_reminder_sent funnel event:', funnelError.message);
          sent++;
        }
      } catch (err) {
        console.error(`Failed to send onboarding reminder for company ${company.id}:`, err);
        failures.push({ company_id: company.id, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    const summary = { success: true, checked: due.length, sent, failures };
    console.log('Onboarding reminder sweep completed:', JSON.stringify(summary));
    return NextResponse.json(summary);
  } catch (err) {
    console.error('Onboarding reminder sweep failed:', err);
    return NextResponse.json({ error: 'Onboarding reminder sweep failed' }, { status: 500 });
  }
}

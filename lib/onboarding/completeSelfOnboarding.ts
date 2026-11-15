// Completes a company's self-onboarding once its first subscription payment
// has succeeded (called from the Stripe webhook's invoice.payment_succeeded
// handler for billing_reason = "subscription_create").
//
// The onboarding-gated modules (see ONBOARDING_GATED_FEATURES in
// src/config/entitlements.ts) unlock only here - i.e. only once a card is on
// file and the recurring subscription has actually been paid - so no
// cost-bearing module is ever usable before the customer pays.
//
// Idempotent: the company row is claimed with a conditional update on
// onboarding_completed_at IS NULL, so Stripe retries or duplicate events
// never send the notification emails twice.

import type { SupabaseClient } from '@supabase/supabase-js'
import { sendOnboardingBookingEmail, sendSelfOnboardingNotificationEmail } from '../email-service'
import { safeErrorInfo } from '../logSafe'

export type CompleteSelfOnboardingParams = {
  companyId: string | number
  assistedCallRequested: boolean
  plan: string
  billingInterval: 'month' | 'year'
  /** Amount in the currency's major unit (e.g. HUF, not fillér). */
  amountPaid: number
  currency: string
}

export type CompleteSelfOnboardingResult =
  | { completed: false; reason: 'already_completed' | 'company_not_found' }
  | { completed: true; ownerNotified: boolean; bookingEmailSent: boolean }

async function findCompanyAdmin(supabase: SupabaseClient, companyId: number) {
  const { data: links } = await supabase
    .from('company_to_users')
    .select('user_id')
    .eq('company_id', companyId)
    .eq('is_active', true)

  const userIds = (links ?? []).map((l: { user_id: string }) => l.user_id)
  if (userIds.length === 0) return null

  const { data: admin } = await supabase
    .from('users')
    .select('id, user_firstname, user_lastname')
    .in('id', userIds)
    .eq('is_admin', true)
    .limit(1)
    .maybeSingle()
  if (!admin) return null

  const { data: authUser } = await supabase.auth.admin.getUserById(admin.id)
  return {
    firstName: (admin.user_firstname as string | null) ?? null,
    lastName: (admin.user_lastname as string | null) ?? null,
    email: authUser?.user?.email ?? null,
  }
}

export async function completeSelfOnboarding(
  supabase: SupabaseClient,
  params: CompleteSelfOnboardingParams
): Promise<CompleteSelfOnboardingResult> {
  const companyId = Number(params.companyId)
  const now = new Date().toISOString()

  const update: Record<string, unknown> = {
    onboarding_completed: true,
    onboarding_completed_at: now,
  }
  // Only ever set to true here - never downgrade a flag the team may have
  // set by hand.
  if (params.assistedCallRequested) update.assisted_onboarding_requested = true

  const { data: claimed, error: claimError } = await supabase
    .from('company')
    .update(update)
    .eq('id', companyId)
    .is('onboarding_completed_at', null)
    .select('id, company_name, slug')

  if (claimError) throw claimError
  if (!claimed || claimed.length === 0) {
    const { data: exists } = await supabase.from('company').select('id').eq('id', companyId).maybeSingle()
    return { completed: false, reason: exists ? 'already_completed' : 'company_not_found' }
  }

  const company = claimed[0] as { id: number; company_name: string | null; slug: string | null }
  const companyName = company.company_name || `Company #${company.id}`

  const { error: funnelError } = await supabase.from('funnel_events').insert({
    event_type: 'self_onboarding_completed',
    session_id: 'internal_system',
    metadata: {
      company_id: company.id,
      slug: company.slug,
      plan: params.plan,
      interval: params.billingInterval,
      assisted: params.assistedCallRequested,
    },
  })
  if (funnelError) console.error('Failed to log self_onboarding_completed funnel event:', funnelError.message)

  // Everything below is best-effort: the unlock above has already happened
  // and must not be rolled back (or the webhook failed) because of email.
  let admin: Awaited<ReturnType<typeof findCompanyAdmin>> = null
  try {
    admin = await findCompanyAdmin(supabase, company.id)
  } catch (err) {
    console.error('Failed to look up company admin for onboarding emails:', safeErrorInfo(err))
  }

  const { count: employeeCount } = await supabase
    .from('company_to_users')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('is_active', true)

  let ownerNotified = false
  try {
    const result = await sendSelfOnboardingNotificationEmail({
      companyName,
      companySlug: company.slug,
      adminName: admin ? [admin.firstName, admin.lastName].filter(Boolean).join(' ') || null : null,
      adminEmail: admin?.email ?? null,
      plan: params.plan,
      billingInterval: params.billingInterval,
      employeeCount: employeeCount ?? 0,
      amountPaid: params.amountPaid,
      currency: params.currency,
      assistedCallRequested: params.assistedCallRequested,
    })
    ownerNotified = result.success
  } catch (err) {
    console.error('Failed to send self-onboarding notification email:', safeErrorInfo(err))
  }

  let bookingEmailSent = false
  if (params.assistedCallRequested) {
    const calendlyUrl = process.env.CALENDLY_ONBOARDING_URL
    if (!calendlyUrl) {
      console.warn('CALENDLY_ONBOARDING_URL is not set - skipping assisted onboarding booking email')
    } else if (!admin?.email) {
      console.warn(`No admin email found for company ${company.id} - skipping assisted onboarding booking email`)
    } else {
      try {
        const result = await sendOnboardingBookingEmail({
          companyId: company.id,
          to: admin.email,
          adminFirstName: admin.firstName || 'there',
          companyName,
          calendlyUrl,
        })
        if (result.success) {
          bookingEmailSent = true
          const { error } = await supabase
            .from('company')
            .update({ onboarding_link_sent_at: new Date().toISOString() })
            .eq('id', company.id)
          if (error) console.error('Failed to record onboarding_link_sent_at:', error.message)

          const { error: linkFunnelError } = await supabase.from('funnel_events').insert({
            event_type: 'onboarding_link_sent',
            session_id: 'internal_system',
            metadata: { company_id: company.id, slug: company.slug },
          })
          if (linkFunnelError) console.error('Failed to log onboarding_link_sent funnel event:', linkFunnelError.message)
        }
      } catch (err) {
        console.error('Failed to send assisted onboarding booking email:', safeErrorInfo(err))
      }
    }
  }

  return { completed: true, ownerNotified, bookingEmailSent }
}

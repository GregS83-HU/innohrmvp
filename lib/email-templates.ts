// lib/email-templates.ts

import { formatLocation } from './ics-generator'

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

interface OnboardingEmailData {
  adminFirstName: string
  companyName: string
  calendlyUrl: string
  variant: 'welcome' | 'reminder'
}

/**
 * Sent to the admin of a company that ticked the optional, paid "assisted
 * onboarding call" during self-onboarding: a Calendly link to book that
 * call. Their modules are already unlocked by the time this goes out (the
 * call is extra help, not a gate). 'welcome' goes out when the first
 * payment succeeds; 'reminder' is the one-time nudge if the call hasn't
 * been marked done within the SLA window (see lib/businessDays.ts).
 */
export function generateOnboardingEmail(data: OnboardingEmailData): string {
  const isReminder = data.variant === 'reminder'

  const heading = isReminder ? "Don't forget to book your onboarding call" : 'Book your assisted onboarding call'
  const intro = isReminder
    ? `Just a quick reminder — <strong>${escapeHtml(data.companyName)}</strong> hasn't booked its assisted onboarding call yet.`
    : `Thank you for choosing assisted onboarding for <strong>${escapeHtml(data.companyName)}</strong>.`
  const body = isReminder
    ? `Every module in your plan is already unlocked — the call is there to help your team get the most out of time &amp; attendance, absences, performance management, and the rest of HRInno.`
    : `Every module in your plan is already unlocked and ready to use. Pick a time below and our team will walk you through setting up HRInno for your company.`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${heading}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <p style="font-size: 16px; margin-top: 0;">Hi ${escapeHtml(data.adminFirstName)},</p>

    <p style="font-size: 16px;">${intro}</p>

    <p style="font-size: 16px;">${body}</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.calendlyUrl}" style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Book your onboarding call
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
      Questions in the meantime? Just reply to this email.
    </p>

  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Sent via HRInno</p>
  </div>

</body>
</html>
`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface SelfOnboardingNotificationData {
  companyName: string
  companySlug: string | null
  adminName: string | null
  adminEmail: string | null
  plan: string
  billingInterval: 'month' | 'year'
  employeeCount: number
  amountPaid: number
  currency: string
  assistedCallRequested: boolean
}

/**
 * Internal email to the HRInno team (ONBOARDING_NOTIFY_EMAIL) sent each time
 * a company completes self-onboarding, i.e. its first subscription payment
 * succeeded. When the customer ticked the paid assisted onboarding call, the
 * email leads with a request to call them back.
 */
export function generateSelfOnboardingNotificationEmail(data: SelfOnboardingNotificationData): string {
  const amount = `${data.amountPaid.toLocaleString('en-US')} ${data.currency.toUpperCase()}`
  const interval = data.billingInterval === 'year' ? 'annual' : 'monthly'
  const rows: Array<[string, string]> = [
    ['Company', data.companyName],
    ['Slug', data.companySlug ?? '—'],
    ['Admin', data.adminName ?? '—'],
    ['Admin email', data.adminEmail ?? '—'],
    ['Plan', `${data.plan} (${interval})`],
    ['Active employees', String(data.employeeCount)],
    ['First payment', amount],
    ['Assisted onboarding call', data.assistedCallRequested ? 'Yes — paid, please call back' : 'No'],
  ]

  const callBack = data.assistedCallRequested
    ? `<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <strong>Action needed: please call this customer back.</strong><br>
        They paid for the assisted onboarding call. They have also been sent the Calendly booking link. Mark the call as done in the onboarding admin page once it has happened.
      </div>`
    : ''

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="margin-top: 0;">New paying customer: ${escapeHtml(data.companyName)}</h2>
  <p>${escapeHtml(data.companyName)} completed self-onboarding and its first subscription payment succeeded. Time &amp; attendance, absences, performance, the wellbeing chatbot and medical certificates are now unlocked (subject to their plan).</p>
  ${callBack}
  <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
    ${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; white-space: nowrap;">${label}</td><td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`
      )
      .join('')}
  </table>
  <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">Manage this company from the Onboarding page in the super-admin menu.</p>
</body>
</html>
`
}

interface PlanCrossoverEmailData {
  adminFirstName: string
  companyName: string
  employeeCount: number
  coreCost: number
  growthCost: number
  monthlySavingsHuf: number
  billingUrl: string
}

/**
 * Sent once to a Core account's admin when their real headcount has grown
 * past the point where Growth is both cheaper and includes strictly more
 * features (performance management, the AI wellbeing chatbot, advanced
 * reporting, more AI credits) - see lib/billing/planCrossover.ts for the
 * calculation. Purely informational: self-serve stays self-serve, so this
 * never switches the plan itself.
 */
export function generatePlanCrossoverEmail(data: PlanCrossoverEmailData): string {
  const huf = (n: number) => Math.round(n).toLocaleString('en-US').replace(/,/g, ' ')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Growth would cost you less right now</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <p style="font-size: 16px; margin-top: 0;">Hi ${data.adminFirstName},</p>

    <p style="font-size: 16px;">
      <strong>${data.companyName}</strong> is currently at <strong>${data.employeeCount} employees</strong> on Core.
      At that headcount, Core costs <strong>${huf(data.coreCost)} Ft/month</strong> while Growth would cost
      <strong>${huf(data.growthCost)} Ft/month</strong> - that's <strong>${huf(data.monthlySavingsHuf)} Ft/month less</strong>,
      and Growth also includes performance management, the AI wellbeing chatbot, advanced reporting, and more AI credits.
    </p>

    <p style="font-size: 16px;">
      This isn't a required change - you decide if and when to switch. If it's a good fit, you can move to Growth anytime from Billing.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.billingUrl}" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Review plans in Billing
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
      Questions in the meantime? Just reply to this email.
    </p>

  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Sent via HRInno</p>
  </div>

</body>
</html>
`
}

interface InterviewEmailData {
  candidateName: string
  recruiterName: string
  positionTitle: string
  interviewDate: string
  interviewTime: string
  location: string
  isForCandidate: boolean
  t?: TranslationFunction // Optional translation function
}

export function generateInterviewEmail(data: InterviewEmailData): string {
  // Fallback translation function if none provided
  const translate: TranslationFunction = data.t || ((key, params) => {
    // Default English fallbacks
    const defaults: Record<string, string> = {
      'emailTemplates.candidate.title': 'Interview Invitation',
      'emailTemplates.candidate.greeting': `Dear ${params?.candidateName},`,
      'emailTemplates.candidate.body': `You have been invited for an interview for the position of <strong>${params?.positionTitle}</strong> with ${params?.recruiterName}.`,
      'emailTemplates.candidate.date': '📅 Date:',
      'emailTemplates.candidate.time': '⏰ Time:',
      'emailTemplates.candidate.locationPhysical': '📍 Location:',
      'emailTemplates.candidate.locationVirtual': '🔗 Location:',
      'emailTemplates.candidate.calendarInfo': 'A calendar invitation has been attached to this email. Please accept it to add this interview to your calendar.',
      'emailTemplates.candidate.contactInfo': `If you have any questions or need to reschedule, please contact ${params?.recruiterName}.`,
      'emailTemplates.candidate.closing': 'Best regards,',
      'emailTemplates.candidate.footer': 'Sent via HRInno Interview Scheduler',
      'emailTemplates.recruiter.title': 'Interview Scheduled',
      'emailTemplates.recruiter.greeting': `Hi ${params?.recruiterName},`,
      'emailTemplates.recruiter.body': `Your interview with <strong>${params?.candidateName}</strong> for the position of <strong>${params?.positionTitle}</strong> has been scheduled.`,
      'emailTemplates.recruiter.candidateLabel': '👤 Candidate:',
      'emailTemplates.recruiter.date': '📅 Date:',
      'emailTemplates.recruiter.time': '⏰ Time:',
      'emailTemplates.recruiter.locationPhysical': '📍 Location:',
      'emailTemplates.recruiter.locationVirtual': '🔗 Location:',
      'emailTemplates.recruiter.notification': 'The candidate has been notified and will receive a calendar invitation. A copy has been added to your calendar as well.',
      'emailTemplates.recruiter.goodLuck': 'Good luck with the interview!',
      'emailTemplates.recruiter.footer': 'Sent via HRInno Interview Scheduler',
    }
    return defaults[key] || key
  })

  const locationInfo = formatLocation(data.location)
  const locationHTML = locationInfo.isVirtual
    ? `<a href="${locationInfo.link}" style="color: #4F46E5; text-decoration: none;">${locationInfo.displayText}</a>`
    : locationInfo.displayText

  if (data.isForCandidate) {
    // Email for candidate
    const locationKey = locationInfo.isVirtual 
      ? 'emailTemplates.candidate.locationVirtual'
      : 'emailTemplates.candidate.locationPhysical'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${translate('emailTemplates.candidate.title')}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">${translate('emailTemplates.candidate.greeting', { candidateName: data.candidateName })}</p>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.candidate.body', { 
        positionTitle: data.positionTitle,
        recruiterName: data.recruiterName 
      })}
    </p>
    
    <div style="background: #f9fafb; border-left: 4px solid #4F46E5; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.candidate.date')}</strong> ${data.interviewDate}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.candidate.time')}</strong> ${data.interviewTime}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate(locationKey)}</strong> ${locationHTML}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.candidate.calendarInfo')}
    </p>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.candidate.contactInfo', { recruiterName: data.recruiterName })}
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      ${translate('emailTemplates.candidate.closing')}<br>
      <strong>${data.recruiterName}</strong>
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">${translate('emailTemplates.candidate.footer')}</p>
  </div>
  
</body>
</html>
`
  } else {
    // Email for recruiter (confirmation)
    const locationKey = locationInfo.isVirtual 
      ? 'emailTemplates.recruiter.locationVirtual'
      : 'emailTemplates.recruiter.locationPhysical'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${translate('emailTemplates.recruiter.title')}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">${translate('emailTemplates.recruiter.greeting', { recruiterName: data.recruiterName })}</p>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.recruiter.body', { 
        candidateName: data.candidateName,
        positionTitle: data.positionTitle 
      })}
    </p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.recruiter.candidateLabel')}</strong> ${data.candidateName}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.recruiter.date')}</strong> ${data.interviewDate}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.recruiter.time')}</strong> ${data.interviewTime}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate(locationKey)}</strong> ${locationHTML}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.recruiter.notification')}
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      ${translate('emailTemplates.recruiter.goodLuck')}
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">${translate('emailTemplates.recruiter.footer')}</p>
  </div>
  
</body>
</html>
`
  }
}
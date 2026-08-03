// lib/email-service.ts

import { Resend } from 'resend'
import { generateICS } from './ics-generator'
import { generateInterviewEmail, generateOnboardingEmail } from './email-templates'
import { sendEmailWithCompanySMTP } from './smtp-mailer'

const resend = new Resend(process.env.RESEND_API_KEY)

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

interface SendInterviewInvitationParams {
  candidate: {
    email: string
    firstName: string
    lastName: string
  }
  recruiter: {
    email: string
    firstName: string
    lastName: string
  }
  position: {
    title: string
  }
  interview: {
    datetime: Date
    location: string
    durationMinutes?: number
  }
  companyId: number // Added: to fetch company SMTP settings
  t?: TranslationFunction // Optional translation function
}

interface SendInterviewCancellationParams {
  candidate: {
    email: string
    firstName: string
    lastName: string
  }
  recruiter: {
    firstName: string
    lastName: string
  }
  position: {
    title: string
  }
  interview: {
    datetime: Date
    location: string
    durationMinutes?: number
  }
  companyId: number // Added: to fetch company SMTP settings
  t?: TranslationFunction // Optional translation function
}

export async function sendInterviewCancellation(params: SendInterviewCancellationParams) {
  const { candidate, recruiter, position, interview, companyId, t } = params

  // Fallback translation function if none provided
  const translate: TranslationFunction = t || ((key, params) => {
    // Default English fallbacks
    const defaults: Record<string, string> = {
      'emailService.cancellation.subject': `Interview Cancelled - ${params?.positionTitle}`,
      'emailService.cancellation.title': 'Interview Cancelled',
      'emailService.cancellation.greeting': `Dear ${params?.candidateName},`,
      'emailService.cancellation.body': `We regret to inform you that your interview for the position of <strong>${params?.positionTitle}</strong> has been cancelled.`,
      'emailService.cancellation.cancelledDate': '📅 Cancelled Date:',
      'emailService.cancellation.cancelledTime': '⏰ Cancelled Time:',
      'emailService.cancellation.contactInfo': `If you have any questions, please feel free to contact ${params?.recruiterName}.`,
      'emailService.cancellation.closing': 'Thank you for your understanding,',
      'emailService.cancellation.footer': 'Sent via HRInno Interview Scheduler',
      'emailService.cancellation.icsDescription': 'This interview has been cancelled.',
      'emailService.cancellation.icsSummary': `CANCELLED: Interview - ${params?.positionTitle}`,
      'emailService.from.interviews': 'HRInno Interviews',
      'emailService.invitation.icsFilenameCancelled': 'interview-cancelled.ics',
    }
    return defaults[key] || key
  })

  const candidateName = `${candidate.firstName} ${candidate.lastName}`
  const recruiterName = `${recruiter.firstName} ${recruiter.lastName}`
  
  const duration = interview.durationMinutes || 60
  const endTime = new Date(interview.datetime.getTime() + duration * 60000)

  const interviewDate = interview.datetime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const interviewTime = interview.datetime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Generate CANCELLED ICS file (with STATUS:CANCELLED)
  const now = new Date()
  const uid = `${now.getTime()}@hrinno.hu`
  
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  const escape = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const cancelledICS = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HRInno//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(interview.datetime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${escape(translate('emailService.cancellation.icsSummary', { positionTitle: position.title }))}`,
    `DESCRIPTION:${escape(translate('emailService.cancellation.icsDescription'))}`,
    `LOCATION:${escape(interview.location)}`,
    'STATUS:CANCELLED',
    'SEQUENCE:1',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const icsBase64 = Buffer.from(cancelledICS).toString('base64')

  // Cancellation email HTML
  const cancellationEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${translate('emailService.cancellation.title')}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">${translate('emailService.cancellation.greeting', { candidateName })}</p>
    
    <p style="font-size: 16px;">
      ${translate('emailService.cancellation.body', { positionTitle: position.title })}
    </p>
    
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailService.cancellation.cancelledDate')}</strong> ${interviewDate}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailService.cancellation.cancelledTime')}</strong> ${interviewTime}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      ${translate('emailService.cancellation.contactInfo', { recruiterName })}
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      ${translate('emailService.cancellation.closing')}<br>
      <strong>${recruiterName}</strong>
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">${translate('emailService.cancellation.footer')}</p>
  </div>
  
</body>
</html>
`

  try {
    // Try to send via company SMTP first
    try {
      const result = await sendEmailWithCompanySMTP(companyId, {
        to: candidate.email,
        subject: translate('emailService.cancellation.subject', { positionTitle: position.title }),
        html: cancellationEmail,
        attachments: [
          {
            filename: translate('emailService.invitation.icsFilenameCancelled'),
            content: icsBase64,
          },
        ],
      })

      console.log('✅ Cancellation email sent to candidate via company SMTP:', result)

      return {
        success: true,
        emailId: result.emailId,
        provider: result.provider,
      }
    } catch (smtpError) {
      // If company SMTP fails, fall back to Resend
      console.log('⚠️ Company SMTP failed, falling back to Resend')
      
      const result = await resend.emails.send({
        from: `${translate('emailService.from.interviews')} <interviews@notifications.hrinno.hu>`,
        to: candidate.email,
        subject: translate('emailService.cancellation.subject', { positionTitle: position.title }),
        html: cancellationEmail,
        attachments: [
          {
            filename: translate('emailService.invitation.icsFilenameCancelled'),
            content: icsBase64,
          },
        ],
      })

      console.log('✅ Cancellation email sent to candidate via Resend:', result)

      return {
        success: true,
        emailId: result.data?.id,
        provider: 'resend',
      }
    }
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error)
    throw error
  }
}

export async function sendInterviewInvitation(params: SendInterviewInvitationParams) {
  const { candidate, recruiter, position, interview, companyId, t } = params

  // Fallback translation function if none provided
  const translate: TranslationFunction = t || ((key, params) => {
    // Default English fallbacks
    const defaults: Record<string, string> = {
      'emailService.invitation.subjectCandidate': `Interview Invitation - ${params?.positionTitle}`,
      'emailService.invitation.subjectRecruiter': `Interview Scheduled - ${params?.candidateName}`,
      'emailService.invitation.icsTitle': `Interview: ${params?.positionTitle}`,
      'emailService.invitation.icsDescription': `Interview for the position of ${params?.positionTitle} with ${params?.recruiterName}`,
      'emailService.invitation.icsFilename': 'interview.ics',
      'emailService.from.interviews': 'HRInno Interviews',
    }
    return defaults[key] || key
  })

  const candidateName = `${candidate.firstName} ${candidate.lastName}`
  const recruiterName = `${recruiter.firstName} ${recruiter.lastName}`
  
  // Calculate end time (default 60 minutes if not specified)
  const duration = interview.durationMinutes || 60
  const endTime = new Date(interview.datetime.getTime() + duration * 60000)

  // Format date and time for display
  const interviewDate = interview.datetime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const interviewTime = interview.datetime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Generate ICS file
  const icsContent = generateICS({
    title: translate('emailService.invitation.icsTitle', { positionTitle: position.title }),
    description: translate('emailService.invitation.icsDescription', { 
      positionTitle: position.title,
      recruiterName 
    }),
    location: interview.location,
    startTime: interview.datetime,
    endTime: endTime,
    organizerEmail: recruiter.email,
    organizerName: recruiterName,
    attendeeEmail: candidate.email,
    attendeeName: candidateName,
  })

  // Convert ICS to base64 for attachment
  const icsBase64 = Buffer.from(icsContent).toString('base64')

  try {
    // Try to send via company SMTP first
    try {
      // Send email to candidate
      const candidateResult = await sendEmailWithCompanySMTP(companyId, {
        to: candidate.email,
        subject: translate('emailService.invitation.subjectCandidate', { positionTitle: position.title }),
        html: generateInterviewEmail({
          candidateName,
          recruiterName,
          positionTitle: position.title,
          interviewDate,
          interviewTime,
          location: interview.location,
          isForCandidate: true,
          t: translate,
        }),
        attachments: [
          {
            filename: translate('emailService.invitation.icsFilename'),
            content: icsBase64,
          },
        ],
      })

      console.log('✅ Email sent to candidate via company SMTP:', candidateResult)

      // Send confirmation email to recruiter
      const recruiterResult = await sendEmailWithCompanySMTP(companyId, {
        to: recruiter.email,
        subject: translate('emailService.invitation.subjectRecruiter', { candidateName }),
        html: generateInterviewEmail({
          candidateName,
          recruiterName,
          positionTitle: position.title,
          interviewDate,
          interviewTime,
          location: interview.location,
          isForCandidate: false,
          t: translate,
        }),
        attachments: [
          {
            filename: translate('emailService.invitation.icsFilename'),
            content: icsBase64,
          },
        ],
      })

      console.log('✅ Email sent to recruiter via company SMTP:', recruiterResult)

      return {
        success: true,
        candidateEmailId: candidateResult.emailId,
        recruiterEmailId: recruiterResult.emailId,
        provider: 'company-smtp',
      }
    } catch (smtpError) {
      // If company SMTP fails, fall back to Resend
      console.log('⚠️ Company SMTP failed, falling back to Resend')

      // Send email to candidate via Resend
      const candidateEmailResult = await resend.emails.send({
        from: `${translate('emailService.from.interviews')} <interviews@notifications.hrinno.hu>`,
        to: candidate.email,
        subject: translate('emailService.invitation.subjectCandidate', { positionTitle: position.title }),
        html: generateInterviewEmail({
          candidateName,
          recruiterName,
          positionTitle: position.title,
          interviewDate,
          interviewTime,
          location: interview.location,
          isForCandidate: true,
          t: translate,
        }),
        attachments: [
          {
            filename: translate('emailService.invitation.icsFilename'),
            content: icsBase64,
          },
        ],
      })

      console.log('✅ Email sent to candidate via Resend:', candidateEmailResult)

      // Send confirmation email to recruiter via Resend
      const recruiterEmailResult = await resend.emails.send({
        from: `${translate('emailService.from.interviews')} <interviews@notifications.hrinno.hu>`,
        to: recruiter.email,
        subject: translate('emailService.invitation.subjectRecruiter', { candidateName }),
        html: generateInterviewEmail({
          candidateName,
          recruiterName,
          positionTitle: position.title,
          interviewDate,
          interviewTime,
          location: interview.location,
          isForCandidate: false,
          t: translate,
        }),
        attachments: [
          {
            filename: translate('emailService.invitation.icsFilename'),
            content: icsBase64,
          },
        ],
      })

      console.log('✅ Email sent to recruiter via Resend:', recruiterEmailResult)

      return {
        success: true,
        candidateEmailId: candidateEmailResult.data?.id,
        recruiterEmailId: recruiterEmailResult.data?.id,
        provider: 'resend',
      }
    }
  } catch (error) {
    console.error('❌ Failed to send interview invitation emails:', error)
    throw error
  }
}

interface SendOnboardingEmailParams {
  companyId: number
  to: string
  adminFirstName: string
  companyName: string
  calendlyUrl: string
}

async function sendOnboardingEmail(
  params: SendOnboardingEmailParams,
  variant: 'welcome' | 'reminder'
) {
  const { companyId, to, adminFirstName, companyName, calendlyUrl } = params

  const subject =
    variant === 'welcome'
      ? `Welcome to HRInno, ${adminFirstName} — book your onboarding call`
      : `Reminder: book your HRInno onboarding call`

  const html = generateOnboardingEmail({ adminFirstName, companyName, calendlyUrl, variant })

  try {
    // Try to send via company SMTP first (a brand-new self-serve company
    // will never have this configured yet, so this will normally throw and
    // fall through to Resend below - kept for consistency with every other
    // email in this file rather than special-casing it).
    try {
      const result = await sendEmailWithCompanySMTP(companyId, { to, subject, html })
      console.log(`✅ Onboarding ${variant} email sent via company SMTP:`, result)
      return { success: true, emailId: result.emailId, provider: result.provider }
    } catch (smtpError) {
      console.log('⚠️ Company SMTP failed, falling back to Resend')

      const result = await resend.emails.send({
        from: 'HRInno Onboarding <onboarding@notifications.hrinno.hu>',
        to,
        subject,
        html,
      })

      // resend-node resolves (doesn't throw) on API-level failures like a
      // 422 validation error - it only rejects data/error into the same
      // object. Check result.error explicitly rather than assuming a
      // non-throwing call means the email was actually accepted, otherwise
      // this gets recorded as "sent" (both in company.onboarding_link_sent_at
      // and the funnel_events row) when it never left the building - which
      // would defeat the whole point of the admin visibility this feature
      // is for (Requirement 3: seeing who's actually fallen through the gap).
      if (result.error) {
        throw new Error(`Resend rejected the email: ${result.error.message}`)
      }

      console.log(`✅ Onboarding ${variant} email sent via Resend:`, result)
      return { success: true, emailId: result.data?.id, provider: 'resend' as const }
    }
  } catch (error) {
    console.error(`❌ Failed to send onboarding ${variant} email:`, error)
    throw error
  }
}

/** Sent right after self-serve signup - Calendly link to book the onboarding call. */
export async function sendOnboardingBookingEmail(params: SendOnboardingEmailParams) {
  return sendOnboardingEmail(params, 'welcome')
}

/** One-time nudge if the company hasn't booked within the reminder SLA. */
export async function sendOnboardingReminderEmail(params: SendOnboardingEmailParams) {
  return sendOnboardingEmail(params, 'reminder')
}
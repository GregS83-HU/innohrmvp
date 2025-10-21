// lib/email-templates.ts

import { formatLocation } from './ics-generator'

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

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
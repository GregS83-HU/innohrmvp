// lib/email-templates.ts

import { formatLocation } from './ics-generator'

interface InterviewEmailData {
  candidateName: string
  recruiterName: string
  positionTitle: string
  interviewDate: string
  interviewTime: string
  location: string
  isForCandidate: boolean
}

export function generateInterviewEmail(data: InterviewEmailData): string {
  const locationInfo = formatLocation(data.location)
  const locationHTML = locationInfo.isVirtual
    ? `<a href="${locationInfo.link}" style="color: #4F46E5; text-decoration: none;">${locationInfo.displayText}</a>`
    : locationInfo.displayText

  if (data.isForCandidate) {
    // Email for candidate
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Interview Invitation</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">Dear ${data.candidateName},</p>
    
    <p style="font-size: 16px;">
      You have been invited for an interview for the position of <strong>${data.positionTitle}</strong> 
      with ${data.recruiterName}.
    </p>
    
    <div style="background: #f9fafb; border-left: 4px solid #4F46E5; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">📅 Date:</strong> ${data.interviewDate}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">⏰ Time:</strong> ${data.interviewTime}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${locationInfo.isVirtual ? '🔗' : '📍'} Location:</strong> ${locationHTML}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      A calendar invitation has been attached to this email. Please accept it to add this interview to your calendar.
    </p>
    
    <p style="font-size: 16px;">
      If you have any questions or need to reschedule, please contact ${data.recruiterName}.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Best regards,<br>
      <strong>${data.recruiterName}</strong>
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Sent via HRInno Interview Scheduler</p>
  </div>
  
</body>
</html>
`
  } else {
    // Email for recruiter (confirmation)
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Interview Scheduled</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">Hi ${data.recruiterName},</p>
    
    <p style="font-size: 16px;">
      Your interview with <strong>${data.candidateName}</strong> for the position of 
      <strong>${data.positionTitle}</strong> has been scheduled.
    </p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">👤 Candidate:</strong> ${data.candidateName}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">📅 Date:</strong> ${data.interviewDate}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">⏰ Time:</strong> ${data.interviewTime}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${locationInfo.isVirtual ? '🔗' : '📍'} Location:</strong> ${locationHTML}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      The candidate has been notified and will receive a calendar invitation. A copy has been added to your calendar as well.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Good luck with the interview!
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Sent via HRInno Interview Scheduler</p>
  </div>
  
</body>
</html>
`
  }
}
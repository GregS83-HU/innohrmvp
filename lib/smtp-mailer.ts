// lib/smtp-mailer.ts
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { decryptPassword } from './encryption'

interface CompanyEmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_username: string
  smtp_password_encrypted: string
  from_name: string | null
  from_email: string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
  }>
}

/**
 * Get company email settings from database
 */
async function getCompanyEmailSettings(companyId: number): Promise<CompanyEmailSettings | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('company_email_settings')
    .select('*')
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return null
  }

  return data as CompanyEmailSettings
}

/**
 * Send email using company's SMTP settings or fallback to Resend
 */
export async function sendEmailWithCompanySMTP(
  companyId: number,
  emailParams: SendEmailParams
): Promise<{ success: boolean; emailId?: string; provider: 'company-smtp' | 'resend' }> {
  
  // Try to get company email settings
  const companySettings = await getCompanyEmailSettings(companyId)

  if (companySettings) {
    // Use company SMTP
    try {
      console.log(`📧 Sending email via company SMTP (${companySettings.smtp_host})`)
      
      // Decrypt password
      const decryptedPassword = decryptPassword(companySettings.smtp_password_encrypted)

            console.log('SMTP Config:', {
        host: companySettings.smtp_host,
        port: companySettings.smtp_port,
        secure: companySettings.smtp_secure,
        username: companySettings.smtp_username,
        passwordLength: decryptPassword(companySettings.smtp_password_encrypted)?.length,
        });



      // Create transporter with company settings
      const transporter = nodemailer.createTransport({
        host: companySettings.smtp_host,
        port: companySettings.smtp_port,
        secure: companySettings.smtp_secure, // true for 465, false for other ports
        auth: {
          user: companySettings.smtp_username,
          pass: decryptedPassword,
        },
      })

      // Prepare from address
      const fromAddress = companySettings.from_name
        ? `${companySettings.from_name} <${companySettings.from_email}>`
        : companySettings.from_email

      // Prepare attachments for nodemailer
      const attachments = emailParams.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64',
      }))

      // Send email
      const info = await transporter.sendMail({
        from: fromAddress,
        to: emailParams.to,
        subject: emailParams.subject,
        html: emailParams.html,
        attachments,
      })

      console.log('✅ Email sent via company SMTP:', info.messageId)

      return {
        success: true,
        emailId: info.messageId,
        provider: 'company-smtp',
      }
    } catch (error) {
      console.error('❌ Failed to send email via company SMTP:', error)
      throw new Error(`Failed to send email via company SMTP: ${(error as Error).message}`)
    }
  } else {
    // No company settings found, use Resend (fallback)
    console.log('📧 No company SMTP settings found, using Resend')
    throw new Error('Company SMTP settings not configured. Please configure email settings or use Resend directly.')
  }
}
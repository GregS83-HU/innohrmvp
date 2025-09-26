// app/api/notifications/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email templates
const emailTemplates = {
  newTicket: {
    subject: 'New Support Ticket Created - #{ticketId}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Support Ticket</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;"><strong>From:</strong> {{userEmail}} ({{userName}})</p>
          <p style="color: #475569;"><strong>Priority:</strong> {{priority}}</p>
          <p style="color: #475569;"><strong>Category:</strong> {{category}}</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="color: #374151; margin: 0;">{{description}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Ticket
          </a>
        </div>
      </div>
    `
  },
  newMessage: {
    subject: 'New Reply on Ticket #{ticketId} - {{title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Message</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;"><strong>From:</strong> {{senderName}} ({{senderType}})</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="color: #374151; margin: 0; white-space: pre-wrap;">{{message}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Conversation
          </a>
        </div>
      </div>
    `
  },
  statusUpdate: {
    subject: 'Ticket Status Updated - #{ticketId}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Ticket Status Update</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;">Your ticket status has been updated:</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; text-align: center;">
            <p style="color: #374151; margin: 0; font-size: 18px; font-weight: bold;">{{status}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Ticket
          </a>
        </div>
      </div>
    `
  }
};

// Mock email service - replace with your actual email service
async function sendEmail(to: string, subject: string, html: string) {
  // This would integrate with your email service (SendGrid, Mailgun, etc.)
  console.log('Sending email:', { to, subject, html });
  
  // For now, just log the email content
  // In production, replace this with actual email sending logic:
  /*
  const response = await fetch('https://api.sendgrid.v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'support@yourcompany.com' },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  });
  
  return response.json();
  */
  
  return { success: true }; // Mock response
}

export async function POST(req: NextRequest) {
  try {
    const { 
      type, 
      recipientEmail, 
      ticketData, 
      messageData, 
      companySlug 
    } = await req.json();

    if (!type || !recipientEmail || !ticketData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/tickets/${ticketData.id}`;
    
    let template;
    let replacements: Record<string, string> = {};

    switch (type) {
      case 'new_ticket':
        template = emailTemplates.newTicket;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          userEmail: ticketData.user_email,
          userName: ticketData.user_name,
          priority: ticketData.priority,
          category: ticketData.category || 'General',
          description: ticketData.description,
          ticketUrl
        };
        break;

      case 'new_message':
        template = emailTemplates.newMessage;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          senderName: messageData.sender_name,
          senderType: messageData.sender_type === 'admin' ? 'Support Team' : 'User',
          message: messageData.message,
          ticketUrl
        };
        break;

      case 'status_update':
        template = emailTemplates.statusUpdate;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          status: ticketData.status.replace('_', ' ').toUpperCase(),
          ticketUrl
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Replace template variables
    let subject = template.subject;
    let html = template.html;

    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });

    // Send email
    await sendEmail(recipientEmail, subject, html);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email notification' },
      { status: 500 }
    );
  }
}

// Helper function to send email notifications (to be called from other parts of your app)
export async function sendTicketNotification(
  type: 'new_ticket' | 'new_message' | 'status_update',
  ticketData: any,
  recipientEmail: string,
  companySlug: string,
  messageData?: any
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        recipientEmail,
        ticketData,
        messageData,
        companySlug
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Email notification failed:', error);
    throw error;
  }
}
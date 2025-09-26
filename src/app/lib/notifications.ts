// app/lib/notifications.ts

import { TicketData, MessageData } from '../api/notifications/email/types'; // import your types

export async function sendTicketNotification(
  type: 'new_ticket' | 'new_message' | 'status_update',
  ticketData: TicketData,
  recipientEmail: string,
  companySlug: string,
  messageData?: MessageData
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ticketData, recipientEmail, companySlug, messageData })
  });

  if (!response.ok) {
    throw new Error('Failed to send email notification');
  }

  return response.json();
}

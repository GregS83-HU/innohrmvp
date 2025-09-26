// app/types.ts

export interface TicketData {
  id: string;
  title: string;
  user_email: string;
  user_name: string;
  priority: string;
  category?: string;
  description: string;
  status?: string;
}

export interface MessageData {
  sender_name: string;
  sender_type: 'user' | 'admin';
  message: string;
}

// File: utils/absenceNotifications.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LeaveRequestNotificationData {
  leaveRequestId: string;
  userId: string;
  userName: string;
  managerId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface LeaveReviewNotificationData {
  leaveRequestId: string;
  userId: string;
  managerId: string;
  managerName: string;
  leaveTypeName: string;
  status: 'approved' | 'rejected';
  reviewNotes?: string;
}

/**
 * Verify that a user exists in the users table
 */
async function verifyUserExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error(`User ${userId} not found in users table:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error verifying user ${userId}:`, err);
    return false;
  }
}

/**
 * Create notification when a user submits a leave request
 */
export async function createLeaveRequestNotification(data: LeaveRequestNotificationData) {
  try {
    // Verify both sender and recipient exist
    const [senderExists, recipientExists] = await Promise.all([
      verifyUserExists(data.userId),
      verifyUserExists(data.managerId)
    ]);

    if (!senderExists) {
      console.error(`Cannot create notification: sender ${data.userId} does not exist`);
      return { success: false, error: 'Sender user not found' };
    }

    if (!recipientExists) {
      console.error(`Cannot create notification: recipient ${data.managerId} does not exist`);
      return { success: false, error: 'Recipient user not found' };
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        type: 'leave_request_created',
        title: 'New Leave Request',
        message: `${data.userName} requested ${data.leaveTypeName} from ${data.startDate} to ${data.endDate} (${data.totalDays} day${data.totalDays !== 1 ? 's' : ''})`,
        leave_request_id: data.leaveRequestId,
        sender_id: data.userId,
        recipient_id: data.managerId,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating leave request notification:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to create leave request notification:', err);
    return { success: false, error: err };
  }
}

/**
 * Create notification when a manager approves or rejects a leave request
 */
export async function createLeaveReviewNotification(data: LeaveReviewNotificationData) {
  try {
    // Verify both sender and recipient exist
    const [senderExists, recipientExists] = await Promise.all([
      verifyUserExists(data.managerId),
      verifyUserExists(data.userId)
    ]);

    if (!senderExists) {
      console.error(`Cannot create notification: sender (manager) ${data.managerId} does not exist`);
      return { success: false, error: 'Sender (manager) user not found' };
    }

    if (!recipientExists) {
      console.error(`Cannot create notification: recipient (employee) ${data.userId} does not exist`);
      return { success: false, error: 'Recipient (employee) user not found' };
    }

    const isApproved = data.status === 'approved';
    const title = isApproved ? 'Leave Request Approved' : 'Leave Request Rejected';
    const emoji = isApproved ? '✅' : '❌';
    
    let message = `${emoji} Your ${data.leaveTypeName} request has been ${data.status} by ${data.managerName}`;
    if (data.reviewNotes) {
      message += `. Note: ${data.reviewNotes}`;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        type: `leave_request_${data.status}`,
        title,
        message,
        leave_request_id: data.leaveRequestId,
        sender_id: data.managerId,
        recipient_id: data.userId,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating leave review notification:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to create leave review notification:', err);
    return { success: false, error: err };
  }
}

/**
 * Get manager info for a user
 */
export async function getUserManager(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('manager_id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { managerId: data?.manager_id, error: null };
  } catch (err) {
    console.error('Error fetching user manager:', err);
    return { managerId: null, error: err };
  }
}

/**
 * Get user's full name
 */
export async function getUserName(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Construct full name from firstname and lastname
    const fullName = data?.user_firstname && data?.user_lastname
      ? `${data.user_firstname} ${data.user_lastname}`.trim()
      : data?.user_firstname || data?.user_lastname || 'User';
    
    return { name: fullName, error: null };
  } catch (err) {
    console.error('Error fetching user name:', err);
    return { name: 'User', error: err };
  }
}
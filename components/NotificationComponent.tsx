'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, X, MessageSquare, Ticket, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationData {
  id: string;
  type: 'new_ticket' | 'new_message' | 'status_update';
  title: string;
  message: string;
  ticket_id?: string;
  company_slug?: string;
  created_at: string;
  read: boolean;
}

interface NotificationComponentProps {
  currentUser: { id: string; [key: string]: any } | null; // at minimum has an id
  isHrinnoAdmin: boolean;
  companySlug: string | null;
}

export default function NotificationComponent({ 
  currentUser, 
  isHrinnoAdmin, 
  companySlug 
}: NotificationComponentProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Create notification
  const createNotification = useCallback((
    type: NotificationData['type'],
    title: string,
    message: string,
    ticketId?: string
  ) => {
    const notification: NotificationData = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      ticket_id: ticketId,
      company_slug: companySlug ?? undefined,
      created_at: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove notification after 5 seconds for non-critical ones
    if (type === 'new_message') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  }, [companySlug]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationData) => {
    markAsRead(notification.id);
    if (notification.ticket_id) {
      router.push(`/${companySlug}/tickets/${notification.ticket_id}`);
    }
    setShowNotifications(false);
  };

  // Remove notification
  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'new_ticket':
        return <Ticket className="w-5 h-5 text-blue-600" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'status_update':
        return <Check className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Set up real-time subscriptions for notifications
  useEffect(() => {
    if (!currentUser) return;

    const subscriptions: any[] = [];

    if (isHrinnoAdmin) {
      // Admin gets notifications for all new tickets and messages
      const newTicketsSubscription = supabase
        .channel('admin_new_tickets')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'tickets'
          }, 
          (payload) => {
            const ticket = payload.new;
            createNotification(
              'new_ticket',
              'New Support Ticket',
              `New ticket from ${ticket.user_name}: ${ticket.title}`,
              ticket.id
            );
          }
        )
        .subscribe();

      const newMessagesSubscription = supabase
        .channel('admin_new_messages')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages'
          },
          async (payload) => {
            const message = payload.new;
            
            // Only notify admin if message is from user
            if (message.sender_type === 'user') {
              // Get ticket info
              const { data: ticket } = await supabase
                .from('tickets')
                .select('title, user_name')
                .eq('id', message.ticket_id)
                .single();

              if (ticket) {
                createNotification(
                  'new_message',
                  'New Message',
                  `${message.sender_name} replied to: ${ticket.title}`,
                  message.ticket_id
                );
              }
            }
          }
        )
        .subscribe();

      subscriptions.push(newTicketsSubscription, newMessagesSubscription);
    } else {
      // Regular users get notifications for messages on their tickets
      const userMessagesSubscription = supabase
        .channel('user_new_messages')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages'
          },
          async (payload) => {
            const message = payload.new;
            
            // Only notify user if message is from admin and it's their ticket
            if (message.sender_type === 'admin') {
              const { data: ticket } = await supabase
                .from('tickets')
                .select('title, user_id')
                .eq('id', message.ticket_id)
                .single();

              if (ticket && ticket.user_id === currentUser.id) {
                createNotification(
                  'new_message',
                  'New Response',
                  `Support team replied to: ${ticket.title}`,
                  message.ticket_id
                );
              }
            }
          }
        )
        .subscribe();

      // Notifications for status updates on user's tickets
      const statusUpdatesSubscription = supabase
        .channel('user_status_updates')
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tickets'
          },
          (payload) => {
            const oldTicket = payload.old as any;
            const newTicket = payload.new as any;
            
            // Only notify if status changed and it's user's ticket
            if (oldTicket.status !== newTicket.status && newTicket.user_id === currentUser.id) {
              createNotification(
                'status_update',
                'Ticket Status Updated',
                `Your ticket "${newTicket.title}" is now ${newTicket.status.replace('_', ' ')}`,
                newTicket.id
              );
            }
          }
        )
        .subscribe();

      subscriptions.push(userMessagesSubscription, statusUpdatesSubscription);
    }

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [currentUser, isHrinnoAdmin, createNotification]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('#notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="relative" id="notifications-dropdown">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast Notifications for new messages (only show if dropdown is closed) */}
      {!showNotifications && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications
            .filter(n => n.type === 'new_message' && !n.read)
            .slice(0, 3)
            .map((notification) => (
              <div
                key={`toast-${notification.id}`}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
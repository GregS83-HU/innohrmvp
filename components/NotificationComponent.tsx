// components/NotificationComponent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Bell,
  X,
  MessageSquare,
  Ticket,
  Check,
  Calendar,
  CheckCircle,
  XCircle,
  Target,
  AlertTriangle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationData {
  id: string;
  type:
    | 'ticket_created'
    | 'ticket_status_changed'
    | 'ticket_message'
    | 'leave_request_created'
    | 'leave_request_approved'
    | 'leave_request_rejected'
    | 'goal_created'
    | 'goal_approved'
    | 'goal_red_flag'
    | 'pulse_reminder'
    | 'one_on_one_scheduled'
    | 'cv_uploaded';
  title: string;
  message: string;
  ticket_id?: string;
  leave_request_id?: string;
  goal_id?: string;
  one_on_one_id?: string;
  position_id?: string;
  created_at: string;
  read: boolean;
  sender_id?: string | null;
  recipient_id?: string | null;
}

interface NotificationComponentProps {
  currentUser: { id: string; is_super_admin?: boolean } | null;
  companySlug: string | null;
}

interface TicketPayload {
  id: string;
  title?: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  status?: string;
  assigned_to?: string;
}

interface TicketMessagePayload {
  id: string;
  ticket_id: string;
  sender_id?: string;
  sender_name?: string;
  created_at: string;
}

interface PostgresChangePayload<T = Record<string, unknown>> {
  new: T;
  old?: Partial<T>;
  eventType?: 'INSERT' | 'UPDATE' | 'DELETE';
}

export default function NotificationComponent({
  currentUser,
  companySlug,
}: NotificationComponentProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [toasts, setToasts] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);
  const [adminStatusChecked, setAdminStatusChecked] = useState(false);
  const subscriptionsRef = useRef<ReturnType<(typeof supabase)['channel']>[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Check admin status ---
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setAdminStatusChecked(true);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_super_admin')
          .eq('id', currentUser.id)
          .single();

        if (!error && userData) {
          setIsHrinnoAdmin(userData.is_super_admin === true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      } finally {
        setAdminStatusChecked(true);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // --- Fetch notifications ---
  useEffect(() => {
    if (!currentUser || !adminStatusChecked) return;

    const fetchNotifications = async () => {
      try {
        const query = supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(50);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        setNotifications(data || []);
      } catch (err) {
        console.error('Error in fetchNotifications:', err);
      }
    };

    fetchNotifications();
  }, [currentUser, adminStatusChecked]);

  // --- Real-time subscriptions ---
  useEffect(() => {
    if (!currentUser || !adminStatusChecked) return;

    // Cleanup function
    const cleanup = () => {
      subscriptionsRef.current.forEach((sub) => {
        supabase.removeChannel(sub);
      });
      subscriptionsRef.current = [];
    };

    cleanup();

    // Ticket notifications (for super admins)
    if (isHrinnoAdmin) {
      const ticketChannel = supabase
        .channel('ticket-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            const newTicket = payload.new as TicketPayload;
            const notification: NotificationData = {
              id: `ticket-${newTicket.id}-${Date.now()}`,
              type: 'ticket_created',
              title: t('notificationComponent.ticket.newTicket'),
              message: `${newTicket.user_name || t('notificationComponent.ticket.user')}: ${newTicket.title}`,
              ticket_id: newTicket.id,
              created_at: newTicket.created_at,
              read: false,
              recipient_id: currentUser.id,
            };

            setNotifications((prev) => [notification, ...prev]);
            setToasts((prev) => [notification, ...prev.slice(0, 2)]);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== notification.id));
            }, 5000);
          }
        )
        .subscribe();

      subscriptionsRef.current.push(ticketChannel);

      // Ticket messages
      const messageChannel = supabase
        .channel('ticket-message-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages',
          },
          (payload) => {
            const newMessage = payload.new as TicketMessagePayload;
            if (newMessage.sender_id !== currentUser.id) {
              const notification: NotificationData = {
                id: `message-${newMessage.id}-${Date.now()}`,
                type: 'ticket_message',
                title: t('notificationComponent.ticket.newMessage'),
                message: `${newMessage.sender_name || t('notificationComponent.ticket.someone')} ${t('notificationComponent.ticket.replied')}`,
                ticket_id: newMessage.ticket_id,
                created_at: newMessage.created_at,
                read: false,
                recipient_id: currentUser.id,
              };

              setNotifications((prev) => [notification, ...prev]);
              setToasts((prev) => [notification, ...prev.slice(0, 2)]);

              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== notification.id));
              }, 5000);
            }
          }
        )
        .subscribe();

      subscriptionsRef.current.push(messageChannel);
    }

    // CV upload notifications (for admins)
    const cvChannel = supabase
      .channel('cv-uploads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationData;
          if (newNotification.type === 'cv_uploaded') {
            console.log('📄 New CV uploaded notification received');
            setNotifications((prev) => [newNotification, ...prev]);
            setToasts((prev) => [newNotification, ...prev.slice(0, 2)]);
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== newNotification.id));
            }, 5000);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(cvChannel);

    // Generic notifications channel
    const notificationChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationData;
          
          // Skip CV uploads as they're handled above
          if (newNotification.type === 'cv_uploaded') return;

          console.log('🔔 New notification received:', newNotification.type);
          setNotifications((prev) => [newNotification, ...prev]);
          setToasts((prev) => [newNotification, ...prev.slice(0, 2)]);

          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newNotification.id));
          }, 5000);
        }
      )
      .subscribe();

    subscriptionsRef.current.push(notificationChannel);

    return cleanup;
  }, [currentUser, adminStatusChecked, isHrinnoAdmin, t]);

  // --- Click outside to close dropdown ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // --- Get notification icon ---
  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'ticket_created':
      case 'ticket_status_changed':
        return <Ticket className="w-4 h-4" />;
      case 'ticket_message':
        return <MessageSquare className="w-4 h-4" />;
      case 'leave_request_created':
      case 'leave_request_approved':
      case 'leave_request_rejected':
        return <Calendar className="w-4 h-4" />;
      case 'goal_created':
      case 'goal_approved':
        return <Target className="w-4 h-4" />;
      case 'goal_red_flag':
        return <AlertTriangle className="w-4 h-4" />;
      case 'pulse_reminder':
        return <TrendingUp className="w-4 h-4" />;
      case 'cv_uploaded':
        return <FileText className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // --- Get notification color ---
  const getNotificationColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'ticket_created':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'ticket_status_changed':
        return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'ticket_message':
        return 'bg-cyan-100 text-cyan-600 border-cyan-200';
      case 'leave_request_created':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'leave_request_approved':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'leave_request_rejected':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'goal_created':
        return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'goal_approved':
        return 'bg-teal-100 text-teal-600 border-teal-200';
      case 'goal_red_flag':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'pulse_reminder':
        return 'bg-violet-100 text-violet-600 border-violet-200';
      case 'cv_uploaded':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // --- Handle notification click ---
  const handleNotificationClick = async (notification: NotificationData) => {
    try {
      // Mark as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );

      // Navigate based on type
      if (notification.type === 'cv_uploaded') {
        if (notification.position_id) {
          router.push(`/jobs/${companySlug}/stats?positionId=${notification.position_id}`);
        }
      } else if (
        notification.type === 'ticket_created' ||
        notification.type === 'ticket_status_changed' ||
        notification.type === 'ticket_message'
      ) {
        if (notification.ticket_id) {
          router.push(`/jobs/${companySlug}/tickets/${notification.ticket_id}`);
        }
      } else if (
        notification.type === 'leave_request_created' ||
        notification.type === 'leave_request_approved' ||
        notification.type === 'leave_request_rejected'
      ) {
        router.push(`/jobs/${companySlug}/absences`);
      } else if (
        notification.type === 'goal_created' ||
        notification.type === 'goal_approved' ||
        notification.type === 'goal_red_flag'
      ) {
        if (notification.goal_id) {
          router.push(`/jobs/${companySlug}/performance/goals/${notification.goal_id}`);
        } else {
          router.push(`/jobs/${companySlug}/performance`);
        }
      } else if (notification.type === 'pulse_reminder') {
        router.push(`/jobs/${companySlug}/performance/pulse`);
      }

      setShowNotifications(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // --- Mark all as read ---
  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

      if (unreadIds.length === 0) return;

      await supabase.from('notifications').update({ read: true }).in('id', unreadIds);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // --- Format time ---
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notificationComponent.time.justNow');
    if (diffMins < 60) return t('notificationComponent.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('notificationComponent.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('notificationComponent.time.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-900">
                {t('notificationComponent.title')}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  {t('notificationComponent.markAllRead')}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('notificationComponent.noNotifications')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 animate-slide-in pointer-events-auto"
          >
            <div className="flex gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${getNotificationColor(
                  toast.type
                )}`}
              >
                {getNotificationIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{toast.title}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
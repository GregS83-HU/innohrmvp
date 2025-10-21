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
    | 'one_on_one_scheduled';
  title: string;
  message: string;
  ticket_id?: string;
  leave_request_id?: string;
  goal_id?: string;
  one_on_one_id?: string;
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
        setIsHrinnoAdmin(false);
        setAdminStatusChecked(true);
        return;
      }

      if (currentUser.is_super_admin !== undefined) {
        setIsHrinnoAdmin(currentUser.is_super_admin);
        setAdminStatusChecked(true);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_super_admin')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching user admin status:', error);
          setIsHrinnoAdmin(companySlug === 'hrinno' || companySlug === 'innohr');
        } else {
          setIsHrinnoAdmin(userData?.is_super_admin || false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsHrinnoAdmin(companySlug === 'hrinno' || companySlug === 'innohr');
      }

      setAdminStatusChecked(true);
    };

    checkAdminStatus();
  }, [currentUser, companySlug]);

  // --- Helpers ---
  const addNotification = (notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev]);
    setToasts((prev) => {
      const newToasts = [notification, ...prev];
      setTimeout(() => setToasts((current) => current.filter((t) => t.id !== notification.id)), 5000);
      return newToasts;
    });
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length === 0) return;

    const snapshot = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        setNotifications(snapshot);
        try {
          const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
          if (data) setNotifications(data as NotificationData[]);
        } catch (e) {
          console.error('Failed to re-fetch notifications after failing to mark all read:', e);
        }
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setNotifications(snapshot);
    }
  };

  const removeNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleNotificationClick = (notification: NotificationData) => {
    markAsRead(notification.id);

    if (notification.ticket_id) {
      router.push(`/jobs/${companySlug}/tickets/${notification.ticket_id}`);
    } else if (notification.leave_request_id) {
      router.push(`/jobs/${companySlug}/absences`);
    } else if (notification.goal_id) {
      router.push(`/jobs/${companySlug}/performance/goals/${notification.goal_id}`);
    } else if (notification.type === 'pulse_reminder') {
      router.push(`/jobs/${companySlug}/performance/pulse`);
    }

    setShowNotifications(false);
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'ticket_created':
        return <Ticket className="w-5 h-5 text-blue-600" />;
      case 'ticket_message':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'ticket_status_changed':
        return <Check className="w-5 h-5 text-orange-600" />;
      case 'leave_request_created':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'leave_request_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'leave_request_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'goal_created':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'goal_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'goal_red_flag':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'pulse_reminder':
        return <Calendar className="w-5 h-5 text-yellow-600" />;
      case 'one_on_one_scheduled':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // --- Load old notifications ---
  useEffect(() => {
    if (!currentUser || !adminStatusChecked) return;

    const fetchOldNotifications = async () => {
      try {
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

        if (isHrinnoAdmin) {
          query = query.or(
            `and(ticket_id.not.is.null,sender_id.neq.${currentUser.id}),and(leave_request_id.not.is.null,recipient_id.eq.${currentUser.id}),recipient_id.eq.${currentUser.id}`
          );
        } else {
          query = query.eq('recipient_id', currentUser.id);

          const { data: userTickets } = await supabase
            .from('tickets')
            .select('id')
            .eq('user_id', currentUser.id);

          const ticketIds = (userTickets || []).map((t: { id: string }) => t.id);

          if (ticketIds.length > 0) {
            query = query.or(`recipient_id.eq.${currentUser.id},ticket_id.in.(${ticketIds.join(',')})`);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Failed to fetch old notifications:', err);
      }
    };

    fetchOldNotifications();
  }, [currentUser, isHrinnoAdmin, adminStatusChecked]);

  // --- Real-time subscriptions ---
  useEffect(() => {
    if (!currentUser || !adminStatusChecked) return;

    subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
    subscriptionsRef.current = [];

    const channel = supabase.channel(`notifications_${currentUser.id}_${Date.now()}`);

    if (isHrinnoAdmin) {
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets' }, (payload: { new: TicketPayload; old?: Partial<TicketPayload> }) => {
          const p = payload.new;
          const notification: NotificationData = {
            id: p.id,
            type: 'ticket_created',
            title: t('notifications.ticket_created.title'),
            message: t('notifications.ticket_created.message', {
              user: p.user_name || t('notifications.fallback.user'),
              title: p.title || '',
            }),
            ticket_id: p.id,
            created_at: p.created_at,
            read: false,
            sender_id: p.user_id || null,
          };

          if (notification.sender_id !== currentUser.id) addNotification(notification);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages' }, (payload: { new: TicketMessagePayload; old?: Partial<TicketMessagePayload> }) => {
          const p = payload.new;
          const notification: NotificationData = {
            id: p.id,
            type: 'ticket_message',
            title: t('notifications.ticket_message.title'),
            message: t('notifications.ticket_message.message', {
              sender: p.sender_name || t('notifications.fallback.user'),
            }),
            ticket_id: p.ticket_id,
            created_at: p.created_at,
            read: false,
            sender_id: p.sender_id || null,
          };

          if (notification.sender_id !== currentUser.id) addNotification(notification);
        })
        .subscribe();
    } else {
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages' }, (payload: { new: TicketMessagePayload; old?: Partial<TicketMessagePayload> }) => {
          const p = payload.new;
          const notification: NotificationData = {
            id: p.id,
            type: 'ticket_message',
            title: t('notifications.ticket_message.title'),
            message: t('notifications.ticket_message.sent_by_admin', {
              sender: p.sender_name || t('notifications.fallback.admin'),
            }),
            ticket_id: p.ticket_id,
            created_at: p.created_at,
            read: false,
            sender_id: p.sender_id || null,
          };
          if (notification.sender_id !== currentUser.id) addNotification(notification);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets' }, (payload: { new: TicketPayload; old?: Partial<TicketPayload> }) => {
          const p = payload.new;
          if (p.user_id !== currentUser.id) return;
          if (payload.old && p.status !== payload.old.status) {
            addNotification({
              id: p.id,
              type: 'ticket_status_changed',
              title: t('notifications.ticket_status_changed.title'),
              message: t('notifications.ticket_status_changed.message', {
                title: p.title || '',
                status: p.status || '',
              }),
              ticket_id: p.id,
              created_at: new Date().toISOString(),
              read: false,
              sender_id: p.assigned_to || null,
            });
          }
        })
        .subscribe();
    }

    // Performance notifications for all users
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        (payload: { new: NotificationData; old?: Partial<NotificationData> }) => {
          const notification = payload.new as NotificationData;
          if (notification.sender_id !== currentUser.id) {
            // if DB messages contain title/message, use them; otherwise fallback to translations by type
            if (!notification.title || !notification.message) {
              const type = notification.type;
              let title = t('notifications.unknown.title');
              let message = t('notifications.unknown.message');

              if (type === 'goal_created') {
                title = t('notifications.goal_created.title');
                message = t('notifications.goal_created.message', { title: notification.title || '' });
              } else if (type === 'leave_request_created') {
                title = t('notifications.leave_request_created.title');
                message = t('notifications.leave_request_created.message');
              } else if (type === 'pulse_reminder') {
                title = t('notifications.pulse_reminder.title');
                message = t('notifications.pulse_reminder.message');
              }

              addNotification({
                ...notification,
                title,
                message,
              });
            } else {
              addNotification(notification);
            }
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.push(channel);

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [currentUser?.id, isHrinnoAdmin, adminStatusChecked, t, companySlug]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
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

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{t('notifications.header.title')}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              disabled={unreadCount === 0}
              className={`text-sm font-medium ${unreadCount === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
            >
              {t('notifications.header.markAllRead')}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('notifications.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        <p className={`text-sm mt-1 ${!n.read ? 'text-gray-600' : 'text-gray-500'}`}>{n.message}</p>
                        {(n.ticket_id || n.leave_request_id || n.goal_id) && (
                          <p className="text-xs text-blue-500 mt-1">{t('notifications.viewDetails')}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.slice(0, 3).map((n) => (
          <div
            key={`toast-${n.id}`}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => {
              handleNotificationClick(n);
              setToasts((prev) => prev.filter((t) => t.id !== n.id));
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-700 mt-1">{n.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter((t) => t.id !== n.id));
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
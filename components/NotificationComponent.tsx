'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, X, MessageSquare, Ticket, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationData {
  id: string;
  type: 'ticket_created' | 'ticket_status_changed' | 'ticket_message';
  title: string;
  message: string;
  ticket_id?: string;
  created_at: string;
  read: boolean;
  sender_id?: string | null;
}

interface NotificationComponentProps {
  currentUser: { id: string; is_super_admin?: boolean } | null;
  companySlug: string | null;
}

export default function NotificationComponent({ currentUser, companySlug }: NotificationComponentProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [toasts, setToasts] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);
  const [adminStatusChecked, setAdminStatusChecked] = useState(false);
  //const subscriptionsRef = useRef<any[]>([]);
  const subscriptionsRef = useRef<ReturnType<(typeof supabase)['channel']>[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsHrinnoAdmin(false);
        setAdminStatusChecked(true);
        return;
      }

      // First check if is_super_admin is already in currentUser object
      if (currentUser.is_super_admin !== undefined) {
        setIsHrinnoAdmin(currentUser.is_super_admin);
        setAdminStatusChecked(true);
        return;
      }

      // If not, fetch it from database
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_super_admin')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching user admin status:', error);
          // Fallback to slug-based check
          setIsHrinnoAdmin(companySlug === 'hrinno' || companySlug === 'innohr');
        } else {
          setIsHrinnoAdmin(userData?.is_super_admin || false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        // Fallback to slug-based check
        setIsHrinnoAdmin(companySlug === 'hrinno' || companySlug === 'innohr');
      }
      
      setAdminStatusChecked(true);
    };

    checkAdminStatus();
  }, [currentUser, companySlug]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev]);
    setToasts(prev => {
      const newToasts = [notification, ...prev];
      setTimeout(() => setToasts(current => current.filter(t => t.id !== notification.id)), 3000);
      return newToasts;
    });
  };

  const markAsRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const removeNotification = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const handleNotificationClick = (notification: NotificationData) => {
    markAsRead(notification.id);
if (notification.ticket_id) router.push(`/jobs/${companySlug}/tickets/${notification.ticket_id}`);    setShowNotifications(false);
  };

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'ticket_created': return <Ticket className="w-5 h-5 text-blue-600" />;
      case 'ticket_message': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'ticket_status_changed': return <Check className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // --------------------------
  // Load old notifications
  // --------------------------
  useEffect(() => {
    if (!currentUser) return;

    const fetchOldNotifications = async () => {
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        console.log("current user_id:", currentUser.id);
        console.log("isHrinnoAdmin:", isHrinnoAdmin);

         if (isHrinnoAdmin) {
          // Admin: show all notifications except their own
          query = query.neq('sender_id', currentUser.id);
        } else {
          // User: only notifications for their own tickets
          const { data: userTickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('id')
            .eq('user_id', currentUser.id);

          if (ticketsError) {
            console.error('Error fetching user tickets:', ticketsError);
            setNotifications([]);
            return;
          }

          const ticketIds = (userTickets || []).map(t => t.id);
          if (ticketIds.length === 0) {
            // No tickets = no notifications, don't run query
            setNotifications([]);
            return;
          }
          
          query = query.in('ticket_id', ticketIds);
        }

        const { data, error } = await query;
        console.log("old notifications:", data);
        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Failed to fetch old notifications:', err);
      }
    };

    // Only fetch when admin status is determined
    if (currentUser && adminStatusChecked) {
      fetchOldNotifications();
    }
  }, [currentUser, isHrinnoAdmin, adminStatusChecked]);

  // --------------------------
  // Real-time subscriptions
  // --------------------------
  useEffect(() => {
    if (!currentUser || !adminStatusChecked) return;

    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];

    console.log('Setting up admin real-time subscriptions...'); // Debug log
    const channel = supabase.channel(`notifications_${currentUser.id}_${Date.now()}`);

    if (isHrinnoAdmin) {
      console.log('Setting up ADMIN subscriptions'); // Debug log
      
      // Listen to tickets separately
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets' }, payload => {
          console.log('🎫 Admin received tickets INSERT event:', payload);
          const p = payload.new;
          const notification: NotificationData = {
            id: p.id,
            type: 'ticket_created',
            title: 'New Ticket',
            message: `${p.user_name || 'User'} created a ticket: "${p.title}"`,
            ticket_id: p.id,
            created_at: p.created_at,
            read: false,
            sender_id: p.user_id || null
          };
          
          console.log('Ticket notification created:', notification);
          if (notification.sender_id !== currentUser.id) {
            console.log('Adding ticket notification to admin dropdown');
            addNotification(notification);
          }
        })
        // Listen to ticket_messages separately  
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages' }, payload => {
          console.log('💬 Admin received ticket_messages INSERT event:', payload);
          const p = payload.new;
          const notification: NotificationData = {
            id: p.id,
            type: 'ticket_message',
            title: 'New Message',
            message: `${p.sender_name || 'User'} sent a message`,
            ticket_id: p.ticket_id,
            created_at: p.created_at,
            read: false,
            sender_id: p.sender_id || null
          };
          
          console.log('Message notification created:', notification);
          console.log('Current admin ID:', currentUser.id);
          console.log('Message sender ID:', notification.sender_id);
          
          if (notification.sender_id !== currentUser.id) {
            console.log('✅ Adding message notification to admin dropdown');
            addNotification(notification);
          } else {
            console.log('❌ Skipping - message sent by current admin');
          }
        })
        .subscribe((status) => {
          console.log('🔔 Admin subscription status:', status);
        });
      
      console.log('Admin subscriptions configured and subscribed'); // Debug log
    } else {
      // User: listen for INSERT on ticket_messages and UPDATE on tickets
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages' }, payload => {
          const p = payload.new;
          const notification: NotificationData = {
            id: p.id,
            type: 'ticket_message',
            title: 'New Message',
            message: `${p.sender_name || 'Administrator'} sent a message`,
            ticket_id: p.ticket_id,
            created_at: p.created_at,
            read: false,
            sender_id: p.sender_id || null
          };
          if (notification.sender_id !== currentUser.id) addNotification(notification);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets' }, payload => {
          const p = payload.new;
          if (p.user_id !== currentUser.id) return;
          if (p.status !== payload.old.status) {
            addNotification({
              id: p.id,
              type: 'ticket_status_changed',
              title: 'Ticket Status Updated',
              message: `Ticket "${p.title}" status changed to: ${p.status}`,
              ticket_id: p.id,
              created_at: new Date().toISOString(),
              read: false,
              sender_id: p.assigned_to || null
            });
          }
        })
        .subscribe();
    }

    subscriptionsRef.current.push(channel);

    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [currentUser?.id, isHrinnoAdmin, adminStatusChecked]); // Use currentUser.id instead of currentUser object

  // --------------------------
  // Close dropdown on outside click
  // --------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
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
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`} onClick={() => handleNotificationClick(n)}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        <p className={`text-sm mt-1 ${!n.read ? 'text-gray-600' : 'text-gray-500'}`}>{n.message}</p>
                        {n.ticket_id && <p className="text-xs text-blue-500 mt-1">View ticket</p>}
                        <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeNotification(n.id); }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2">
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
        {toasts.slice(0, 3).map(n => (
          <div key={`toast-${n.id}`} className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105"
               onClick={() => { handleNotificationClick(n); setToasts(prev => prev.filter(t => t.id !== n.id)); }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-700 mt-1">{n.message}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setToasts(prev => prev.filter(t => t.id !== n.id)); }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
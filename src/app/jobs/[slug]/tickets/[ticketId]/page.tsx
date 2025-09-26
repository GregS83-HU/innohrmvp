'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  User,
  Clock,
  Paperclip,
  Download,
  Settings,
  Check,
  Building,
  MessageSquare,
  Shield
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  company_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  company: {
    company_name: string;
    slug: string;
  };
}

interface MessageData {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin';
  sender_id: string | null;
  sender_email: string | null;
  sender_name: string | null;
  message: string;
  created_at: string;
}

interface AttachmentData {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusButtonColors = {
  open: 'bg-blue-600 hover:bg-blue-700 text-white',
  in_progress: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  resolved: 'bg-green-600 hover:bg-green-700 text-white',
  closed: 'bg-gray-600 hover:bg-gray-700 text-white'
};


const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function TicketDetailPage() {
  const params = useParams<{ slug: string; ticketId: string }>();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Replace your fetchCurrentUser function with this corrected version:

// Replace your fetchCurrentUser function with this corrected version:
const fetchCurrentUser = useCallback(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${params.slug}/login`);
      return null;
    }
    
    console.log("Auth User:", user.id, user.email);
    
    // Debug: First check if the user exists in company_to_users table
    const { data: debugCompanyUser, error: debugError } = await supabase
      .from('company_to_users')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('Debug - Raw company_to_users data:', debugCompanyUser);
    console.log('Debug - company_to_users error:', debugError);
    
    // Alternative approach: Get company_to_users data first, then get company data separately
    const { data: companyUserData, error: companyUserError } = await supabase
      .from('company_to_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
     
    if (companyUserError) {
      console.error('Company user error:', companyUserError);
      setError('User company association not found');
      return null;
    }

    if (!companyUserData) {
      console.error('No company association found for user:', user.id);
      setError('User is not associated with any company');
      return null;
    }

    console.log('Company user data:', companyUserData);

    // Get company data separately
    let companyData = null;
    if (companyUserData.company_id) {
      const { data: company, error: companyError } = await supabase
        .from('company')
        .select('id, slug, company_name')
        .eq('id', companyUserData.company_id)
        .single();
      
      if (companyError) {
        console.error('Company fetch error:', companyError);
        // Continue without company data - it's not critical for sending messages
      } else {
        companyData = company;
      }
    }

    // Then get the user profile data
    const { data: userProfileData, error: userProfileError } = await supabase
      .from('users')
      .select('id, user_firstname, user_lastname, is_admin')
      .eq('id', user.id)
      .single();

    if (userProfileError) {
      console.error('User profile error:', userProfileError);
      setError('User profile not found');
      return null;
    }

    // Combine all user data
    const mergedUser = {
      auth_id: user.id,
      auth_email: user.email,
      user_firstname: userProfileData.user_firstname,
      user_lastname: userProfileData.user_lastname,
      is_admin: userProfileData.is_admin,
      company: companyData,
      company_id: companyUserData.company_id
    };

    console.log("Merged User Data:", mergedUser);
    
    setCurrentUser(mergedUser);
    
    // Fix the admin check - you mentioned 'innohr' not 'hrinno'
    setIsHrinnoAdmin(companyData?.slug === 'innohr');

    return mergedUser;
  } catch (err) {
    console.error('Failed to load user data:', err);
    setError('Failed to load user data');
    return null;
  }
}, [params.slug, router]);

  const fetchTicket = useCallback(async () => {
    try {
      const { data, error: ticketError } = await supabase
        .from('tickets')
  .select('*') // fetch all columns
  .eq('id', params.ticketId)
  .maybeSingle();

      if (ticketError || !data) {
        setError('Ticket not found');
        return null;
      }

      setTicket(data);
      return data;
    } catch {
      setError('Failed to load ticket');
      return null;
    }
  }, [params.ticketId]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', params.ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(data || []);
      return data;
    } catch (err) {
      console.error('Failed to load messages:', err);
      return [];
    }
  }, [params.ticketId]);

  const fetchAttachments = useCallback(async () => {
    try {
      const { data, error: attachmentsError } = await supabase
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', params.ticketId)
        .order('uploaded_at', { ascending: true });

      if (attachmentsError) throw attachmentsError;
      setAttachments(data || []);
      return data;
    } catch (err) {
      console.error('Failed to load attachments:', err);
      return [];
    }
  }, [params.ticketId]);

 const sendMessage = async () => {
  if (!newMessage.trim() || !currentUser) {
    console.log("Cannot send message:", { 
      hasMessage: !!newMessage.trim(), 
      hasCurrentUser: !!currentUser 
    });
    return;
  }

  setSendingMessage(true);

  try {
    const senderName = `${currentUser.user_firstname || ''} ${currentUser.user_lastname || ''}`.trim();

    const messageData = {
      ticket_id: params.ticketId,
      sender_type: isHrinnoAdmin ? 'admin' : 'user',
      sender_id: currentUser.auth_id,
      sender_email: currentUser.auth_email,
      sender_name: senderName || 'Unknown User',
      message: newMessage.trim(),
      created_at: new Date().toISOString() // optional: ensures a temporary timestamp
    };

    // Insert into Supabase and return the inserted row
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert(messageData)
      .select()
      .single(); // fetch the inserted row immediately

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    // Optimistically add the message to the UI
    setMessages(prev => [...prev, data]);
    setNewMessage('');
    scrollToBottom(); // scroll immediately after sending

  } catch (err: any) {
    console.error("Send message error:", err);
    setError(err.message || 'Failed to send message');
  } finally {
    setSendingMessage(false);
  }
};




  const updateTicketStatus = async (newStatus: string) => {
    if (!isHrinnoAdmin || !ticket) return;
    setUpdatingStatus(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket.id);

      if (error) throw error;

      setTicket(prev => prev ? { ...prev, status: newStatus as any, resolved_at: updateData.resolved_at || prev.resolved_at } : null);
      setShowStatusModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadAttachment = async (attachment: AttachmentData) => {
    try {
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download file');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);

      const userData = await fetchCurrentUser();
      if (!userData) {
        setLoading(false);
        return;
      }

      await Promise.all([fetchTicket(), fetchMessages(), fetchAttachments()]);
      setLoading(false);
    };
    initializeData();
  }, [fetchCurrentUser, fetchTicket, fetchMessages, fetchAttachments]);

  useEffect(() => {
    if (!currentUser || !params.ticketId) return;

    const messagesSubscription = supabase
      .channel('ticket_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${params.ticketId}` },
        (payload) => setMessages(prev => [...prev, payload.new as MessageData])
      )
      .subscribe();

    const ticketSubscription = supabase
      .channel('ticket_updates')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${params.ticketId}` },
        (payload) => setTicket(prev => prev ? { ...prev, ...payload.new } : null)
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      ticketSubscription.unsubscribe();
    };
  }, [currentUser, params.ticketId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                    <p className="text-gray-600 text-sm sm:text-base">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{ticket.user_name}</span>
                  </div>
                  {isHrinnoAdmin && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{ticket.company?.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Created {formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                    {ticket.priority} priority
                  </span>
                  {ticket.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {ticket.category}
                    </span>
                  )}
                </div>

                {isHrinnoAdmin && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Messages */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col">
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Conversation</h3>
                <p className="text-sm text-gray-500">{messages.length} messages</p>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender_type === 'admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span className="text-xs font-medium opacity-75">{message.sender_name}</span>
                          <span className="text-xs opacity-60">{formatDate(message.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Attachments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col h-[600px]">
              <h3 className="font-semibold text-gray-900 mb-4">Attachments</h3>
              <div className="flex-1 overflow-y-auto space-y-3">
                {attachments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center mt-12">No attachments</p>
                ) : (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 truncate max-w-[120px]">{attachment.file_name}</span>
                          <span className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

     {/* Status Modal */}
{showStatusModal && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-80">
      <h3 className="font-semibold text-gray-900 mb-4">Update Ticket Status</h3>
      <div className="flex flex-col gap-2">
        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => updateTicketStatus(status)}
            disabled={updatingStatus}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusButtonColors[status as keyof typeof statusButtonColors]}`}
          >
            {updatingStatus ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              status.replace('_', ' ').toUpperCase()
            )}
          </button>
        ))}
      </div>
      <button
        onClick={() => setShowStatusModal(false)}
        disabled={updatingStatus}
        className="mt-4 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Clock,
  User,
  Building,
  ArrowUpCircle,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { useLocale } from '../../../../i18n/LocaleProvider';

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
  company?: {
    name: string;
    slug: string;
  } | null;
  ticket_messages?: { count: number }[];
  ticket_attachments?: { count: number }[];
  message_count: number;
  attachment_count: number;
}

interface UserData {
  id: string;
  email: string;
  user_firstname: string;
  user_lastname: string;
  company_to_users?: {
    company_id: string;
    company?: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

export default function TicketsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const companySlug = params.slug;
  const { t } = useLocale();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);

  const statusColors = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const fetchCurrentUser = useCallback(async () => {
    setIsHrinnoAdmin(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/jobs/${companySlug}/login`);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          company_to_users!inner(
            company!inner(id, slug, company_name)
          )
        `)
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        setError(t('ticketsPage.errors.userNotFound'));
        return;
      }
      
      setCurrentUser(userData);

      const userCompany = userData.company_to_users?.[0]?.company;
      setIsHrinnoAdmin(
        ['hrinno', 'innohr'].includes(userCompany?.slug ?? '')
      );
      
    } catch (_err) {
      setError(t('ticketsPage.errors.loadUserData'));
    }
  }, [companySlug, router, t]);

  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      let ticketsQuery = supabase
        .from('tickets')
        .select(`
          *,
          company:company_id(id,slug,name:company_name)
        `)
        .order('created_at', { ascending: false });
      
      if (!isHrinnoAdmin) {
        const userCompanyId = currentUser.company_to_users?.[0]?.company?.id;
        if (userCompanyId) {
          ticketsQuery = ticketsQuery.eq('company_id', userCompanyId);
        }
      }

      const { data: ticketsData, error: fetchError } = await ticketsQuery;

      if (fetchError) throw fetchError;

      if (!ticketsData || ticketsData.length === 0) {
        setTickets([]);
        return;
      }

      const ticketIds = ticketsData.map(t => t.id);
      
      const { data: messageCounts } = await supabase
        .from('ticket_messages')
        .select('ticket_id')
        .in('ticket_id', ticketIds);

      const { data: attachmentCounts } = await supabase
        .from('ticket_attachments')
        .select('ticket_id')
        .in('ticket_id', ticketIds);

      const messageCountMap: { [key: string]: number } = {};
      const attachmentCountMap: { [key: string]: number } = {};

      messageCounts?.forEach(msg => {
        messageCountMap[msg.ticket_id] = (messageCountMap[msg.ticket_id] || 0) + 1;
      });

      attachmentCounts?.forEach(att => {
        attachmentCountMap[att.ticket_id] = (attachmentCountMap[att.ticket_id] || 0) + 1;
      });

      const processedTickets: TicketData[] = ticketsData.map(ticket => ({
        ...ticket,
        message_count: messageCountMap[ticket.id] || 0,
        attachment_count: attachmentCountMap[ticket.id] || 0
      }));

      setTickets(processedTickets);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('ticketsPage.errors.fetchTickets'));
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, isHrinnoAdmin, t]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = !searchTerm || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser, fetchTickets]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) {
      return t('ticketsPage.time.minutesAgo', { count: Math.floor(diffInMinutes) });
    } else if (diffInMinutes < 1440) {
      return t('ticketsPage.time.hoursAgo', { count: Math.floor(diffInMinutes / 60) });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">{t('ticketsPage.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('ticketsPage.errorState.title')}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            {t('ticketsPage.errorState.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isHrinnoAdmin ? t('ticketsPage.header.titleAdmin') : t('ticketsPage.header.title')}
                </h1>
                <p className="text-gray-600">
                  {t('ticketsPage.header.count', { count: filteredTickets.length })}
                  {isHrinnoAdmin && ' ' + t('ticketsPage.header.acrossCompanies')}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/jobs/${companySlug}/tickets/create`)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('ticketsPage.header.newTicket')}</span>
              <span className="sm:hidden">{t('ticketsPage.header.new')}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('ticketsPage.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
                <div className="flex items-center gap-2 min-w-fit">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="all">{t('ticketsPage.filters.allStatus')}</option>
                    <option value="open">{t('ticketsPage.status.open')}</option>
                    <option value="in_progress">{t('ticketsPage.status.in_progress')}</option>
                    <option value="resolved">{t('ticketsPage.status.resolved')}</option>
                    <option value="closed">{t('ticketsPage.status.closed')}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 min-w-fit">
                  <ArrowUpCircle className="w-4 h-4 text-gray-500" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="all">{t('ticketsPage.filters.allPriority')}</option>
                    <option value="urgent">{t('ticketsPage.priority.urgent')}</option>
                    <option value="high">{t('ticketsPage.priority.high')}</option>
                    <option value="medium">{t('ticketsPage.priority.medium')}</option>
                    <option value="low">{t('ticketsPage.priority.low')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? t('ticketsPage.empty.noTicketsFound')
                : t('ticketsPage.empty.noTicketsYet')}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? t('ticketsPage.empty.tryAdjusting')
                : t('ticketsPage.empty.createFirst')}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={() => router.push(`/jobs/${companySlug}/tickets/create`)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                {t('ticketsPage.empty.createFirstButton')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('ticketsPage.table.ticket')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('ticketsPage.table.status')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('ticketsPage.table.priority')}
                      </th>
                      {isHrinnoAdmin && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {t('ticketsPage.table.company')}
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('ticketsPage.table.user')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('ticketsPage.table.created')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('ticketsPage.table.activity')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => router.push(`/jobs/${companySlug}/tickets/${ticket.id}`)}
                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {ticket.title}
                            </h4>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                            {t(`ticketsPage.status.${ticket.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                            {t(`ticketsPage.priority.${ticket.priority}`)}
                          </span>
                        </td>
                        {isHrinnoAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {ticket.company?.name || t('ticketsPage.common.unknown')}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ticket.user_name}</p>
                              <p className="text-xs text-gray-500">{ticket.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(ticket.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {ticket.message_count > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MessageSquare className="w-3 h-3" />
                                {ticket.message_count}
                              </div>
                            )}
                            {ticket.attachment_count > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Paperclip className="w-3 h-3" />
                                {ticket.attachment_count}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:hidden space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => router.push(`/jobs/${companySlug}/tickets/${ticket.id}`)}
                  className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {ticket.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="ml-3 flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[ticket.status]}`}>
                        {t(`ticketsPage.status.${ticket.status}`)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                        {t(`ticketsPage.priority.${ticket.priority}`)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="truncate">{ticket.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>

                  {isHrinnoAdmin && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{ticket.company?.name || t('ticketsPage.common.unknownCompany')}</span>
                    </div>
                  )}

                  {(ticket.message_count > 0 || ticket.attachment_count > 0) && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {ticket.message_count > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {t('ticketsPage.mobile.messages', { count: ticket.message_count })}
                        </div>
                      )}
                      {ticket.attachment_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {t('ticketsPage.mobile.files', { count: ticket.attachment_count })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
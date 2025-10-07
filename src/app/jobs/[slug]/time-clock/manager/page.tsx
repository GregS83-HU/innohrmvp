import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, Filter, Loader2 } from 'lucide-react';

interface ManagerDashboardProps {
  managerId: string;
  managerName: string;
}

interface TeamMember {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  todayStatus: 'clocked_in' | 'clocked_out' | 'not_started';
  todayEntry?: {
    id: number;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
    is_late: boolean;
  };
  weeklyHours: number;
}

interface PendingEntry {
  id: number;
  user_id: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  is_late: boolean;
  is_overtime: boolean;
  employee_notes: string | null;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function ManagerTimeClockDashboard({ managerId, managerName }: ManagerDashboardProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'pending'>('today');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, [managerId]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingEntries();
    }
  }, [activeTab]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeclock/manager?managerId=${managerId}&action=team-today`);
      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.teamMembers);
      }
    } catch (err) {
      console.error('Failed to fetch team data:', err);
      showError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEntries = async () => {
    try {
      const response = await fetch(`/api/timeclock/manager?managerId=${managerId}&action=pending-approvals`);
      const data = await response.json();

      if (data.success) {
        setPendingEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch pending entries:', err);
      showError('Failed to load pending entries');
    }
  };

  const handleApproval = async (entryId: number, status: 'approved' | 'rejected', notes?: string) => {
    try {
      setActionLoading(entryId);
      const response = await fetch('/api/timeclock/manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId,
          action: 'approve-entry',
          entryId,
          status,
          managerNotes: notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update entry');
      }

      showSuccess(`Entry ${status}!`);
      fetchPendingEntries();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Working
          </span>
        );
      case 'clocked_out':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            Finished
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            Not started
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Team Time Clock</h1>
                <p className="text-xs text-gray-600">{managerName}</p>
              </div>
            </div>

            {pendingEntries.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  {pendingEntries.length} pending approval{pendingEntries.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today's Status
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all relative ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending Approvals
              {pendingEntries.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingEntries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'today' ? (
          <>
            {/* Team Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Working Now</p>
                    <p className="text-3xl font-bold text-green-600">
                      {teamMembers.filter(m => m.todayStatus === 'clocked_in').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Finished Today</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {teamMembers.filter(m => m.todayStatus === 'clocked_out').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Not Started</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {teamMembers.filter(m => m.todayStatus === 'not_started').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Team Members</h3>
              </div>

              {teamMembers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No team members found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Employees will appear here once they're assigned to you as manager
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <div key={member.user_id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {member.first_name[0]}{member.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {member.first_name} {member.last_name}
                              </h4>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </div>

                          {member.todayEntry && (
                            <div className="ml-13 flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>In: {formatTime(member.todayEntry.clock_in)}</span>
                              </div>
                              {member.todayEntry.clock_out && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <span>Out: {formatTime(member.todayEntry.clock_out)}</span>
                                </div>
                              )}
                              {member.todayEntry.is_late && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                  Late
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">This Week</p>
                            <p className="text-lg font-bold text-gray-900">
                              {member.weeklyHours.toFixed(1)}h
                            </p>
                          </div>
                          {getStatusBadge(member.todayStatus)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Pending Approvals Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Time Entries Awaiting Approval</h3>
            </div>

            {pendingEntries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">All caught up!</p>
                <p className="text-gray-400 text-sm mt-2">
                  No time entries pending approval
                </p>
              </div>
            ) : (
              pendingEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {entry.user_profiles.first_name} {entry.user_profiles.last_name}
                        </h4>
                        {entry.is_late && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Late
                          </span>
                        )}
                        {entry.is_overtime && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Overtime
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(entry.clock_in)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(entry.clock_in)} - {formatTime(entry.clock_out)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {entry.total_hours.toFixed(2)}h
                        </span>
                      </div>

                      {entry.employee_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Employee Note:</p>
                          <p className="text-sm text-gray-700">{entry.employee_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(entry.id, 'rejected')}
                      disabled={actionLoading === entry.id}
                      className="flex-1 py-2 px-4 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === entry.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        'Reject'
                      )}
                    </button>
                    <button
                      onClick={() => handleApproval(entry.id, 'approved')}
                      disabled={actionLoading === entry.id}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === entry.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        'Approve'
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
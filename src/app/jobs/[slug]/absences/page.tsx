'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { User, createClient } from '@supabase/supabase-js';
import {
  Calendar,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  User as UserIcon,
  RefreshCw,
  Users,
  Bell,
  FileText
} from 'lucide-react';

// Types
interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  leave_type_name_hu: string;
  leave_type_color: string;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

interface LeaveRequest {
  id: string;
  leave_type_name: string;
  leave_type_name_hu: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface LeaveType {
  id: string;
  name: string;
  name_hu: string;
  color: string;
  is_paid: boolean;
  requires_medical_certificate: boolean;
  max_days_per_year?: number;
}

interface PendingApproval {
  id: string;
  employee_name: string;
  employee_email: string;
  leave_type_name: string;
  leave_type_name_hu: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AbsenceManagement: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview');

  // Request form state
  const [requestForm, setRequestForm] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch current user and check if manager
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUser(user);

      // Check if user is a manager (has direct reports)
      const { data: directReports } = await supabase
        .from('users')
        .select('id')
        .eq('manager_id', user.id)
        .limit(1);

      setIsManager((directReports?.length || 0) > 0);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }, []);

  // Fetch leave types
  const fetchLeaveTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setLeaveTypes(data || []);
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  }, []);

  // Fetch user leave overview
  const fetchLeaveOverview = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_leave_overview', {
          user_id_param: currentUser.id,
          year_param: new Date().getFullYear()
        });

      if (error) throw error;

      const overview = typeof data === 'string' ? JSON.parse(data) : data;
      setBalances(overview.balances || []);
      setRecentRequests(overview.recent_requests || []);
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}
  }, [currentUser]);

  // Fetch pending approvals for managers
  const fetchPendingApprovals = useCallback(async () => {
    if (!currentUser || !isManager) return;

    try {
      const { data, error } = await supabase
        .rpc('get_manager_pending_approvals', {
          manager_id_param: currentUser.id
        });

      if (error) throw error;

      const approvals = typeof data === 'string' ? JSON.parse(data) : data;
      setPendingApprovals(approvals || []);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    }
  }, [currentUser, isManager]);

  // Submit leave request
  const submitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSubmitLoading(true);

      // Get user's manager
      const { data: userData } = await supabase
        .from('users')
        .select('manager_id')
        .eq('id', currentUser.id)
        .single();

      // Calculate working days
      //const startDate = new Date(requestForm.start_date);
      //const endDate = new Date(requestForm.end_date);
      
      const { data: workingDays } = await supabase
        .rpc('calculate_working_days', {
          start_date: requestForm.start_date,
          end_date: requestForm.end_date
        });

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: currentUser.id,
          leave_type_id: requestForm.leave_type_id,
          start_date: requestForm.start_date,
          end_date: requestForm.end_date,
          total_days: workingDays,
          reason: requestForm.reason,
          manager_id: userData?.manager_id
        });

      if (error) throw error;

      // Reset form and close modal
      setRequestForm({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      setShowRequestModal(false);

      // Refresh data
      await fetchLeaveOverview();
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}
  };

  // Approve/reject leave request
  const handleRequestReview = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          reviewed_by: currentUser?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh data
      await fetchPendingApprovals();
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred');
  }
}
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200',
      approved: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
      rejected: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
      cancelled: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      cancelled: XCircle
    };

    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Effects
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  useEffect(() => {
    if (currentUser) {
      fetchLeaveOverview();
      if (isManager) {
        fetchPendingApprovals();
      }
    }
  }, [currentUser, isManager, fetchLeaveOverview, fetchPendingApprovals]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-center">Loading absence data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Absence Management
                </h1>
                <p className="text-gray-600">Manage your leave and time off</p>
              </div>
            </div>

            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Request Leave</span>
              <span className="sm:hidden">Request</span>
            </button>
          </div>

          {/* Tab Navigation for Managers */}
          {isManager && (
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  My Leave
                </button>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 relative ${
                    activeTab === 'approvals'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Team Approvals
                  {pendingApprovals.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingApprovals.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Leave Balances */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Leave Balances ({new Date().getFullYear()})
              </h2>
              
              {balances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No leave balances found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {balances.map((balance) => (
                    <div
                      key={balance.leave_type_id}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                      style={{ borderColor: balance.leave_type_color + '30' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: balance.leave_type_color }}
                        />
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {balance.leave_type_name_hu}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium">{balance.total_days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Used:</span>
                          <span className="font-medium text-red-600">{balance.used_days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pending:</span>
                          <span className="font-medium text-orange-600">{balance.pending_days} days</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-bold text-green-600">{balance.remaining_days} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Recent Requests
                </h2>
                <button
                  onClick={fetchLeaveOverview}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {recentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No leave requests yet</p>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Request Your First Leave
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: request.leave_type_color }}
                            />
                            <h3 className="font-semibold text-gray-900">
                              {request.leave_type_name_hu}
                            </h3>
                            <StatusBadge status={request.status} />
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Period:</span>{' '}
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </p>
                            <p>
                              <span className="font-medium">Duration:</span>{' '}
                              {request.total_days} day{request.total_days !== 1 ? 's' : ''}
                            </p>
                            {request.reason && (
                              <p>
                                <span className="font-medium">Reason:</span> {request.reason}
                              </p>
                            )}
                            {request.review_notes && (
                              <p>
                                <span className="font-medium">Manager Notes:</span> {request.review_notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Requested: {formatDate(request.created_at)}
                          {request.reviewed_at && (
                            <>
                              <br />
                              Reviewed: {formatDate(request.reviewed_at)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Manager Approvals Tab */
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Pending Approvals
              </h2>
              <button
                onClick={fetchPendingApprovals}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: approval.leave_type_color }}
                          />
                          <h3 className="font-semibold text-gray-900">
                            {approval.employee_name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({approval.leave_type_name_hu})
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Period:</span>{' '}
                            {formatDate(approval.start_date)} - {formatDate(approval.end_date)}
                          </p>
                          <p>
                            <span className="font-medium">Duration:</span>{' '}
                            {approval.total_days} day{approval.total_days !== 1 ? 's' : ''}
                          </p>
                          {approval.reason && (
                            <p>
                              <span className="font-medium">Reason:</span> {approval.reason}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Requested: {formatDate(approval.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const notes = prompt('Optional notes for approval:');
                            handleRequestReview(approval.id, 'approved', notes || undefined);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Reason for rejection (required):');
                            if (notes?.trim()) {
                              handleRequestReview(approval.id, 'rejected', notes);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Request Leave</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={submitLeaveRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={requestForm.leave_type_id}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, leave_type_id: e.target.value }))}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name_hu} ({type.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={requestForm.start_date}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={requestForm.end_date}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    min={requestForm.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your leave request..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenceManagement;
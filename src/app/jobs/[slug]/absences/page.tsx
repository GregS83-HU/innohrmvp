// File: app/absence-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { User } from '@supabase/supabase-js';
import {
  Calendar,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Users,
  Bell
} from 'lucide-react';

import { supabase } from '../../../../../lib/supabaseClient';
import { LeaveBalance, LeaveRequest, LeaveType, PendingApproval } from '../../../../../types/absence';
import { formatDate as utilFormatDate } from '../../../../../utils/formatDate';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'i18n/LocaleProvider';

import CertificateUploadModal from '../../../../../components/CertificateUploadModal';
import { CertificateStatusBadge } from '../../../../../components/CertificateStatusBadge';

import StatusBadge from '../../../../../components/absence/StatusBadge';
import LeaveBalances from '../../../../../components/absence/LeaveBalances';
import RecentRequests from '../../../../../components/absence/RecentRequests';
import PendingApprovals from '../../../../../components/absence/PendingApprovals';
import RequestLeaveModal from '../../../../../components/absence/RequestLeaveModal2';

// Type for certificate data (matching what CertificateUploadModal returns)
interface CertificateData {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  comment?: string;
  certificate_file: string;
  medical_certificate_id: number;
}

// Type for company data from database
interface CompanyToUser {
  company_id: string;
}

// Type for insert data
interface LeaveRequestInsertData {
  user_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  manager_id?: string;
  medical_certificate_id?: number;
}

const AbsenceManagement: React.FC = () => {
  const { t } = useLocale();
  
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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const router = useRouter();

  // Certificate upload states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedLeaveRequestId, setSelectedLeaveRequestId] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [uploadMode, setUploadMode] = useState<'new' | 'existing'>('new');

  // Extract CompanySlug:
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

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

      // Fetch company_id from company_to_users
      const { data: companyData } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (companyData) {
        const typedCompanyData = companyData as CompanyToUser;
        setCompanyId(typedCompanyData.company_id);
      }

      // Check if user is a manager (has direct reports)
      const { data: directReports } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('manager_id', user.id)
        .limit(1);

      console.log("DirectReport from DB:", directReports?.length);

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
        setError(t('absenceManagement.messages.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, t]);

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

  // Check if leave type is sick leave
  const isSickLeaveType = useCallback(
    (leaveTypeId: string): boolean => {
      return leaveTypes.find(t => t.id === leaveTypeId)?.requires_medical_certificate ?? false;
    },
    [leaveTypes]
  );

  // Handle certificate upload success
  const handleCertificateSuccess = async (data: CertificateData) => {
    setCertificateData(data);

    if (uploadMode === 'existing' && selectedLeaveRequestId) {
      // Certificate added to existing request - link it
      try {
        const { error } = await supabase
          .from('leave_requests')
          .update({ medical_certificate_id: data.medical_certificate_id })
          .eq('id', selectedLeaveRequestId);

        if (error) throw error;

        await fetchLeaveOverview();
        alert(t('absenceManagement.messages.certificateLinked'));
      } catch (err) {
        console.error('Error linking certificate:', err);
        alert(t('absenceManagement.messages.certificateLinkFailed'));
      }
    } else {
      // New request - pre-fill form
      setRequestForm(prev => ({
        ...prev,
        start_date: data.sickness_start_date,
        end_date: data.sickness_end_date,
        reason: data.comment || '',
        // Set to Medical Certificate type if exists
        leave_type_id: leaveTypes.find(t => t.name === 'Sick Leave (Medical Certificate)')?.id || ''
      }));
      setShowRequestModal(true);
    }

    setShowCertificateModal(false);
    setSelectedLeaveRequestId(null);
  };

  // Open certificate modal for existing request
  const handleUploadCertificateForRequest = (requestId: string) => {
    setSelectedLeaveRequestId(requestId);
    setUploadMode('existing');
    setShowCertificateModal(true);
  };

  // Open certificate modal for new request
  const handleCreateWithCertificate = () => {
    setSelectedLeaveRequestId(null);
    setUploadMode('new');
    setShowCertificateModal(true);
  };

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
      const { data: workingDays } = await supabase
        .rpc('calculate_working_days', {
          start_date: requestForm.start_date,
          end_date: requestForm.end_date
        });

      const insertData: LeaveRequestInsertData = {
        user_id: currentUser.id,
        leave_type_id: requestForm.leave_type_id,
        start_date: requestForm.start_date,
        end_date: requestForm.end_date,
        total_days: workingDays as number,
        reason: requestForm.reason,
        manager_id: userData?.manager_id
        // Certificate ID will be added in the modal's handleSubmitWithNotification
      };

      const { error } = await supabase
        .from('leave_requests')
        .insert(insertData);

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
        setError(t('absenceManagement.messages.unexpectedError'));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Approve/reject leave request
  const handleRequestReview = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      console.log("user_id before update", currentUser?.id);
      console.log("status before update", status);
      console.log("notes before update", notes);
      console.log("requestI before update", requestId);

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
        setError(t('absenceManagement.messages.unexpectedError'));
      }
    }
  };

  // Format date wrapper (use util)
  const formatDate = (d: string) => utilFormatDate(d);

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
          <p className="text-gray-600 text-center">{t('absenceManagement.loading.message')}</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('absenceManagement.error.title')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('absenceManagement.error.tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return null;
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
                  {t('absenceManagement.header.title')}
                </h1>
                <p className="text-gray-600">{t('absenceManagement.header.subtitle')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('absenceManagement.header.requestLeave')}</span>
                <span className="sm:hidden">{t('absenceManagement.header.requestShort')}</span>
              </button>

              {/* Calendar View Button - Hidden on Mobile */}
              <button
                onClick={() => router.push(`/jobs/${companySlug}/absences/calendar`)}
                className="hidden md:flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                {t('absenceManagement.header.calendarView')}
              </button>
            </div>
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
                  <Users className="w-4 h-4 inline mr-2" />
                  {t('absenceManagement.tabs.myLeave')}
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
                  {t('absenceManagement.tabs.teamApprovals')}
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
            <LeaveBalances balances={balances} />

            <RecentRequests
              requests={recentRequests}
              onRefresh={fetchLeaveOverview}
              onOpenRequestModal={() => setShowRequestModal(true)}
              onUploadCertificateForRequest={handleUploadCertificateForRequest}
              isSickLeaveType={isSickLeaveType}
              formatDate={formatDate}
            />
          </div>
        ) : (
          <PendingApprovals
            approvals={pendingApprovals}
            onRefresh={fetchPendingApprovals}
            onReview={handleRequestReview}
            formatDate={formatDate}
            currentUserId={currentUser.id}
          />
        )}
      </div>

      {/* Request Leave Modal */}
      <RequestLeaveModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        requestForm={requestForm}
        setRequestForm={setRequestForm}
        leaveTypes={leaveTypes}
        onSubmit={submitLeaveRequest}
        loading={submitLoading}
        currentUserId={currentUser.id}
        companyId={companyId || ''}
        currentUserName={`${currentUser?.user_metadata?.first_name || ''} ${currentUser?.user_metadata?.last_name || ''}`.trim() || currentUser?.email || ''}
      />

      {/* Certificate Upload Modal */}
      {showCertificateModal && companyId && (
        <CertificateUploadModal
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false);
            setSelectedLeaveRequestId(null);
          }}
          onSuccess={handleCertificateSuccess}
          companyId={companyId}
          existingLeaveRequestId={selectedLeaveRequestId || undefined}
          prefilledData={{
            employee_name: `${currentUser?.user_metadata?.first_name || ''} ${currentUser?.user_metadata?.last_name || ''}`.trim() || currentUser?.email || ''
          }}
        />
      )}
    </div>
  );
};

export default AbsenceManagement;
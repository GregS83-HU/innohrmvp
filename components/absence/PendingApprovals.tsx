// File: components/absence/PendingApprovals.tsx
import React, { useState } from 'react';
import { Bell, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { PendingApproval } from '../../types/absence';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';
import { createLeaveReviewNotification, getUserName } from '../../utils/absenceNotifications';
import { createClient } from '@supabase/supabase-js';
import ApprovalModal from './ApprovalModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  approvals: PendingApproval[];
  onRefresh: () => void;
  onReview: (requestId: string, status: 'approved' | 'rejected', notes?: string) => Promise<void> | void;
  formatDate?: (d: string) => string;
  currentUserId: string;
};

const PendingApprovals: React.FC<Props> = ({
  approvals,
  onRefresh,
  onReview,
  formatDate = defaultFormatDate,
  currentUserId
}) => {
  // Modal state - THIS IS NEW
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    approval: PendingApproval | null;
  }>({
    isOpen: false,
    type: null,
    approval: null
  });
  
  // Generate public URL for certificate
  const getCertificateUrl = (certificateFile: string | null | undefined): string | null => {
    if (!certificateFile) return null;
    
    const { data } = supabase.storage
      .from('medical-certificates')
      .getPublicUrl(certificateFile);
    
    return data.publicUrl;
  };

  const handleReviewWithNotification = async (
    approval: PendingApproval,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      console.log('🔍 Full approval object:', approval);
      console.log('🔍 approval.user_id:', approval.user_id);
      console.log('🔍 approval.id:', approval.id);
      console.log('🔍 currentUserId (manager):', currentUserId);

      // First, perform the actual review action
      await onReview(approval.id, status, notes);
      console.log('✅ Review action completed');
      
      // Then send the notification to the employee
      const { name: managerName, error: nameError } = await getUserName(currentUserId);
      console.log('👤 Manager name retrieved:', managerName, 'Error:', nameError);
      
      const notificationData = {
        leaveRequestId: approval.id,
        userId: approval.user_id,
        managerId: currentUserId,
        managerName,
        leaveTypeName: approval.leave_type_name_hu || approval.leave_type_name,
        status,
        reviewNotes: notes
      };
      console.log('📧 Sending notification with data:', notificationData);
      
      const result = await createLeaveReviewNotification(notificationData);
      console.log('📬 Notification result:', result);
      
      if (result.success) {
        console.log(`✅ ${status} notification sent to employee (userId: ${approval.user_id})`);
      } else {
        console.error('❌ Notification failed:', result.error);
      }
    } catch (error) {
      console.error('Error in review with notification:', error);
      // The review itself might have succeeded, so we don't re-throw
    }
  };

  // UPDATED - now opens modal instead of using prompt()
  const handleApprove = (approval: PendingApproval) => {
    setModalState({
      isOpen: true,
      type: 'approve',
      approval
    });
  };

  // UPDATED - now opens modal instead of using prompt()
  const handleReject = (approval: PendingApproval) => {
    setModalState({
      isOpen: true,
      type: 'reject',
      approval
    });
  };

  // NEW - Close modal function
  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      approval: null
    });
  };

  // NEW - Handle modal confirmation
  const handleModalConfirm = (notes?: string) => {
    if (!modalState.approval) return;
    
    const status = modalState.type === 'reject' ? 'rejected' : 'approved';
    handleReviewWithNotification(modalState.approval, status, notes);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Pending Approvals
          </h2>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => {
              const certificateUrl = getCertificateUrl(approval.certificate_file);
              
              return (
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
                        {certificateUrl && (
                          <a
                            href={certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 rounded-lg transition-colors text-xs font-medium"
                            title="View medical certificate"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Certificate</span>
                          </a>
                        )}
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
                        onClick={() => handleApprove(approval)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW - Modal component */}
      <ApprovalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        type={modalState.type}
        approval={modalState.approval}
      />
    </>
  );
};

export default PendingApprovals;
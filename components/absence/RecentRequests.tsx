// File: components/absence/RecentRequests.tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { RefreshCw, Calendar, FileText, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { LeaveRequest } from '../../types/absence';
import { CertificateStatusBadge } from './../CertificateStatusBadge';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';
import { createClient } from '@supabase/supabase-js';
import { getUserManager, getUserName } from '../../utils/absenceNotifications';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  requests: LeaveRequest[];
  onRefresh: () => void | Promise<void>; // Update to allow both sync and async
  onOpenRequestModal: () => void;
  onUploadCertificateForRequest: (id: string) => void;
  isSickLeaveType: (leaveTypeId: string) => boolean;
  formatDate?: (d: string) => string;
  currentUserId: string; // Add this prop
};

const RecentRequests: React.FC<Props> = ({
  requests,
  onRefresh,
  onOpenRequestModal,
  onUploadCertificateForRequest,
  isSickLeaveType,
  formatDate = defaultFormatDate,
  currentUserId // Add this
}) => {
  const { t } = useLocale();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // Debug log
  console.log('RecentRequests - currentUserId received:', currentUserId, typeof currentUserId);

  // Check if request can be cancelled
  const canCancelRequest = (request: LeaveRequest): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(request.start_date);
    startDate.setHours(0, 0, 0, 0);

    // Can cancel if: (pending OR approved) AND start date is in the future
    const isNotStarted = startDate > today;
    const isCancellableStatus = request.status === 'pending' || request.status === 'approved';
    
    return isNotStarted && isCancellableStatus;
  };

  // Handle cancel request
  const handleCancelRequest = async (request: LeaveRequest, currentUserId: string) => {
    setCancellingId(request.id);
    
    try {
      // Validate currentUserId
      if (!currentUserId || currentUserId === 'undefined') {
        console.error('Invalid currentUserId:', currentUserId);
        alert('Unable to cancel: User ID not found. Please refresh the page.');
        setCancellingId(null);
        return;
      }

      console.log('Cancelling request for user:', currentUserId);

      // Get manager info for notification
      const { managerId } = await getUserManager(currentUserId);
      
      if (!managerId) {
        console.warn('No manager found for user');
      }

      // Get user name
      const { name: userName } = await getUserName(currentUserId);

      // Calculate total days
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Format dates for notification
      const formattedStartDate = formatDate(request.start_date);
      const formattedEndDate = formatDate(request.end_date);

      console.log('Attempting to delete request with ID:', request.id);

      // First, delete any notifications related to this leave request
      console.log('Deleting related notifications...');
      const { error: notificationDeleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('leave_request_id', request.id);

      if (notificationDeleteError) {
        console.error('Error deleting related notifications:', notificationDeleteError);
        // Continue anyway - we'll try to delete the request
      } else {
        console.log('Related notifications deleted successfully');
      }

      // Then delete the request from database
      const { error: deleteError, data: deleteData } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', request.id);

      console.log('Delete result:', { deleteError, deleteData });

      if (deleteError) throw deleteError;

      console.log('Request deleted successfully');

      // Send notification to manager if exists
      // Send notification to manager if exists (after deletion, so don't reference the deleted request)
      if (managerId) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'leave_request_cancelled',
            title: 'Leave Request Cancelled',
            message: `${userName} has cancelled their ${request.leave_type_name_hu || request.leave_type_name || 'leave'} request from ${formattedStartDate} to ${formattedEndDate} (${totalDays} day${totalDays !== 1 ? 's' : ''})`,
            // Don't include leave_request_id since the request was deleted
            sender_id: currentUserId,
            recipient_id: managerId,
            read: false,
            created_at: new Date().toISOString()
          });

        if (notificationError) {
          console.error('Error creating cancellation notification:', notificationError);
        } else {
          console.log('Cancellation notification sent to manager');
        }
      }

      // Refresh the list
      onRefresh();
      setShowCancelConfirm(null);
      
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(t('recentRequests.messages.cancelFailed') || 'Failed to cancel request. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('recentRequests.title')}
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('recentRequests.empty.noRequests')}</p>
          <button
            onClick={onOpenRequestModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('recentRequests.empty.firstLeaveButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const showCancelButton = canCancelRequest(request);
            const isShowingConfirm = showCancelConfirm === request.id;
            const isCancelling = cancellingId === request.id;

            return (
              <div
                key={request.id}
                className="border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: request.leave_type_color }}
                        />
                        <h3 className="font-semibold text-gray-900">
                          {request.leave_type_name_hu}
                        </h3>
                        <div className="ml-2">
                          <StatusBadge status={request.status} />
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">{t('recentRequests.fields.period')}</span>{' '}
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </p>
                        <p>
                          <span className="font-medium">{t('recentRequests.fields.duration')}</span>{' '}
                          {request.total_days} {request.total_days !== 1 
                            ? t('recentRequests.fields.days') 
                            : t('recentRequests.fields.day')}
                        </p>
                        {request.reason && (
                          <p>
                            <span className="font-medium">{t('recentRequests.fields.reason')}</span> {request.reason}
                          </p>
                        )}
                        {request.review_notes && (
                          <p>
                            <span className="font-medium">{t('recentRequests.fields.managerNotes')}</span> {request.review_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500 text-right">
                        {t('recentRequests.fields.requested')} {formatDate(request.created_at)}
                        {request.reviewed_at && (
                          <>
                            <br />
                            {t('recentRequests.fields.reviewed')} {formatDate(request.reviewed_at)}
                          </>
                        )}
                      </div>

                      {/* Cancel button or confirmation */}
                      {showCancelButton && (
                        <div className="flex-shrink-0">
                          {!isShowingConfirm ? (
                            <button
                              onClick={() => setShowCancelConfirm(request.id)}
                              disabled={isCancelling}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              {t('recentRequests.buttons.cancel')}
                            </button>
                          ) : (
                            <div className="bg-white rounded-lg border-2 border-red-200 p-3 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <p className="text-sm font-semibold text-gray-900">
                                  {t('recentRequests.buttons.confirmCancel')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCancelRequest(request, currentUserId)}
                                  disabled={isCancelling}
                                  className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  {isCancelling ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      {t('recentRequests.buttons.cancelling')}
                                    </>
                                  ) : (
                                    t('recentRequests.buttons.confirmYes')
                                  )}
                                </button>
                                <button
                                  onClick={() => setShowCancelConfirm(null)}
                                  disabled={isCancelling}
                                  className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {t('recentRequests.buttons.confirmNo')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate Status Badge & Upload button */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <CertificateStatusBadge
                      hasCertificate={!!request.medical_certificate_id}
                      certificateTreated={false}
                      isHrValidated={request.hr_validated}
                      isMedicalConfirmed={request.is_medical_confirmed}
                    />

                    {isSickLeaveType(request.leave_type_id) &&
                      !request.medical_certificate_id &&
                      request.status === 'pending' && (
                        <button
                          onClick={() => onUploadCertificateForRequest(request.id)}
                          className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                        >
                          {t('recentRequests.buttons.uploadCertificate')}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentRequests;
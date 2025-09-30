// File: components/absence/RequestLeaveModal.tsx
import React from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { LeaveType } from '../../types/absence';
import { createLeaveRequestNotification, getUserManager, getUserName } from '../../utils/absenceNotifications';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RequestForm = {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  requestForm: RequestForm;
  setRequestForm: React.Dispatch<React.SetStateAction<RequestForm>>;
  leaveTypes: LeaveType[];
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  loading: boolean;
  currentUserId: string;
};

const RequestLeaveModal: React.FC<Props> = ({
  isOpen,
  onClose,
  requestForm,
  setRequestForm,
  leaveTypes,
  onSubmit,
  loading,
  currentUserId
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmitWithNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the original onSubmit handler first
    await onSubmit(e);
    
    // After successful submission, create notification
    try {
      // Get the manager ID
      const { managerId } = await getUserManager(currentUserId);
      
      if (!managerId) {
        console.warn('No manager found for user, skipping notification');
        return;
      }

      // Get user name
      const { name: userName } = await getUserName(currentUserId);

      // Get leave type name
      const selectedLeaveType = leaveTypes.find(lt => lt.id === requestForm.leave_type_id);
      const leaveTypeName = selectedLeaveType?.name_hu || selectedLeaveType?.name || 'Leave';

      // Calculate total days
      const startDate = new Date(requestForm.start_date);
      const endDate = new Date(requestForm.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Get the newly created leave request ID
      // We need to query for it since we don't have it from onSubmit
      const { data: leaveRequest } = await supabase
        .from('leave_requests')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('start_date', requestForm.start_date)
        .eq('end_date', requestForm.end_date)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!leaveRequest) {
        console.error('Could not find created leave request');
        return;
      }

      // Create the notification
      await createLeaveRequestNotification({
        leaveRequestId: leaveRequest.id,
        userId: currentUserId,
        userName,
        managerId,
        leaveTypeName,
        startDate: requestForm.start_date,
        endDate: requestForm.end_date,
        totalDays
      });

      console.log('✅ Leave request notification sent to manager');
    } catch (error) {
      console.error('Error sending leave request notification:', error);
      // Don't throw - notification failure shouldn't block the request
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Request Leave</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitWithNotification} className="space-y-4">
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
                min={today}
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
                min={requestForm.start_date || today}
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
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
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
  );
};

export default RequestLeaveModal;
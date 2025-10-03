// components/CalendarLeaveModal.tsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Loader2, CheckCircle, Upload } from 'lucide-react';
import CertificateUploadModal from '../../CertificateUploadModal';
import { createLeaveRequestNotification } from '../../../utils/absenceNotifications';

// --- Types ---
interface LeaveType {
  id: string;
  name: string;
  name_hu?: string;
}

interface UserProfile {
  manager_id: string | null;
}

interface CurrentUser {
  id: string;
  email?: string;
  user_firstname?: string;
  user_lastname?: string;
}

interface CertificateData {
  medical_certificate_id: number; // ✅ number, matches Supabase
  sickness_start_date: string;
  sickness_end_date: string;
  comment?: string;
}

interface CalendarLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  currentUser: CurrentUser;
  prefilledDates: { start: Date; end: Date };
}

// --- Helpers ---
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CalendarLeaveModal: React.FC<CalendarLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  currentUser,
  prefilledDates
}) => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: formatDateForInput(prefilledDates.start),
    end_date: formatDateForInput(prefilledDates.end),
    reason: ''
  });

  // Update form dates when prefilledDates changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      start_date: formatDateForInput(prefilledDates.start),
      end_date: formatDateForInput(prefilledDates.end)
    }));
  }, [prefilledDates]);

  // Fetch leave types when modal opens
  useEffect(() => {
    const fetchLeaveTypes = async () => {
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
    };
    if (isOpen) fetchLeaveTypes();
  }, [isOpen]);

  const isSickLeaveType = (leaveTypeId: string) => {
    const type = leaveTypes.find(t => t.id === leaveTypeId);
    return type?.name.includes('Sick Leave') ?? false;
  };

  const handleCertificateSuccess = (data: CertificateData) => {
    setCertificateData(data);
    setShowCertificateModal(false);
    const medicalCertType = leaveTypes.find(t => t.name === 'Sick Leave (Medical Certificate)');
    setFormData(prev => ({
      ...prev,
      leave_type_id: medicalCertType?.id || prev.leave_type_id,
      start_date: data.sickness_start_date,
      end_date: data.sickness_end_date,
      reason: data.comment || prev.reason
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leave_type_id) {
      alert('Please select a leave type');
      return;
    }

    try {
      setLoading(true);

      // Fetch manager_id
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('manager_id')
        .eq('user_id', currentUser.id)
        .single<UserProfile>();

      // Calculate working days
      const { data: workingDays } = await supabase.rpc('calculate_working_days', {
        start_date: formData.start_date,
        end_date: formData.end_date
      });

      // Build insert payload
      const insertData: Record<string, unknown> = {
        user_id: currentUser.id,
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: workingDays,
        reason: formData.reason,
        manager_id: userProfile?.manager_id
      };

      if (certificateData) {
        insertData.is_medical_confirmed = true;
        insertData.medical_certificate_id = certificateData.medical_certificate_id;
      }

      // Insert leave request
      const { data: newLeaveRequest, error } = await supabase
        .from('leave_requests')
        .insert(insertData)
        .select('id')
        .single<{ id: string }>();

      if (error) throw error;

      // Send notification
      if (userProfile?.manager_id && newLeaveRequest) {
        try {
          const userName =
            currentUser?.user_firstname && currentUser?.user_lastname
              ? `${currentUser.user_firstname} ${currentUser.user_lastname}`.trim()
              : currentUser?.email || 'Unknown User';

          const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leave_type_id);
          const leaveTypeName = selectedLeaveType?.name_hu || selectedLeaveType?.name || 'Leave';

          await createLeaveRequestNotification({
            leaveRequestId: newLeaveRequest.id,
            userId: currentUser.id,
            userName,
            managerId: userProfile.manager_id,
            leaveTypeName,
            startDate: formData.start_date,
            endDate: formData.end_date,
            totalDays: workingDays
          });

          console.log('Leave request notification sent to manager');
        } catch (notificationError) {
          console.error('Error sending leave request notification:', notificationError);
        }
      } else {
        console.warn('No manager found for user, skipping notification');
      }

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert('Error submitting request: ' + message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Leave Request</h2>
              <p className="text-sm text-gray-600">
                {prefilledDates.start.toLocaleDateString('hu-HU')} -{' '}
                {prefilledDates.end.toLocaleDateString('hu-HU')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select
                value={formData.leave_type_id}
                onChange={e => setFormData({ ...formData, leave_type_id: e.target.value })}
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select leave type</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name_hu} ({type.name})
                  </option>
                ))}
              </select>
            </div>

            {isSickLeaveType(formData.leave_type_id) && !certificateData && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 mb-3">
                  For sick leave, you can upload a medical certificate
                </p>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Certificate
                </button>
              </div>
            )}

            {certificateData && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Medical certificate uploaded</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  min={formData.start_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
              <textarea
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder="Brief description..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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

      {showCertificateModal && (
        <CertificateUploadModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          onSuccess={handleCertificateSuccess}
          companyId={companyId}
          prefilledData={{
            employee_name:
              currentUser?.user_firstname && currentUser?.user_lastname
                ? `${currentUser.user_firstname} ${currentUser.user_lastname}`.trim()
                : currentUser?.email || ''
          }}
        />
      )}
    </>
  );
};

export default CalendarLeaveModal;

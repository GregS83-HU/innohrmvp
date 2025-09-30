// File: components/absence/RequestLeaveModal.tsx
import React from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { LeaveType } from '../../types/absence';

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
};

const RequestLeaveModal: React.FC<Props> = ({
  isOpen,
  onClose,
  requestForm,
  setRequestForm,
  leaveTypes,
  onSubmit,
  loading
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

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

        <form onSubmit={onSubmit} className="space-y-4">
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

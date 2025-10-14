// File: components/absence/ApprovalModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PendingApproval } from '../../types/absence';

type ApprovalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  type: 'approve' | 'reject' | null;
  approval: PendingApproval | null;
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  approval
}) => {
  const [notes, setNotes] = useState('');
  const isReject = type === 'reject';

  if (!isOpen || !approval) return null;

  const handleSubmit = () => {
    if (isReject && !notes.trim()) {
      return;
    }
    onConfirm(notes || undefined);
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      
      <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isReject ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <h3 className={`text-xl font-bold ${
              isReject ? 'text-red-900' : 'text-green-900'
            }`}>
              {isReject ? 'Reject Request' : 'Approve Request'}
            </h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Employee</p>
              <p className="font-semibold text-gray-900">{approval.employee_name}</p>
              <p className="text-sm text-gray-600 mt-2">Leave Type</p>
              <p className="font-medium text-gray-800">{approval.leave_type_name_hu}</p>
              <p className="text-sm text-gray-600 mt-2">Duration</p>
              <p className="font-medium text-gray-800">{approval.total_days} day(s)</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isReject ? 'Reason for rejection (required)' : 'Notes (optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder={isReject ? 'Please explain why this request is being rejected...' : 'Add any additional notes...'}
              />
              {isReject && !notes.trim() && (
                <p className="text-xs text-red-600 mt-1">Rejection reason is required</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isReject && !notes.trim()}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                  isReject && !notes.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isReject
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isReject ? 'Reject Request' : 'Approve Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalModal;
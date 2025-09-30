// File: components/absence/PendingApprovals.tsx
import React from 'react';
import { Bell, RefreshCw, CheckCircle } from 'lucide-react';
import { PendingApproval } from '../../types/absence';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';

type Props = {
  approvals: PendingApproval[];
  onRefresh: () => void;
  onReview: (requestId: string, status: 'approved' | 'rejected', notes?: string) => Promise<void> | void;
  formatDate?: (d: string) => string;
};

const PendingApprovals: React.FC<Props> = ({
  approvals,
  onRefresh,
  onReview,
  formatDate = defaultFormatDate
}) => {
  return (
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
          {approvals.map((approval) => (
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
                      onReview(approval.id, 'approved', notes || undefined);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Reason for rejection (required):');
                      if (notes?.trim()) {
                        onReview(approval.id, 'rejected', notes);
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
  );
};

export default PendingApprovals;

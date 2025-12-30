// components/payroll/PeriodStatusWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import PeriodClosureModal from './PeriodClosureModal';

interface PeriodStatusWidgetProps {
  countryCode: string;
  year: number;
  month: number;
  currentUserId: string;
  lastExportId?: string;
  onStatusChange?: () => void;
}

interface PeriodStatus {
  status: 'open' | 'closed' | 'reopened';
  closed_at?: string;
  closed_by?: string;
  closed_by_name?: string;
  closed_reason?: string;
  reopened_at?: string;
  reopened_by?: string;
  reopened_by_name?: string;
  reopen_reason?: string;
}

export default function PeriodStatusWidget({
  countryCode,
  year,
  month,
  currentUserId,
  lastExportId,
  onStatusChange,
}: PeriodStatusWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PeriodStatus | null>(null);
  const [showModal, setShowModal] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/payroll/periods/status?current_user_id=${currentUserId}&country_code=${countryCode}&year=${year}&month=${month}`
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching period status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [countryCode, year, month, currentUserId]);

  const handleSuccess = () => {
    fetchStatus();
    if (onStatusChange) {
      onStatusChange();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const currentStatus = status?.status || 'open';
  const isClosed = currentStatus === 'closed';
  const isReopened = currentStatus === 'reopened';

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`p-4 ${
          isClosed 
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100'
            : isReopened
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isClosed
                  ? 'bg-gradient-to-br from-red-500 to-pink-500'
                  : isReopened
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-500'
              }`}>
                {isClosed ? (
                  <Lock className="w-5 h-5 text-white" />
                ) : isReopened ? (
                  <Unlock className="w-5 h-5 text-white" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {monthName} {year}
                </h3>
                <p className="text-sm text-gray-600">Period Status</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isClosed
                ? 'bg-red-100 text-red-800 border border-red-200'
                : isReopened
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {isClosed ? '🔒 CLOSED' : isReopened ? '🔓 REOPENED' : '✓ OPEN'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status Information */}
          {isClosed && status?.closed_at && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Closed</p>
                  <p className="text-xs text-gray-600">
                    {new Date(status.closed_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {status.closed_by_name && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-600">
                    by <strong className="text-gray-900">{status.closed_by_name}</strong>
                  </span>
                </div>
              )}
              {status.closed_reason && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    "{status.closed_reason}"
                  </p>
                </div>
              )}
            </div>
          )}

          {isReopened && status?.reopened_at && (
            <div className="bg-yellow-50 rounded-lg p-4 space-y-2 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Reopened for Corrections</p>
                  <p className="text-xs text-yellow-700">
                    {new Date(status.reopened_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {status.reopened_by_name && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-yellow-800">
                    by <strong className="text-yellow-900">{status.reopened_by_name}</strong>
                  </span>
                </div>
              )}
              {status.reopen_reason && (
                <div className="pt-2 border-t border-yellow-200">
                  <p className="text-xs text-yellow-700 italic">
                    "{status.reopen_reason}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              {isClosed ? (
                <>
                  This period is locked. No payroll changes or exports allowed.
                  You can reopen it if corrections are needed.
                </>
              ) : isReopened ? (
                <>
                  This period was reopened for corrections. Remember to close it again
                  after making changes.
                </>
              ) : (
                <>
                  This period is open. You can edit payroll data and create exports.
                  Close it when the month is finalized.
                </>
              )}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowModal(true)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isClosed
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
            }`}
          >
            {isClosed ? (
              <>
                <Unlock className="w-4 h-4" />
                Reopen This Period
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Close This Period
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      <PeriodClosureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        countryCode={countryCode}
        year={year}
        month={month}
        currentStatus={currentStatus}
        currentUserId={currentUserId}
        lastExportId={lastExportId}
      />
    </>
  );
}
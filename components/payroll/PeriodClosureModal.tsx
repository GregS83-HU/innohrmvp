// components/payroll/PeriodClosureModal.tsx
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

interface PeriodClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  countryCode: string;
  year: number;
  month: number;
  currentStatus: 'open' | 'closed' | 'reopened';
  currentUserId: string;
  lastExportId?: string;
}

export default function PeriodClosureModal({
  isOpen,
  onClose,
  onSuccess,
  countryCode,
  year,
  month,
  currentStatus,
  currentUserId,
  lastExportId,
}: PeriodClosureModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const isClosing = currentStatus !== 'closed';
  const isReopening = currentStatus === 'closed';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isReopening) {
        // Validate reopen reason
        if (reason.trim().length < 10) {
          setError('Reopen reason must be at least 10 characters');
          setLoading(false);
          return;
        }

        // Reopen the period
        const response = await fetch('/api/payroll/periods/close', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country_code: countryCode,
            year,
            month,
            reopened_by: currentUserId,
            reopen_reason: reason,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reopen period');
        }
      } else {
        // Close the period
        const response = await fetch('/api/payroll/periods/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country_code: countryCode,
            year,
            month,
            closed_by: currentUserId,
            closed_reason: reason || `${monthName} ${year} payroll finalized`,
            last_export_id: lastExportId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to close period');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isReopening 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : 'bg-gradient-to-br from-red-500 to-pink-500'
            }`}>
              {isReopening ? (
                <Unlock className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isReopening ? 'Reopen Period' : 'Close Period'}
              </h2>
              <p className="text-sm text-gray-600">
                {monthName} {year} - {countryCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning/Info Box */}
          <div className={`rounded-lg border p-4 ${
            isReopening
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isReopening ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <div>
                <h3 className={`font-semibold mb-1 ${
                  isReopening ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  {isReopening ? 'Reopening a Closed Period' : 'Closing This Period'}
                </h3>
                <p className={`text-sm ${
                  isReopening ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {isReopening ? (
                    <>
                      This will allow editing payroll data and creating new exports for this period. 
                      <strong className="block mt-1">You must provide a reason for reopening.</strong>
                    </>
                  ) : (
                    <>
                      This will prevent further edits to payroll data and exports for this period.
                      You can reopen it later if corrections are needed.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Period:</span>
              <span className="text-gray-900">{monthName} {year}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Country:</span>
              <span className="text-gray-900">{countryCode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                currentStatus === 'closed' 
                  ? 'bg-red-100 text-red-800'
                  : currentStatus === 'reopened'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                Current Status: {currentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason {isReopening && <span className="text-red-500">*</span>}
              {isReopening && (
                <span className="text-gray-500 font-normal ml-1">(min. 10 characters)</span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required={isReopening}
              rows={3}
              placeholder={
                isReopening
                  ? 'e.g., Salary correction needed for employee John Doe'
                  : 'e.g., Monthly payroll completed and verified (optional)'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            {isReopening && reason.length > 0 && reason.length < 10 && (
              <p className="text-sm text-red-600 mt-1">
                {10 - reason.length} more characters required
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isReopening && reason.trim().length < 10)}
              className={`px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${
                isReopening
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isReopening ? 'Reopening...' : 'Closing...'}
                </>
              ) : (
                <>
                  {isReopening ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      Reopen Period
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Close Period
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
// components/payroll/PayrollExportModal.tsx
'use client';

import { useState } from 'react';
import {
  X,
  Download,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { exportAndDownloadPayroll } from '../../lib/payrollExportUtils';
import type { ExportFormat, EmploymentType } from '../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import PeriodStatusWidget from './PeriodStatusWidget';

interface PayrollExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function PayrollExportModal({
  isOpen,
  onClose,
  userId,
}: PayrollExportModalProps) {
  const { t } = useLocale();

  const currentDate = new Date();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isBlocked, setIsBlocked] = useState(false);
  const [validationIssues, setValidationIssues] = useState<any[] | null>(null);

  const [exportDone, setExportDone] = useState(false);
  const [lastExportId, setLastExportId] = useState<string | undefined>();

  const [formData, setFormData] = useState({
    country_code: 'HU',
    export_month: currentDate.getMonth() + 1,
    export_year: currentDate.getFullYear(),
    export_format: 'nexon' as ExportFormat,
    include_terminated: false,
    department: '',
    employment_types: [] as EmploymentType[],
  });

  const getMonthName = (monthNumber: number) =>
    new Date(2024, monthNumber - 1).toLocaleString(
      t('payrollExportModal.locale'),
      { month: 'long' }
    );

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsBlocked(false);
      setValidationIssues(null);

      const response = await fetch('/api/payroll/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validated_by: userId,
        }),
      });

      const result = await response.json();

      if (!response.ok && result.status === 'blocked') {
        setIsBlocked(true);
        setValidationIssues(result.issues || []);
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || t('payrollExportModal.errors.exportFailed')
        );
      }

      await exportAndDownloadPayroll({
        format: formData.export_format,
        month: formData.export_month,
        year: formData.export_year,
        data: result.data,
      });

      // Save the export ID for period closure
      setLastExportId(result.export_id);
      setExportDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('payrollExportModal.errors.genericError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodStatusChange = () => {
    // Refresh or handle period status changes
    console.log('Period status changed');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('payrollExportModal.title')}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Layout: Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Export Settings */}
            <div className="space-y-6">
              {/* PERIOD SUMMARY */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700">
                  {t('payrollExportModal.summary.exporting')}
                </div>
                <div className="text-lg font-semibold text-green-900">
                  {getMonthName(formData.export_month)} {formData.export_year}
                </div>
              </div>

              {/* SUCCESS CONFIRMATION */}
              {exportDone && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900">
                      {t('payrollExportModal.success.title')}
                    </div>
                    <div className="text-sm text-green-700">
                      {t('payrollExportModal.success.subtitle')}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOCKING VALIDATION */}
              {isBlocked && validationIssues && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <h3 className="text-red-800 font-semibold">
                      {t('payrollExportModal.validation.blockedTitle')}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-red-700 ml-7">
                    {validationIssues.map((issue, index) => (
                      <li key={index}>
                        <div>{issue.message}</div>
                        {issue.suggested_fix && (
                          <div className="text-red-600 mt-1">
                            → {issue.suggested_fix}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* PERIOD SELECTION */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Select Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={formData.export_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          export_month: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {getMonthName(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={formData.export_year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          export_year: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(
                        (y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* FORMAT */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Export Format</h3>
                <div className="space-y-2">
                  {[
                    { value: 'generic', label: 'Generic Excel' },
                    { value: 'kulcs_soft', label: 'Kulcs-Soft' },
                    { value: 'nexon', label: 'Nexon', recommended: true },
                    { value: 'sap', label: 'SAP' },
                  ].map(({ value, label, recommended }) => (
                    <label
                      key={value}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        checked={formData.export_format === value}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            export_format: value as ExportFormat,
                          })
                        }
                        className="mr-3"
                      />
                      <span className="font-medium">{label}</span>
                      {recommended && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* ADVANCED OPTIONS */}
              <details className="border rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  {t('payrollExportModal.advancedOptions')}
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder={t(
                        'payrollExportModal.sections.filters.placeholders.department'
                      )}
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.include_terminated}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          include_terminated: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {t('payrollExportModal.sections.filters.fields.includeTerminated')}
                    </span>
                  </label>
                </div>
              </details>
            </div>

            {/* RIGHT COLUMN: Period Status Widget */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Period Status</h3>
              <PeriodStatusWidget
                countryCode={formData.country_code}
                year={formData.export_year}
                month={formData.export_month}
                currentUserId={userId}
                lastExportId={lastExportId}
                onStatusChange={handlePeriodStatusChange}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('payrollExportModal.buttons.cancel')}
            </button>

            <button
              onClick={handleExport}
              disabled={loading || isBlocked || exportDone}
              className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('payrollExportModal.buttons.checking')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('payrollExportModal.buttons.exportPeriod', {
                    month: getMonthName(formData.export_month),
                    year: formData.export_year,
                  })}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
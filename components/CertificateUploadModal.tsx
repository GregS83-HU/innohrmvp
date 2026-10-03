import React, { useState } from 'react';
import { Upload, FileText, X, AlertTriangle, CheckCircle, Loader2, Calendar, User } from 'lucide-react';

interface CertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (certificateData: CertificateData) => void;
  companyId: string;
  existingLeaveRequestId?: string;
  prefilledData?: {
    employee_name: string;
    start_date?: string;
    end_date?: string;
  };
}

interface CertificateData {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  comment?: string;
  certificate_file: string;
  medical_certificate_id: number;
}

const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  existingLeaveRequestId,
  prefilledData
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    employee_name: prefilledData?.employee_name || '',
    sickness_start_date: prefilledData?.start_date || '',
    sickness_end_date: prefilledData?.end_date || ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (selectedFile: File | null) => {
    setError('');
    if (!selectedFile) return setFile(null);

    if (selectedFile.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const handleConfirm = async () => {
    if (!file) return setError('Please select a file');
    if (!formData.employee_name.trim()) return setError('Please enter the employee name');
    if (!formData.sickness_start_date) return setError('Please enter the start date');
    if (!formData.sickness_end_date) return setError('Please enter the end date');

    setSaving(true);
    setError('');

    try {
      const body = new FormData();
      body.append('employee_name', formData.employee_name);
      body.append('absenceDateStart', formData.sickness_start_date);
      body.append('absenceDateEnd', formData.sickness_end_date);
      body.append('comment', comment || '');
      body.append('file', file);
      body.append('company_id', companyId);

      if (existingLeaveRequestId) {
        body.append('leave_request_id', existingLeaveRequestId);
      }

      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        body,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      onSuccess({
        employee_name: formData.employee_name,
        sickness_start_date: formData.sickness_start_date,
        sickness_end_date: formData.sickness_end_date,
        comment: comment,
        certificate_file: data.insertedData?.[0]?.certificate_file ?? '',
        medical_certificate_id: data.insertedData?.[0]?.id ?? 0,
      });

      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setComment('');
    setError('');
    setFormData({
      employee_name: prefilledData?.employee_name || '',
      sickness_start_date: prefilledData?.start_date || '',
      sickness_end_date: prefilledData?.end_date || ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {existingLeaveRequestId ? 'Upload Medical Certificate' : 'Upload Certificate & Create Leave'}
              </h2>
              <p className="text-sm text-gray-600">
                {existingLeaveRequestId ? 'Add certificate to existing sick leave' : 'Upload certificate to create sick leave request'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Medical Certificate
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  handleFileChange(selected);
                }}
                className="hidden"
                id="cert-upload"
              />
              <label htmlFor="cert-upload" className="block cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-green-800 text-sm break-all">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-blue-600 font-medium hover:text-blue-700">
                      Click to select certificate
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF or Image • Maximum 1MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Manual Entry Form */}
          <div className="space-y-4">
            {/* Employee Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Employee Name
              </label>
              <input
                type="text"
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                placeholder="Enter employee name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.sickness_start_date}
                  onChange={(e) => setFormData({ ...formData, sickness_start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.sickness_end_date}
                  onChange={(e) => setFormData({ ...formData, sickness_end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional information..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateUploadModal;

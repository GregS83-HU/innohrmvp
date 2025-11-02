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

interface ExtractedData {
  employee_name?: string;
  sickness_start_date?: string;
  sickness_end_date?: string;
  storage_path?: string;
  public_url?: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiConsentAccepted, setAiConsentAccepted] = useState(false);


  // Manual correction state
  const [manualData, setManualData] = useState({
    employee_name: '',
    sickness_start_date: '',
    sickness_end_date: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (selectedFile: File | null) => {
    setError('');
     setAiConsentAccepted(false);
    if (!selectedFile) return setFile(null);
    
    if (selectedFile.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const isFieldUnrecognised = (value?: string) => {
    return value && ['non recognised', 'not recognised'].some(v => value.trim().toLowerCase().includes(v));
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    
    setLoading(true);
    setError('');
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', companyId);
      formData.append(
  'employee_ai_consent_date',
  aiConsentAccepted ? new Date().toISOString() : ''
);

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const extracted = data.extracted_data || {};
      
      // Pre-fill with logged-in user data or OCR data
      const resultData = {
        employee_name: prefilledData?.employee_name || extracted.employee_name,
        sickness_start_date: extracted.sickness_start_date,
        sickness_end_date: extracted.sickness_end_date,
        storage_path: data.storage_path,
        public_url: data.public_url
      };
      
      setExtractedData(resultData);
      
      // Initialize manual data for unrecognised fields
      setManualData({
        employee_name: isFieldUnrecognised(resultData.employee_name) ? (prefilledData?.employee_name || '') : resultData.employee_name || '',
        sickness_start_date: isFieldUnrecognised(resultData.sickness_start_date) ? '' : resultData.sickness_start_date || '',
        sickness_end_date: isFieldUnrecognised(resultData.sickness_end_date) ? '' : resultData.sickness_end_date || '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
  if (!extractedData || !file) return setError('Cannot save: missing file or extracted data.');

  setSaving(true);
  setError('');

  try {
    const formData = new FormData();

    // Use manual data for unrecognised fields, otherwise fallback to extracted values
    formData.append(
      'employee_name',
      isFieldUnrecognised(extractedData.employee_name)
        ? manualData.employee_name
        : extractedData.employee_name ?? ''
    );

    formData.append(
      'absenceDateStart',
      isFieldUnrecognised(extractedData.sickness_start_date)
        ? manualData.sickness_start_date
        : extractedData.sickness_start_date ?? ''
    );

    formData.append(
      'absenceDateEnd',
      isFieldUnrecognised(extractedData.sickness_end_date)
        ? manualData.sickness_end_date
        : extractedData.sickness_end_date ?? ''
    );

    formData.append('comment', comment || '');
    formData.append('file', file);
    formData.append('company_id', companyId);

    if (existingLeaveRequestId) {
      formData.append('leave_request_id', existingLeaveRequestId);
    }

    const res = await fetch('/api/medical-certificates/confirm', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    // Return certificate data to parent
    onSuccess({
      employee_name: isFieldUnrecognised(extractedData.employee_name)
        ? manualData.employee_name
        : extractedData.employee_name ?? '',
      sickness_start_date: isFieldUnrecognised(extractedData.sickness_start_date)
        ? manualData.sickness_start_date
        : extractedData.sickness_start_date ?? '',
      sickness_end_date: isFieldUnrecognised(extractedData.sickness_end_date)
        ? manualData.sickness_end_date
        : extractedData.sickness_end_date ?? '',
      comment: comment,
      certificate_file: extractedData.public_url ?? '',
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
    setExtractedData(null);
    setComment('');
    setError('');
    setManualData({ employee_name: '', sickness_start_date: '', sickness_end_date: '' });
    setAiConsentAccepted(false);
    onClose();
  };

  const hasUnrecognised = extractedData && [
    extractedData.employee_name,
    extractedData.sickness_start_date,
    extractedData.sickness_end_date
  ].some(val => isFieldUnrecognised(val));

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

          {/* Processing Failed Warning */}
          {extractedData && hasUnrecognised && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">OCR Processing Incomplete</h3>
              </div>
              <p className="text-sm text-orange-700">
                Some information could not be recognized. Please fill in the missing fields below.
              </p>
            </div>
          )}

          {/* Upload Section */}
         {/* Upload Section */}
{!extractedData && (
  <div className="space-y-4">
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

    {/* ✅ AI Consent Checkbox */}
    {file && !extractedData && (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <input
          id="ai-consent"
          type="checkbox"
          checked={aiConsentAccepted}
          onChange={(e) => setAiConsentAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded flex-shrink-0"
        />
        <label htmlFor="ai-consent" className="text-sm text-gray-700">
          🤖 I agree that my medical certificate will be processed using AI technology for automated data extraction and validation.
        </label>
      </div>
    )}

    <button
      onClick={handleUpload}
      disabled={!file || loading || !aiConsentAccepted}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Upload className="w-5 h-5" />
          Process Certificate
        </>
      )}
    </button>
  </div>
)}



          {/* Extracted Data Form */}
          {extractedData && (
            <div className="space-y-4">
              {/* Employee Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Employee Name
                </label>
                {isFieldUnrecognised(extractedData.employee_name) ? (
                  <input
                    type="text"
                    value={manualData.employee_name}
                    onChange={(e) => setManualData({...manualData, employee_name: e.target.value})}
                    placeholder="Enter employee name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-gray-900 font-medium">{extractedData.employee_name}</p>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  {isFieldUnrecognised(extractedData.sickness_start_date) ? (
                    <input
                      type="date"
                      value={manualData.sickness_start_date}
                      onChange={(e) => setManualData({...manualData, sickness_start_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-gray-900 font-medium">{extractedData.sickness_start_date}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  {isFieldUnrecognised(extractedData.sickness_end_date) ? (
                    <input
                      type="date"
                      value={manualData.sickness_end_date}
                      onChange={(e) => setManualData({...manualData, sickness_end_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-gray-900 font-medium">{extractedData.sickness_end_date}</p>
                    </div>
                  )}
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
                  disabled={saving || !aiConsentAccepted}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateUploadModal;
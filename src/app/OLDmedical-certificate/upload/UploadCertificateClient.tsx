'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Upload, FileText, User, Calendar, Stethoscope, MessageCircle, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';

type UploadCertificateClientProps = {
  companyId: string;
};

export default function UploadCertificateClient({ companyId }: UploadCertificateClientProps) {
  
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
  // Check if 'demo' is anywhere in the path segments
  const isDemo = segments.includes('demo');
  
  // Alternative approach - check if the URL contains /jobs/demo/
  const isDemoAlt = pathname.includes('/jobs/demo/');
  
  console.log("Pathname:", pathname);
  console.log("Segments:", segments);
  console.log("Is Demo (includes):", isDemo);
  console.log("Is Demo (alt):", isDemoAlt);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    employee_name?: string;
    absenceDateStart?: string;
    absenceDateEnd?: string;
    doctor_name?: string;
  } | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (file: File | null) => {
    setError('');
    if (!file) return setFile(null);
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      setFile(null);
    } else {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const extracted = data.extracted_data || {};
      setResult({
        employee_name: extracted.employee_name,
        absenceDateStart: extracted.sickness_start_date,
        absenceDateEnd: extracted.sickness_end_date,
        doctor_name: extracted.doctor_name,
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || !file) return setError('Cannot save: missing file or extracted data.');

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('employee_name', result.employee_name || '');
      formData.append('absenceDateStart', result.absenceDateStart || '');
      formData.append('absenceDateEnd', result.absenceDateEnd || '');
      formData.append('comment', comment || '');
      formData.append('file', file);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setSuccessMessage(data.message || 'Certificate saved successfully!');
      setResult(null);
      setFile(null);
      setComment('');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setResult(null);
    setFile(null);
    setComment('');
    setSuccessMessage('');
    setError('');
  };

  const hasUnrecognised =
    result &&
    [result.employee_name, result.absenceDateStart, result.absenceDateEnd, result.doctor_name].some(
      (val) => val && ['non recognised', 'not recognised'].includes(val.trim().toLowerCase())
    );

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Upload Medical Certificate
            </h1>
            <p className="text-gray-600">Upload your medical certificate for automatic processing</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Demo block */}
        {isDemo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col gap-3">
              <a
                href="/fake_medical_certificate.pdf"
                download
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <FileText className="w-5 h-5" />
                Download fake certificate
              </a>
              <p className="text-sm text-gray-700">
                You can use our fake certificate for testing purpose. If you want to use your own file, please note that all the data will be deleted from our demo system each night at 1 am.
              </p>
            </div>
          </div>
        )}

        {/* Upload Form */}
        {!result && !successMessage && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpload();
                }}
                className="space-y-6"
              >
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Certificate File
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
                      file 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label htmlFor="certificate-upload" className="block cursor-pointer">
                      {file ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="font-medium text-green-800 text-sm sm:text-base break-all">{file.name}</span>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-blue-600 font-medium hover:text-blue-700 text-sm sm:text-base">
                            Click here to select your file
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            PDF or Image • Maximum 1MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Process
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
                <FileText className="w-6 h-6" />
                Extracted Certificate Details
              </h2>

              <div className="grid gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <label className="font-medium text-gray-700">Employee Name</label>
                  </div>
                  <p className="text-gray-800 font-medium">{result.employee_name || '—'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="font-medium text-gray-700">Start Date</label>
                    </div>
                    <p className="text-gray-800 font-medium">{result.absenceDateStart || '—'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="font-medium text-gray-700">End Date</label>
                    </div>
                    <p className="text-gray-800 font-medium">{result.absenceDateEnd || '—'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <label className="font-medium text-gray-700">Doctor Name</label>
                  </div>
                  <p className="text-gray-800 font-medium">{result.doctor_name || '—'}</p>
                </div>
              </div>

              {!hasUnrecognised && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <MessageCircle className="w-4 h-4" />
                    Additional Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add any additional information or comments..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!hasUnrecognised ? (
                  <>
                    <button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Confirm & Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-800">Processing Failed</h3>
                      </div>
                      <p className="text-red-700">
                        Some information could not be recognized automatically. Would you like to try uploading a different file?
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleCancel}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        <Upload className="w-5 h-5" />
                        Try Again
                      </button>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        <X className="w-5 h-5" />
                        Exit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
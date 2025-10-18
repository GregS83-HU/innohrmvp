'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale } from 'i18n/LocaleProvider';
import { Upload, FileText, User, Calendar, Stethoscope, MessageCircle, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';

type UploadCertificateClientProps = {
  companyId: string;
};

export default function UploadCertificateClient({ companyId }: UploadCertificateClientProps) {
  const { t } = useLocale();
  
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
  } | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for manual input when processing fails
  const [manualData, setManualData] = useState({
    employee_name: '',
    absenceDateStart: '',
    absenceDateEnd: '',
    doctor_name: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (file: File | null) => {
    setError('');
    if (!file) return setFile(null);
    if (file.size > MAX_SIZE) {
      setError(t('uploadCertificate.alerts.fileTooLarge'));
      setFile(null);
    } else {
      setFile(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return setError(t('uploadCertificate.alerts.selectFile'));
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
      const resultData = {
        employee_name: extracted.employee_name,
        absenceDateStart: extracted.sickness_start_date,
        absenceDateEnd: extracted.sickness_end_date,
        doctor_name: extracted.doctor_name,
      };
      
      setResult(resultData);
      
      // Initialize manual data with empty strings for non-recognised fields
      setManualData({
        employee_name: isFieldUnrecognised(resultData.employee_name) ? '' : resultData.employee_name || '',
        absenceDateStart: isFieldUnrecognised(resultData.absenceDateStart) ? '' : resultData.absenceDateStart || '',
        absenceDateEnd: isFieldUnrecognised(resultData.absenceDateEnd) ? '' : resultData.absenceDateEnd || '',
        doctor_name: isFieldUnrecognised(resultData.doctor_name) ? '' : resultData.doctor_name || '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t('uploadCertificate.alerts.uploadError'));
    } finally {
      setLoading(false);
    }
  };

  const isFieldUnrecognised = (value?: string) => {
    return value && ['non recognised', 'not recognised'].includes(value.trim().toLowerCase());
  };

  const handleConfirm = async () => {
    if (!result || !file) return setError(t('uploadCertificate.alerts.cannotSave'));

    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Use manual data for unrecognised fields, otherwise use result data
      formData.append('employee_name', isFieldUnrecognised(result.employee_name) ? manualData.employee_name : (result.employee_name || ''));
      formData.append('absenceDateStart', isFieldUnrecognised(result.absenceDateStart) ? manualData.absenceDateStart : (result.absenceDateStart || ''));
      formData.append('absenceDateEnd', isFieldUnrecognised(result.absenceDateEnd) ? manualData.absenceDateEnd : (result.absenceDateEnd || ''));
     // formData.append('doctor_name', isFieldUnrecognised(result.doctor_name) ? manualData.doctor_name : (result.doctor_name || ''));
      
      formData.append('comment', comment || '');
      formData.append('file', file);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setSuccessMessage(data.message || t('uploadCertificate.alerts.success'));
      setResult(null);
      setFile(null);
      setComment('');
      setManualData({
        employee_name: '',
        absenceDateStart: '',
        absenceDateEnd: '',
        doctor_name: ''
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t('uploadCertificate.alerts.saveError'));
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
    setManualData({
      employee_name: '',
      absenceDateStart: '',
      absenceDateEnd: '',
      doctor_name: ''
    });
  };

  const hasUnrecognised =
    result &&
    [result.employee_name, result.absenceDateStart, result.absenceDateEnd].some(
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
              {t('uploadCertificate.header.title')}
            </h1>
            <p className="text-gray-600">{t('uploadCertificate.header.subtitle')}</p>
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
                href="https://drive.google.com/uc?export=download&id=1ASXxoxYw4hq28BSTNm54fKKZEv4NOjcG"
                download
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <FileText className="w-5 h-5" />
                {t('uploadCertificate.demo.downloadButton')}
              </a>
              <p className="text-sm text-gray-700">
                {t('uploadCertificate.demo.description')}
              </p>
            </div>
          </div>
        )}

        {/* Processing Failed Warning - Now displayed before the form */}
        {result && hasUnrecognised && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">{t('uploadCertificate.alerts.processingFailed')}</h3>
            </div>
            <p className="text-red-700">
              {t('uploadCertificate.alerts.processingFailedDesc')}
            </p>
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
                    {t('uploadCertificate.upload.fileLabel')}
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
                            {t('uploadCertificate.upload.dropzoneEmpty')}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {t('uploadCertificate.upload.dropzoneHelp')}
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
                      {t('uploadCertificate.upload.processing')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      {t('uploadCertificate.upload.uploadButton')}
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

        {/* Results - Now includes manual form when processing fails */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-6">
                <FileText className="w-6 h-6" />
                {hasUnrecognised ? t('uploadCertificate.results.titleManual') : t('uploadCertificate.results.titleSuccess')}
              </h2>

              <div className="grid gap-4 mb-6">
                {/* Employee Name */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <label className="font-medium text-gray-700">{t('uploadCertificate.results.employeeName')}</label>
                  </div>
                  {isFieldUnrecognised(result.employee_name) ? (
                    <input
                      type="text"
                      value={manualData.employee_name}
                      onChange={(e) => setManualData({...manualData, employee_name: e.target.value})}
                      placeholder={t('uploadCertificate.results.employeeNamePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{result.employee_name || t('uploadCertificate.results.noData')}</p>
                  )}
                </div>

                {/* Start and End Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="font-medium text-gray-700">{t('uploadCertificate.results.startDate')}</label>
                    </div>
                    {isFieldUnrecognised(result.absenceDateStart) ? (
                      <input
                        type="date"
                        value={manualData.absenceDateStart}
                        onChange={(e) => setManualData({...manualData, absenceDateStart: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{result.absenceDateStart || t('uploadCertificate.results.noData')}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="font-medium text-gray-700">{t('uploadCertificate.results.endDate')}</label>
                    </div>
                    {isFieldUnrecognised(result.absenceDateEnd) ? (
                      <input
                        type="date"
                        value={manualData.absenceDateEnd}
                        onChange={(e) => setManualData({...manualData, absenceDateEnd: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{result.absenceDateEnd || t('uploadCertificate.results.noData')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment field - always displayed */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <MessageCircle className="w-4 h-4" />
                  {t('uploadCertificate.results.comment')}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('uploadCertificate.results.commentPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {hasUnrecognised ? (
                  <>
                    <button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          {t('uploadCertificate.buttons.saving')}
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          {t('uploadCertificate.buttons.confirmSave')}
                        </>
                      )}
                    </button>
                    {/* When processing failed - show Try Again button */}
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <Upload className="w-5 h-5" />
                      {t('uploadCertificate.buttons.tryAgain')}
                    </button>
                  </>
                ) : (
                  <>
                    {/* When processing succeeded - show original buttons */}
                    <button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          {t('uploadCertificate.buttons.saving')}
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          {t('uploadCertificate.buttons.confirmSave')}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <X className="w-5 h-5" />
                      {t('uploadCertificate.buttons.cancel')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
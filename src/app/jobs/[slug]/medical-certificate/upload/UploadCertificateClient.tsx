'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { useLocale } from 'i18n/LocaleProvider';
import { Upload, FileText, User, Calendar, MessageCircle, Check, AlertTriangle, CheckCircle } from 'lucide-react';

export default function UploadCertificateClient() {
  const { t } = useLocale();
  const session = useSession();
  const pathname = usePathname();
  const isDemo = pathname.includes('/jobs/demo/');

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    employee_name: '',
    absenceDateStart: '',
    absenceDateEnd: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (selected: File | null) => {
    setError('');
    if (!selected) return setFile(null);
    if (selected.size > MAX_SIZE) {
      setError(t('uploadCertificate.alerts.fileTooLarge'));
      setFile(null);
    } else {
      setFile(selected);
    }
  };

  const resetForm = () => {
    setFile(null);
    setComment('');
    setFormData({ employee_name: '', absenceDateStart: '', absenceDateEnd: '' });
  };

  const handleConfirm = async () => {
    if (!file) return setError(t('uploadCertificate.alerts.selectFile'));
    if (!formData.employee_name.trim() || !formData.absenceDateStart || !formData.absenceDateEnd) {
      return setError(t('uploadCertificate.alerts.cannotSave'));
    }
    if (!session?.access_token) return setError(t('uploadCertificate.error.loginRequired'));

    setSaving(true);
    setError('');

    try {
      const body = new FormData();
      body.append('employee_name', formData.employee_name);
      body.append('absenceDateStart', formData.absenceDateStart);
      body.append('absenceDateEnd', formData.absenceDateEnd);
      body.append('comment', comment || '');
      body.append('file', file);

      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setSuccessMessage(data.message || t('uploadCertificate.alerts.success'));
      resetForm();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t('uploadCertificate.alerts.saveError'));
    } finally {
      setSaving(false);
    }
  };

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
            <button
              onClick={() => setSuccessMessage('')}
              className="inline-flex items-center justify-center gap-2 mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <Upload className="w-5 h-5" />
              {t('buttons.uploadAnother')}
            </button>
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

        {/* Upload & Details Form */}
        {!successMessage && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
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

              {/* Employee Name */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <label className="font-medium text-gray-700">{t('uploadCertificate.results.employeeName')}</label>
                </div>
                <input
                  type="text"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  placeholder={t('uploadCertificate.results.employeeNamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <label className="font-medium text-gray-700">{t('uploadCertificate.results.startDate')}</label>
                  </div>
                  <input
                    type="date"
                    value={formData.absenceDateStart}
                    onChange={(e) => setFormData({ ...formData, absenceDateStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <label className="font-medium text-gray-700">{t('uploadCertificate.results.endDate')}</label>
                  </div>
                  <input
                    type="date"
                    value={formData.absenceDateEnd}
                    onChange={(e) => setFormData({ ...formData, absenceDateEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
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

              {/* Action Button */}
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

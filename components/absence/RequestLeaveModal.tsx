// File: components/absence/RequestLeaveModal.tsx
import React, { useState, useEffect } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { XCircle, Loader2, Upload, FileText, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import { LeaveType } from '../../types/absence';
import { createLeaveRequestNotification, getUserManager, getUserName } from '../../utils/absenceNotifications';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RequestForm = {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  requestForm: RequestForm;
  setRequestForm: React.Dispatch<React.SetStateAction<RequestForm>>;
  leaveTypes: LeaveType[];
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  loading: boolean;
  currentUserId: string;
  companyId: string;
  currentUserName: string;
};

interface ExtractedData {
  employee_name?: string;
  sickness_start_date?: string;
  sickness_end_date?: string;
  storage_path?: string;
  public_url?: string;
}

const RequestLeaveModal: React.FC<Props> = ({
  isOpen,
  onClose,
  requestForm,
  setRequestForm,
  leaveTypes,
  onSubmit,
  loading,
  currentUserId,
  companyId,
  currentUserName
}) => {
  const { t } = useLocale();
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [certificateComment, setCertificateComment] = useState('');
  const [certificateId, setCertificateId] = useState<number | null>(null);
  
  const [manualData, setManualData] = useState({
    employee_name: '',
    sickness_start_date: '',
    sickness_end_date: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024;
  
  const selectedLeaveType = leaveTypes.find(lt => lt.id === requestForm.leave_type_id);
  const isSickLeave = selectedLeaveType?.requires_medical_certificate || false;

  useEffect(() => {
    if (!isOpen || !isSickLeave) {
      setCertificateFile(null);
      setExtractedData(null);
      setCertificateError('');
      setCertificateComment('');
      setCertificateId(null);
      setManualData({ employee_name: '', sickness_start_date: '', sickness_end_date: '' });
    }
  }, [isOpen, isSickLeave]);

  const isFieldUnrecognised = (value?: string) => {
    return value && ['non recognised', 'not recognised'].some(v => value.trim().toLowerCase().includes(v));
  };

  const handleFileChange = (selectedFile: File | null) => {
    setCertificateError('');
    if (!selectedFile) return setCertificateFile(null);
    
    if (selectedFile.size > MAX_SIZE) {
      setCertificateError(t('requestLeaveModal.errors.fileTooLarge'));
      setCertificateFile(null);
    } else {
      setCertificateFile(selectedFile);
    }
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile) {
      setCertificateError(t('requestLeaveModal.errors.selectFile'));
      return;
    }
    
    setUploadingCertificate(true);
    setCertificateError('');
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', certificateFile);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const extracted = data.extracted_data || {};
      
      const resultData = {
        employee_name: currentUserName || extracted.employee_name,
        sickness_start_date: extracted.sickness_start_date,
        sickness_end_date: extracted.sickness_end_date,
        storage_path: data.storage_path,
        public_url: data.public_url
      };
      
      setExtractedData(resultData);
      
      setManualData({
        employee_name: isFieldUnrecognised(resultData.employee_name) ? currentUserName : resultData.employee_name || '',
        sickness_start_date: isFieldUnrecognised(resultData.sickness_start_date) ? '' : resultData.sickness_start_date || '',
        sickness_end_date: isFieldUnrecognised(resultData.sickness_end_date) ? '' : resultData.sickness_end_date || '',
      });

      if (resultData.sickness_start_date && !isFieldUnrecognised(resultData.sickness_start_date)) {
        setRequestForm(prev => ({ ...prev, start_date: resultData.sickness_start_date || '' }));
      }
      if (resultData.sickness_end_date && !isFieldUnrecognised(resultData.sickness_end_date)) {
        setRequestForm(prev => ({ ...prev, end_date: resultData.sickness_end_date || '' }));
      }

    } catch (err: unknown) {
      if (err instanceof Error) setCertificateError(err.message);
      else setCertificateError('Unknown error occurred');
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleConfirmCertificate = async () => {
    if (!extractedData || !certificateFile) {
      setCertificateError(t('requestLeaveModal.errors.cannotSave'));
      return;
    }

    setUploadingCertificate(true);
    setCertificateError('');

    try {
      const formData = new FormData();

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

      formData.append('comment', certificateComment || '');
      formData.append('file', certificateFile);
      formData.append('company_id', companyId);

      const res = await fetch('/api/medical-certificates/confirm', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setCertificateId(data.insertedData?.[0]?.id ?? null);

      const finalStartDate = isFieldUnrecognised(extractedData.sickness_start_date)
        ? manualData.sickness_start_date
        : extractedData.sickness_start_date ?? '';
      
      const finalEndDate = isFieldUnrecognised(extractedData.sickness_end_date)
        ? manualData.sickness_end_date
        : extractedData.sickness_end_date ?? '';

      setRequestForm(prev => ({
        ...prev,
        start_date: finalStartDate,
        end_date: finalEndDate,
        reason: certificateComment || prev.reason
      }));

    } catch (err: unknown) {
      if (err instanceof Error) setCertificateError(err.message);
      else setCertificateError('Unknown error occurred while saving');
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleSubmitWithNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSickLeave && extractedData && !certificateId) {
      setCertificateError(t('requestLeaveModal.errors.confirmBeforeSubmit'));
      return;
    }

    await onSubmit(e);
    
    try {
      const { managerId } = await getUserManager(currentUserId);
      
      if (!managerId) {
        console.warn(t('requestLeaveModal.console.noManager'));
        return;
      }

      const { name: userName } = await getUserName(currentUserId);
      const leaveTypeName = selectedLeaveType?.name_hu || selectedLeaveType?.name || 'Leave';

      const startDate = new Date(requestForm.start_date);
      const endDate = new Date(requestForm.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { data: leaveRequest } = await supabase
        .from('leave_requests')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('start_date', requestForm.start_date)
        .eq('end_date', requestForm.end_date)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!leaveRequest) {
        console.error(t('requestLeaveModal.console.requestNotFound'));
        return;
      }

      try {
        await supabase
          .from('leave_requests')
          .update({ manager_id: managerId })
          .eq('id', leaveRequest.id);

        console.log(t('requestLeaveModal.console.managerUpdated'), managerId);
      } catch (err) {
        console.error(t('requestLeaveModal.console.managerUpdateFailed'), err);
      }

      if (certificateId) {
        try {
          const { data: updateData, error: updateError } = await supabase
            .from('leave_requests')
            .update({ medical_certificate_id: certificateId })
            .eq('id', leaveRequest.id);
          
          console.log("Update result:", { updateData, updateError });

          await supabase
            .from('medical_certificates')
            .update({ leave_request_id: leaveRequest.id })
            .eq('id', certificateId);

          console.log(t('requestLeaveModal.console.certificateLinked'), certificateId);
        } catch (err) {
          console.error(t('requestLeaveModal.console.certificateLinkFailed'), err);
        }
      }
      
      console.log(t('requestLeaveModal.console.managerCertificateAdded'));

      await createLeaveRequestNotification({
        leaveRequestId: leaveRequest.id,
        userId: currentUserId,
        userName,
        managerId,
        leaveTypeName,
        startDate: requestForm.start_date,
        endDate: requestForm.end_date,
        totalDays
      });

      console.log(t('requestLeaveModal.console.notificationSent'));
    } catch (error) {
      console.error(t('requestLeaveModal.console.notificationError'), error);
    }
  };

  const handleClose = () => {
    setCertificateFile(null);
    setExtractedData(null);
    setCertificateError('');
    setCertificateComment('');
    setCertificateId(null);
    setManualData({ employee_name: '', sickness_start_date: '', sickness_end_date: '' });
    onClose();
  };

  const hasUnrecognised = extractedData && [
    extractedData.employee_name,
    extractedData.sickness_start_date,
    extractedData.sickness_end_date
  ].some(val => isFieldUnrecognised(val));

  const datesLocked = extractedData && certificateId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{t('requestLeaveModal.title')}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitWithNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('requestLeaveModal.fields.leaveType')}
            </label>
            <select
              value={requestForm.leave_type_id}
              onChange={(e) => setRequestForm(prev => ({ ...prev, leave_type_id: e.target.value }))}
              required
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('requestLeaveModal.fields.leaveTypePlaceholder')}</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name_hu} ({type.name})
                </option>
              ))}
            </select>
          </div>

          {isSickLeave && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">{t('requestLeaveModal.certificate.title')}</h4>
              </div>

              {certificateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{certificateError}</p>
                  </div>
                </div>
              )}

              {hasUnrecognised && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <h5 className="font-semibold text-orange-800 text-sm">{t('requestLeaveModal.errors.ocrIncomplete')}</h5>
                  </div>
                  <p className="text-xs text-orange-700">
                    {t('requestLeaveModal.errors.ocrIncompleteDesc')}
                  </p>
                </div>
              )}

              {!extractedData ? (
                <>
                  <div>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                      certificateFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                        id="cert-upload-inline"
                      />
                      <label htmlFor="cert-upload-inline" className="block cursor-pointer">
                        {certificateFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800 text-sm break-all">{certificateFile.name}</span>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-blue-600 font-medium text-sm hover:text-blue-700">
                              {t('requestLeaveModal.certificate.selectFile')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t('requestLeaveModal.certificate.fileHelp')}
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCertificateUpload}
                    disabled={!certificateFile || uploadingCertificate}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {uploadingCertificate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('requestLeaveModal.certificate.processing')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {t('requestLeaveModal.certificate.processButton')}
                      </>
                    )}
                  </button>
                </>
              ) : !certificateId ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                        <User className="w-3 h-3" />
                        {t('requestLeaveModal.certificate.employeeName')}
                      </label>
                      {isFieldUnrecognised(extractedData.employee_name) ? (
                        <input
                          type="text"
                          value={manualData.employee_name}
                          onChange={(e) => setManualData({...manualData, employee_name: e.target.value})}
                          placeholder={t('requestLeaveModal.certificate.employeeNamePlaceholder')}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-gray-900 font-medium text-sm">{extractedData.employee_name}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                          <Calendar className="w-3 h-3" />
                          {t('requestLeaveModal.fields.startDate')}
                        </label>
                        {isFieldUnrecognised(extractedData.sickness_start_date) ? (
                          <input
                            type="date"
                            value={manualData.sickness_start_date}
                            onChange={(e) => setManualData({...manualData, sickness_start_date: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900 font-medium text-sm">{extractedData.sickness_start_date}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                          <Calendar className="w-3 h-3" />
                          {t('requestLeaveModal.fields.endDate')}
                        </label>
                        {isFieldUnrecognised(extractedData.sickness_end_date) ? (
                          <input
                            type="date"
                            value={manualData.sickness_end_date}
                            onChange={(e) => setManualData({...manualData, sickness_end_date: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900 font-medium text-sm">{extractedData.sickness_end_date}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {t('requestLeaveModal.certificate.additionalComment')}
                      </label>
                      <textarea
                        value={certificateComment}
                        onChange={(e) => setCertificateComment(e.target.value)}
                        placeholder={t('requestLeaveModal.certificate.commentPlaceholder')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmCertificate}
                      disabled={uploadingCertificate}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {uploadingCertificate ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('requestLeaveModal.certificate.saving')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t('requestLeaveModal.certificate.confirmButton')}
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 text-sm">{t('requestLeaveModal.certificate.confirmed')}</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {t('requestLeaveModal.certificate.confirmedDescription', { fileName: certificateFile?.name || '' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('requestLeaveModal.fields.startDate')}
              </label>
              <input
                type="date"
                value={requestForm.start_date}
                onChange={(e) => setRequestForm(prev => ({ ...prev, start_date: e.target.value }))}
                required
                disabled={!!datesLocked}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {datesLocked && (
                <p className="text-xs text-gray-500 mt-1">{t('requestLeaveModal.fields.dateLocked')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('requestLeaveModal.fields.endDate')}
              </label>
              <input
                type="date"
                value={requestForm.end_date}
                onChange={(e) => setRequestForm(prev => ({ ...prev, end_date: e.target.value }))}
                required
                disabled={!!datesLocked}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {datesLocked && (
                <p className="text-xs text-gray-500 mt-1">{t('requestLeaveModal.fields.dateLocked')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('requestLeaveModal.fields.reason')}
            </label>
            <textarea
              value={requestForm.reason}
              onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('requestLeaveModal.fields.reasonPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              {t('requestLeaveModal.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('requestLeaveModal.buttons.submitting')}
                </>
              ) : (
                t('requestLeaveModal.buttons.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestLeaveModal;
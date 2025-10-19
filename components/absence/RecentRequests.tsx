// File: components/absence/RecentRequests.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { RefreshCw, Calendar, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { LeaveRequest } from '../../types/absence';
import { CertificateStatusBadge } from './../CertificateStatusBadge';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';

type Props = {
  requests: LeaveRequest[];
  onRefresh: () => void;
  onOpenRequestModal: () => void;
  onUploadCertificateForRequest: (id: string) => void;
  isSickLeaveType: (leaveTypeId: string) => boolean;
  formatDate?: (d: string) => string;
};

const RecentRequests: React.FC<Props> = ({
  requests,
  onRefresh,
  onOpenRequestModal,
  onUploadCertificateForRequest,
  isSickLeaveType,
  formatDate = defaultFormatDate
}) => {
  const { t } = useLocale();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('recentRequests.title')}
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('recentRequests.empty.noRequests')}</p>
          <button
            onClick={onOpenRequestModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('recentRequests.empty.firstLeaveButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: request.leave_type_color }}
                      />
                      <h3 className="font-semibold text-gray-900">
                        {request.leave_type_name_hu}
                      </h3>
                      <div className="ml-2">
                        <StatusBadge status={request.status} />
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">{t('recentRequests.fields.period')}</span>{' '}
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </p>
                      <p>
                        <span className="font-medium">{t('recentRequests.fields.duration')}</span>{' '}
                        {request.total_days} {request.total_days !== 1 
                          ? t('recentRequests.fields.days') 
                          : t('recentRequests.fields.day')}
                      </p>
                      {request.reason && (
                        <p>
                          <span className="font-medium">{t('recentRequests.fields.reason')}</span> {request.reason}
                        </p>
                      )}
                      {request.review_notes && (
                        <p>
                          <span className="font-medium">{t('recentRequests.fields.managerNotes')}</span> {request.review_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {t('recentRequests.fields.requested')} {formatDate(request.created_at)}
                    {request.reviewed_at && (
                      <>
                        <br />
                        {t('recentRequests.fields.reviewed')} {formatDate(request.reviewed_at)}
                      </>
                    )}
                  </div>
                </div>

                {/* Certificate Status Badge & Upload button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <CertificateStatusBadge
                    hasCertificate={!!request.medical_certificate_id}
                    certificateTreated={false}
                    isHrValidated={request.hr_validated}
                    isMedicalConfirmed={request.is_medical_confirmed}
                  />

                  {isSickLeaveType(request.leave_type_id) &&
                    !request.medical_certificate_id &&
                    request.status === 'pending' && (
                      <button
                        onClick={() => onUploadCertificateForRequest(request.id)}
                        className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                      >
                        {t('recentRequests.buttons.uploadCertificate')}
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentRequests;
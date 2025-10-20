// components/CertificateStatusBadge.tsx
import React from 'react';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

interface CertificateStatusBadgeProps {
  hasCertificate?: boolean;
  certificateTreated?: boolean;
  isHrValidated?: boolean;
  isMedicalConfirmed?: boolean;
}

export const CertificateStatusBadge: React.FC<CertificateStatusBadgeProps> = ({
  hasCertificate,
  certificateTreated,
  isHrValidated,
  isMedicalConfirmed
}) => {
  const { t } = useLocale();

  if (!hasCertificate) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        <FileText className="w-3 h-3 mr-1" />
        {t('certificateStatusBadge.noCertificate')}
      </span>
    );
  }

  if (isHrValidated && certificateTreated) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t('certificateStatusBadge.certificateConfirmed')}
      </span>
    );
  }

  if (hasCertificate && !certificateTreated) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
        <Clock className="w-3 h-3 mr-1" />
        {t('certificateStatusBadge.pendingHrReview')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
      <FileText className="w-3 h-3 mr-1" />
      {t('certificateStatusBadge.certificateUploaded')}
    </span>
  );
};

// Date Mismatch Alert Component
interface DateMismatchAlertProps {
  certificateStart: string;
  certificateEnd: string;
  leaveStart: string;
  leaveEnd: string;
}

export const DateMismatchAlert: React.FC<DateMismatchAlertProps> = ({
  certificateStart,
  certificateEnd,
  leaveStart,
  leaveEnd
}) => {
  const { t } = useLocale();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800 mb-1">
            {t('dateMismatchAlert.title')}
          </p>
          <p className="text-yellow-700">
            {t('dateMismatchAlert.description', {
              certificateStart,
              certificateEnd,
              leaveStart,
              leaveEnd
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
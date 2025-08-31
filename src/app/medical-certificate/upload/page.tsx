// src/app/medical-certificate/upload/page.tsx
import UploadCertificateClient from './UploadCertificateClient';

export default function UploadCertificatePage() {
  // Tu peux définir ici le companyId si nécessaire
  const companyId = process.env.NEXT_PUBLIC_COMPANY_ID || 'default_company_id';

  return <UploadCertificateClient companyId={companyId} />;
}

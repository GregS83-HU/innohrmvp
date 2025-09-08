// src/app/medical-certificate/upload/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import UploadCertificateClient from './UploadCertificateClient';

function UploadCertificatePageContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company_id');

  console.log('=== DEBUG UPLOAD PAGE ===');
  console.log('URL search params:', searchParams.toString());
  console.log('Company ID from URL:', companyId);
  console.log('========================');

  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 mb-4">
            Aucun ID d'entreprise fourni. Veuillez accéder à cette page via le lien approprié.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <UploadCertificateClient companyId={companyId} />;
}

export default function UploadCertificatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <UploadCertificatePageContent />
    </Suspense>
  );
}
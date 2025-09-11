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
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 mb-6">
            Aucun ID d&apos;entreprise fourni. Veuillez accéder à cette page via le lien approprié.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-[1.02]"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }

  return <UploadCertificateClient companyId={companyId} />;
}

export default function UploadCertificatePage() {
  return (
    <Suspense fallback={
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </main>
    }>
      <UploadCertificatePageContent />
    </Suspense>
  );
}
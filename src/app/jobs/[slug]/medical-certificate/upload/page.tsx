// src/app/medical-certificate/upload/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import UploadCertificateClient from './UploadCertificateClient';

// Initialize Supabase client (adjust these values according to your setup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function UploadCertificatePageContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company_id');
  const [canAddCertificate, setCanAddCertificate] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const certificateAccessChecked = useRef(false);

  // Check if user can add medical certificate
  const checkCertificateAccess = useCallback(async () => {
    console.log('🎯 checkCertificateAccess called with:', {
      companyId,
      alreadyChecked: certificateAccessChecked.current
    });
    
    if (!companyId) {
      console.log('❌ No companyId available, cannot check access');
      setIsLoading(false);
      return;
    }
    
    if (certificateAccessChecked.current) {
      console.log('❌ Access already checked, skipping');
      return;
    }
    
    console.log('🔍 Checking certificate access for company_id:', companyId);
    certificateAccessChecked.current = true;
    
    try {
      console.log('📞 Calling supabase.rpc with params:', { p_company_id: companyId });
      
      const { data, error } = await supabase.rpc('can_add_medical_certificate', { p_company_id: companyId });
      
      console.log('📨 RPC Response:', { data, error, dataType: typeof data });
      
      if (error) {
        console.log('❌ RPC Error:', error);
        setCanAddCertificate(false);
        setIsLoading(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanAddCertificate(false);
        setIsLoading(false);
        return;
      }
      
      // Handle different possible return formats
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        console.log('🔧 Data is boolean:', data);
        hasAccess = data;
      } else if (typeof data === 'string') {
        console.log('🔧 Data is string:', data);
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        console.log('🔧 Data is number:', data);
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        console.log('🔧 Data is object:', data);
        // Sometimes Supabase functions return objects, check if there's a result property
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' || // Sometimes it's an array
                   data === true; // Sometimes the object itself is the boolean
      }
      
      console.log('✅ Final access decision:', hasAccess);
      setCanAddCertificate(hasAccess);
      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanAddCertificate(false);
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    checkCertificateAccess();
  }, [checkCertificateAccess]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Show error if no company ID
  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700 mb-4">
            Aucun ID d&apos;entreprise fourni. Veuillez accéder à cette page via le lien approprié.
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

  // Show plan limit reached message if access is denied
  if (canAddCertificate === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Limite du plan atteinte</h1>
          <p className="text-gray-700 mb-6">
            Your company&apos;s plan limit has been reached. To continue, please reach out to your company administrator.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // Show the upload component if access is granted
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
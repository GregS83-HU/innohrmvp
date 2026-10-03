// src/app/medical-certificate/upload/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from '@supabase/auth-helpers-react';
import UploadCertificateClient from './UploadCertificateClient';
import { useLocale } from '../../../../../i18n/LocaleProvider';
import LockedModuleNotice from '../../../../../../components/entitlements/LockedModuleNotice';
import { safeErrorInfo } from '../../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function UploadCertificatePageContent() {
  const params = useParams();
  const slug = params.slug as string;
  const session = useSession();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyIdLoading, setCompanyIdLoading] = useState(true);
  const [canAddCertificate, setCanAddCertificate] = useState<boolean | null>(null);
  const [accessReason, setAccessReason] = useState<string | null>(null);
  const [accessPlan, setAccessPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const certificateAccessChecked = useRef(false);
  const { t } = useLocale();

  // This page previously derived company_id from a plain ?company_id= URL
  // query param, reachable with no login at all. It now requires a session
  // and derives the company from that session's own membership - matching
  // how the backend (medical-certificates/confirm and /upload) has
  // required an authenticated company admin since the Group 3 fix.
  const fetchUserCompanyId = useCallback(async () => {
    if (!session?.user?.id) {
      setCompanyIdLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();
      if (!error && data?.company_id) setCompanyId(data.company_id);
    } catch (error) {
      console.error('Error fetching company id:', safeErrorInfo(error));
    } finally {
      setCompanyIdLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchUserCompanyId();
  }, [fetchUserCompanyId]);

  // Check if user can add medical certificate
  const checkCertificateAccess = useCallback(async () => {
    if (!companyId || !session?.access_token) {
      setIsLoading(false);
      return;
    }

    if (certificateAccessChecked.current) {
      return;
    }
    certificateAccessChecked.current = true;

    try {
      const res = await fetch(`/api/entitlements/check?feature=medicalCertificates.upload`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await res.json();
      setCanAddCertificate(res.ok && result.allowed === true);
      setAccessReason(result.reason ?? null);
      setAccessPlan(result.plan ?? null);
      setIsLoading(false);
    } catch (error) {
      console.error('Entitlement check error:', safeErrorInfo(error));
      setCanAddCertificate(false);
      setIsLoading(false);
    }
  }, [companyId, session?.access_token]);

  useEffect(() => {
    checkCertificateAccess();
  }, [checkCertificateAccess]);

  // Show loading state
  if (session === undefined || companyIdLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('uploadCertificate.loading')}</p>
        </div>
      </div>
    );
  }

  // Require a logged-in session before anything else - this page (and the
  // API routes it calls) used to be reachable with no login at all.
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('uploadCertificate.error.title')}</h1>
          <p className="text-gray-700 mb-4">{t('uploadCertificate.error.loginRequired')}</p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {t('uploadCertificate.buttons.back')}
          </a>
        </div>
      </div>
    );
  }

  // Show error if the session has no associated company
  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('uploadCertificate.error.title')}</h1>
          <p className="text-gray-700 mb-4">
            {t('uploadCertificate.error.noCompanyId')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {t('uploadCertificate.buttons.back')}
          </button>
        </div>
      </div>
    );
  }

  // Onboarding-completion gate: same locked-state component used by the
  // other five onboarding-gated modules, not the plan-limit card below -
  // this is a temporary compliance safeguard, not a plan limitation. See
  // ONBOARDING_GATED_FEATURES in src/config/entitlements.ts.
  if (canAddCertificate === false && accessReason === 'onboarding_required') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <LockedModuleNotice
          feature="medicalCertificates.upload"
          plan={accessPlan}
          upgradeHref={`/jobs/${slug}/contact`}
          reason="onboarding"
        />
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('uploadCertificate.planLimit.title')}</h1>
          <p className="text-gray-700 mb-6">
            {t('uploadCertificate.planLimit.message')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {t('uploadCertificate.buttons.home')}
          </button>
        </div>
      </div>
    );
  }

  // Show the upload component if access is granted
  return <UploadCertificateClient />;
}

export default function UploadCertificatePage() {
  const { t } = useLocale();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('uploadCertificate.loading')}</p>
        </div>
      </div>
    }>
      <UploadCertificatePageContent />
    </Suspense>
  );
}

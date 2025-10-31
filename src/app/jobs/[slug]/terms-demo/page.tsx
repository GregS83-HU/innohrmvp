// src/app/terms-demo/page.tsx

'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import Link from 'next/link';


interface TermsDemoPageProps {
  params: Promise<{ slug: string }>;
}

export default function TermsDemoPage({ params }: TermsDemoPageProps) {
  const { t } = useLocale();
  const { slug } = React.use(params); 
  const currentDate = '2025. január 29.'; // Or use Date object

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">
        {t('termsDemo.title')}
      </h1>
      
      <div className="prose prose-blue max-w-none">
        {/* Section 1: Demo Features */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.demoFeatures.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.demoFeatures.content')}
        </p>

        {/* Section 2: Liability */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.liability.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.liability.content')}
        </p>

        {/* Section 3: Data Processing */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.dataProcessing.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.dataProcessing.content')}{' '}
          {t('termsDemo.sections.dataProcessing.detailsLink')}{' '}
          <Link href={`/jobs/${slug}/privacy-demo`} className="text-blue-600 underline hover:text-blue-800">
            {t('termsDemo.sections.dataProcessing.privacyPolicy')}
          </Link>
        </p>

        {/* Section 4: AI Content */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.aiContent.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.aiContent.content')}
        </p>

        {/* Section 5: Termination */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.termination.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.termination.content')}
        </p>

        {/* Section 6: Contact */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.contact.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.contact.content')}{' '}
          <a 
            href="mailto:privacy@innohr.hu" 
            className="text-blue-600 underline hover:text-blue-800"
          >
            privacy@innohr.hu
          </a>
        </p>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 mt-8 pt-4 border-t">
          {t('termsDemo.lastUpdated', { date: currentDate })}
        </p>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import Link from 'next/link';

interface TermsDemoContentProps {
  privacyHref: string;
}

const SIMPLE_SECTION_KEYS = [
  'service',
  'accounts',
  'subscriptions',
  'onboarding',
  'acceptableUse',
  'aiContent',
] as const;

const SIMPLE_SECTION_KEYS_AFTER_DATA_PROCESSING = [
  'intellectualProperty',
  'availability',
  'liability',
  'termination',
  'changes',
  'governingLaw',
] as const;

export default function TermsDemoContent({ privacyHref }: TermsDemoContentProps) {
  const { t } = useLocale();

  const renderSimpleSection = (key: string) => (
    <React.Fragment key={key}>
      <h2 className="text-xl font-semibold mt-6 mb-3">
        {t(`termsDemo.sections.${key}.title`)}
      </h2>
      <p className="mb-4">
        {t(`termsDemo.sections.${key}.content`)}
      </p>
    </React.Fragment>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">
        {t('termsDemo.title')}
      </h1>

      <div className="prose prose-blue max-w-none">
        {SIMPLE_SECTION_KEYS.map(renderSimpleSection)}

        {/* Data Protection — links to the Privacy Notice */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.dataProcessing.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.dataProcessing.content')}{' '}
          {t('termsDemo.sections.dataProcessing.detailsLink')}{' '}
          <Link href={privacyHref} className="text-blue-600 underline hover:text-blue-800">
            {t('termsDemo.sections.dataProcessing.privacyPolicy')}
          </Link>
        </p>

        {SIMPLE_SECTION_KEYS_AFTER_DATA_PROCESSING.map(renderSimpleSection)}

        {/* Contact */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.contact.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.contact.content')}{' '}
          <a
            href="mailto:privacy@hrinno.hu"
            className="text-blue-600 underline hover:text-blue-800"
          >
            privacy@hrinno.hu
          </a>
        </p>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 mt-8 pt-4 border-t">
          {t('termsDemo.lastUpdated')}
        </p>
      </div>
    </div>
  );
}

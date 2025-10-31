'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

const CookiesDemoPage: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">{t('cookiesDemo.title')}</h1>

      <p className="mb-4">{t('cookiesDemo.intro')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('cookiesDemo.sections.whatAreCookies.title')}
      </h2>
      <p className="mb-4">{t('cookiesDemo.sections.whatAreCookies.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('cookiesDemo.sections.howWeUse.title')}
      </h2>
      <p className="mb-4">{t('cookiesDemo.sections.howWeUse.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('cookiesDemo.sections.types.title')}
      </h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>{t('cookiesDemo.sections.types.items.necessary')}</li>
        <li>{t('cookiesDemo.sections.types.items.analytics')}</li>
        <li>{t('cookiesDemo.sections.types.items.functional')}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('cookiesDemo.sections.manage.title')}
      </h2>
      <p className="mb-4">{t('cookiesDemo.sections.manage.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('cookiesDemo.sections.moreInfo.title')}
      </h2>
      <p className="mb-4">
        {t('cookiesDemo.sections.moreInfo.text')}{' '}
        <a
          href="mailto:privacy@innohr.hu"
          className="text-blue-600 underline hover:text-blue-800"
        >
          privacy@innohr.hu
        </a>
      </p>

      <p className="text-sm text-gray-500 mt-8">
        {t('cookiesDemo.lastUpdated')}
      </p>
    </div>
  );
};

export default CookiesDemoPage;

'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

const STORAGE_ITEM_KEYS = ['session', 'locale', 'consentChoice', 'funnelId', 'vercel'] as const;

const CookiesDemoContent: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
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
        <li>{t('cookiesDemo.sections.types.items.functional')}</li>
        <li>{t('cookiesDemo.sections.types.items.analytics')}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('cookiesDemo.sections.specificStorage.title')}
      </h2>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">{t('cookiesDemo.sections.specificStorage.columns.name')}</th>
              <th className="text-left px-3 py-2 font-semibold">{t('cookiesDemo.sections.specificStorage.columns.type')}</th>
              <th className="text-left px-3 py-2 font-semibold">{t('cookiesDemo.sections.specificStorage.columns.purpose')}</th>
              <th className="text-left px-3 py-2 font-semibold">{t('cookiesDemo.sections.specificStorage.columns.duration')}</th>
              <th className="text-left px-3 py-2 font-semibold">{t('cookiesDemo.sections.specificStorage.columns.consent')}</th>
            </tr>
          </thead>
          <tbody>
            {STORAGE_ITEM_KEYS.map((key) => (
              <tr key={key} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-xs">{t(`cookiesDemo.sections.specificStorage.items.${key}.name`)}</td>
                <td className="px-3 py-2">{t(`cookiesDemo.sections.specificStorage.items.${key}.type`)}</td>
                <td className="px-3 py-2 text-gray-600">{t(`cookiesDemo.sections.specificStorage.items.${key}.purpose`)}</td>
                <td className="px-3 py-2 text-gray-600">{t(`cookiesDemo.sections.specificStorage.items.${key}.duration`)}</td>
                <td className="px-3 py-2 text-gray-600">{t(`cookiesDemo.sections.specificStorage.items.${key}.consent`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          href="mailto:privacy@hrinno.hu"
          className="text-blue-600 underline hover:text-blue-800"
        >
          privacy@hrinno.hu
        </a>
      </p>

      <p className="text-sm text-gray-500 mt-8">
        {t('cookiesDemo.lastUpdated')}
      </p>
    </div>
  );
};

export default CookiesDemoContent;

'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

const PrivacyDemoPage: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">{t('privacyDemo.title')}</h1>

      <DataControllerInfo />

      <p className="mb-4">{t('privacyDemo.intro')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.dataCollected.title')}
      </h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>{t('privacyDemo.sections.dataCollected.items.0')}</li>
        <li>{t('privacyDemo.sections.dataCollected.items.1')}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.purpose.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.purpose.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.storage.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.storage.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.aiProcessing.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.aiProcessing.text')}</p>

      <ThirdPartyServices />

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.userRights.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.userRights.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.contact.title')}
      </h2>
      <p className="mb-2">{t('privacyDemo.sections.contact.text')}</p>

      <a
        href="mailto:privacy@innohr.hu"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {t('privacyDemo.sections.contact.email')}
      </a>

      <p className="text-sm text-gray-500 mt-8">
        {t('privacyDemo.lastUpdated')}
      </p>
    </div>
  );
};

const ThirdPartyServices = () => {
  const { t } = useLocale();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-3">
        {t('privacyDemo.sections.thirdParty.title')}
      </h2>
      <div className="space-y-3">
        {['supabase', 'openai', 'vercel', 'stripe'].map((key) => (
          <div
            key={key}
            className={`border-l-4 pl-4 ${t(
              `privacyDemo.sections.thirdParty.items.${key}.color`
            )}`}
          >
            <h3 className="font-semibold">
              {t(`privacyDemo.sections.thirdParty.items.${key}.name`)}
            </h3>
            <p className="text-sm text-gray-600">
              {t(`privacyDemo.sections.thirdParty.items.${key}.desc`)} <br />
              <a
                href={t(`privacyDemo.sections.thirdParty.items.${key}.linkHref`)}
                className="text-blue-600 underline"
              >
                {t(`privacyDemo.sections.thirdParty.items.${key}.linkText`)}
              </a>
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4 bg-yellow-50 p-3 rounded">
        ⚠️ <strong>{t('privacyDemo.sections.thirdParty.noticeTitle')}</strong>{' '}
        {t('privacyDemo.sections.thirdParty.noticeText')}
      </p>
    </div>
  );
};

const DataControllerInfo = () => {
  const { t } = useLocale();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-2">
        {t('privacyDemo.sections.dataController.title')}
      </h3>
      <p className="text-sm text-blue-800">
        <strong>{t('privacyDemo.sections.dataController.nameLabel')}</strong>{' '}
        {t('privacyDemo.sections.dataController.name')} <br />
        <strong>{t('privacyDemo.sections.dataController.emailLabel')}</strong>{' '}
        {t('privacyDemo.sections.dataController.email')} <br />
        <strong>{t('privacyDemo.sections.dataController.addressLabel')}</strong>{' '}
        {t('privacyDemo.sections.dataController.address')} <br />
        <strong>
          {t('privacyDemo.sections.dataController.dpoLabel')}
        </strong>{' '}
        {t('privacyDemo.sections.dataController.dpo')}
      </p>
    </div>
  );
};

export default PrivacyDemoPage;

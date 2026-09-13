'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

export default function ImpressumDemoContent() {
  const { t } = useLocale();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">{t('impressumDemo.title')}</h1>
      <p className="mb-4">{t('impressumDemo.intro')}</p>

      <ul className="space-y-2 mb-6">
        <li><strong>{t('impressumDemo.fields.operator')}:</strong> Saussez Grégory</li>
        <li><strong>{t('impressumDemo.fields.legalForm')}:</strong> {t('impressumDemo.values.legalForm')}</li>
        <li><strong>{t('impressumDemo.fields.registrationNumber')}:</strong> {t('impressumDemo.values.registrationNumber')}</li>
        <li><strong>{t('impressumDemo.fields.taxNumber')}:</strong> {t('impressumDemo.values.taxNumber')}</li>
        <li><strong>{t('impressumDemo.fields.address')}:</strong> {t('impressumDemo.values.address')}</li>
        <li><strong>{t('impressumDemo.fields.email')}:</strong> <a href="mailto:privacy@hrinno.hu" className="underline text-blue-600">privacy@hrinno.hu</a></li>
        <li><strong>{t('impressumDemo.fields.website')}:</strong> https://www.hrinno.hu</li>
        <li><strong>{t('impressumDemo.fields.hosting')}:</strong> Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
      </ul>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('impressumDemo.sections.liability.title')}</h2>
        <p>{t('impressumDemo.sections.liability.text')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('impressumDemo.sections.copyright.title')}</h2>
        <p>{t('impressumDemo.sections.copyright.text')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('impressumDemo.sections.dataProtection.title')}</h2>
        <p>{t('impressumDemo.sections.dataProtection.text')}</p>
      </section>

      <p className="text-sm text-gray-500 mt-8">{t('impressumDemo.lastUpdated')}</p>
    </main>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'i18n/LocaleProvider';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const { t } = useLocale();
  const pathname = usePathname();

  // Extract the job slug if the current path matches /jobs/[slug]/*
  const match = pathname.match(/^\/jobs\/([^/]+)/);
  const jobSlug = match ? match[1] : null;

  // Helper to generate the proper path
  const makePath = (subpath: string) =>
    jobSlug ? `/jobs/${jobSlug}/${subpath}` : `/${subpath}`;

  return (
    <footer className="text-center text-sm text-gray-500 mt-8 py-6 border-t border-gray-200">
      <p>© {new Date().getFullYear()} HRInno – {t('footer.operatedBy')}</p>

      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        <Link href={makePath('privacy')} className="underline hover:text-blue-600">
          {t('footer.privacyLink')}
        </Link>
        <a
          href="https://www.hrinno.hu/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          {t('footer.termsLink')}
        </a>
        <Link href={makePath('cookies')} className="underline hover:text-blue-600">
          {t('footer.cookiesLink')}
        </Link>
        <a
          href="https://www.hrinno.hu/legal-notice"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          {t('footer.impressumLink')}
        </a>
      </div>

      <p className="mt-2">
        {t('footer.contact')}{' '}
        <a
          href="mailto:info@hrinno.hu"
          className="underline hover:text-blue-600"
        >
          info@hrinno.hu
        </a>
      </p>

      <p className="mt-2 text-xs">{t('footer.aiDisclaimer')}</p>
    </footer>
  );
};

export default Footer;

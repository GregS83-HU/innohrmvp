'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { X, Check } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner only if no previous choice
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-fade-in">
      <div className="text-sm text-gray-700 leading-snug">
        <strong className="block mb-1">{t('cookies.title')}</strong>
        <p className="text-xs text-gray-600">{t('cookies.text')}</p>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
        <button
          onClick={declineCookies}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          {t('cookies.reject')}
        </button>
        <button
          onClick={acceptCookies}
          className="px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          {t('cookies.accept')}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;

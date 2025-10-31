'use client';

import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { AlertTriangle, X } from 'lucide-react';

export default function DemoWarningBanner() {
  const [visible, setVisible] = useState(true);
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>{t('demoBanner.title')}</strong>{' '}
            {t('demoBanner.text')}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-yellow-600 hover:text-yellow-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

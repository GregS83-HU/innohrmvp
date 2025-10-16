'use client';

import { useLocale } from '../src/i18n/LocaleProvider';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
          locale === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('hu')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
          locale === 'hu'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        HU
      </button>
    </div>
  );
}
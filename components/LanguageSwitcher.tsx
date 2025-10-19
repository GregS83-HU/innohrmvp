'use client';

import { useLocale } from '../src/i18n/LocaleProvider';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }) {
  const { locale, setLocale } = useLocale();

  // Compact mobile icon version
  if (compact) {
    return (
      <button
        onClick={() => setLocale(locale === 'en' ? 'hu' : 'en')}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  // Full version (desktop + mobile menu)
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

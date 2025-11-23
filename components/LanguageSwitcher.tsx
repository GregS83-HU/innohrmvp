'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLocale } from '../src/i18n/LocaleProvider';
import { locales } from '../src/i18n/config';

type Props = {
  compact?: boolean; // pour la version mobile
};

const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  hu: '🇭🇺',
  fr: '🇫🇷',
};

const LanguageSwitcher: React.FC<Props> = ({ compact = false }) => {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  // Version mobile : compact = true
  if (compact) {
    return (
      <button
        onClick={() => {
          // cycle entre toutes les langues
          const index = locales.indexOf(locale);
          const next = locales[(index + 1) % locales.length];
          setLocale(next);
        }}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  // Version desktop : full avec drapeaux
  return (
    <div className="flex items-center gap-2">
      {locales.map((code) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            locale === code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="text-lg">{FLAGS[code]}</span>
          <span>{code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

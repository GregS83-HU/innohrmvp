'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocale } from '../src/i18n/LocaleProvider';
import { locales } from '../src/i18n/config';

type Props = {
  compact?: boolean; // mobile version
};

const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  hu: '🇭🇺',
  fr: '🇫🇷',
};

const LanguageSwitcher: React.FC<Props> = ({ compact = false }) => {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile/compact version: cycle languages
  if (compact) {
    return (
      <button
        onClick={() => {
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

  // Desktop/full version: dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <span className="text-lg">{FLAGS[locale]}</span>
        <span>{locale.toUpperCase()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
          {locales.map((code) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                locale === code
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span className="text-lg">{FLAGS[code]}</span>
              <span>{code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

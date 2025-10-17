'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, LOCALE_COOKIE, locales } from './config';

// Define type for nested messages recursively
type Messages = {
  [key: string]: string | Messages;
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Typed translation function
function createTranslator(locale: Locale, messages: Messages) {
  return (key: string, vars?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: string | Messages = messages;

    // Traverse object by dot-separated keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if not found
      }
    }

    // If value found and is a string, optionally interpolate {{placeholders}}
    if (typeof value === 'string') {
      if (vars) {
        return value.replace(/\{\{(.*?)\}\}/g, (_, v) => {
          const key = v.trim();
          return vars[key] !== undefined ? String(vars[key]) : '';
        });
      }
      return value;
    }

    return key;
  };
}

interface LocaleProviderProps {
  children: ReactNode;
  messages: Record<Locale, Messages>;
}

export function LocaleProvider({ children, messages }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Try to get locale from cookie first
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LOCALE_COOKIE}=`))
      ?.split('=')[1] as Locale | undefined;

    // Fallback to localStorage
    const storedLocale = cookieLocale || (localStorage.getItem(LOCALE_COOKIE) as Locale | null);

    if (storedLocale && locales.includes(storedLocale)) {
      setLocaleState(storedLocale);
    } else {
      // Detect from browser
      const browserLocale = navigator.language.split('-')[0] as Locale;
      if (locales.includes(browserLocale)) {
        setLocaleState(browserLocale);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);

    // Save to cookie (expires in 1 year)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; expires=${expiryDate.toUTCString()}`;

    // Also save to localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_COOKIE, newLocale);
    }
  };

  const t = createTranslator(locale, messages[locale] || messages[defaultLocale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

// Hook to use locale context
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

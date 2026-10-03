  'use client';

  import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
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
    const [, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);

      // Try to get locale from cookie first
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${LOCALE_COOKIE}=`))
        ?.split('=')[1] as Locale | undefined;

      // Fallback to localStorage
      const storedLocale = cookieLocale || (localStorage.getItem(LOCALE_COOKIE) as Locale | null);

      // No previously-saved choice falls back to defaultLocale (Hungarian) -
      // deliberately NOT auto-detected from navigator.language. The
      // marketing site (www.hrinno.hu) always defaults to Hungarian
      // regardless of browser language, and this app has no way to read a
      // language choice made there (different subdomain, and that site
      // doesn't persist its own choice to a cookie or localStorage either -
      // it's in-memory only). Matching its default, rather than guessing
      // from the browser, keeps a visitor's language consistent across the
      // two sites instead of an app.hrinno.hu page suddenly switching to
      // whatever language their OS happens to be set to.
      if (storedLocale && locales.includes(storedLocale)) {
        setLocaleState(storedLocale);
      }
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
      setLocaleState(newLocale);

      // Save to cookie (expires in 1 year)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; expires=${expiryDate.toUTCString()}`;

      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_COOKIE, newLocale);
      }
    }, []);

    // Memoized so `t` and the context value keep the same identity until the
    // locale actually changes - consumers list `t` in hook dependency arrays,
    // and a fresh translator on every render would re-run those effects.
    const t = useMemo(
      () => createTranslator(locale, messages[locale] || messages[defaultLocale]),
      [locale, messages]
    );
    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return (
      <LocaleContext.Provider value={value}>
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

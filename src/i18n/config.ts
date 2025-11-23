export const locales = ['en', 'hu', 'fr'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

// Cookie name for storing user's locale preference
export const LOCALE_COOKIE = 'NEXT_LOCALE';
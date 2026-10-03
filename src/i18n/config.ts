export const locales = ['en', 'hu', 'fr'] as const;
// Matches the marketing site (www.hrinno.hu), which always defaults to
// Hungarian rather than auto-detecting the visitor's browser language - see
// LocaleProvider, which no longer falls back to navigator.language for the
// same reason (a visitor arriving from the Hungarian marketing site with a
// non-Hungarian browser locale was otherwise landing on a different
// language than the page they just came from).
export const defaultLocale = 'hu' as const;
export type Locale = (typeof locales)[number];

// Cookie name for storing user's locale preference
export const LOCALE_COOKIE = 'NEXT_LOCALE';
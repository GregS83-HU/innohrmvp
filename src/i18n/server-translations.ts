// lib/server-translations.ts
import en from '../../messages/en.json'
import hu from '../../messages/hu.json'

type Translations = typeof en

const translations: Record<string, Translations> = {
  en,
  hu,
}

export function getServerTranslation(locale: string = 'en') {
  const messages = translations[locale] || translations.en
  
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }
    
    // ⭐ IMPORTANT: Replace {{param}} placeholders with actual values
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() || ''
      })
    }
    
    return value
  }
}
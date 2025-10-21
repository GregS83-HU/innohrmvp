// lib/server-translations.ts
import en from '../../messages/en.json'
import hu from '../../messages/hu.json'

type Translations = typeof en

const translations: Record<string, Translations> = {
  en,
  hu,
}

interface TranslationObject {
  [key: string]: TranslationValue
}

type TranslationValue = string | TranslationObject

export function getServerTranslation(locale: string = 'en') {
  const messages = translations[locale] || translations.en
  
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.')
    let value: TranslationValue = messages as TranslationValue
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[k]
      } else {
        value = undefined as unknown as TranslationValue
      }
      
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
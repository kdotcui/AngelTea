export type Locale = 'en' | 'zh' | 'es';

export interface Translations {
  [key: string]: any;
}

// Import translations directly
import enTranslations from '../locales/en.json';
import zhTranslations from '../locales/zh.json';
import esTranslations from '../locales/es.json';

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  zh: zhTranslations,
  es: esTranslations
};

export function getTranslations(locale: Locale = 'en'): Translations {
  return translations[locale] || translations.en;
}

export function t(key: string, locale: Locale = 'en', fallback?: string): string {
  const keys = key.split('.');
  let value: any = getTranslations(locale);
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found in current locale
      if (locale !== 'en') {
        return t(key, 'en', fallback);
      }
      return fallback || key;
    }
  }
  
  return typeof value === 'string' ? value : (fallback || key);
}

// Helper function to get nested translation values
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Client-side hook for React components
export function useTranslations(locale: Locale = 'en') {
  return {
    t: (key: string, fallback?: string) => t(key, locale, fallback),
    locale
  };
}

// Server-side function for Next.js
export function getServerTranslations(locale: Locale = 'en') {
  return {
    t: (key: string, fallback?: string) => t(key, locale, fallback),
    locale
  };
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, useTranslations } from './i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('angel-tea-locale') as Locale;
    if (savedLocale && ['en', 'zh', 'es'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // Save language preference to localStorage
  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('angel-tea-locale', newLocale);
  };

  const { t } = useTranslations(locale);

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

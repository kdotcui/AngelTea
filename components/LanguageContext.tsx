'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LanguageContextType = {
  language: 'en' | 'zh' | 'es';
  setLanguage: (lang: 'en' | 'zh' | 'es') => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'zh' | 'es'>('en');
  const [messages, setMessages] = useState<any>({});

  useEffect(() => {
    // Load saved language from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const allowedLanguages = ['en', 'zh', 'es'];
      const storedLanguage = localStorage.getItem('language');
      const savedLanguage = allowedLanguages.includes(storedLanguage as string)
        ? (storedLanguage as 'en' | 'zh' | 'es')
        : 'en';
      setLanguageState(savedLanguage);
      loadMessages(savedLanguage);
    }
  }, []);

  const loadMessages = async (lang: 'en' | 'zh' | 'es') => {
    try {
      const msgs = await import(`../messages/${lang}.json`);
      setMessages(msgs.default);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const setLanguage = (lang: 'en' | 'zh' | 'es') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    loadMessages(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

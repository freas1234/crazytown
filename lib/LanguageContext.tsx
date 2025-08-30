'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useI18n } from './i18n';


interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translate: () => '',
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();

  const setLanguage = (lang: string) => {
    if (lang === 'en' || lang === 'ar') {
      setLocale(lang);
    }
  };

  const translate = (key: string, fallback?: string) => {
    return t(key, fallback);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: locale,
        setLanguage,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext); 
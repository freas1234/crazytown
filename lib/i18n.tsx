'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    dir: 'ltr' as const,
    isRTL: false
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl' as const,
    isRTL: true
  }
};

export type Language = keyof typeof LANGUAGES;
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  dir: Direction;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: () => '',
  isRTL: false,
  dir: 'ltr',
  languages: LANGUAGES
});

let translations: Record<Language, Record<string, any>> = {
  en: {},
  ar: {}
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [dir, setDir] = useState<Direction>('ltr');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const loadTranslations = async (lang: Language) => {
    try {
      if (!translations[lang] || Object.keys(translations[lang]).length === 0) {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
        translations[lang] = await response.json();
      }
      return translations[lang];
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      return {};
    }
  };
  
  useEffect(() => {
    const initializeLanguage = async () => {
      const storedLang = typeof window !== 'undefined' ? localStorage.getItem('language') as Language : null;
      
      let detectedLang: Language = 'en';
      if (storedLang && storedLang in LANGUAGES) {
        detectedLang = storedLang;
      } else if (typeof navigator !== 'undefined') {
        try {
          const browserLang = navigator.language.split('-')[0] as Language;
          if (browserLang in LANGUAGES) {
            detectedLang = browserLang;
          }
        } catch (e) {
          console.error('Error detecting browser language:', e);
        }
      }
      
      await loadTranslations(detectedLang);
      setLocaleState(detectedLang);
      setIsRTL(LANGUAGES[detectedLang].isRTL);
      setDir(LANGUAGES[detectedLang].dir);
      
      if (typeof document !== 'undefined') {
        document.documentElement.lang = detectedLang;
        document.documentElement.dir = LANGUAGES[detectedLang].dir;
        document.body.classList.toggle('rtl', LANGUAGES[detectedLang].isRTL);
        document.body.classList.toggle('ltr', !LANGUAGES[detectedLang].isRTL);
      }
      
      setIsLoaded(true);
    };
    
    initializeLanguage();
  }, []);
  
  const setLocale = async (lang: Language) => {
    if (!(lang in LANGUAGES)) return;
    
    await loadTranslations(lang);
    
    setLocaleState(lang);
    setIsRTL(LANGUAGES[lang].isRTL);
    setDir(LANGUAGES[lang].dir);
    
    localStorage.setItem('language', lang);
    
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = LANGUAGES[lang].dir;
      document.body.classList.toggle('rtl', LANGUAGES[lang].isRTL);
      document.body.classList.toggle('ltr', !LANGUAGES[lang].isRTL);
    }
    
    if (pathname) {
      router.refresh();
    }
  };
  
  const t = (key: string, fallback?: string): string => {
    if (!key) return fallback || '';
    
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      if (!value || typeof value !== 'object') return fallback || key;
      value = value[k];
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isRTL,
        dir,
        languages: LANGUAGES
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

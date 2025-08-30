'use client';

import { useI18n } from '../i18n';

export function useTranslation() {
  const { t, locale, setLocale, isRTL, dir, languages } = useI18n();
  
  return {
    t,
    locale,
    setLocale,
    isRTL,
    dir,
    languages
  };
} 
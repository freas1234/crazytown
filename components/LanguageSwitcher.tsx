'use client';

import { useState } from 'react';
import { useI18n, Language } from '../lib/i18n';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'minimal';
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'dropdown', 
  className 
}: LanguageSwitcherProps) {
  const { locale, setLocale, languages, isRTL } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLanguageChange = (lang: Language) => {
    setLocale(lang);
    setIsOpen(false);
  };
  
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center space-x-2 rtl:space-x-reverse", className)}>
        {Object.entries(languages).map(([code, langData]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={cn(
              "px-2 py-1 text-sm rounded-md transition-colors",
              locale === code 
                ? "bg-primary/20 text-primary font-medium" 
                : "text-gray-400 hover:text-white"
            )}
            aria-label={`Switch to ${langData.name}`}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }
  
  if (variant === 'buttons') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {Object.entries(languages).map(([code, langData]) => (
          <Button
            key={code}
            variant={locale === code ? "default" : "outline"}
            size="sm"
            onClick={() => handleLanguageChange(code as Language)}
            className={locale === code ? "" : "opacity-70"}
          >
            {langData.nativeName}
          </Button>
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn("relative", className)}>
      <button
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-md border",
          "bg-secondary/50 border-gray-800 text-white w-full",
          "hover:bg-secondary/80 transition-colors"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{languages[locale].nativeName}</span>
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={cn(
            "h-4 w-4 transition-transform", 
            isOpen ? "transform rotate-180" : ""
          )} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute mt-1 w-full rounded-md border border-gray-800",
            "bg-secondary/90 backdrop-blur-sm shadow-lg z-50",
            "animate-fade-in overflow-hidden",
            isRTL ? "right-0" : "left-0"
          )}
          role="listbox"
        >
          {Object.entries(languages).map(([code, langData]) => (
            <button
              key={code}
              className={cn(
                "w-full text-left px-3 py-2 flex items-center justify-between",
                locale === code 
                  ? "bg-primary/20 text-primary" 
                  : "text-white hover:bg-gray-800/50 hover:text-primary",
                "transition-colors"
              )}
              onClick={() => handleLanguageChange(code as Language)}
              aria-selected={locale === code}
              role="option"
            >
              <span>{langData.nativeName}</span>
              {locale === code && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useTranslation } from '../lib/hooks/useTranslation';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface MaintenanceModeProps {
  customTitle?: {
    en: string;
    ar: string;
  } | null;
  customMessage?: {
    en: string;
    ar: string;
  } | null;
}

export default function MaintenanceMode({
  customTitle,
  customMessage
}: MaintenanceModeProps) {
  const { user, isAdmin } = useAuth();
  const { locale, setLocale, isRTL } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState<{
    title: { en: string; ar: string };
    message: { en: string; ar: string };
  }>({
    title: {
      en: "Site Under Maintenance",
      ar: "الموقع تحت الصيانة"
    },
    message: {
      en: "We're currently performing scheduled maintenance. Please check back soon.",
      ar: "نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
    }
  });
  
  useEffect(() => {
    setMounted(true);
    
    // If custom content was provided via props, use it
    if (customTitle && customMessage) {
      setContent({
        title: customTitle,
        message: customMessage
      });
    } else {
      // Otherwise fetch from API
      fetchMaintenanceContent();
    }
  }, [customTitle, customMessage]);
  
  const fetchMaintenanceContent = async () => {
    try {
      console.log('MaintenanceMode: Fetching content from API');
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContent({
            title: {
              en: data.content.en?.title || content.title.en,
              ar: data.content.ar?.title || content.title.ar
            },
            message: {
              en: data.content.en?.message || content.message.en,
              ar: data.content.ar?.message || content.message.ar
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance content:', error);
    }
  };
  
  const defaultContent = {
    login: {
      en: "Login",
      ar: "تسجيل الدخول"
    },
    adminPanel: {
      en: "Admin Panel",
      ar: "لوحة الإدارة"
    }
  };
  
  const title = content.title[locale as keyof typeof content.title] || "Site Under Maintenance";
  const message = content.message[locale as keyof typeof content.message] || "We're currently performing scheduled maintenance. Please check back soon.";
  
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="animated-bg opacity-30">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
      
      <div className="max-w-md w-full p-8 bg-gray-900/70 backdrop-blur-md rounded-lg border border-primary/20 shadow-lg z-10">
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center">
            <span className="text-primary font-display text-3xl font-bold animate-text-flicker">CRAZY</span>
            <span className="text-white font-display text-3xl font-bold">TOWN</span>
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
        <p className="text-gray-300 text-center mb-8">{message}</p>
        
        <div className="flex flex-col space-y-4">
          <Link 
            href="/login" 
            className="w-full py-2 px-4 bg-primary hover:bg-primary/80 text-white font-medium rounded-md text-center transition-colors"
          >
            {defaultContent.login[locale as keyof typeof defaultContent.login]}
          </Link>
          
          {isAdmin && (
            <Link 
              href="/admin" 
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md text-center transition-colors"
            >
              {defaultContent.adminPanel[locale as keyof typeof defaultContent.adminPanel]}
            </Link>
          )}
        </div>
        
        <div className="flex justify-center mt-6 space-x-2 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocale('en')} 
            className={locale === 'en' ? 'border-primary text-primary' : 'border-gray-600 text-gray-400'}
          >
            English
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocale('ar')} 
            className={locale === 'ar' ? 'border-primary text-primary' : 'border-gray-600 text-gray-400'}
          >
            العربية
          </Button>
        </div>
      </div>
      
      <div className="mt-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Wexon Store
      </div>
    </div>
  );
} 
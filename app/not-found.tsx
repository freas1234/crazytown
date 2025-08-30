'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../lib/hooks/useTranslation';
import { usePageContent } from '../lib/usePageContent';

// Define default content for the not found page
const defaultNotFoundContent = {
  en: {
    title: "Page Not Found",
    subtitle: "404",
    message: "The page you're looking for doesn't exist or has been moved to another location.",
    backHome: "Go Home"
  },
  ar: {
    title: "الصفحة غير موجودة",
    subtitle: "404",
    message: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.",
    backHome: "العودة للرئيسية"
  }
};

export default function NotFound() {
  const { locale, dir } = useTranslation();
  const { localizedContent, isLoading } = usePageContent('notFound');
  
  // Use default content if no content is loaded from the API
  const content = localizedContent || defaultNotFoundContent[locale];
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="loading-spinner"></div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      <Header />
      <main className="flex-grow">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="text-8xl md:text-9xl font-display font-bold text-primary/20 mb-4">
                  {content?.subtitle || "404"}
                </div>
                <div className="w-32 h-1 bg-primary mx-auto mb-6"></div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 cyberpunk-border inline-block">
                <span className="text-white animate-text-flicker">{content?.title || "Page Not Found"}</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto">
                {content?.message || "The page you're looking for doesn't exist or has been moved to another location."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="group relative">
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></span>
                  <button className="relative px-8 py-3 bg-secondary rounded-lg border border-primary text-primary font-bold group-hover:text-white transition-colors">
                    {content?.backHome || "Go Home"}
                    <span className="absolute inset-0 w-full h-full bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </button>
                </Link>
              </div>
              
              <div className="mt-12 text-gray-500 text-sm">
                Error Code: 404 | {content?.title || "Page Not Found"}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
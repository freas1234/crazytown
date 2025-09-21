'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from '../lib/hooks/useTranslation';

export default function Hero() {
  const { t, locale } = useTranslation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const parallaxElements = document.querySelectorAll('.parallax-element');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;

      parallaxElements.forEach((element) => {
        const el = element as HTMLElement;
        const speed = parseFloat(el.dataset.speed || '0.01');
        const offsetX = (mouseX - 0.5) * speed * 100;
        const offsetY = (mouseY - 0.5) * speed * 100;
        
        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden parallax-bg">
      <div className="absolute inset-0 bg-cyber-grid opacity-5"></div>
      
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div 
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow" 
        style={{ animationDelay: '2s' }}
      ></div>
      
      <div className="absolute top-10 left-10 w-20 h-1 bg-primary opacity-30 parallax-element" data-speed="0.03"></div>
      <div className="absolute bottom-10 right-10 w-20 h-1 bg-primary opacity-30 parallax-element" data-speed="0.02"></div>
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-primary opacity-50 rounded-full animate-pulse-slow parallax-element" data-speed="0.05"></div>
      <div 
        className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-primary opacity-50 rounded-full animate-pulse-slow parallax-element" 
        data-speed="0.04" 
        style={{ animationDelay: '1s' }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="mb-6 inline-block relative">
          <span className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-lg"></span>
          <h1 className="relative text-4xl md:text-6xl font-display font-bold mb-2 cyberpunk-border">
            <span className="text-white animate-text-flicker">{t('hero.title', 'Welcome to  Wexon Store')}</span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl">{t('hero.subtitle', 'The ultimate gaming experience')}</p>
        
        <Link href="/store" className="group relative">
          <span className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></span>
          <button className="relative px-8 py-3 bg-secondary rounded-lg border border-primary text-primary font-bold group-hover:text-white transition-colors">
            {t('hero.cta', 'Explore Store')}
            <span className="absolute inset-0 w-full h-full bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </Link>
              
        <div 
          className="absolute top-1/3 left-10 text-primary opacity-30 text-xs font-mono animate-float parallax-element" 
          data-speed="0.08" 
          style={{ animationDelay: '0.5s' }}
        >
          &lt;FiveM Server/&gt;
        </div>
        <div 
          className="absolute bottom-1/3 right-10 text-primary opacity-30 text-xs font-mono animate-float parallax-element" 
          data-speed="0.06" 
          style={{ animationDelay: '1.5s' }}
        >
          {t('hero.join_now', '// Join Now')}
        </div>
      </div>
    </section>
  );
} 
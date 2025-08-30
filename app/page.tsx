'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '../lib/hooks/useTranslation';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedCards from '../components/FeaturedCards';
import Footer from '../components/Footer';

export default function Home() {
  const { locale } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <FeaturedCards />
      </main>
      <Footer />
    </div>
  );
} 
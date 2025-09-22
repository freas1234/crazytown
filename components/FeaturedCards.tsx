'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../lib/hooks/useTranslation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { AspectRatio } from './ui/aspect-ratio';
import { Skeleton } from './ui/skeleton';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';

interface FeaturedCard {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  link: string;
}

interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  badgeType?: 'default' | 'secondary' | 'destructive';
  badgeColor?: string;
  cards: FeaturedCard[];
}

interface FeaturedCardsData {
  categories: Category[];
  // Legacy format
  newItems: FeaturedCard[];
  bestSelling: FeaturedCard[];
  discounts: FeaturedCard[];
}

export default function FeaturedCards() {
  const { t, locale, isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [featuredCards, setFeaturedCards] = useState<FeaturedCardsData>({
    categories: [],
    newItems: [],
    bestSelling: [],
    discounts: []
  });

  useEffect(() => {
    const fetchFeaturedCards = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/content/featured-cards');
        if (response.ok) {
          const data = await response.json();
          
          // Handle both legacy format and new format with categories
          const safeData = {
            categories: [],
            newItems: [],
            bestSelling: [],
            discounts: [],
            ...data.featuredCards
          };

          // If we don't have any categories yet, create them from the legacy format
          if (safeData.categories.length === 0 && 
             (safeData.newItems.length > 0 || 
              safeData.bestSelling.length > 0 || 
              safeData.discounts.length > 0)) {
            safeData.categories = [
              {
                id: 'newItems',
                name: { en: 'Our New', ar: 'الجديد لدينا' },
                badgeType: 'default',
                cards: safeData.newItems || []
              },
              {
                id: 'bestSelling',
                name: { en: 'Best Selling', ar: 'الأكثر مبيعًا' },
                badgeType: 'secondary',
                cards: safeData.bestSelling || []
              },
              {
                id: 'discounts',
                name: { en: 'Our Discounts', ar: 'خصوماتنا' },
                badgeType: 'destructive',
                cards: safeData.discounts || []
              }
            ];
          }
          
          setFeaturedCards(safeData);
          
          // Set active tab to the first category if available
          if (safeData.categories.length > 0) {
            setActiveTab(safeData.categories[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching featured cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCards();
  }, []);

    useEffect(() => {
    const handleUserActivity = () => {
      setLastInteraction(Date.now());
    };

    const events = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    const intervalId = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      
      if (timeSinceLastInteraction >= 5000 && featuredCards.categories.length > 1) {
        const currentIndex = featuredCards.categories.findIndex(cat => cat.id === activeTab);
        const nextIndex = (currentIndex + 1) % featuredCards.categories.length;
        const nextTab = featuredCards.categories[nextIndex];
        
        if (nextTab) {
          setActiveTab(nextTab.id);
          setLastInteraction(Date.now());
        }
      }
    }, 1000);
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [activeTab, featuredCards.categories, lastInteraction]);

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <Card key={`skeleton-${index}`} className="overflow-hidden bg-card/30 backdrop-blur-sm border-gray-800/50">
        <div className="relative">
          <Skeleton className="h-48 w-full rounded-b-none" />
        </div>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-8 w-28" />
        </CardFooter>
      </Card>
    ));
  };

  const getBadgeForCategory = (categoryId: string, badgeType?: string) => {
    switch (badgeType || categoryId) {
      case 'secondary':
      case 'bestSelling':
        return (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-amber-500/90 text-white backdrop-blur-sm"
          >
            {t('featured_cards.best_seller', 'Best Seller')}
          </Badge>
        );
      case 'destructive':
      case 'discounts':
        return (
          <Badge 
            variant="destructive" 
            className="absolute top-2 right-2 backdrop-blur-sm"
          >
            {t('featured_cards.discount', 'Discount')}
          </Badge>
        );
      case 'default':
      case 'newItems':
      default:
        return (
          <Badge 
            variant="default" 
            className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm"
          >
            {t('featured_cards.new', 'New')}
          </Badge>
        );
    }
  };

  const renderCards = (cards: FeaturedCard[], categoryId: string, badgeType?: string) => {
    if (loading) {
      return renderSkeletons();
    }

    if (!cards || cards.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
          <div className="text-gray-400 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto mb-4 opacity-50" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
            <p className="text-lg">{t('featured_cards.no_items', 'No items to display')}</p>
          </div>
        </div>
      );
    }

    return cards.map((card, index) => (
      <Card 
        key={card.id || index} 
        className="group overflow-hidden bg-card/30 backdrop-blur-sm border-gray-800/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
        style={{
          animationDelay: `${index * 150}ms`,
          animationDuration: '600ms',
          animationFillMode: 'both'
        }}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <AspectRatio ratio={16/9}>
            <Image 
              src={card.imageUrl || '/placeholder-product.jpg'} 
              alt={card.title} 
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
            />
          </AspectRatio>
          
          {getBadgeForCategory(categoryId, badgeType)}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
        </div>
        
        <CardHeader className="relative z-10 pb-3 px-6 pt-6">
          <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-all duration-300 mb-3">
            {card.title}
          </CardTitle>
          <CardDescription className="text-gray-300 line-clamp-2 leading-relaxed">
            {card.description}
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="pt-2 pb-6 px-6">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link 
                href={card.link} 
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                <span className="text-sm font-medium">
                  {t('common.learn_more', 'Learn More')}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ml-1 ${isRTL ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 overflow-hidden">
              <div className="relative h-32">
                <Image 
                  src={card.imageUrl || '/placeholder-product.jpg'} 
                  alt={card.title} 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="p-4">
                <h4 className="font-bold mb-1">{card.title}</h4>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardFooter>
      </Card>
    ));
  };


  if (featuredCards.categories.length === 0 && 
     !featuredCards.newItems.length && 
     !featuredCards.bestSelling.length && 
     !featuredCards.discounts.length) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-80 z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            {t('featured_cards.title', 'Featured Content')}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('featured_cards.subtitle', 'Discover what makes our server special')}
          </p>
        </div>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setLastInteraction(Date.now()); // Reset timer when user manually changes tab
        }} className="w-full">
          <div className="flex justify-center mb-10 overflow-x-auto pb-2">
            <TabsList className="flex space-x-2 bg-transparent p-0">
              {featuredCards.categories.map((category) => (
                <TabsTrigger 
                  key={category.id}
                  value={category.id}
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-2 whitespace-nowrap transition-all duration-300 ease-in-out bg-background/30 backdrop-blur-sm border border-gray-800/50"
                >
                  {locale === 'ar' ? category.name.ar : category.name.en}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {featuredCards.categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 px-4 md:px-8">
                {renderCards(category.cards, category.id, category.badgeType)}
              </div>
            </TabsContent>
          ))}
        </Tabs>

      </div>
    </section>
  );
}
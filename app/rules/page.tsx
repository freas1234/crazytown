'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Rule, RuleCategory } from '../models/Rule';
import { useTranslation } from '../../lib/hooks/useTranslation';

interface RuleCategoryWithRules {
  category: RuleCategory;
  rules: Rule[];
}

export default function RulesPage() {
  const router = useRouter();
  const { t, locale, isRTL } = useTranslation();
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    const fetchRulesData = async () => {
      try {
        setLoading(true);
        
        const categoriesResponse = await fetch('/api/rules/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch rule categories');
        }
        const categoriesData = await categoriesResponse.json();
        const activeCategories = categoriesData.categories.filter((cat: RuleCategory) => cat.active);
        setCategories(activeCategories);
        
        if (activeCategories.length > 0) {
          setActiveCategory(activeCategories[0].id);
        }
        
        const rulesResponse = await fetch('/api/rules');
        if (!rulesResponse.ok) {
          throw new Error('Failed to fetch rules');
        }
        const rulesData = await rulesResponse.json();
        const activeRules = rulesData.rules.filter((rule: Rule) => rule.active);
        setRules(activeRules);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rules data:', err);
        setError(t('rules.error_loading', 'Failed to load rules. Please try again later.'));
        setLoading(false);
      }
    };
    
    fetchRulesData();
  }, [t]);

  const toggleRule = (ruleId: string) => {
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    } else {
      setExpandedRule(ruleId);
    }
  };

  const getRulesByCategory = (categoryId: string) => {
    return rules
      .filter(rule => rule.category === categoryId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
            <Header />
        <main className="flex-grow">
          <section className="relative py-16 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 cyberpunk-border inline-block">
                  {t('rules.title_server')} <span className="text-primary animate-text-flicker">{t('rules.title_rules')}</span>
                </h1>
                <div className="mt-8 flex justify-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-4 w-48 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <section className="relative py-16 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 cyberpunk-border inline-block">
                  {t('rules.title_server')} <span className="text-primary animate-text-flicker">{t('rules.title_rules')}</span>
                </h1>
                <div className="mt-8 p-4 bg-red-500/20 border border-red-500/40 rounded-lg max-w-md mx-auto">
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 cyberpunk-border inline-block">
                {t('rules.title_server')} <span className="text-primary animate-text-flicker">{t('rules.title_rules')}</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('rules.description', 'Please familiarize yourself with our server rules to ensure a fair and enjoyable experience for everyone')}
              </p>
            </div>
            
            {categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-secondary/80 border border-gray-800 text-gray-300 hover:border-primary/50'
                    }`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {locale === 'en' ? category.name.en : category.name.ar}
                  </button>
                ))}
              </div>
            )}
            
            <div className="max-w-4xl mx-auto">
              {activeCategory && getRulesByCategory(activeCategory).length > 0 ? (
                getRulesByCategory(activeCategory).map((rule) => (
                  <div 
                    key={rule.id} 
                    className="mb-4 game-card group cursor-pointer"
                    onClick={() => toggleRule(rule.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {locale === 'en' ? rule.title.en : rule.title.ar}
                      </h3>
                      <button className="text-primary">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-6 w-6 transition-transform ${expandedRule === rule.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {expandedRule === rule.id && (
                                           <div className="mt-4 pt-4 border-t border-gray-800 text-gray-300 whitespace-pre-line">
                        {locale === 'en' ? rule.description.en : rule.description.ar}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {t('rules.no_rules_found', 'No rules found for this category.')}
                  </p>
                </div>
              )}
            </div>
            
            <div className="max-w-4xl mx-auto mt-12 p-6 rounded-lg border border-primary/30 bg-secondary/50">
              <div className="flex items-start">
                <div className="mr-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('rules.acknowledgment_title', 'Rule Acknowledgment')}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {t('rules.acknowledgment_description', 'By joining our server, you acknowledge that you have read and agree to follow these rules. Failure to comply may result in warnings, temporary bans, or permanent removal from the server.')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('rules.subject_to_change', 'Rules are subject to change. Check back regularly for updates.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
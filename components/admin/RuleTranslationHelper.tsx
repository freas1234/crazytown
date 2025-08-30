'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useTranslation } from '../../lib/hooks/useTranslation';

interface RuleTranslation {
  id: string;
  category: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
}

export default function RuleTranslationHelper() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<RuleTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRule, setActiveRule] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules);
      } else {
        toast.error('Failed to load rules');
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Error loading rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/rules/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleUpdateRule = async (rule: RuleTranslation) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (response.ok) {
        toast.success('Rule translation updated successfully');
        fetchRules();
      } else {
        toast.error('Failed to update rule translation');
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Error updating rule translation');
    } finally {
      setSaving(false);
    }
  };

  const updateRuleField = (ruleId: string, field: string, language: 'en' | 'ar', value: string) => {
    setRules(prevRules => 
      prevRules.map(rule => {
        if (rule.id === ruleId) {
          if (field === 'title') {
            return {
              ...rule,
              title: {
                ...rule.title,
                [language]: value
              }
            };
          } else if (field === 'description') {
            return {
              ...rule,
              description: {
                ...rule.description,
                [language]: value
              }
            };
          }
        }
        return rule;
      })
    );
  };

  const filteredRules = rules.filter(rule => 
    !activeCategory || rule.category === activeCategory
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => setActiveCategory(category.id)}
            className={activeCategory === category.id ? "bg-primary hover:bg-primary/80" : ""}
          >
            {category.name.en}
          </Button>
        ))}
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          onClick={() => setActiveCategory(null)}
          className={activeCategory === null ? "bg-primary hover:bg-primary/80" : ""}
        >
          All Categories
        </Button>
      </div>

      {filteredRules.length === 0 ? (
        <Card className="bg-secondary/50 border-gray-800">
          <CardContent className="pt-6">
            <p className="text-center text-gray-400">No rules found in this category.</p>
          </CardContent>
        </Card>
      ) : (
        filteredRules.map(rule => (
          <Card 
            key={rule.id} 
            className={`bg-secondary/50 border-gray-800 ${activeRule === rule.id ? 'ring-1 ring-primary' : ''}`}
          >
            <CardHeader className="cursor-pointer" onClick={() => setActiveRule(activeRule === rule.id ? null : rule.id)}>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{rule.title.en}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform ${activeRule === rule.id ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </CardTitle>
            </CardHeader>
            
            {activeRule === rule.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">English Title</label>
                    <Input
                      value={rule.title.en}
                      onChange={(e) => updateRuleField(rule.id, 'title', 'en', e.target.value)}
                      className="bg-gray-900 border-gray-700"
                    />
                    <label className="text-sm font-medium text-gray-300">English Description</label>
                    <Textarea
                      value={rule.description.en}
                      onChange={(e) => updateRuleField(rule.id, 'description', 'en', e.target.value)}
                      className="bg-gray-900 border-gray-700 min-h-[150px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Arabic Title</label>
                    <Input
                      value={rule.title.ar}
                      onChange={(e) => updateRuleField(rule.id, 'title', 'ar', e.target.value)}
                      className="bg-gray-900 border-gray-700"
                      dir="rtl"
                    />
                    <label className="text-sm font-medium text-gray-300">Arabic Description</label>
                    <Textarea
                      value={rule.description.ar}
                      onChange={(e) => updateRuleField(rule.id, 'description', 'ar', e.target.value)}
                      className="bg-gray-900 border-gray-700 min-h-[150px]"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleUpdateRule(rule)}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/80"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Rule Translation'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
} 
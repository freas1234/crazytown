'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { toast } from 'sonner';
import TranslationHelper from '../../../../components/TranslationHelper';

interface RuleCategory {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
}

interface RuleFormData {
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  category: string;
  order: number;
  active: boolean;
}

export default function CreateRule() {
  const router = useRouter();
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('en');
  const [showTranslationHelper, setShowTranslationHelper] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<RuleFormData>({
    title: {
      en: '',
      ar: ''
    },
    description: {
      en: '',
      ar: ''
    },
    category: '',
    order: 0,
    active: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const categoriesResponse = await fetch('/api/admin/rules/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
        
        // Set default category if available
        if (categoriesData.categories.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: categoriesData.categories[0].id
          }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'category' || name === 'order') {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'order' ? parseInt(value) : value
      }));
    } else if (name === 'active') {
      setFormData(prev => ({
        ...prev,
        active: (e.target as HTMLInputElement).checked
      }));
    } else if (name.includes('.')) {
      const [field, lang] = name.split('.');
      if (field === 'title' || field === 'description') {
        setFormData(prev => ({
          ...prev,
          [field]: {
            ...prev[field as keyof typeof prev] as Record<string, string>,
            [lang]: value
          }
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.en.trim() || !formData.title.ar.trim()) {
      toast.error('Rule title is required in both languages');
      return;
    }
    
    if (!formData.description.en.trim() || !formData.description.ar.trim()) {
      toast.error('Rule description is required in both languages');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create rule');
      }
      
      toast.success('Rule created successfully');
      router.push('/admin/rules');
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create rule');
      setSaving(false);
    }
  };

  const handleApplyTranslation = (translatedText: string) => {
    if (activeTab === 'en') {
      // Translate from English to Arabic
      const field = document.activeElement?.id?.split('.')[0];
      if (field === 'title') {
        setFormData(prev => ({
          ...prev,
          title: {
            ...prev.title,
            ar: translatedText
          }
        }));
      } else if (field === 'description') {
        setFormData(prev => ({
          ...prev,
          description: {
            ...prev.description,
            ar: translatedText
          }
        }));
      }
    } else {
      // Translate from Arabic to English
      const field = document.activeElement?.id?.split('.')[0];
      if (field === 'title') {
        setFormData(prev => ({
          ...prev,
          title: {
            ...prev.title,
            en: translatedText
          }
        }));
      } else if (field === 'description') {
        setFormData(prev => ({
          ...prev,
          description: {
            ...prev.description,
            en: translatedText
          }
        }));
      }
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Create New Rule</span>
          </h1>
          <Button variant="outline" size="sm" asChild className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary w-full sm:w-auto">
            <Link href="/admin/rules">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Rules
            </Link>
          </Button>
        </div>
        
        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Create New Rule</CardTitle>
            <CardDescription className="text-gray-400">Add a new server rule</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-24 w-full bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
                <Skeleton className="h-10 w-1/3 bg-gray-700" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4 bg-gray-700 grid w-full grid-cols-2">
                    <TabsTrigger value="en" className="text-sm">English</TabsTrigger>
                    <TabsTrigger value="ar" className="text-sm">Arabic</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title.en">Rule Title (English)</Label>
                      <Input 
                        id="title.en" 
                        name="title.en"
                        placeholder="Enter rule title in English" 
                        value={formData.title.en}
                        onChange={handleInputChange}
                        className="bg-gray-900/50 border-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description.en">Rule Description (English)</Label>
                      <Textarea 
                        id="description.en" 
                        name="description.en"
                        placeholder="Enter rule description in English (Use Shift + Enter for new lines)" 
                        value={formData.description.en}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                          }
                        }}
                        className="bg-gray-900/50 border-gray-700 min-h-[150px] resize-y"
                        required
                      />
                      <p className="text-xs text-gray-400">Press Shift + Enter for new lines</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ar" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title.ar">Rule Title (Arabic)</Label>
                      <Input 
                        id="title.ar" 
                        name="title.ar"
                        placeholder="Enter rule title in Arabic" 
                        value={formData.title.ar}
                        onChange={handleInputChange}
                        className="bg-gray-900/50 border-gray-700 text-right"
                        dir="rtl"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description.ar">Rule Description (Arabic)</Label>
                      <Textarea 
                        id="description.ar" 
                        name="description.ar"
                        placeholder="Enter rule description in Arabic (Use Shift + Enter for new lines)" 
                        value={formData.description.ar}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                          }
                        }}
                        className="bg-gray-900/50 border-gray-700 min-h-[150px] text-right resize-y"
                        dir="rtl"
                        required
                      />
                      <p className="text-xs text-gray-400 text-right">اضغط Shift + Enter للانتقال لسطر جديد</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {categories.length > 0 ? (
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <p className="text-yellow-400 text-sm">
                        No categories found. Please create a category first.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-400"
                        onClick={() => router.push('/admin/rules?tab=categories')}
                      >
                        Create Category
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input 
                    id="order" 
                    name="order"
                    type="number" 
                    placeholder="0" 
                    value={formData.order}
                    onChange={handleInputChange}
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="active" 
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end pt-4 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/admin/rules')}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
                    disabled={saving || categories.length === 0}
                  >
                    {saving ? 'Creating...' : 'Create Rule'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={() => setShowTranslationHelper(!showTranslationHelper)}
            className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm sm:text-base">{showTranslationHelper ? 'Hide Translation Helper' : 'Show Translation Helper'}</span>
          </button>
        </div>
        
        {showTranslationHelper && (
          <Card className="mt-4 border-gray-800 bg-secondary/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Translation Helper</CardTitle>
              <CardDescription className="text-gray-400">
                {activeTab === 'en' ? 'Translate English to Arabic' : 'Translate Arabic to English'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TranslationHelper onTranslated={handleApplyTranslation} />
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
} 
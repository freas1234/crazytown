'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../../../components/RoleGuard';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Switch } from '../../../../../components/ui/switch';
import { Label } from '../../../../../components/ui/label';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { toast } from 'sonner';
import TranslationHelper from '../../../../../components/TranslationHelper';

interface Rule {
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
  createdAt: string;
  updatedAt: string;
}

interface RuleCategory {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditRule({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  
  const [rule, setRule] = useState<Rule | null>(null);
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('en');
  const [showTranslationHelper, setShowTranslationHelper] = useState(false);
  
  const [formData, setFormData] = useState({
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
    active: true,
  });

  // Resolve the params Promise and extract the id
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const ruleResponse = await fetch(`/api/admin/rules/${id}`);
        if (!ruleResponse.ok) {
          throw new Error('Failed to fetch rule');
        }
        const ruleData = await ruleResponse.json();
        setRule(ruleData.rule);
        
        setFormData({
          title: ruleData.rule.title,
          description: ruleData.rule.description,
          category: ruleData.rule.category,
          order: ruleData.rule.order,
          active: ruleData.rule.active,
        });
          
        const categoriesResponse = await fetch('/api/admin/rules/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load rule data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev] as Record<string, string>,
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'order' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error('Rule ID is missing');
      return;
    }
    
    if (!formData.title.en || !formData.title.ar || !formData.description.en || !formData.description.ar || !formData.category) {
      toast.error('Please fill in all required fields in both languages');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update rule');
      }
      
      toast.success('Rule updated successfully');
      router.push('/admin/rules');
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      toast.error('Rule ID is missing');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this rule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/rules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete rule');
      }
      
      toast.success('Rule deleted successfully');
      router.push('/admin/rules');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Edit Rule</span>
          </h1>
          <Button variant="outline" size="sm" asChild className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary">
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
            <CardTitle className="text-white">Edit Rule</CardTitle>
            <CardDescription className="text-gray-400">Update rule information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !id ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-24 w-full bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
                <Skeleton className="h-10 w-1/3 bg-gray-700" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4 bg-gray-700">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ar">Arabic</TabsTrigger>
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
                        placeholder="Enter rule description in English" 
                        value={formData.description.en}
                        onChange={handleInputChange}
                        className="bg-gray-900/50 border-gray-700 min-h-[150px]"
                        required
                      />
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
                        placeholder="Enter rule description in Arabic" 
                        value={formData.description.ar}
                        onChange={handleInputChange}
                        className="bg-gray-900/50 border-gray-700 min-h-[150px] text-right"
                        dir="rtl"
                        required
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
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
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete Rule
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/admin/rules')}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/80"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowTranslationHelper(!showTranslationHelper)}
            className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {showTranslationHelper ? 'Hide Translation Helper' : 'Show Translation Helper'}
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
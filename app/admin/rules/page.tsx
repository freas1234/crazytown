'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../components/RoleGuard';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { toast } from 'sonner';
import TranslationHelper from '../../../components/TranslationHelper';

interface Rule {
  id: string;
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

interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
}

export default function AdminRules() {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');
  const [showTranslationHelper, setShowTranslationHelper] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en');
  
  const [newRule, setNewRule] = useState({
    title: '',
    description: '',
    category: '',
    order: 0,
    active: true,
  });
  
  const [newCategory, setNewCategory] = useState({
    name: {
      en: '',
      ar: ''
    },
    order: 0,
    active: true
  });
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const rulesResponse = await fetch('/api/admin/rules');
        if (!rulesResponse.ok) {
          throw new Error('Failed to fetch rules');
        }
        const rulesData = await rulesResponse.json();
        setRules(rulesData.rules);
        
        const categoriesResponse = await fetch('/api/admin/rules/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRule.title || !newRule.description || !newRule.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRule),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create rule');
      }
      
      const data = await response.json();
      
      setRules([...rules, data.rule]);
      
      setNewRule({
        title: '',
        description: '',
        category: '',
        order: 0,
        active: true,
      });
      
      toast.success('Rule created successfully');
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
    }
  };
  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.en.trim() || !newCategory.name.ar.trim()) {
      toast.error('Category name is required in both English and Arabic');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/rules/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      const data = await response.json();
      
      setCategories([...categories, data.category]);
      
      setNewCategory({
        name: {
          en: '',
          ar: ''
        },
        order: 0,
        active: true
      });
      
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };
  
  const handleDeleteRule = async (id: string) => {
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
      
      setRules(rules.filter(rule => rule.id !== id));
      
      toast.success('Rule deleted successfully');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All rules in this category will also be deleted.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/rules/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      setCategories(categories.filter(category => category.id !== id));
      
      setRules(rules.filter(rule => rule.category !== id));
      
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };
  
  const handleToggleRuleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/rules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update rule status');
      }
      
      setRules(rules.map(r => r.id === id ? { ...r, active: !currentStatus } : r));
      
      toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating rule status:', error);
      toast.error('Failed to update rule status');
    }
  };
  
  const handleToggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/rules/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category status');
      }
      
      setCategories(categories.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
      
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name.en : 'Unknown Category';
  };

  const handleApplyTranslation = (translatedText: string) => {
    if (activeLang === 'en') {
      // Translate from English to Arabic
      setNewCategory(prev => ({
        ...prev,
        name: {
          ...prev.name,
          ar: translatedText
        }
      }));
    } else {
      // Translate from Arabic to English
      setNewCategory(prev => ({
        ...prev,
        name: {
          ...prev.name,
          en: translatedText
        }
      }));
    }
  };
  
  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Rules Management</span>
          </h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button variant="default" size="sm" asChild className="gap-1 bg-primary hover:bg-primary/80 w-full sm:w-auto">
              <Link href="/admin/rules/create">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Rule
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary w-full sm:w-auto">
              <Link href="/admin">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="rules" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6 sm:mb-8 bg-secondary/80 backdrop-blur-sm border border-gray-800">
            <TabsTrigger 
              value="rules" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(255,107,0,0.2)]"
            >
              Manage Rules
            </TabsTrigger>
            <TabsTrigger 
              value="categories"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(255,107,0,0.2)]"
            >
              Manage Categories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rules">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Server Rules</CardTitle>
                    <CardDescription className="text-gray-400">Manage all server rules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
                              <Skeleton className="h-3 w-24 bg-gray-700" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                              <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : rules.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No rules found. Create your first rule!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rules.map(rule => (
                          <div key={rule.id} className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                            <div>
                              <h3 className="font-medium text-white">{rule.title.en}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                  {getCategoryName(rule.category)}
                                </Badge>
                                <Badge variant={rule.active ? "outline" : "secondary"} className={
                                  rule.active 
                                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }>
                                  {rule.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleRuleStatus(rule.id, rule.active)}
                                className={rule.active 
                                  ? "hover:bg-red-500/20 hover:text-red-400" 
                                  : "hover:bg-green-500/20 hover:text-green-400"
                                }
                              >
                                {rule.active ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => router.push(`/admin/rules/edit/${rule.id}`)}
                                className="hover:bg-blue-500/20 hover:text-blue-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteRule(rule.id)}
                                className="hover:bg-red-500/20 hover:text-red-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Rule</CardTitle>
                    <CardDescription className="text-gray-400">Add a new rule to the server</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateRule} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Rule Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Enter rule title" 
                          value={newRule.title}
                          onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                          className="bg-gray-900/50 border-gray-700"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Rule Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Enter rule description" 
                          value={newRule.description}
                          onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                          className="bg-gray-900/50 border-gray-700 min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={newRule.category} 
                          onValueChange={(value) => setNewRule({ ...newRule, category: value })}
                          required
                        >
                          <SelectTrigger className="bg-gray-900/50 border-gray-700">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {getCategoryName(category.id)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="order">Display Order</Label>
                        <Input 
                          id="order" 
                          type="number" 
                          placeholder="0" 
                          value={newRule.order}
                          onChange={(e) => setNewRule({ ...newRule, order: parseInt(e.target.value) })}
                          className="bg-gray-900/50 border-gray-700"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="active" 
                          checked={newRule.active}
                          onCheckedChange={(checked) => setNewRule({ ...newRule, active: checked })}
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/80">
                        Create Rule
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Rule Categories</CardTitle>
                    <CardDescription className="text-gray-400">Manage rule categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                              <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No categories found. Create your first category!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categories.map(category => (
                          <div key={category.id} className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                            <div>
                              <h3 className="font-medium text-white">{getCategoryName(category.id)}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={category.active ? "outline" : "secondary"} className={
                                  category.active 
                                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }>
                                  {category.active ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-xs text-gray-500">Order: {category.order}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleCategoryStatus(category.id, category.active)}
                                className={category.active 
                                  ? "hover:bg-red-500/20 hover:text-red-400" 
                                  : "hover:bg-green-500/20 hover:text-green-400"
                                }
                              >
                                {category.active ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteCategory(category.id)}
                                className="hover:bg-red-500/20 hover:text-red-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Category</CardTitle>
                    <CardDescription className="text-gray-400">Add a new rule category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <Tabs value={activeLang} onValueChange={(value) => setActiveLang(value as 'en' | 'ar')} className="w-full">
                        <TabsList className="mb-4 bg-gray-700">
                          <TabsTrigger value="en">English</TabsTrigger>
                          <TabsTrigger value="ar">Arabic</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="en" className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Category Name (English) <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              id="name-en"
                              value={newCategory.name.en}
                              onChange={(e) => setNewCategory({
                                ...newCategory,
                                name: {
                                  ...newCategory.name,
                                  en: e.target.value
                                }
                              })}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                              required
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="ar" className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Category Name (Arabic) <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              id="name-ar"
                              value={newCategory.name.ar}
                              onChange={(e) => setNewCategory({
                                ...newCategory,
                                name: {
                                  ...newCategory.name,
                                  ar: e.target.value
                                }
                              })}
                              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                              dir="rtl"
                              required
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={newCategory.order}
                          onChange={(e) => setNewCategory({
                            ...newCategory,
                            order: parseInt(e.target.value)
                          })}
                          min="0"
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="categoryActive"
                          checked={newCategory.active}
                          onChange={(e) => setNewCategory({
                            ...newCategory,
                            active: e.target.checked
                          })}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                        />
                        <label htmlFor="categoryActive" className="ml-2 block text-sm text-gray-300">
                          Active
                        </label>
                      </div>
                      
                      <div className="mb-6 flex justify-end">
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
                        <div className="mb-6">
                          <TranslationHelper onTranslated={handleApplyTranslation} />
                        </div>
                      )}
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        Create Category
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
} 
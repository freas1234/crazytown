'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { toast } from 'sonner';
import { useTranslation } from '../../../../lib/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../../../../components/ui/dialog";
import { PlusCircle, Trash2, LayoutGrid, Settings, X } from 'lucide-react';
import { ScrollArea } from '../../../../components/ui/scroll-area';

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
  // Keep legacy format for backward compatibility
  newItems: FeaturedCard[];
  bestSelling: FeaturedCard[];
  discounts: FeaturedCard[];
}

export default function FeaturedCardsPage() {
  const { t, locale } = useTranslation();
  const [featuredCards, setFeaturedCards] = useState<FeaturedCardsData>({
    categories: [],
    newItems: [],
    bestSelling: [],
    discounts: []
  });
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [idCounter, setIdCounter] = useState(0);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<Category, 'cards'>>({
    id: '',
    name: { en: '', ar: '' },
    badgeType: 'default'
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
        toast.error('Failed to load featured cards');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCards();
  }, []);

  const handleSaveFeaturedCards = async () => {
    try {
      setSaving(true);
      
      // Update legacy format from categories for backward compatibility
      const dataToSave = { ...featuredCards };
      
      // Map categories back to legacy format
      const newItemsCategory = featuredCards.categories.find(c => c.id === 'newItems');
      const bestSellingCategory = featuredCards.categories.find(c => c.id === 'bestSelling');
      const discountsCategory = featuredCards.categories.find(c => c.id === 'discounts');
      
      if (newItemsCategory) dataToSave.newItems = newItemsCategory.cards;
      if (bestSellingCategory) dataToSave.bestSelling = bestSellingCategory.cards;
      if (discountsCategory) dataToSave.discounts = discountsCategory.cards;
      
      const response = await fetch('/api/content/featured-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featuredCards: dataToSave
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save featured cards');
      }
      
      toast.success('Featured cards saved successfully');
    } catch (error) {
      console.error('Error saving featured cards:', error);
      toast.error('Failed to save featured cards');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (!newCategory.name.en || !newCategory.name.ar) {
      toast.error('Please provide both English and Arabic names for the category');
      return;
    }
    
    // Generate a URL-friendly ID from the English name
    const id = newCategory.name.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    
    const categoryToAdd = {
      ...newCategory,
      id,
      cards: []
    };
    
    setFeaturedCards(prev => ({
      ...prev,
      categories: [...prev.categories, categoryToAdd]
    }));
    
    setActiveTab(id);
    setNewCategoryDialog(false);
    setNewCategory({
      id: '',
      name: { en: '', ar: '' },
      badgeType: 'default'
    });
    
    toast.success('Category added successfully');
  };

  const removeCategory = (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All cards in this category will be lost.')) {
      return;
    }
    
    setFeaturedCards(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryId)
    }));
    
    // If the active tab is the removed category, switch to the first available category
    if (activeTab === categoryId) {
      const remainingCategories = featuredCards.categories.filter(c => c.id !== categoryId);
      if (remainingCategories.length > 0) {
        setActiveTab(remainingCategories[0].id);
      } else {
        setActiveTab('');
      }
    }
    
    toast.success('Category removed successfully');
  };

  const addCard = (categoryId: string) => {
    setIdCounter(prev => prev + 1);
    
    setFeaturedCards(prev => {
      const newData = { ...prev };
      const categoryIndex = newData.categories.findIndex(c => c.id === categoryId);
      
      if (categoryIndex !== -1) {
        newData.categories[categoryIndex] = {
          ...newData.categories[categoryIndex],
          cards: [
            ...newData.categories[categoryIndex].cards,
            {
              id: `new-card-${idCounter}`,
              imageUrl: '',
              title: '',
              description: '',
              link: ''
            }
          ]
        };
      }
      
      return newData;
    });
  };

  const removeCard = (categoryId: string, cardIndex: number) => {
    setFeaturedCards(prev => {
      const newData = { ...prev };
      const categoryIndex = newData.categories.findIndex(c => c.id === categoryId);
      
      if (categoryIndex !== -1) {
        const newCards = [...newData.categories[categoryIndex].cards];
        newCards.splice(cardIndex, 1);
        
        newData.categories[categoryIndex] = {
          ...newData.categories[categoryIndex],
          cards: newCards
        };
      }
      
      return newData;
    });
  };

  const updateCard = (categoryId: string, cardIndex: number, field: keyof FeaturedCard, value: string) => {
    setFeaturedCards(prev => {
      const newData = { ...prev };
      const categoryIndex = newData.categories.findIndex(c => c.id === categoryId);
      
      if (categoryIndex !== -1) {
        const newCards = [...newData.categories[categoryIndex].cards];
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          [field]: value
        };
        
        newData.categories[categoryIndex] = {
          ...newData.categories[categoryIndex],
          cards: newCards
        };
      }
      
      return newData;
    });
  };

  const renderCardEditor = (categoryId: string) => {
    const category = featuredCards.categories.find(c => c.id === categoryId);
    
    if (!category) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-400">No category selected or category not found.</p>
        </div>
      );
    }
    
    if (!category.cards || category.cards.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-400">No cards available in this category. Add your first card below.</p>
          <Button 
            variant="outline" 
            onClick={() => addCard(categoryId)}
            className="w-full mt-4 border-dashed border-gray-600"
          >
            Add Card
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {category.cards.map((card, index) => (
          <Card key={card.id || index} className="border border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Card {index + 1}</CardTitle>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => removeCard(categoryId, index)}
              >
                Remove
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={card.imageUrl}
                  onChange={(e) => updateCard(categoryId, index, 'imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={card.title}
                  onChange={(e) => updateCard(categoryId, index, 'title', e.target.value)}
                  placeholder="Card Title"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={card.description}
                  onChange={(e) => updateCard(categoryId, index, 'description', e.target.value)}
                  placeholder="Card Description"
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link</label>
                <Input
                  value={card.link}
                  onChange={(e) => updateCard(categoryId, index, 'link', e.target.value)}
                  placeholder="/store/product/123"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button 
          variant="outline" 
          onClick={() => addCard(categoryId)}
          className="w-full border-dashed border-gray-600"
        >
          Add Card
        </Button>
      </div>
    );
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Featured Cards Management</h1>
          <Button 
            onClick={handleSaveFeaturedCards} 
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center">
                    <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
                    Categories
                  </CardTitle>
                  <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="categoryNameEn" className="text-sm font-medium">
                            English Name
                          </label>
                          <Input
                            id="categoryNameEn"
                            placeholder="e.g., Special Offers"
                            value={newCategory.name.en}
                            onChange={(e) => setNewCategory({
                              ...newCategory,
                              name: { ...newCategory.name, en: e.target.value }
                            })}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="categoryNameAr" className="text-sm font-medium">
                            Arabic Name
                          </label>
                          <Input
                            id="categoryNameAr"
                            placeholder="e.g., عروض خاصة"
                            value={newCategory.name.ar}
                            onChange={(e) => setNewCategory({
                              ...newCategory,
                              name: { ...newCategory.name, ar: e.target.value }
                            })}
                            className="bg-gray-800 border-gray-700"
                            dir="rtl"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="badgeType" className="text-sm font-medium">
                            Badge Type
                          </label>
                          <select
                            id="badgeType"
                            value={newCategory.badgeType}
                            onChange={(e) => setNewCategory({
                              ...newCategory,
                              badgeType: e.target.value as 'default' | 'secondary' | 'destructive'
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
                          >
                            <option value="default">Default (Blue)</option>
                            <option value="secondary">Secondary (Yellow)</option>
                            <option value="destructive">Destructive (Red)</option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addCategory}>
                          Add Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60px] pb-3">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 flex flex-nowrap overflow-x-auto">
                      {featuredCards.categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <TabsTrigger value={category.id} className="whitespace-nowrap">
                            {locale === 'ar' ? category.name.ar : category.name.en}
                          </TabsTrigger>
                          {/* Don't allow deleting the three default categories */}
                          {!['newItems', 'bestSelling', 'discounts'].includes(category.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 p-1 h-auto text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeCategory(category.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </TabsList>
                    
                    {featuredCards.categories.map((category) => (
                      <TabsContent key={category.id} value={category.id}>
                        {renderCardEditor(category.id)}
                      </TabsContent>
                    ))}
                  </Tabs>
                </ScrollArea>
                
                {featuredCards.categories.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No categories created yet.</p>
                    <Button onClick={() => setNewCategoryDialog(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Category
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {activeTab && (
              <Card className="border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-primary" />
                    Category Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderCardEditor(activeTab)}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../../../../components/RoleGuard';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Input } from '../../../../../../components/ui/input';
import { Switch } from '../../../../../../components/ui/switch';
import { Label } from '../../../../../../components/ui/label';
import { Skeleton } from '../../../../../../components/ui/skeleton';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  order: number;
  active: boolean;
}

export default function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: {
      en: '',
      ar: '',
    },
    order: 0,
    active: true,
  });

  // Resolve the params promise first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCategoryId(resolvedParams.id);
    };
    
    resolveParams();
  }, [params]);

  // Fetch category data once we have the ID
  useEffect(() => {
    if (!categoryId) return;
    
    const fetchCategory = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/admin/products/categories/${categoryId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        
        const data = await response.json();
        setCategory(data.category);
        
        setFormData({
          name: data.category.name,
          order: data.category.order,
          active: data.category.active,
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category data');
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) return;
    
    if (!formData.name.en) {
      toast.error('Please enter a category name in English');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/products/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      toast.success('Category updated successfully');
      router.push('/admin/store/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryId) return;
    
    if (!confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/products/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      toast.success('Category deleted successfully');
      router.push('/admin/store/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // Show loading while resolving params
  if (!categoryId) {
    return (
      <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="cyberpunk-border inline-block">Edit Category</span>
            </h1>
          </div>
          <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-8 w-1/2 bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Edit Category</span>
          </h1>
          <Button variant="outline" size="sm" asChild className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary">
            <Link href="/admin/store?tab=categories">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Categories
            </Link>
          </Button>
        </div>
        
        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Edit Category</CardTitle>
            <CardDescription className="text-gray-400">Update category information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-8 w-1/2 bg-gray-700" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Category Name (English) *</Label>
                    <Input 
                      id="nameEn" 
                      placeholder="Enter category name in English" 
                      value={formData.name.en}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        name: { ...formData.name, en: e.target.value } 
                      })}
                      className="bg-gray-900/50 border-gray-700"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">Category Name (Arabic)</Label>
                    <Input 
                      id="nameAr" 
                      placeholder="Enter category name in Arabic" 
                      value={formData.name.ar}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        name: { ...formData.name, ar: e.target.value } 
                      })}
                      className="bg-gray-900/50 border-gray-700"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input 
                    id="order" 
                    type="number" 
                    placeholder="0" 
                    value={formData.order || ''}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="bg-gray-900/50 border-gray-700"
                  />
                  <p className="text-sm text-gray-500">Categories with lower order values will be displayed first</p>
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
                    Delete Category
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/admin/store?tab=categories')}
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
      </div>
    </RoleGuard>
  );
}
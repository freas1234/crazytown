'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../../../components/RoleGuard';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Switch } from '../../../../../components/ui/switch';
import { Label } from '../../../../../components/ui/label';
import { toast } from 'sonner';

export default function CreateCategory() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: {
      en: '',
      ar: '',
    },
    order: 0,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.en) {
      toast.error('Please enter a category name in English');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/products/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      toast.success('Category created successfully');
      router.push('/admin/store/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      setSaving(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Create New Category</span>
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
            <CardTitle className="text-white">Create New Category</CardTitle>
            <CardDescription className="text-gray-400">Add a new product category to your store</CardDescription>
          </CardHeader>
          <CardContent>
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
              
              <div className="flex justify-end pt-4 space-x-2">
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
                  {saving ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../../../../components/RoleGuard';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Input } from '../../../../../../components/ui/input';
import { Textarea } from '../../../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { Switch } from '../../../../../../components/ui/switch';
import { Label } from '../../../../../../components/ui/label';
import { Skeleton } from '../../../../../../components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";

interface Product {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  salePrice?: number;
  imageUrl: string;
  category: string;
  featured: boolean;
  stock: number;
  digital: boolean;
  downloadUrl?: string;
  outOfStock?: boolean;
  outOfStockMessage?: {
    en: string;
    ar: string;
  };
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

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [discountType, setDiscountType] = useState<'price' | 'percentage'>('price');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: {
      en: '',
      ar: '',
    },
    description: {
      en: '',
      ar: '',
    },
    price: 0,
    salePrice: 0,
    imageUrl: '',
    category: '',
    featured: false,
    stock: 0,
    digital: false,
    downloadUrl: '',
    outOfStock: false,
    outOfStockMessage: {
      en: 'Out of stock',
      ar: 'نفذت الكمية'
    }
  });

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
    };
    
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productResponse = await fetch(`/api/admin/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await productResponse.json();
        setProduct(productData.product);
        
        // Initialize form data
        const initialFormData = {
          name: productData.product.name,
          description: productData.product.description,
          price: productData.product.price,
          salePrice: productData.product.salePrice || 0,
          imageUrl: productData.product.imageUrl || '',
          category: productData.product.category,
          featured: productData.product.featured,
          stock: productData.product.stock,
          digital: productData.product.digital,
          downloadUrl: productData.product.downloadUrl || '',
          outOfStock: productData.product.outOfStock || false,
          outOfStockMessage: productData.product.outOfStockMessage || {
            en: 'Out of stock',
            ar: 'نفذت الكمية'
          }
        };
        
        setFormData(initialFormData);
        
        // Calculate discount percentage if sale price is set
        if (productData.product.salePrice && productData.product.salePrice > 0 && productData.product.price > 0) {
          const percentage = ((productData.product.price - productData.product.salePrice) / productData.product.price) * 100;
          setDiscountPercentage(Math.round(percentage));
          
          // If discount is a clean percentage (like 10%, 25%), default to percentage mode
          if (Math.abs(percentage - Math.round(percentage)) < 0.01) {
            setDiscountType('percentage');
          }
        }
          
        const categoriesResponse = await fetch('/api/admin/products/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load product data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  // Update sale price when discount percentage changes
  const updateSalePriceFromPercentage = (percentage: number) => {
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    setDiscountPercentage(percentage);
    const calculatedSalePrice = formData.price * (1 - percentage / 100);
    // Round to 2 decimal places
    const roundedSalePrice = Math.round(calculatedSalePrice * 100) / 100;
    setFormData({ ...formData, salePrice: roundedSalePrice });
  };

  // Update discount percentage when sale price changes directly
  const updateDiscountPercentageFromSalePrice = (salePrice: number) => {
    if (salePrice >= 0 && formData.price > 0) {
      const percentage = ((formData.price - salePrice) / formData.price) * 100;
      setDiscountPercentage(Math.round(percentage));
    } else {
      setDiscountPercentage(0);
    }
    
    setFormData({ ...formData, salePrice });
  };

  // Update both price and discount when regular price changes
  const updatePrice = (price: number) => {
    setFormData({ ...formData, price });
    
    if (discountType === 'percentage' && discountPercentage > 0) {
      const calculatedSalePrice = price * (1 - discountPercentage / 100);
      const roundedSalePrice = Math.round(calculatedSalePrice * 100) / 100;
      setFormData(prev => ({ ...prev, price, salePrice: roundedSalePrice }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;
    
    if (!formData.name.en || !formData.description.en || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      toast.success('Product updated successfully');
      router.push('/admin/store/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      toast.success('Product deleted successfully');
      router.push('/admin/store/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };
  
  if (!productId) {
    return (
      <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="cyberpunk-border inline-block">Edit Product</span>
            </h1>
          </div>
          <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-full bg-gray-700" />
                <Skeleton className="h-24 w-full bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-700" />
                <Skeleton className="h-10 w-1/3 bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Edit Product</span>
          </h1>
          <Button variant="outline" size="sm" asChild className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary w-full sm:w-auto">
            <Link href="/admin/store">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Store
            </Link>
          </Button>
        </div>
        
        <Card className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Edit Product</CardTitle>
            <CardDescription className="text-gray-400">Update product information</CardDescription>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Product Name (English) *</Label>
                    <Input 
                      id="nameEn" 
                      placeholder="Enter product name in English" 
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
                    <Label htmlFor="nameAr">Product Name (Arabic)</Label>
                    <Input 
                      id="nameAr" 
                      placeholder="Enter product name in Arabic" 
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">Description (English) *</Label>
                    <Textarea 
                      id="descriptionEn" 
                      placeholder="Enter product description in English" 
                      value={formData.description.en}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        description: { ...formData.description, en: e.target.value } 
                      })}
                      className="bg-gray-900/50 border-gray-700 min-h-[150px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea 
                      id="descriptionAr" 
                      placeholder="Enter product description in Arabic" 
                      value={formData.description.ar}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        description: { ...formData.description, ar: e.target.value } 
                      })}
                      className="bg-gray-900/50 border-gray-700 min-h-[150px]"
                      dir="rtl"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="0.00" 
                      value={formData.price || ''}
                      onChange={(e) => updatePrice(parseFloat(e.target.value))}
                      className="bg-gray-900/50 border-gray-700"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="salePrice">Sale Price</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Percentage</span>
                        <Switch 
                          checked={discountType === 'percentage'}
                          onCheckedChange={(checked) => setDiscountType(checked ? 'percentage' : 'price')}
                        />
                      </div>
                    </div>
                    
                    {discountType === 'price' ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          id="salePrice" 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="0.00" 
                          value={formData.salePrice || ''}
                          onChange={(e) => updateDiscountPercentageFromSalePrice(parseFloat(e.target.value))}
                          className="bg-gray-900/50 border-gray-700"
                        />
                        {formData.salePrice > 0 && formData.price > formData.salePrice && (
                          <div className="bg-primary/20 text-primary px-2 py-1 rounded text-sm whitespace-nowrap">
                            {discountPercentage}% off
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input 
                          id="discountPercentage" 
                          type="number" 
                          min="0"
                          max="100"
                          placeholder="0" 
                          value={discountPercentage || ''}
                          onChange={(e) => updateSalePriceFromPercentage(parseInt(e.target.value))}
                          className="bg-gray-900/50 border-gray-700"
                        />
                        <span className="text-lg font-bold text-primary">%</span>
                        {discountPercentage > 0 && (
                          <div className="bg-primary/20 text-primary px-2 py-1 rounded text-sm whitespace-nowrap">
                            ${formData.salePrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {discountType === 'percentage' 
                        ? "Enter percentage discount (e.g. 25 for 25% off)" 
                        : "Enter sale price (0 for no sale)"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      min="0"
                      placeholder="0" 
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="bg-gray-900/50 border-gray-700"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    placeholder="https://example.com/image.jpg" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="featured" 
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="digital" 
                      checked={formData.digital}
                      onCheckedChange={(checked) => setFormData({ ...formData, digital: checked })}
                    />
                    <Label htmlFor="digital">Digital Product</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="outOfStock" className="text-white">Mark as Out of Stock</Label>
                      <p className="text-sm text-gray-400">Override stock count and show as unavailable</p>
                    </div>
                    <Switch 
                      id="outOfStock" 
                      checked={formData.outOfStock}
                      onCheckedChange={(checked) => setFormData({ ...formData, outOfStock: checked })}
                    />
                  </div>
                </div>
                
                {formData.digital && (
                  <div className="space-y-2">
                    <Label htmlFor="downloadUrl">Download URL</Label>
                    <Input 
                      id="downloadUrl" 
                      placeholder="https://example.com/download" 
                      value={formData.downloadUrl}
                      onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                      className="bg-gray-900/50 border-gray-700"
                    />
                  </div>
                )}

                {formData.outOfStock && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-800 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="outOfStockMessageEn">Out of Stock Message (English)</Label>
                      <Input 
                        id="outOfStockMessageEn" 
                        placeholder="Out of stock" 
                        value={formData.outOfStockMessage?.en || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          outOfStockMessage: { ...formData.outOfStockMessage, en: e.target.value } 
                        })}
                        className="bg-gray-900/50 border-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="outOfStockMessageAr">Out of Stock Message (Arabic)</Label>
                      <Input 
                        id="outOfStockMessageAr" 
                        placeholder="نفذت الكمية" 
                        value={formData.outOfStockMessage?.ar || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          outOfStockMessage: { ...formData.outOfStockMessage, ar: e.target.value } 
                        })}
                        className="bg-gray-900/50 border-gray-700"
                        dir="rtl"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between pt-4 gap-4">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={saving}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Delete Product
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/admin/store')}
                      disabled={saving}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
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
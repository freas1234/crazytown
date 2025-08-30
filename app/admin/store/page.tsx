'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../components/RoleGuard';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Skeleton } from '../../../components/ui/skeleton';
import { toast } from 'sonner';
import Image from 'next/image';

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

function AdminStoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam === 'categories' ? 'categories' : 'products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/products/categories')
        ]);
        
        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        setProducts(productsData.products);
        setCategories(categoriesData.categories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Failed to load store data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/admin/store?tab=${value}`, { scroll: false });
  };
  
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      setProducts(products.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/products/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      setCategories(categories.filter(category => category.id !== id));
      setProducts(products.filter(product => product.category !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Store Management</span>
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-secondary/50 border border-gray-800">
              <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Products
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Categories
              </TabsTrigger>
            </TabsList>
            
            {activeTab === 'products' ? (
              <Button asChild className="bg-primary hover:bg-primary/80">
                <Link href="/admin/store/products/create">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/80">
                <Link href="/admin/store/categories/create">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Category
                </Link>
              </Button>
            )}
          </div>
          
          <TabsContent value="products" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="bg-secondary/80 border-gray-800">
                    <CardContent className="p-0">
                      <div className="animate-pulse">
                        <div className="h-40 bg-gray-800"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                          <div className="h-8 bg-gray-800 rounded w-full mt-4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="bg-secondary/80 border-gray-800">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-white mb-2">No products found</h3>
                  <p className="text-gray-400 mb-6">Get started by creating your first product.</p>
                  <Button asChild className="bg-primary hover:bg-primary/80">
                    <Link href="/admin/store/products/create">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Product
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <Card key={product.id} className="bg-secondary/80 border-gray-800 overflow-hidden">
                    <div className="h-40 relative">
                      <Image
                        src={product.imageUrl || "/placeholder-product.jpg"}
                        alt={product.name.en}
                        fill
                        className="object-cover"
                      />
                      {product.featured && (
                        <div className="absolute top-2 right-2 bg-primary text-xs font-medium px-2 py-1 rounded">
                          FEATURED
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{product.name.en}</CardTitle>
                          <CardDescription>
                            {product.salePrice && product.salePrice > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-primary">${product.salePrice.toFixed(2)}</span>
                                <span className="line-through text-gray-500 text-xs">${product.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span>${product.price.toFixed(2)}</span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                        <div className="text-xs bg-gray-800 px-2 py-1 rounded">
                            {product.digital ? 'Digital' : 'Physical'}
                          </div>
                          {product.outOfStock ? (
                            <div className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
                              Out of Stock
                            </div>
                          ) : product.stock <= 0 ? (
                            <div className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
                              No Stock
                            </div>
                          ) : (
                            <div className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                              {product.stock} in stock
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.description.en}
                      </p>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-500/30 hover:bg-red-500/20 hover:text-red-500 text-red-400"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/30 hover:bg-primary/20 hover:text-primary"
                          asChild
                        >
                          <Link href={`/admin/store/products/${product.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="bg-secondary/80 border-gray-800">
                    <CardContent className="p-0">
                      <div className="animate-pulse">
                        <div className="p-4">
                          <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
                          <div className="h-8 bg-gray-800 rounded w-full mt-4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <Card className="bg-secondary/80 border-gray-800">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-white mb-2">No categories found</h3>
                  <p className="text-gray-400 mb-6">Get started by creating your first category.</p>
                  <Button asChild className="bg-primary hover:bg-primary/80">
                    <Link href="/admin/store/categories/create">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Category
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <Card key={category.id} className="bg-secondary/80 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{category.name.en}</CardTitle>
                          <CardDescription>
                            {products.filter(p => p.category === category.id).length} products
                          </CardDescription>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${category.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {category.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-500/30 hover:bg-red-500/20 hover:text-red-500 text-red-400"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary/30 hover:bg-primary/20 hover:text-primary"
                          asChild
                        >
                          <Link href={`/admin/store/categories/${category.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}

export default function AdminStore() {
  return (
    <Suspense fallback={
      <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="cyberpunk-border inline-block">Store Management</span>
            </h1>
          </div>
          <div className="flex justify-center items-center py-10">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-gray-400">Loading...</span>
          </div>
        </div>
      </RoleGuard>
    }>
      <AdminStoreContent />
    </Suspense>
  );
} 
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../../components/RoleGuard';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
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

function ProductsContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/admin/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
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

  return (
    <RoleGuard allowedRoles={['admin', 'owner']}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="cyberpunk-border inline-block">Products Management</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" asChild className="gap-1 border-primary/30 hover:bg-primary/20 hover:text-primary w-full sm:w-auto">
              <Link href="/admin/store">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Store
              </Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/80 w-full sm:w-auto">
              <Link href="/admin/store/products/create">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </Link>
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="bg-card/80 border-border">
                <CardContent className="p-0">
                  <div className="animate-pulse">
                    <div className="h-40 bg-card"></div>
                    <div className="p-4">
                      <div className="h-6 bg-card rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-card rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-card rounded w-full mb-2"></div>
                      <div className="h-4 bg-card rounded w-full mb-2"></div>
                      <div className="h-8 bg-card rounded w-full mt-4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-card/80 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first product.</p>
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
      </div>
    </RoleGuard>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              <span className="cyberpunk-border inline-block">Products Management</span>
            </h1>
          </div>
          <div className="flex justify-center items-center py-10">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-gray-400">Loading...</span>
          </div>
        </div>
      </RoleGuard>
    }>
      <ProductsContent />
    </Suspense>
  );
}

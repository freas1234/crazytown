'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslation } from '../../../../lib/hooks/useTranslation';

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

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [id, setId] = useState<string>('');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    params.then(({ id: productId }) => {
      setId(productId);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data.product);
        
        if (data.product) {
          const relatedResponse = await fetch(`/api/products?category=${data.product.category}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedProducts(
              relatedData.products
                .filter((p: Product) => p.id !== id)
                .slice(0, 3)
            );
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product data');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  const addToCart = () => {
    if (!product) return;
    
    const storedCart = localStorage.getItem('cart');
    let cart = storedCart ? JSON.parse(storedCart) : [];
    
    const existingItem = cart.find((item: any) => item.productId === product.id);
    
    if (existingItem) {
      cart = cart.map((item: any) => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      cart.push({ productId: product.id, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart');
  };
  
  const incrementQuantity = () => {
    if (product && product.stock > quantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const buyNow = () => {
    addToCart();
    router.push('/store/cart');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Link href="/store" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('store.product.back_to_store', 'Back to Store')}
            </Link>
            
            {loading ? (
              <div className="game-card animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-96 bg-gray-800 rounded-lg"></div>
                  <div>
                    <div className="h-10 bg-gray-800 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/4 mb-6"></div>
                    <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-8"></div>
                    <div className="h-10 bg-gray-800 rounded w-full mb-4"></div>
                    <div className="h-12 bg-gray-800 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ) : !product ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl text-white mb-2">{t('store.product.product_not_found', 'Product not found')}</h2>
                <p className="text-gray-400 mb-6">{t('store.product.product_not_found_message', 'The product you\'re looking for doesn\'t exist or has been removed.')}</p>
                <Link href="/store" className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors">
                  {t('store.product.browse_products', 'Browse Products')}
                </Link>
              </div>
            ) : (
              <div>
                <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                    <div className="relative h-96 rounded-lg overflow-hidden">
                      <Image 
                        src={product.imageUrl || "/placeholder-product.jpg"} 
                        alt={product.name[locale]}
                        fill
                        className="object-cover"
                      />
                      {product.featured && (
                        <div className="absolute top-4 right-4 bg-primary text-xs font-medium px-2 py-1 rounded">
                          FEATURED
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {product.name[locale]}
                      </h1>
                      
                      <div className="mb-6">
                        {product.salePrice && product.salePrice > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl text-primary font-bold">${product.salePrice.toFixed(2)}</span>
                            <span className="text-gray-400 line-through">${product.price.toFixed(2)}</span>
                            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                              {Math.round((1 - product.salePrice / product.price) * 100)}% {t('store.product.off', 'OFF')}
                            </span>
                          </div>
                        ) : (
                          <div className="text-2xl text-primary font-bold">
                        ${product.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      <div className="prose prose-invert mb-6">
                        <div className="text-gray-300 whitespace-pre-line">
                          {product.description[locale]}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <span className="text-gray-400 mr-2">{t('store.product.availability', 'Availability:')}</span>
                          {product.outOfStock ? (
                            <span className="text-red-500">
                              {product.outOfStockMessage?.[locale] || t('store.product.out_of_stock', 'Out of Stock')}
                            </span>
                          ) : product.stock > 0 ? (
                            <span className="text-green-500">{t('store.product.in_stock', 'In Stock')} ({product.stock} {t('store.product.available', 'available')})</span>
                          ) : (
                            <span className="text-red-500">{t('store.product.out_of_stock', 'Out of Stock')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">{t('store.product.type', 'Type:')}</span>
                          <span className="text-white capitalize">{product.digital ? 'Digital' : 'Physical'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-6">
                        <span className="text-gray-400 mr-4">{t('store.product.quantity', 'Quantity:')}</span>
                        <div className="flex items-center">
                          <button 
                            onClick={decrementQuantity}
                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-l-lg transition-colors"
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-12 text-center bg-gray-900 py-1">{quantity}</span>
                          <button 
                            onClick={incrementQuantity}
                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-r-lg transition-colors"
                            disabled={product.stock <= quantity}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={addToCart}
                          disabled={product.outOfStock || product.stock === 0}
                          className="px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-1"
                        >
                          {t('store.product.add_to_cart', 'Add to Cart')}
                        </button>
                        <button 
                          onClick={buyNow}
                          disabled={product.outOfStock || product.stock === 0}
                          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex-1"
                        >
                          {t('store.product.buy_now', 'Buy Now')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {relatedProducts.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">{t('store.product.related_products', 'Related Products')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedProducts.map(product => (
                        <div key={product.id} className="game-card group">
                          <div className="h-48 mb-4 relative overflow-hidden rounded-lg">
                            <Image 
                              src={product.imageUrl || "/placeholder-product.jpg"} 
                              alt={product.name[locale]}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent"></div>
                          </div>
                          
                          <Link href={`/store/product/${product.id}`} className="block">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                              {product.name[locale]}
                            </h3>
                          </Link>
                          
                          <div className="text-gray-400 mb-4 text-sm min-h-[40px] whitespace-pre-line">
                            {product.description[locale].length > 100
                              ? `${product.description[locale].substring(0, 100)}...`
                              : product.description[locale]}
                          </div>
                          
                          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800 group-hover:border-primary/30 transition-colors">
                            <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                            <Link 
                              href={`/store/product/${product.id}`}
                              className="px-4 py-1.5 bg-primary/10 border border-primary/50 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                              {t('store.product.view_details', 'View Details')}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
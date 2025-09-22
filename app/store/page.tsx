'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from '../../lib/hooks/useTranslation';

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

export default function Store() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{productId: string, quantity: number}[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching store data...');
        
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/products/categories')
        ]);
        
        console.log('Products response status:', productsRes.status);
        console.log('Categories response status:', categoriesRes.status);
        
        if (!productsRes.ok) {
          throw new Error(`Failed to fetch products: ${productsRes.status} ${productsRes.statusText}`);
        }
        
        if (!categoriesRes.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
        }
        
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        console.log('Products data:', productsData);
        console.log('Categories data:', categoriesData);
        
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Failed to load store data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const addToCart = (productId: string) => {
    const existingItem = cart.find(item => item.productId === productId);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      newCart = [...cart, { productId, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Item added to cart');
  };
  
  const viewCart = () => {
    router.push('/store/cart');
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "all" || 
      product.category === activeCategory;
    
    const matchesSearch = searchQuery === "" || 
      product.name[locale].toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description[locale].toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  const allCategories = [{ id: "all", name: { en: t('store.all_categories', 'All'), ar: t('store.all_categories', 'All') } }].concat(categories);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 cyberpunk-border inline-block">
                <span className="text-primary animate-text-flicker">{t('common.crazytown', 'CRAZY TOWN')}</span> {t('store.title', 'STORE')}
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('store.subtitle', 'Enhance your role-playing experience with our premium items and packages')}
              </p>
            </div>
            
            {/* Search and Categories */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex w-full md:w-auto gap-2 items-center">
                  <div className="relative flex-grow md:min-w-[300px]">
                    <input
                      type="text"
                      placeholder={t('store.search_placeholder', 'Search products...')}
                      className="w-full py-2 px-4 bg-secondary/80 border border-gray-800 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <button 
                    onClick={viewCart}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/50 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary text-white'
                          : 'bg-secondary/80 border border-gray-800 text-gray-300 hover:border-primary/50'
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name[locale]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="game-card animate-pulse">
                    <div className="h-48 mb-4 bg-gray-800 rounded-lg"></div>
                    <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                      <div className="h-6 bg-gray-800 rounded w-16"></div>
                      <div className="h-8 bg-gray-800 rounded w-28"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <div key={product.id} className="game-card group">
                    {product.featured && (
                      <div className="absolute top-0 right-0 bg-primary text-xs font-medium px-2 py-1 rounded-bl-lg z-10">
                        FEATURED
                      </div>
                    )}
                    
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
                    
                    <p className="text-gray-400 mb-4 text-sm min-h-[40px]">
                      {product.description[locale].length > 100
                        ? `${product.description[locale].substring(0, 100)}...`
                        : product.description[locale]}
                    </p>
                    
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800 group-hover:border-primary/30 transition-colors">
                      <div>
                        {product.salePrice && product.salePrice > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
                            <span className="text-primary font-bold">${product.salePrice.toFixed(2)}</span>
                          </div>
                        ) : (
                      <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      
                      {product.outOfStock || product.stock <= 0 ? (
                        <div className="px-4 py-1.5 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg cursor-not-allowed">
                          {product.outOfStockMessage?.[locale] || t('store.out_of_stock', 'Out of stock')}
                        </div>
                      ) : (
                      <button 
                        className="px-4 py-1.5 bg-primary/10 border border-primary/50 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                        onClick={() => addToCart(product.id)}
                      >
                        {t('store.add_to_cart', 'Add to Cart')}
                      </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl text-white mb-2">{t('store.no_products_found', 'No products found')}</h3>
                <p className="text-gray-400">{t('store.no_products_message', 'Try adjusting your search or filter criteria')}</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-secondary/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                {t('store.suggest_item_title', 'Want to suggest a new store item?')}
              </h2>
              <p className="text-gray-400 mb-8">
                {t('store.suggest_item_text', 'Have an idea for a cool new item or package? Join our Discord and share your suggestions with us!')}
              </p>
              <a href="#" className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-white font-medium rounded-lg shadow-lg transition-all">
                {t('store.join_discord', 'Join Our Discord')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
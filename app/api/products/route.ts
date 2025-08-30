import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductsByCategory, getFeaturedProducts } from '../../models/Product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    console.log('API: Fetching products with params:', { category, featured });
    
    let products;
    
    if (featured === 'true') {
      products = await getFeaturedProducts();
    } else if (category) {
      products = await getProductsByCategory(category);
    } else {
      products = await getProducts();
    }
    
    console.log(`API: Found ${products?.length || 0} products`);
    
    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('API: Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
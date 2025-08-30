import { NextRequest, NextResponse } from 'next/server';
import { getProductCategories } from '../../../models/Product';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching product categories...');
    const categories = await getProductCategories();
    
    console.log(`API: Found ${categories?.length || 0} product categories`);
    
    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('API: Error fetching product categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product categories', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
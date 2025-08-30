import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '../../../models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    console.log(`API: Fetching product with id: ${id}`);
    
    const product = await getProduct(id);
    
    console.log(`API: Product found: ${!!product}`);
    
    if (!product) {
      console.log(`API: Product not found with id: ${id}`);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error(`API: Error fetching product with id ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { getProducts, createProduct } from '../../../models/Product';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const products = await getProducts();
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    if (!data.name || !data.description || !data.price || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!data.name.en || !data.name.ar || !data.description.en || !data.description.ar) {
      return NextResponse.json(
        { error: 'Both English and Arabic content is required for name and description' },
        { status: 400 }
      );
    }
    
    const product = await createProduct({
      name: {
        en: data.name.en,
        ar: data.name.ar
      },
      description: {
        en: data.description.en,
        ar: data.description.ar
      },
      price: data.price,
      salePrice: data.salePrice || 0,
      imageUrl: data.imageUrl || '',
      category: data.category,
      featured: data.featured || false,
      stock: data.stock || 0,
      digital: data.digital || false,
      downloadUrl: data.downloadUrl,
      outOfStock: data.outOfStock || false,
      outOfStockMessage: data.outOfStock ? {
        en: data.outOfStockMessage?.en || 'Out of stock',
        ar: data.outOfStockMessage?.ar || 'نفذت الكمية'
      } : undefined
    });
    
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 
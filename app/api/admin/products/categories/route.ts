import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { getProductCategories, createProductCategory } from '../../../../models/Product';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const categories = await getProductCategories();
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product categories' },
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
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    if (!data.name.en || !data.name.ar) {
      return NextResponse.json(
        { error: 'Both English and Arabic content is required for category name' },
        { status: 400 }
      );
    }
    
    const category = await createProductCategory({
      name: {
        en: data.name.en,
        ar: data.name.ar
      },
      order: data.order || 0,
      active: data.active !== undefined ? data.active : true,
    });
    
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating product category:', error);
    return NextResponse.json(
      { error: 'Failed to create product category' },
      { status: 500 }
    );
  }
} 
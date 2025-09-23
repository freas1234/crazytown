import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth-config';
import { getProductCategories, updateProductCategory, deleteProductCategory } from '../../../../../models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const categories = await getProductCategories();
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error fetching product category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const data = await request.json();
    
    const updatedCategory = await updateProductCategory(id, {
      name: data.name,
      order: data.order,
      active: data.active,
    });
    
    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('Error updating product category:', error);
    return NextResponse.json(
      { error: 'Failed to update product category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    await deleteProductCategory(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product category:', error);
    return NextResponse.json(
      { error: 'Failed to delete product category' },
      { status: 500 }
    );
  }
}
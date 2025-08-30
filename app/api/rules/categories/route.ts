import { NextRequest, NextResponse } from 'next/server';
import { getRuleCategories } from '../../../models/Rule';

export async function GET(request: NextRequest) {
  try {
    const categories = await getRuleCategories();
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching rule categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule categories' },
      { status: 500 }
    );
  }
} 
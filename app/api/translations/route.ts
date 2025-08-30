import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'en';
    
    const translations = await db.translations.getAll();
    
    return NextResponse.json({
      success: true,
      translations
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
} 
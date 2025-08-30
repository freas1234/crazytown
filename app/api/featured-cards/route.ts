import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { Language } from '../../../lib/i18n';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = (searchParams.get('lang') || 'en') as Language;
    
    const featuredCards = await db.content.findByType('featuredCards');
    
    return NextResponse.json({
      success: true,
      featuredCards: featuredCards?.data?.[lang] || {
        newItems: [],
        bestSelling: [],
        discounts: []
      },
      language: lang
    });
  } catch (error) {
    console.error('Error fetching featured cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const lang = (data.language || 'en') as Language;
    
    if (!data || !data.featuredCards) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Get existing data first
    const existingContent = await db.content.findByType('featuredCards');
    let updatedContent = {};
    
    if (existingContent?.data) {
      // Preserve data for other languages
      updatedContent = { ...existingContent.data };
    } else {
      // Initialize with empty structures for both languages
      updatedContent = {
        en: {
          newItems: [],
          bestSelling: [],
          discounts: []
        },
        ar: {
          newItems: [],
          bestSelling: [],
          discounts: []
        }
      };
    }
    
  
    (updatedContent as Record<Language, typeof data.featuredCards>)[lang] = data.featuredCards;
    
    const result = await db.content.upsert('featuredCards', updatedContent);
    
    return NextResponse.json({
      success: true,
      featuredCards: result,
      language: lang
    });
  } catch (error) {
    console.error('Error updating featured cards:', error);
    return NextResponse.json(
      { error: 'Failed to update featured cards' },
      { status: 500 }
    );
  }
}
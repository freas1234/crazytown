import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { defaultContactContent } from '../../../models/Contact';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    
    const { db } = await connectToDatabase();
    const contentCollection = db.collection('content');
    
    const contactContent = await contentCollection.findOne({ type: 'contact' });
    
    return NextResponse.json({ 
      success: true,
      content: contactContent?.data || defaultContactContent
    });
  } catch (error) {
    console.error('Error fetching contact page content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
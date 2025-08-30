import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const content = await db.content.findByType('featuredCards');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching featured cards content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch featured cards content' },
      { status: 500 }
    );
  }
} 
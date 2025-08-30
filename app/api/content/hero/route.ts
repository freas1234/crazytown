import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const content = await db.content.findByType('hero');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json(
      { message: 'Failed to fetch hero content' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    // Fetch metadata from the database
    const content = await db.content.findByType('metadata');
    
    if (!content) {
      return NextResponse.json({
        success: true,
        content: {
          type: 'metadata',
          data: {
            title: '𝐅𝐚𝐬𝐭 | 𝐒𝐭𝐨𝐫𝐞',
            description: 'Official store for Fast server',
            keywords: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterHandle: '',
            themeColor: '#000000',
          }
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
} 
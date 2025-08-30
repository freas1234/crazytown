import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../lib/db';
import { authOptions } from '../../../../lib/auth-config';
import { defaultLoginContent } from '../../../models/PageContent';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const content = await db.collection('content').findOne({ type: 'login' });
    
    if (!content) {
      return NextResponse.json({ 
        content: defaultLoginContent,
        message: 'Using default login content' 
      });
    }
         
    return NextResponse.json({ 
      content: content.data || defaultLoginContent,
      message: 'Login content retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching login content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login content', content: defaultLoginContent },
      { status: 500 }
    );
  }
} 
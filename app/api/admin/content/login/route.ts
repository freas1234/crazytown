import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../../lib/db';
import { authOptions } from '../../../../../lib/auth-config';
import { defaultLoginContent } from '../../../../models/PageContent';

// GET endpoint to fetch login content for admin panel
export async function GET() {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'owner'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    const content = await db.collection('content').findOne({ type: 'login' });
    
    // If no content exists yet, return default content
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
      { error: 'Failed to fetch login content' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update login content
export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'owner'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    // Update or create login content
    const result = await db.collection('content').updateOne(
      { type: 'login' },
      { 
        $set: {
          data: content,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: 'login',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      message: 'Login content updated successfully',
      content: content
    });
  } catch (error) {
    console.error('Error updating login content:', error);
    return NextResponse.json(
      { error: 'Failed to update login content' },
      { status: 500 }
    );
  }
} 
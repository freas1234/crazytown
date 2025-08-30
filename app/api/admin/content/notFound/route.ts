import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '../../../../../lib/db';
import { authOptions } from '../../../../../lib/auth-config';

// Default content for the not found page
const defaultNotFoundContent = {
  en: {
    title: "Page Not Found",
    subtitle: "404",
    message: "The page you're looking for doesn't exist or has been moved to another location.",
    backHome: "Go Home"
  },
  ar: {
    title: "الصفحة غير موجودة",
    subtitle: "404",
    message: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.",
    backHome: "العودة للرئيسية"
  }
};

// GET endpoint to fetch not found content for admin panel
export async function GET() {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'owner'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { db } = await connectToDatabase();
    const content = await db.collection('content').findOne({ type: 'notFound' });
    
    // If no content exists yet, return default content
    if (!content) {
      return NextResponse.json({ 
        content: defaultNotFoundContent,
        message: 'Using default not found content' 
      });
    }
    
    return NextResponse.json({ 
      content: content.data || defaultNotFoundContent,
      message: 'Not found content retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching not found content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch not found content' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update not found content
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
    
    // Update or create not found content
    const result = await db.collection('content').updateOne(
      { type: 'notFound' },
      { 
        $set: {
          data: content,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: 'notFound',
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      message: 'Not found content updated successfully',
      content: content
    });
  } catch (error) {
    console.error('Error updating not found content:', error);
    return NextResponse.json(
      { error: 'Failed to update not found content' },
      { status: 500 }
    );
  }
} 
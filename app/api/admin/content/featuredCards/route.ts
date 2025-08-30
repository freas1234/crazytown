import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth-config';
import { db } from '../../../../../lib/db';
import { verifyToken } from '../../../../../lib/auth-utils';

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    const user = session.user;
    if (user.role === 'admin' || user.role === 'owner') {
      return { isAdmin: true, user };
    }
  }
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (token) {
    try {
      const decoded = await verifyToken(token);
      if (decoded && (decoded.role === 'admin' || decoded.role === 'owner')) {
        return { isAdmin: true, user: decoded };
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  return { isAdmin: false, user: null };
}

export async function GET() {
  const { isAdmin, user } = await checkAdminAuth();
  
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
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

export async function POST(request: Request) {
  const { isAdmin, user } = await checkAdminAuth();
  
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { data } = body;
    
    if (!data || !data.en || !data.ar) {
      return NextResponse.json(
        { message: 'Invalid featured cards data' },
        { status: 400 }
      );
    }
    
    if (!data.en.title || !data.ar.title) {
      return NextResponse.json(
        { message: 'Section titles are required' },
        { status: 400 }
      );
    }
        
    if (!data.en.cards || !data.ar.cards || 
        !Array.isArray(data.en.cards) || !Array.isArray(data.ar.cards) ||
        data.en.cards.length === 0 || data.ar.cards.length === 0) {
      return NextResponse.json(
        { message: 'Cards are required for both languages' },
        { status: 400 }
      );
    }
    
    const updatedContent = await db.content.upsert('featuredCards', data);
    
    return NextResponse.json({ 
      message: 'Featured cards content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Error updating featured cards content:', error);
    return NextResponse.json(
      { message: 'Failed to update featured cards content' },
      { status: 500 }
    );
  }
} 
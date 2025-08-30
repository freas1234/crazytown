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
    const content = await db.content.findByType('metadata');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { message: 'Failed to fetch metadata' },
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
    
    if (!data || !data.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    
    const updatedContent = await db.content.upsert('metadata', data);
    
    return NextResponse.json({ 
      message: 'Metadata updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    return NextResponse.json(
      { message: 'Failed to update metadata' },
      { status: 500 }
    );
  }
} 
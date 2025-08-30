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
        { message: 'Invalid hero content data' },
        { status: 400 }
      );
    }
            
    if (!data.en.title || !data.en.subtitle || !data.en.cta ||
        !data.ar.title || !data.ar.subtitle || !data.ar.cta) {
      return NextResponse.json(
        { message: 'All hero content fields are required' },
        { status: 400 }
      );
    }
    
    const updatedContent = await db.content.upsert('hero', data);
    
    return NextResponse.json({ 
      message: 'Hero content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Error updating hero content:', error);
    return NextResponse.json(
      { message: 'Failed to update hero content' },
      { status: 500 }
    );
  }
} 
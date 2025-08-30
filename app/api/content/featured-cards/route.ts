import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'en';
    
    const { db } = await connectToDatabase();
    const contentCollection = db.collection('content');
    
    const featuredCards = await contentCollection.findOne({ type: 'featuredCards' });
    
    return NextResponse.json({
      success: true,
      featuredCards: featuredCards?.data || {
        categories: [],
        newItems: [],
        bestSelling: [],
        discounts: []
      }
    });
  } catch (error) {
    console.error('Error fetching featured cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    if (!data || !data.featuredCards) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const contentCollection = db.collection('content');
    
    
    await contentCollection.updateOne(
      { type: 'featuredCards' },
      { $set: { data: data.featuredCards } },
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Featured cards updated successfully'
    });
  } catch (error) {
    console.error('Error updating featured cards:', error);
    return NextResponse.json(
      { error: 'Failed to update featured cards' },
      { status: 500 }
    );
  }
} 
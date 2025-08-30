import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { getRules, createRule } from '../../../models/Rule';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const rules = await getRules();
    
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
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
    
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate multilingual content
    if (!data.title.en || !data.title.ar || !data.description.en || !data.description.ar) {
      return NextResponse.json(
        { error: 'Both English and Arabic content is required for title and description' },
        { status: 400 }
      );
    }
    
    const rule = await createRule({
      title: {
        en: data.title.en,
        ar: data.title.ar
      },
      description: {
        en: data.description.en,
        ar: data.description.ar
      },
      category: data.category,
      order: data.order || 0,
      active: data.active !== undefined ? data.active : true,
    });
    
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
} 
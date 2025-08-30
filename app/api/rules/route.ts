import { NextRequest, NextResponse } from 'next/server';
import { getRules } from '../../models/Rule';

export async function GET(request: NextRequest) {
  try {
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
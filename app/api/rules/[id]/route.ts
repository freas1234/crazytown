import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { getRule, updateRule, deleteRule } from '../../../models/Rule';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rule = await getRule(id);
    
    if (!rule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ rule });
  } catch (error) {
    console.error('Error fetching rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Make sure the rule exists
    const existingRule = await getRule(id);
    if (!existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }
    
    // Update the rule
    const updatedRule = await updateRule(id, body);
    
    return NextResponse.json({ rule: updatedRule });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Make sure the rule exists
    const existingRule = await getRule(id);
    if (!existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }
    
    // Delete the rule
    await deleteRule(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    );
  }
} 
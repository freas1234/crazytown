import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth-config';
import { updateRuleCategory, deleteRuleCategory } from '../../../../../models/Rule';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const data = await request.json();
    
    const updatedCategory = await updateRuleCategory(id, {
      name: data.name,
      order: data.order,
      active: data.active,
    });
    
    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error('Error updating rule category:', error);
    return NextResponse.json(
      { error: 'Failed to update rule category' },
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
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    await deleteRuleCategory(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule category:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule category' },
      { status: 500 }
    );
  }
} 
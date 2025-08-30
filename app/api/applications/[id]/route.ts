import { NextRequest, NextResponse } from 'next/server';
import { getApplication, updateApplicationStatus } from '../../../models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    const application = await getApplication(id);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Only allow admin/owner or the user who applied to view the application
    if (!session || 
        (!['admin', 'owner'].includes(session.user.role) && 
         application.userId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
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
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const data = await request.json();
    
    const application = await getApplication(id);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    if (!['pending', 'approved', 'rejected'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const updatedApplication = await updateApplicationStatus(
      id, 
      data.status as 'pending' | 'approved' | 'rejected'
    );
    
    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
} 
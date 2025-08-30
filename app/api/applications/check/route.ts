import { NextRequest, NextResponse } from 'next/server';
import { checkUserApplicationStatus } from '../../../models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    const applicationStatus = await checkUserApplicationStatus(session.user.id, jobId);
    
    return NextResponse.json({ applicationStatus });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { error: 'Failed to check application status' },
      { status: 500 }
    );
  }
} 
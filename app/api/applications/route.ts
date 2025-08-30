import { NextRequest, NextResponse } from 'next/server';
import { createApplication, getApplications, checkUserApplicationStatus } from '../../models/Job';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    const jobId = searchParams.get('jobId') || undefined;
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;
    
    const applications = await getApplications(jobId, status);
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const data = await request.json();
    
    if (!data.jobId || !data.name || !data.email || !data.discord || 
        !data.experience || !data.whyJoin || !data.availability) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (session?.user?.id) {
      const applicationStatus = await checkUserApplicationStatus(session.user.id, data.jobId);
      
      if (applicationStatus) {
        if (applicationStatus.status === 'pending' || applicationStatus.status === 'approved') {
          return NextResponse.json(
            { error: 'You have already applied for this job' },
            { status: 400 }
          );
        } else if (applicationStatus.status === 'rejected') {
          const rejectionTime = new Date(applicationStatus.updatedAt).getTime();
          const currentTime = new Date().getTime();
          const hoursSinceRejection = (currentTime - rejectionTime) / (1000 * 60 * 60);
          const hoursRemaining = Math.ceil(24 - hoursSinceRejection);
          
          return NextResponse.json(
            { 
              error: `Your previous application was rejected. Please wait ${hoursRemaining} more hour${hoursRemaining !== 1 ? 's' : ''} before applying again.` 
            },
            { status: 400 }
          );
        }
      }
    }
    
    const applicationData = {
      jobId: data.jobId,
      name: data.name,
      email: data.email,
      discord: data.discord,
      experience: data.experience,
      whyJoin: data.whyJoin,
      availability: data.availability,
      resume: data.resume || undefined,
      userId: session?.user?.id
    };
    
    const application = await createApplication(applicationData);
    
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getUserApplications } from '../../../models/Job';
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
    
    const applications = await getUserApplications(session.user.id);
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
} 
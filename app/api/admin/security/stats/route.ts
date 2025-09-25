import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { db } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get security statistics
    const stats = await db.security.getEventStats();

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    return NextResponse.json({ error: 'Failed to fetch security stats' }, { status: 500 });
  }
}

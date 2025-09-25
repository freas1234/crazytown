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

    // Get blocked IPs from database
    const blockedIPs = await db.security.getBlockedIPs();

    return NextResponse.json({
      success: true,
      blockedIPs: blockedIPs.map((ip: any) => ({
        ip: ip.ip,
        reason: ip.reason,
        blockedAt: ip.blockedAt,
        duration: ip.duration
      }))
    });
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked IPs' }, { status: 500 });
  }
}

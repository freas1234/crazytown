import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { db } from '../../../../../lib/db';
import { logSecurityEvent } from '../../../../../lib/security-monitor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ip } = body;

    if (!ip) {
      return NextResponse.json({ error: 'IP is required' }, { status: 400 });
    }

    // Unblock the IP
    await db.security.unblockIP(ip, session.user.id);

    // Log the event
    await logSecurityEvent(
      'IP_UNBLOCKED',
      'MEDIUM',
      ip,
      { unblockedBy: session.user.id }
    );

    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been unblocked successfully`
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    if (error instanceof Error && error.message === 'IP is not blocked') {
      return NextResponse.json({ error: 'IP is not blocked' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to unblock IP' }, { status: 500 });
  }
}

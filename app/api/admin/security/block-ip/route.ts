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
    const { ip, reason } = body;

    if (!ip || !reason) {
      return NextResponse.json({ error: 'IP and reason are required' }, { status: 400 });
    }

    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip)) {
      return NextResponse.json({ error: 'Invalid IP address format' }, { status: 400 });
    }

    // Block the IP
    const blockedIP = await db.security.blockIP(ip, reason, session.user.id);

    // Log the event
    await logSecurityEvent(
      'IP_BLOCKED',
      'HIGH',
      ip,
      { reason, blockedBy: session.user.id }
    );

    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been blocked successfully`
    });
  } catch (error) {
    console.error('Error blocking IP:', error);
    if (error instanceof Error && error.message === 'IP is already blocked') {
      return NextResponse.json({ error: 'IP is already blocked' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to block IP' }, { status: 500 });
  }
}

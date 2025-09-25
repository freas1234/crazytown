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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get security events from database
    const events = await db.security.getEvents(limit, offset);

    return NextResponse.json({
      success: true,
      events: events.map(event => ({
        id: (event as any)._id?.toString() || event.id || '',
        type: event.type,
        severity: event.severity,
        clientIP: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        timestamp: event.timestamp,
        resolved: event.resolved || false
      }))
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json({ error: 'Failed to fetch security events' }, { status: 500 });
  }
}

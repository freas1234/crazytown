import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const settings = await db.content.findByType('siteSettings');
    
    
    return NextResponse.json({
      success: true,
      settings: settings?.data || {
        siteName: 'Crazy Town',
        siteDescription: 'The official Crazy Town community website',
        contactEmail: 'admin@crazytown.com',
        discordInviteUrl: 'https://discord.gg/crazytown',
        enableRegistration: true,
        enableStore: true,
        enableJobs: false,
        maintenanceMode: false,
        maintenanceContent: {
          en: {
            title: "Site Under Maintenance",
            message: "We're currently performing scheduled maintenance. Please check back soon."
          },
          ar: {
            title: "الموقع تحت الصيانة",
            message: "نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { data } = body;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    const result = await db.content.upsert('siteSettings', data);
    
    return NextResponse.json({
      success: true,
      settings: result,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

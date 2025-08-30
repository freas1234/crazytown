import { NextResponse } from "next/server";
import { isMaintenanceModeEnabled, loadMaintenanceModeFromDb } from "../../../lib/maintenance";
import { connectToDatabase } from "../../../lib/db";

export async function GET() {
  try {
    console.log('API: Loading maintenance mode from DB');
    await loadMaintenanceModeFromDb();
    const maintenanceEnabled = isMaintenanceModeEnabled();
    console.log('API: Maintenance mode is:', maintenanceEnabled);
    
    const { db } = await connectToDatabase();
    const pageContent = await db.collection('pageContent').findOne({ page: 'maintenance' });
    
    return NextResponse.json({
      maintenanceMode: maintenanceEnabled,
      content: pageContent?.content || {
        en: {
          title: "Site Under Maintenance",
          message: "We're currently performing scheduled maintenance. Please check back soon."
        },
        ar: {
          title: "الموقع تحت الصيانة",
          message: "نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
        }
      },
      success: true
    });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
} 
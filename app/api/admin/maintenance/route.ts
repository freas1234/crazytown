import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { 
  isMaintenanceModeEnabled, 
  enableMaintenanceMode, 
  disableMaintenanceMode, 
  toggleMaintenanceMode,
  loadMaintenanceModeFromDb
} from "../../../../lib/maintenance";
import { connectToDatabase } from "../../../../lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }
    
    await loadMaintenanceModeFromDb();
    
    // Get maintenance content
    const { db } = await connectToDatabase();
    const pageContent = await db.collection('pageContent').findOne({ page: 'maintenance' });
    
    return NextResponse.json({
      success: true,
      maintenanceMode: isMaintenanceModeEnabled(),
      content: pageContent?.content || {
        en: {
          title: "Site Under Maintenance",
          message: "We're currently performing scheduled maintenance. Please check back soon."
        },
        ar: {
          title: "الموقع تحت الصيانة",
          message: "نحن نقوم حاليًا بإجراء صيانة مجدولة. يرجى التحقق مرة أخرى قريبًا."
        }
      }
    });
  } catch (error) {
    console.error("Error in GET maintenance:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance status", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log("Maintenance POST request body:", body);
    
    if (body.action === 'enable') {
      console.log("Enabling maintenance mode");
      await enableMaintenanceMode();
      return NextResponse.json({
        maintenanceMode: true,
        success: true
      });
    } else if (body.action === 'disable') {
      console.log("Disabling maintenance mode");
      await disableMaintenanceMode();
      return NextResponse.json({
        maintenanceMode: false,
        success: true
      });
    } else if (body.action === 'toggle') {
      console.log("Toggling maintenance mode");
      const newState = await toggleMaintenanceMode();
      console.log("New maintenance state:", newState);
      return NextResponse.json({
        maintenanceMode: newState,
        success: true
      });
    } else if (body.content) {
      // Update maintenance content
      const { db } = await connectToDatabase();
      
      // Validate content structure
      const content = body.content;
      if (!content.en || !content.ar || 
          typeof content.en.title !== 'string' || 
          typeof content.en.message !== 'string' ||
          typeof content.ar.title !== 'string' || 
          typeof content.ar.message !== 'string') {
        return NextResponse.json(
          { error: "Invalid content format", success: false },
          { status: 400 }
        );
      }
      
      // Update or insert the maintenance page content
      await db.collection('pageContent').updateOne(
        { page: 'maintenance' },
        { 
          $set: { 
            content,
            updatedAt: new Date(),
            updatedBy: session.user.id
          } 
        },
        { upsert: true }
      );
      
      return NextResponse.json({
        success: true,
        message: "Maintenance content updated successfully"
      });
    } else {
      console.error("Invalid maintenance action:", body);
      return NextResponse.json(
        { error: "Invalid action. Expected 'enable', 'disable', 'toggle', or content update", success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST maintenance:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance status", success: false },
      { status: 500 }
    );
  }
} 
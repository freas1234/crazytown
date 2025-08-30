import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { db } from "../../../../../lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const content = await db.content.findByType("applications");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          title: "My Applications",
          subtitle: "Track the status of your job applications",
          noApplications: "You haven't submitted any applications yet",
          columns: {
            position: "Position",
            date: "Date Applied",
            status: "Status",
            actions: "Actions"
          },
          statuses: {
            pending: "Pending",
            reviewing: "Under Review",
            accepted: "Accepted",
            rejected: "Rejected"
          },
          viewDetails: "View Details",
          deleteApplication: "Delete Application",
          confirmDelete: "Are you sure you want to delete this application?",
          cancelDelete: "Cancel"
        },
        ar: {
          title: "طلباتي",
          subtitle: "تتبع حالة طلبات التوظيف الخاصة بك",
          noApplications: "لم تقدم أي طلبات بعد",
          columns: {
            position: "المنصب",
            date: "تاريخ التقديم",
            status: "الحالة",
            actions: "الإجراءات"
          },
          statuses: {
            pending: "قيد الانتظار",
            reviewing: "قيد المراجعة",
            accepted: "مقبول",
            rejected: "مرفوض"
          },
          viewDetails: "عرض التفاصيل",
          deleteApplication: "حذف الطلب",
          confirmDelete: "هل أنت متأكد أنك تريد حذف هذا الطلب؟",
          cancelDelete: "إلغاء"
        }
      }
    });
  } catch (error) {
    console.error("Error fetching applications content:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: "No content provided" }, 
        { status: 400 }
      );
    }
    
    const result = await db.content.upsert("applications", content);
    
    return NextResponse.json({
      success: true,
      message: "Applications content updated successfully"
    });
  } catch (error) {
    console.error("Error updating applications content:", error);
    return NextResponse.json(
      { error: "Failed to update applications content" },
      { status: 500 }
    );
  }
} 
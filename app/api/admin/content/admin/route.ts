import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { db } from '../../../../../lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const content = await db.content.findByType('admin');
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          dashboard: {
            title: "Admin Dashboard",
            welcome: "Welcome to the admin dashboard",
            summary: "Here's a summary of your site's activity"
          },
          sidebar: {
            dashboard: "Dashboard",
            content: "Content",
            store: "Store",
            jobs: "Jobs",
            users: "Users",
            orders: "Orders",
            settings: "Settings",
            backToSite: "Back to Site"
          },
          common: {
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            create: "Create",
            search: "Search",
            filter: "Filter",
            loading: "Loading...",
            saving: "Saving...",
            success: "Success",
            error: "Error",
            confirm: "Confirm",
            actions: "Actions"
          }
        },
        ar: {
          dashboard: {
            title: "لوحة التحكم",
            welcome: "مرحبًا بك في لوحة التحكم",
            summary: "إليك ملخصًا لنشاط موقعك"
          },
          sidebar: {
            dashboard: "لوحة التحكم",
            content: "المحتوى",
            store: "المتجر",
            jobs: "الوظائف",
            users: "المستخدمين",
            orders: "الطلبات",
            settings: "الإعدادات",
            backToSite: "العودة إلى الموقع"
          },
          common: {
            save: "حفظ",
            cancel: "إلغاء",
            edit: "تعديل",
            delete: "حذف",
            create: "إنشاء",
            search: "بحث",
            filter: "تصفية",
            loading: "جاري التحميل...",
            saving: "جاري الحفظ...",
            success: "تم بنجاح",
            error: "خطأ",
            confirm: "تأكيد",
            actions: "إجراءات"
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== 'admin' && session?.user?.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' }, 
        { status: 400 }
      );
    }
    
    const result = await db.content.upsert('admin', content);
    
    return NextResponse.json({
      success: true,
      message: 'Admin content updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin content:', error);
    return NextResponse.json(
      { error: 'Failed to update admin content' },
      { status: 500 }
    );
  }
} 
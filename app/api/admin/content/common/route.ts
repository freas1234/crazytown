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
    
    const content = await db.content.findByType('common');
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          buttons: {
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            create: "Create",
            update: "Update",
            submit: "Submit",
            back: "Back",
            next: "Next",
            confirm: "Confirm",
            search: "Search",
            filter: "Filter",
            sort: "Sort",
            add: "Add",
            remove: "Remove"
          },
          status: {
            loading: "Loading...",
            saving: "Saving...",
            success: "Success",
            error: "Error",
            warning: "Warning",
            info: "Information"
          },
          forms: {
            required: "Required",
            optional: "Optional",
            invalid: "Invalid",
            valid: "Valid"
          },
          messages: {
            confirmDelete: "Are you sure you want to delete this item?",
            unsavedChanges: "You have unsaved changes. Are you sure you want to leave?",
            successfullyCreated: "Successfully created",
            successfullyUpdated: "Successfully updated",
            successfullyDeleted: "Successfully deleted",
            errorOccurred: "An error occurred"
          }
        },
        ar: {
          buttons: {
            save: "حفظ",
            cancel: "إلغاء",
            edit: "تعديل",
            delete: "حذف",
            create: "إنشاء",
            update: "تحديث",
            submit: "إرسال",
            back: "رجوع",
            next: "التالي",
            confirm: "تأكيد",
            search: "بحث",
            filter: "تصفية",
            sort: "ترتيب",
            add: "إضافة",
            remove: "إزالة"
          },
          status: {
            loading: "جاري التحميل...",
            saving: "جاري الحفظ...",
            success: "تم بنجاح",
            error: "خطأ",
            warning: "تحذير",
            info: "معلومات"
          },
          forms: {
            required: "مطلوب",
            optional: "اختياري",
            invalid: "غير صالح",
            valid: "صالح"
          },
          messages: {
            confirmDelete: "هل أنت متأكد أنك تريد حذف هذا العنصر؟",
            unsavedChanges: "لديك تغييرات غير محفوظة. هل أنت متأكد أنك تريد المغادرة؟",
            successfullyCreated: "تم الإنشاء بنجاح",
            successfullyUpdated: "تم التحديث بنجاح",
            successfullyDeleted: "تم الحذف بنجاح",
            errorOccurred: "حدث خطأ"
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching common translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch common translations' },
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
    
    const result = await db.content.upsert('common', content);
    
    return NextResponse.json({
      success: true,
      message: 'Common translations updated successfully'
    });
  } catch (error) {
    console.error('Error updating common translations:', error);
    return NextResponse.json(
      { error: 'Failed to update common translations' },
      { status: 500 }
    );
  }
}

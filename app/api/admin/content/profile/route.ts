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
    
    const content = await db.content.findByType("profile");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          title: "My Profile",
          subtitle: "Manage your account settings and preferences",
          personalInfo: {
            title: "Personal Information",
            nameLabel: "Full Name",
            usernameLabel: "Username",
            emailLabel: "Email Address",
            joinedLabel: "Joined",
            saveButton: "Save Changes",
            successMessage: "Profile updated successfully",
            errorMessage: "Failed to update profile"
          },
          security: {
            title: "Security Settings",
            currentPasswordLabel: "Current Password",
            newPasswordLabel: "New Password",
            confirmPasswordLabel: "Confirm New Password",
            changePasswordButton: "Change Password",
            successMessage: "Password changed successfully",
            errorMessage: "Failed to change password"
          },
          tabs: {
            info: "Personal Info",
            security: "Security",
            applications: "My Applications",
            orders: "My Orders"
          }
        },
        ar: {
          title: "ملفي الشخصي",
          subtitle: "إدارة إعدادات وتفضيلات حسابك",
          personalInfo: {
            title: "المعلومات الشخصية",
            nameLabel: "الاسم الكامل",
            usernameLabel: "اسم المستخدم",
            emailLabel: "البريد الإلكتروني",
            joinedLabel: "تاريخ الانضمام",
            saveButton: "حفظ التغييرات",
            successMessage: "تم تحديث الملف الشخصي بنجاح",
            errorMessage: "فشل تحديث الملف الشخصي"
          },
          security: {
            title: "إعدادات الأمان",
            currentPasswordLabel: "كلمة المرور الحالية",
            newPasswordLabel: "كلمة المرور الجديدة",
            confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
            changePasswordButton: "تغيير كلمة المرور",
            successMessage: "تم تغيير كلمة المرور بنجاح",
            errorMessage: "فشل تغيير كلمة المرور"
          },
          tabs: {
            info: "المعلومات الشخصية",
            security: "الأمان",
            applications: "طلباتي",
            orders: "طلبات الشراء"
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching profile content:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile content" },
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
    
    const result = await db.content.upsert("profile", content);
    
    return NextResponse.json({
      success: true,
      message: "Profile content updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile content:", error);
    return NextResponse.json(
      { error: "Failed to update profile content" },
      { status: 500 }
    );
  }
} 
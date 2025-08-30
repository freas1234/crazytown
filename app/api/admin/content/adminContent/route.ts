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
    
    const content = await db.content.findByType("adminContent");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          pages: {
            hero: {
              title: "Hero Section",
              description: "Manage the homepage hero section content",
              actionButton: "Manage Hero Content"
            },
            featuredCards: {
              title: "Featured Cards",
              description: "Manage the featured cards on the homepage",
              actionButton: "Manage Featured Cards"
            }
          }
        },
        ar: {
          pages: {
            hero: {
              title: "قسم الترحيب",
              description: "إدارة محتوى قسم الترحيب في الصفحة الرئيسية",
              actionButton: "إدارة محتوى الترحيب"
            },
            featuredCards: {
              title: "البطاقات المميزة",
              description: "إدارة البطاقات المميزة في الصفحة الرئيسية",
              actionButton: "إدارة البطاقات المميزة"
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching admin content pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin content pages" },
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
    
    const result = await db.content.upsert("adminContent", content);
    
    return NextResponse.json({
      success: true,
      message: "Admin content pages updated successfully"
    });
  } catch (error) {
    console.error("Error updating admin content pages:", error);
    return NextResponse.json(
      { error: "Failed to update admin content pages" },
      { status: 500 }
    );
  }
}

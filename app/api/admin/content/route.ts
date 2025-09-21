import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-config";
import { db } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const contentType = request.nextUrl.searchParams.get('type');
    
    if (!contentType) {
      return NextResponse.json(
        { error: "Content type is required" },
        { status: 400 }
      );
    }
    
    // Get content from database
    const dbContent = await db.content.findByType(contentType);
    
    if (dbContent && dbContent.data) {
      return NextResponse.json({
        success: true,
        content: dbContent.data
      });
    }
    
    // If no content found in database, return empty object
    return NextResponse.json({
      success: true,
      content: {}
    });
  } catch (error) {
    console.error("Error in GET content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
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
    const { type, content } = body;
    
    if (!type || !content) {
      return NextResponse.json(
        { error: "Content type and content are required" },
        { status: 400 }
      );
    }
    
    // Validate that content is a valid object
    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { error: `Invalid content data: expected object, got ${typeof content}` },
        { status: 400 }
      );
    }
    
    // Save content to database
    await db.content.upsert(type, content);
    
    return NextResponse.json({
      success: true,
      message: `${type} content updated successfully`
    });
  } catch (error) {
    console.error("Error in PUT content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

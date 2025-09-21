import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
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

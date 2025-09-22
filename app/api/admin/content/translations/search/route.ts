import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth-config";
import { db } from "../../../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const language = searchParams.get('language');
    
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }
    
    try {
      const results = await db.translations.search(query, language || undefined);
      
      return NextResponse.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error searching translations:', error);
      return NextResponse.json(
        { error: 'Failed to search translations' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in search translations:", error);
    return NextResponse.json(
      { error: "Failed to search translations" },
      { status: 500 }
    );
  }
}

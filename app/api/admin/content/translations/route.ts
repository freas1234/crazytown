import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { db } from "../../../../../lib/db";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const language = request.nextUrl.searchParams.get('language') || 'en';
    
    if (language !== 'en' && language !== 'ar') {
      return NextResponse.json(
        { error: "Invalid language specified" },
        { status: 400 }
      );
    }
    
    // Get translations from database
    const dbTranslations = await db.content.findByType(`translations_${language}`);
    
    if (dbTranslations && dbTranslations.data) {
      return NextResponse.json({
        success: true,
        translations: dbTranslations.data
      });
    }
    
    // If no translations found in database, return empty object
    return NextResponse.json({
      success: true,
      translations: {}
    });
  } catch (error) {
    console.error("Error in GET translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
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
    const { language, translations } = body;
    
    if (!language || !translations) {
      return NextResponse.json(
        { error: "Language and translations are required" },
        { status: 400 }
      );
    }
    
    if (language !== 'en' && language !== 'ar') {
      return NextResponse.json(
        { error: "Only 'en' and 'ar' languages are supported" },
        { status: 400 }
      );
    }
    
    // Validate that translations is a valid object
    if (!translations || typeof translations !== 'object') {
      return NextResponse.json(
        { error: `Invalid translations data: expected object, got ${typeof translations}` },
        { status: 400 }
      );
    }
    
    try {
      // Save translations to database
      await db.content.upsert(`translations_${language}`, translations);
      
      return NextResponse.json({
        success: true,
        message: `${language} translations updated successfully`
      });
    } catch (error) {
      console.error(`Error saving ${language} translations to database:`, error);
      return NextResponse.json(
        { error: `Failed to save ${language} translations` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in PUT translations:", error);
    return NextResponse.json(
      { error: "Failed to update translations" },
      { status: 500 }
    );
  }
}

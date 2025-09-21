import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
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
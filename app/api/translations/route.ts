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
    
    try {
      // Try to get translations from database first
      const dbTranslations = await db.content.findByType(`translations_${language}`);
      
      if (dbTranslations && dbTranslations.data) {
        return NextResponse.json({
          success: true,
          translations: dbTranslations.data
        });
      }
      
      // Fallback to static files if not in database
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'locales', `${language}.json`);
      
      try {
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const translations = JSON.parse(fileContent);
        
        return NextResponse.json({
          success: true,
          translations
        });
      } catch (fileError) {
        console.error(`Error reading ${language}.json:`, fileError);
        return NextResponse.json(
          { error: `Failed to read ${language} translations` },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error(`Error reading ${language} translations:`, error);
      return NextResponse.json(
        { error: `Failed to read ${language} translations` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in GET translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}
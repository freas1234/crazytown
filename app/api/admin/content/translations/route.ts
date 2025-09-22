import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { db } from "../../../../../lib/db";

// Helper function to flatten nested object to key-value pairs
const flattenTranslations = (obj: any, prefix = ''): Array<{ key: string; value: string }> => {
  const result: Array<{ key: string; value: string }> = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      result.push(...flattenTranslations(value, newKey));
    } else {
      result.push({ key: newKey, value: String(value) });
    }
  }
  
  return result;
};

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
    
    try {
      const translations = await db.translations.getByLanguage(language);
      
      return NextResponse.json({
        success: true,
        translations
      });
    } catch (error) {
      console.error(`Error reading ${language} translations from database:`, error);
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
    
    try {
      // Flatten the nested translations object to key-value pairs
      const flattenedTranslations = flattenTranslations(translations);
      
      // Convert to the format expected by updateMultiple
      const translationUpdates = flattenedTranslations.map(({ key, value }) => ({
        key,
        language,
        value
      }));
      
      const result = await db.translations.updateMultiple(translationUpdates);
      
      if (!result.success) {
        return NextResponse.json(
          { error: `Failed to update ${language} translations` },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `${language} translations updated successfully`,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      });
    } catch (error) {
      console.error(`Error updating ${language} translations in database:`, error);
      return NextResponse.json(
        { error: `Failed to update ${language} translations` },
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

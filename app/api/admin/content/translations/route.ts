import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import * as fs from 'fs';
import * as path from 'path';


const writeTranslationFile = async (language: string, translations: any): Promise<boolean> => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', `${language}.json`);
    
    // Validate that translations is a valid object
    if (!translations || typeof translations !== 'object') {
      throw new Error(`Invalid translations data: expected object, got ${typeof translations}`);
    }
    
    const jsonString = JSON.stringify(translations, null, 2);
    await fs.promises.writeFile(filePath, jsonString, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${language}.json:`, error);
    return false;
  }
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
    
    const filePath = path.join(process.cwd(), 'public', 'locales', `${language}.json`);
    
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const translations = JSON.parse(fileContent);
      
      return NextResponse.json({
        success: true,
        translations
      });
    } catch (error) {
      console.error(`Error reading ${language}.json:`, error);
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
    
    const success = await writeTranslationFile(language, translations);
    
    if (!success) {
      return NextResponse.json(
        { error: `Failed to write ${language} translations` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `${language} translations updated successfully`
    });
  } catch (error) {
    console.error("Error in PUT translations:", error);
    return NextResponse.json(
      { error: "Failed to update translations" },
      { status: 500 }
    );
  }
}

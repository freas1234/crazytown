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
    
    try {
      const [allKeys, enTranslations, arTranslations] = await Promise.all([
        db.translations.getAllKeys(),
        db.translations.getByLanguage('en'),
        db.translations.getByLanguage('ar')
      ]);
      
      // Count unique keys
      const uniqueKeys = new Set(allKeys);
      
      // Count translations per language
      const enCount = Object.keys(enTranslations).length;
      const arCount = Object.keys(arTranslations).length;
      
      // Find missing translations
      const enKeys = new Set();
      const arKeys = new Set();
      
      const collectKeys = (obj: any, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            collectKeys(value, fullKey);
          } else {
            if (prefix.includes('en') || prefix === '') enKeys.add(fullKey);
            if (prefix.includes('ar') || prefix === '') arKeys.add(fullKey);
          }
        }
      };
      
      collectKeys(enTranslations);
      collectKeys(arTranslations);
      
      const missingEn = Array.from(arKeys).filter(key => !enKeys.has(key));
      const missingAr = Array.from(enKeys).filter(key => !arKeys.has(key));
      
      const stats = {
        totalKeys: uniqueKeys.size,
        enTranslations: enCount,
        arTranslations: arCount,
        missingEn: missingEn.length,
        missingAr: missingAr.length,
        completionRate: {
          en: uniqueKeys.size > 0 ? Math.round((enCount / uniqueKeys.size) * 100) : 0,
          ar: uniqueKeys.size > 0 ? Math.round((arCount / uniqueKeys.size) * 100) : 0
        }
      };
      
      return NextResponse.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error fetching translation stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch translation statistics' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in GET translation stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch translation statistics" },
      { status: 500 }
    );
  }
}

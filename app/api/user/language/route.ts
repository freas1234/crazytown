import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { db } from '../../../../lib/db';
import { LANGUAGES, Language } from '../../../../lib/i18n';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { language } = body;
    
    if (!language || !(language in LANGUAGES)) {
      return NextResponse.json(
        { error: 'Invalid language specified' }, 
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    await db.settings.updateUserLanguagePreference(userId, language);
    
    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error('Error updating language preference:', error);
    return NextResponse.json(
      { error: 'Failed to update language preference' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const language = await db.settings.getUserLanguagePreference(userId);
    
    
    const validLanguage = (language in LANGUAGES) ? 
      language as Language : 
      'en' as Language;
    
    return NextResponse.json({ 
      success: true, 
      language: validLanguage,
      isRTL: LANGUAGES[validLanguage].isRTL,
      dir: LANGUAGES[validLanguage].dir
    });
  } catch (error) {
    console.error('Error fetching language preference:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language preference' },
      { status: 500 }
    );
  }
} 
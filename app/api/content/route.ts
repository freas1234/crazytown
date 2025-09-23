import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');
    
    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      );
    }
    
    // Handle different content types
    switch (contentType) {
      case 'notFound':
        return NextResponse.json({
          content: {
            en: {
              title: "Page Not Found",
              subtitle: "404",
              message: "The page you're looking for doesn't exist or has been moved to another location.",
              backHome: "Go Home"
            },
            ar: {
              title: "الصفحة غير موجودة",
              subtitle: "404",
              message: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.",
              backHome: "العودة للرئيسية"
            }
          }
        });
      
      case 'hero':
        try {
          const content = await db.content.findByType('hero');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching hero content:', error);
          return NextResponse.json({ content: null });
        }
      
      case 'featuredCards':
        try {
          const content = await db.content.findByType('featuredCards');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching featured cards content:', error);
          return NextResponse.json({ content: null });
        }
      
      case 'contact':
        try {
          const content = await db.content.findByType('contact');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching contact content:', error);
          return NextResponse.json({ content: null });
        }
      
      case 'login':
        try {
          const content = await db.content.findByType('login');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching login content:', error);
          return NextResponse.json({ content: null });
        }
      
      case 'register':
        try {
          const content = await db.content.findByType('register');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching register content:', error);
          return NextResponse.json({ content: null });
        }
      
      case 'about':
        try {
          const content = await db.content.findByType('about');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching about content:', error);
          return NextResponse.json({ content: null });
        }
      
      case 'metadata':
        try {
          const content = await db.content.findByType('metadata');
          return NextResponse.json({ content: content?.data || null });
        } catch (error) {
          console.error('Error fetching metadata content:', error);
          return NextResponse.json({ content: null });
        }
      
      default:
        return NextResponse.json(
          { error: `Unknown content type: ${contentType}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

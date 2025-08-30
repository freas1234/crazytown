import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

const defaultNotFoundContent = {
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
};

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const content = await db.collection('content').findOne({ type: 'notFound' });
    
    if (!content) {
      return NextResponse.json({ 
        content: defaultNotFoundContent,
        message: 'Using default not found content' 
      });
    }
    
    return NextResponse.json({ 
      content: content.data || defaultNotFoundContent,
      message: 'Not found content retrieved successfully' 
    });
  } catch (error) {
    console.error('Error fetching not found content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch not found content', content: defaultNotFoundContent },
      { status: 500 }
    );
  }
} 
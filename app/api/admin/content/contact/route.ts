import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth-config';
import { connectToDatabase } from '../../../../../lib/db';
import { defaultContactContent } from '../../../../models/Contact';

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id && (session.user.role === 'admin' || session.user.role === 'owner')) {
    return { isAdmin: true, user: session.user };
  }
  
  return { isAdmin: false, user: null };
}

export async function GET() {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { db: database } = await connectToDatabase();
    const contentCollection = database.collection('content');
    
    const contactContent = await contentCollection.findOne({ type: 'contact' });
    
    return NextResponse.json({ 
      success: true,
      content: contactContent?.data || defaultContactContent
    });
  } catch (error) {
    console.error('Error fetching contact page content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { content } = data;
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    if (!content.en || !content.ar) {
      return NextResponse.json({ 
        error: 'Both English and Arabic content is required' 
      }, { status: 400 });
    }
    
    const requiredFields = [
      'title', 'subtitle', 'contactInfoTitle', 'contactInfoSubtitle', 
      'formTitle', 'formSubtitle', 'faqTitle', 'faqSubtitle', 'successMessage'
    ];
    
    for (const field of requiredFields) {
      if (!content.en[field] || !content.ar[field]) {
        return NextResponse.json({ 
          error: `Field '${field}' is required in both English and Arabic` 
        }, { status: 400 });
      }
    }
    
    if (!content.en.formLabels || !content.ar.formLabels) {
      return NextResponse.json({ 
        error: 'Form labels are required in both English and Arabic' 
      }, { status: 400 });
    }
    
    const formLabelFields = [
      'name', 'email', 'subject', 'message', 'send', 'sending',
      'namePlaceholder', 'emailPlaceholder', 'subjectPlaceholder', 'messagePlaceholder'
    ];
    
    for (const field of formLabelFields) {
      if (!content.en.formLabels[field] || !content.ar.formLabels[field]) {
        return NextResponse.json({ 
          error: `Form label '${field}' is required in both English and Arabic` 
        }, { status: 400 });
      }
    }
    
    if (!Array.isArray(content.en.faqs) || !Array.isArray(content.ar.faqs)) {
      return NextResponse.json({ 
        error: 'FAQs must be arrays in both English and Arabic' 
      }, { status: 400 });
    }
    
    if (content.en.faqs.length !== content.ar.faqs.length) {
      return NextResponse.json({ 
        error: 'The number of FAQs must be the same in both languages' 
      }, { status: 400 });
    }
    
    for (let i = 0; i < content.en.faqs.length; i++) {
      if (!content.en.faqs[i].question || !content.en.faqs[i].answer ||
          !content.ar.faqs[i].question || !content.ar.faqs[i].answer) {
        return NextResponse.json({ 
          error: `FAQ #${i + 1} must have both question and answer in both languages` 
        }, { status: 400 });
      }
    }
    
    const { db: database } = await connectToDatabase();
    const contentCollection = database.collection('content');
    
    await contentCollection.updateOne(
      { type: 'contact' },
      { 
        $set: { 
          type: 'contact',
          data: content,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact page content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
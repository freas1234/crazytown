import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth-config';
import { connectToDatabase } from '../../../../../lib/db';


async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (session?.user && (session.user.role === 'admin' || session.user.role === 'owner')) {
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
    

    const aboutContent = await contentCollection.findOne({ type: 'about' });
    
    return NextResponse.json({ 
      success: true,
      content: aboutContent?.data || {
        title: { en: 'About Our Server', ar: 'عن السيرفر' },
        subtitle: { en: 'Discover the world of Crazy Town FiveM', ar: 'اكتشف عالم كريزي تاون FiveM' },
        aboutText: { 
          en: 'Crazy Town is a premier FiveM roleplay server offering an immersive gaming experience.', 
          ar: 'كريزي تاون هو سيرفر لعب أدوار FiveM متميز يقدم تجربة ألعاب غامرة.' 
        },
        serverInfoText: { 
          en: 'Our server features a custom economy system, unique job opportunities, and regular events.', 
          ar: 'يتميز السيرفر بنظام اقتصادي مخصص، وفرص عمل فريدة، وفعاليات منتظمة.' 
        },
        featuresItems: [],
        teamMembers: []
      }
    });
  } catch (error) {
    console.error('Error fetching about page content:', error);
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
    
    const requiredFields = ['title', 'subtitle', 'aboutText', 'serverInfoText'];
    
    for (const field of requiredFields) {
      if (!content[field] || !content[field].en || !content[field].ar) {
        return NextResponse.json({ 
          error: `Both English and Arabic content is required for ${field}` 
        }, { status: 400 });
      }
    }
    
    if (content.featuresItems && Array.isArray(content.featuresItems)) {
      const hasInvalidFeatures = content.featuresItems.some(
        (item: any) => !item.title?.en || !item.title?.ar || !item.description?.en || !item.description?.ar
      );
      
      if (hasInvalidFeatures) {
        return NextResponse.json({ 
          error: 'All features must have both English and Arabic content for title and description' 
        }, { status: 400 });
      }
    }
        
    if (content.teamMembers && Array.isArray(content.teamMembers)) {
      const hasInvalidMembers = content.teamMembers.some(
        (member: any) => !member.name?.en || !member.name?.ar || !member.role?.en || !member.role?.ar
      );
      
      if (hasInvalidMembers) {
        return NextResponse.json({ 
          error: 'All team members must have both English and Arabic content for name and role' 
        }, { status: 400 });
      }
    }
    
    const { db: database } = await connectToDatabase();
    const contentCollection = database.collection('content');
    
    await contentCollection.updateOne(
      { type: 'about' },
      { 
        $set: { 
          type: 'about',
          data: content,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating about page content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
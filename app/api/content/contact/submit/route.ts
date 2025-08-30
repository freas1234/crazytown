import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const messagesCollection = db.collection('contactMessages');
    
    await messagesCollection.insertOne({
      name,
      email,
      subject: subject || 'No subject',
      message,
      createdAt: new Date(),
      read: false
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
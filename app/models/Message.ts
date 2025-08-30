import { connectToDatabase } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'order' | 'system' | 'support';
  orderId?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getMessages(userId: string) {
  const { db } = await connectToDatabase();
  const messagesCollection = db.collection('messages');
  
  return messagesCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function getMessage(id: string) {
  const { db } = await connectToDatabase();
  const messagesCollection = db.collection('messages');
  
  return messagesCollection.findOne({ id });
}

export async function createMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) {
  const { db } = await connectToDatabase();
  const messagesCollection = db.collection('messages');
  
  const now = new Date();
  const newMessage = {
    id: uuidv4(),
    ...messageData,
    createdAt: now,
    updatedAt: now,
  };
  
  await messagesCollection.insertOne(newMessage);
  return newMessage;
}

export async function markMessageAsRead(id: string) {
  const { db } = await connectToDatabase();
  const messagesCollection = db.collection('messages');
  
  await messagesCollection.updateOne({ id }, { $set: { read: true, updatedAt: new Date() } });
  return { id, read: true };
}

export async function deleteMessage(id: string) {
  const { db } = await connectToDatabase();
  const messagesCollection = db.collection('messages');
  
  await messagesCollection.deleteOne({ id });
  return { id };
}

export async function getUnreadMessagesCount(userId: string) {
  const { db } = await connectToDatabase();
  const messagesCollection = db.collection('messages');
  
  return messagesCollection.countDocuments({ userId, read: false });
} 
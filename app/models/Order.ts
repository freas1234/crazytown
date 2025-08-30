import { connectToDatabase } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'paypal' | 'card';
  paymentId?: string;
  deliveryMethod: 'digital' | 'none';
  createdAt: Date;
  updatedAt: Date;
}

export async function getOrders() {
  const { db } = await connectToDatabase();
  const ordersCollection = db.collection('orders');
  
  return ordersCollection.find().sort({ createdAt: -1 }).toArray();
}

export async function getUserOrders(userId: string) {
  const { db } = await connectToDatabase();
  const ordersCollection = db.collection('orders');
  
  return ordersCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function getOrder(id: string) {
  const { db } = await connectToDatabase();
  const ordersCollection = db.collection('orders');
  
  return ordersCollection.findOne({ id });
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  const { db } = await connectToDatabase();
  const ordersCollection = db.collection('orders');
  
  const now = new Date();
  const newOrder = {
    id: uuidv4(),
    ...orderData,
    createdAt: now,
    updatedAt: now,
  };
  
  await ordersCollection.insertOne(newOrder);
  return newOrder;
}

export async function updateOrder(id: string, orderData: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>) {
  const { db } = await connectToDatabase();
  const ordersCollection = db.collection('orders');
  
  const updatedOrder = {
    ...orderData,
    updatedAt: new Date(),
  };
  
  await ordersCollection.updateOne({ id }, { $set: updatedOrder });
  return { id, ...updatedOrder };
}

export async function deleteOrder(id: string) {
  const { db } = await connectToDatabase();
  const ordersCollection = db.collection('orders');
  
  await ordersCollection.deleteOne({ id });
  return { id };
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth-config';
import { getOrder, updateOrder } from '../../../../../models/Order';
import { createMessage } from '../../../../../models/Message';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'owner'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Await the params Promise in Next.js 15
    const { id } = await params;
    const { status } = await request.json();
    
    if (!['pending', 'paid', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const order = await getOrder(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const updatedOrder = await updateOrder(id, { status });
    
    // Send notification to user
    let messageTitle = '';
    let messageContent = '';
    
    switch (status) {
      case 'pending':
        messageTitle = 'Order Status Changed to Pending';
        messageContent = `Your order #${id.substring(0, 8)} status has been changed to pending. Please complete the payment to proceed.`;
        break;
      case 'paid':
        messageTitle = 'Payment Confirmed';
        messageContent = `Your payment for order #${id.substring(0, 8)} has been confirmed. Thank you for your purchase!`;
        break;
      case 'completed':
        messageTitle = 'Order Completed';
        messageContent = `Your order #${id.substring(0, 8)} has been completed. You can access your purchased items in your account.`;
        break;
      case 'cancelled':
        messageTitle = 'Order Cancelled';
        messageContent = `Your order #${id.substring(0, 8)} has been cancelled. Please contact support if you have any questions.`;
        break;
    }
    
    await createMessage({
      userId: order.userId,
      title: messageTitle,
      content: messageContent,
      type: 'order',
      orderId: id,
      read: false,
    });
    
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
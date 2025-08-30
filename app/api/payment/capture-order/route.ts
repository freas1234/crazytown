import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { getOrder, updateOrder } from '../../../models/Order';
import { captureOrder as capturePayPalOrder } from '../../../../lib/paypal';
import { createMessage } from '../../../models/Message';
import { getProduct, updateProduct } from '../../../models/Product';
import fs from 'fs';
import path from 'path';

// Load PayPal configuration
let clientId: string;
let clientSecret: string;
let environment: string;

try {
  const configPath = path.join(process.cwd(), 'paypal-config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  
  clientId = config.clientId;
  clientSecret = config.clientSecret;
  environment = config.environment || 'production';
  
  console.log(`PayPal configuration loaded for capture-order. Environment: ${environment}`);
} catch (error) {
  console.error('Error loading PayPal configuration:', error);

  clientId = process.env.PAYPAL_CLIENT_ID || '';
  clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  environment = process.env.PAYPAL_ENVIRONMENT || 'production';
  
  console.log('Using PayPal configuration from environment variables for capture-order');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { paypalOrderId, orderId } = data;
    
    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { error: 'PayPal Order ID and Order ID are required' },
        { status: 400 }
      );
    }
    
    const order = await getOrder(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      );
    }
    
    // Check if PayPal credentials are configured
    if (!clientId || !clientSecret) {
      console.error('PayPal credentials not configured');
      return NextResponse.json(
        { 
          error: 'Payment gateway not configured', 
          details: 'PayPal credentials are missing. Please check your configuration.'
        },
        { status: 503 }
      );
    }
    
    const captureResult = await capturePayPalOrder(paypalOrderId);
    
    if (!captureResult.success) {
      console.error('PayPal capture failed:', captureResult.error);
      
      const errorMessage = captureResult.error instanceof Error ? captureResult.error.message : 'Unknown error';
      if (errorMessage.includes('credentials') || errorMessage.includes('access token')) {
        return NextResponse.json(
          { 
            error: 'Payment gateway configuration error', 
            details: 'There was a problem with the payment gateway configuration. Please contact support.'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment', details: errorMessage },
        { status: 500 }
      );
    }
        
    const paymentStatus = captureResult.status;
    if (paymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentStatus}` },
        { status: 400 }
      );
    }
    
    // Update product stock for each item in the order
    try {
      for (const item of order.items) {
        // Skip digital products as they don't need stock management
        const product = await getProduct(item.productId);
        if (product && !product.digital && !product.outOfStock) {
          // Calculate new stock level
          const newStock = Math.max(0, product.stock - item.quantity);
          
          // Update the product stock
          await updateProduct(item.productId, {
            stock: newStock,
            // If stock becomes 0, optionally set outOfStock to true
            ...(newStock === 0 ? { outOfStock: true } : {})
          });
          
          console.log(`Updated stock for product ${item.productId}: ${product.stock} -> ${newStock}`);
        }
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
      // We don't want to fail the order if stock update fails
      // Just log the error and continue with order processing
    }
    
    const updatedOrder = await updateOrder(orderId, {
      status: 'paid',
      paymentId: captureResult.captureID || captureResult.id,
    });
    
    await createMessage({
      userId: order.userId,
      title: 'Payment Successful',
      content: `Your payment for order #${order.id} has been successfully processed. Thank you for your purchase!`,
      type: 'order',
      orderId: order.id,
      read: false,
    });
    
    if (order.deliveryMethod === 'digital') {
      await updateOrder(orderId, {
        status: 'completed',
      });
      
      await createMessage({
        userId: order.userId,
        title: 'Order Completed',
        content: `Your order #${order.id} is now complete. You can access your digital items in your account.`,
        type: 'order',
        orderId: order.id,
        read: false,
      });
    }
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('credentials') || errorMessage.includes('access token')) {
      return NextResponse.json(
        { 
          error: 'Payment gateway configuration error', 
          details: 'There was a problem with the payment gateway configuration. Please contact support.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment', details: errorMessage },
      { status: 500 }
    );
  }
} 
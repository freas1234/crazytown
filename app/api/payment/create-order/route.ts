import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { getOrder } from '../../../models/Order';
import { createOrder as createPayPalOrder } from '../../../../lib/paypal';
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
  
  console.log(`PayPal configuration loaded for create-order. Environment: ${environment}`);
} catch (error) {
  console.error('Error loading PayPal configuration:', error);

  clientId = process.env.PAYPAL_CLIENT_ID || '';
  clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  environment = process.env.PAYPAL_ENVIRONMENT || 'production';
  
  console.log('Using PayPal configuration from environment variables for create-order');
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
    const { orderId } = data;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
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
    
    const paypalOrderData = {
      cart_id: order.id,
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        unit_amount: {
          currency_code: 'USD',
          value: item.price.toString(),
        },
        // Include discount information if available
        ...(item.discountPercentage && {
          description: `${item.discountPercentage}% off`
        })
      })),
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: order.total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: order.total.toFixed(2),
              },
            },
          },
          items: order.items.map((item: any) => ({
            name: item.name,
            unit_amount: {
              currency_code: 'USD',
              value: item.price.toString(),
            },
            quantity: item.quantity.toString(),
            // Include discount information if available
            ...(item.discountPercentage && {
              description: `${item.discountPercentage}% off`
            })
          })),
          reference_id: order.id,
          description: `Order #${order.id}`,
        },
      ],
    };
    
    const paypalOrder = await createPayPalOrder(paypalOrderData);
    
    if (!paypalOrder.success) {
      console.error('PayPal order creation failed:', paypalOrder.error);
      
      // Check if it's a credentials error
      const errorMessage = paypalOrder.error instanceof Error ? paypalOrder.error.message : 'Unknown error';
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
        { error: 'Failed to create PayPal order', details: errorMessage },
        { status: 500 }
      );
    }
    
    // Find the approve URL in the links array
    const approvalLink = paypalOrder.links?.find((link: any) => link.rel === 'approve');
    
    return NextResponse.json({ 
      orderId: paypalOrder.orderID,
      approvalUrl: approvalLink ? approvalLink.href : null
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    
    // Check if it's a credentials error
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
      { error: 'Failed to create PayPal order', details: errorMessage },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth-config';
import { createOrder } from '../../models/Order';
import { getProduct } from '../../models/Product';
import { createMessage } from '../../models/Message';

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (originalPrice: number, salePrice: number) => {
  if (!originalPrice || !salePrice || originalPrice <= 0 || salePrice >= originalPrice) return undefined;
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discount);
};

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
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    const items = [];
    let total = 0;
    
    for (const item of data.items) {
      const product = await getProduct(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }
      
      if (product.outOfStock) {
        return NextResponse.json(
          { error: `Product is out of stock: ${product.name.en}` },
          { status: 400 }
        );
      }
      
      if (!product.digital && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.name.en}. Only ${product.stock} available.` },
          { status: 400 }
        );
      }
      
      
      const price = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
      const discountPercentage = (product.salePrice && product.salePrice > 0) 
        ? calculateDiscountPercentage(product.price, product.salePrice)
        : undefined;
      
      items.push({
        productId: product.id,
        name: product.name.en,
        price: price,
        originalPrice: (product.salePrice && product.salePrice > 0) ? product.price : undefined,
        discountPercentage: discountPercentage,
        quantity: item.quantity,
      });
      
      total += price * item.quantity;
    }
    
    const order = await createOrder({
      userId,
      items,
      total,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      deliveryMethod: data.deliveryMethod || 'digital',
    });
    
    await createMessage({
      userId,
      title: 'New Order Created',
      content: `Your order #${order.id} has been created and is awaiting payment. Total: $${total.toFixed(2)}`,
      type: 'order',
      orderId: order.id,
      read: false,
    });
    
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 
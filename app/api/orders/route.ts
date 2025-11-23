import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { createOrder } from "../../models/Order";
import { getProduct } from "../../models/Product";
import { createMessage } from "../../models/Message";
import {
  getCouponByCode,
  incrementCouponUsage,
  recordCouponUsage,
  getUserCouponUsage,
} from "../../models/Coupon";
import type { Coupon } from "../../models/Coupon";

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (
  originalPrice: number,
  salePrice: number
) => {
  if (
    !originalPrice ||
    !salePrice ||
    originalPrice <= 0 ||
    salePrice >= originalPrice
  )
    return undefined;
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discount);
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const items = [];
    let subtotal = 0;

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
          {
            error: `Insufficient stock for product: ${product.name.en}. Only ${product.stock} available.`,
          },
          { status: 400 }
        );
      }

      const price =
        product.salePrice && product.salePrice > 0
          ? product.salePrice
          : product.price;
      const discountPercentage =
        product.salePrice && product.salePrice > 0
          ? calculateDiscountPercentage(product.price, product.salePrice)
          : undefined;

      items.push({
        productId: product.id,
        name: product.name.en,
        price: price,
        originalPrice:
          product.salePrice && product.salePrice > 0
            ? product.price
            : undefined,
        discountPercentage: discountPercentage,
        quantity: item.quantity,
      });

      subtotal += price * item.quantity;
    }

    // Handle coupon if provided
    let couponCode: string | undefined;
    let couponDiscount = 0;

    if (data.couponCode) {
      const coupon = (await getCouponByCode(data.couponCode)) as Coupon | null;

      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid coupon code" },
          { status: 400 }
        );
      }

      // Validate coupon
      if (!coupon.active) {
        return NextResponse.json(
          { error: "This coupon is not active" },
          { status: 400 }
        );
      }

      const now = new Date();
      const validFrom = new Date(coupon.validFrom);
      const validUntil = new Date(coupon.validUntil);

      if (now < validFrom || now > validUntil) {
        return NextResponse.json(
          { error: "This coupon is not valid at this time" },
          { status: 400 }
        );
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: "This coupon has reached its usage limit" },
          { status: 400 }
        );
      }

      if (coupon.userLimit) {
        const userUsage = await getUserCouponUsage(userId, coupon.id);
        if (userUsage >= coupon.userLimit) {
          return NextResponse.json(
            {
              error: "You have reached the maximum usage limit for this coupon",
            },
            { status: 400 }
          );
        }
      }

      if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
        return NextResponse.json(
          {
            error: `Minimum purchase amount of $${coupon.minPurchaseAmount.toFixed(
              2
            )} is required for this coupon`,
          },
          { status: 400 }
        );
      }

      // Check if coupon applies to cart items
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const cartProductIds = data.items.map((item: any) => item.productId);
        const hasApplicableProduct = coupon.applicableProducts.some(
          (productId: string) => cartProductIds.includes(productId)
        );

        if (!hasApplicableProduct) {
          return NextResponse.json(
            { error: "This coupon does not apply to any items in your cart" },
            { status: 400 }
          );
        }
      }

      // Calculate discount
      if (coupon.discountType === "percentage") {
        couponDiscount = (subtotal * coupon.discountValue) / 100;

        if (
          coupon.maxDiscountAmount &&
          couponDiscount > coupon.maxDiscountAmount
        ) {
          couponDiscount = coupon.maxDiscountAmount;
        }
      } else {
        couponDiscount = coupon.discountValue;
        if (couponDiscount > subtotal) {
          couponDiscount = subtotal;
        }
      }

      couponCode = coupon.code;
    }

    const total = Math.max(0, subtotal - couponDiscount);

    const order = await createOrder({
      userId,
      items,
      total,
      subtotal,
      couponCode,
      couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
      status: "pending",
      paymentMethod: data.paymentMethod,
      deliveryMethod: data.deliveryMethod || "digital",
    });

    // Record coupon usage if coupon was applied
    if (couponCode && data.couponCode) {
      const coupon = (await getCouponByCode(data.couponCode)) as Coupon | null;
      if (coupon) {
        await incrementCouponUsage(coupon.id);
        await recordCouponUsage(userId, coupon.id, order.id);
      }
    }

    await createMessage({
      userId,
      title: "New Order Created",
      content: `Your order #${
        order.id
      } has been created and is awaiting payment. Total: $${total.toFixed(2)}`,
      type: "order",
      orderId: order.id,
      read: false,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

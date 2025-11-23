import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-config";
import { getCouponByCode, getUserCouponUsage } from "../../../models/Coupon";
import type { Coupon } from "../../../models/Coupon";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { code, cartItems, subtotal } = data;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    if (subtotal === undefined || subtotal < 0) {
      return NextResponse.json(
        { error: "Valid subtotal is required" },
        { status: 400 }
      );
    }

    // Get coupon by code
    const coupon = (await getCouponByCode(code)) as Coupon | null;

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json(
        { error: "This coupon is not active" },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (now < validFrom) {
      return NextResponse.json(
        { error: "This coupon is not yet valid" },
        { status: 400 }
      );
    }

    if (now > validUntil) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check user limit
    if (coupon.userLimit) {
      const userUsage = await getUserCouponUsage(session.user.id, coupon.id);
      if (userUsage >= coupon.userLimit) {
        return NextResponse.json(
          { error: "You have reached the maximum usage limit for this coupon" },
          { status: 400 }
        );
      }
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
      return NextResponse.json(
        {
          error: `Minimum purchase amount of $${coupon.minPurchaseAmount.toFixed(
            2
          )} is required for this coupon`,
          minPurchaseAmount: coupon.minPurchaseAmount,
        },
        { status: 400 }
      );
    }

    // Check if coupon applies to cart items
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const cartProductIds = cartItems.map((item: any) => item.productId);
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
    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;

      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discount = coupon.discountValue;

      // Don't allow discount to exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    const finalTotal = Math.max(0, subtotal - discount);

    return NextResponse.json(
      {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discount: parseFloat(discount.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        finalTotal: parseFloat(finalTotal.toFixed(2)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

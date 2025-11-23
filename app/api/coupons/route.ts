import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { getCoupons, createCoupon } from "../../models/Coupon";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const coupons = await getCoupons();

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // Validate required fields
    if (
      !data.code ||
      !data.discountType ||
      !data.discountValue ||
      !data.validFrom ||
      !data.validUntil
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: code, discountType, discountValue, validFrom, validUntil",
        },
        { status: 400 }
      );
    }

    // Validate discount value
    if (
      data.discountType === "percentage" &&
      (data.discountValue < 0 || data.discountValue > 100)
    ) {
      return NextResponse.json(
        { error: "Percentage discount must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (data.discountType === "fixed" && data.discountValue < 0) {
      return NextResponse.json(
        { error: "Fixed discount must be greater than or equal to 0" },
        { status: 400 }
      );
    }

    // Validate dates
    const validFrom = new Date(data.validFrom);
    const validUntil = new Date(data.validUntil);

    if (validFrom >= validUntil) {
      return NextResponse.json(
        { error: "validUntil must be after validFrom" },
        { status: 400 }
      );
    }

    const coupon = await createCoupon({
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minPurchaseAmount: data.minPurchaseAmount,
      maxDiscountAmount: data.maxDiscountAmount,
      validFrom: validFrom,
      validUntil: validUntil,
      usageLimit: data.usageLimit,
      userLimit: data.userLimit,
      active: data.active !== undefined ? data.active : true,
      applicableCategories: data.applicableCategories,
      applicableProducts: data.applicableProducts,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

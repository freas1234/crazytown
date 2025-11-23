import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-config";
import { getCoupon, updateCoupon, deleteCoupon } from "../../../models/Coupon";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const coupon = await getCoupon(resolvedParams.id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const data = await request.json();

    // Validate discount value if provided
    if (
      data.discountType === "percentage" &&
      data.discountValue !== undefined
    ) {
      if (data.discountValue < 0 || data.discountValue > 100) {
        return NextResponse.json(
          { error: "Percentage discount must be between 0 and 100" },
          { status: 400 }
        );
      }
    }

    if (data.discountType === "fixed" && data.discountValue !== undefined) {
      if (data.discountValue < 0) {
        return NextResponse.json(
          { error: "Fixed discount must be greater than or equal to 0" },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    if (data.validFrom && data.validUntil) {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);

      if (validFrom >= validUntil) {
        return NextResponse.json(
          { error: "validUntil must be after validFrom" },
          { status: 400 }
        );
      }
    }

    const updatedCoupon = await updateCoupon(resolvedParams.id, data);

    return NextResponse.json({ coupon: updatedCoupon }, { status: 200 });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    await deleteCoupon(resolvedParams.id);

    return NextResponse.json(
      { message: "Coupon deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

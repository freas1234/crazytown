import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { db } from "../../../../../lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const content = await db.content.findByType("cart");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          title: "Your Cart",
          emptyCart: "Your cart is empty",
          continueShopping: "Continue Shopping",
          checkout: "Proceed to Checkout",
          summary: {
            title: "Order Summary",
            subtotal: "Subtotal",
            shipping: "Shipping",
            tax: "Tax",
            total: "Total"
          },
          items: {
            product: "Product",
            price: "Price",
            quantity: "Quantity",
            total: "Total",
            remove: "Remove"
          },
          updateCart: "Update Cart"
        },
        ar: {
          title: "سلة التسوق",
          emptyCart: "سلة التسوق فارغة",
          continueShopping: "مواصلة التسوق",
          checkout: "المتابعة إلى الدفع",
          summary: {
            title: "ملخص الطلب",
            subtotal: "المجموع الفرعي",
            shipping: "الشحن",
            tax: "الضريبة",
            total: "المجموع"
          },
          items: {
            product: "المنتج",
            price: "السعر",
            quantity: "الكمية",
            total: "المجموع",
            remove: "إزالة"
          },
          updateCart: "تحديث السلة"
        }
      }
    });
  } catch (error) {
    console.error("Error fetching cart content:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session?.user?.role !== "admin" && session?.user?.role !== "owner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: "No content provided" }, 
        { status: 400 }
      );
    }
    
    const result = await db.content.upsert("cart", content);
    
    return NextResponse.json({
      success: true,
      message: "Cart content updated successfully"
    });
  } catch (error) {
    console.error("Error updating cart content:", error);
    return NextResponse.json(
      { error: "Failed to update cart content" },
      { status: 500 }
    );
  }
}

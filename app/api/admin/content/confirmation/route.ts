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
    
    const content = await db.content.findByType("confirmation");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          title: "Order Confirmation",
          subtitle: "Thank you for your purchase!",
          orderNumber: "Order Number",
          thankYou: "Thank you for your order",
          emailSent: "We have sent a confirmation email to your email address",
          orderDetails: {
            title: "Order Details",
            date: "Order Date",
            total: "Total Amount",
            paymentMethod: "Payment Method",
            shippingAddress: "Shipping Address"
          },
          actions: {
            viewOrder: "View Order Details",
            continueShopping: "Continue Shopping"
          }
        },
        ar: {
          title: "تأكيد الطلب",
          subtitle: "شكراً لك على الشراء!",
          orderNumber: "رقم الطلب",
          thankYou: "شكراً لطلبك",
          emailSent: "لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني",
          orderDetails: {
            title: "تفاصيل الطلب",
            date: "تاريخ الطلب",
            total: "المبلغ الإجمالي",
            paymentMethod: "طريقة الدفع",
            shippingAddress: "عنوان الشحن"
          },
          actions: {
            viewOrder: "عرض تفاصيل الطلب",
            continueShopping: "مواصلة التسوق"
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching confirmation content:", error);
    return NextResponse.json(
      { error: "Failed to fetch confirmation content" },
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
    
    const result = await db.content.upsert("confirmation", content);
    
    return NextResponse.json({
      success: true,
      message: "Confirmation content updated successfully"
    });
  } catch (error) {
    console.error("Error updating confirmation content:", error);
    return NextResponse.json(
      { error: "Failed to update confirmation content" },
      { status: 500 }
    );
  }
} 
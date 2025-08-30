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
    
    const content = await db.content.findByType("checkout");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          title: "Checkout",
          subtitle: "Complete your purchase",
          steps: {
            information: "Information",
            shipping: "Shipping",
            payment: "Payment",
            confirmation: "Confirmation"
          },
          form: {
            contactInfo: {
              title: "Contact Information",
              email: "Email",
              phone: "Phone Number"
            },
            shippingAddress: {
              title: "Shipping Address",
              name: "Full Name",
              address: "Address",
              city: "City",
              country: "Country",
              postalCode: "Postal Code"
            },
            paymentMethod: {
              title: "Payment Method",
              creditCard: "Credit Card",
              paypal: "PayPal",
              cardNumber: "Card Number",
              cardName: "Name on Card",
              expiration: "Expiration Date",
              cvv: "CVV"
            },
            buttons: {
              continue: "Continue",
              back: "Back",
              placeOrder: "Place Order"
            }
          },
          orderSummary: {
            title: "Order Summary",
            items: "Items",
            shipping: "Shipping",
            tax: "Tax",
            total: "Total"
          }
        },
        ar: {
          title: "الدفع",
          subtitle: "إكمال عملية الشراء",
          steps: {
            information: "المعلومات",
            shipping: "الشحن",
            payment: "الدفع",
            confirmation: "التأكيد"
          },
          form: {
            contactInfo: {
              title: "معلومات الاتصال",
              email: "البريد الإلكتروني",
              phone: "رقم الهاتف"
            },
            shippingAddress: {
              title: "عنوان الشحن",
              name: "الاسم الكامل",
              address: "العنوان",
              city: "المدينة",
              country: "البلد",
              postalCode: "الرمز البريدي"
            },
            paymentMethod: {
              title: "طريقة الدفع",
              creditCard: "بطاقة ائتمان",
              paypal: "باي بال",
              cardNumber: "رقم البطاقة",
              cardName: "الاسم على البطاقة",
              expiration: "تاريخ الانتهاء",
              cvv: "رمز التحقق"
            },
            buttons: {
              continue: "متابعة",
              back: "رجوع",
              placeOrder: "إتمام الطلب"
            }
          },
          orderSummary: {
            title: "ملخص الطلب",
            items: "العناصر",
            shipping: "الشحن",
            tax: "الضريبة",
            total: "المجموع"
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching checkout content:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkout content" },
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
    
    const result = await db.content.upsert("checkout", content);
    
    return NextResponse.json({
      success: true,
      message: "Checkout content updated successfully"
    });
  } catch (error) {
    console.error("Error updating checkout content:", error);
    return NextResponse.json(
      { error: "Failed to update checkout content" },
      { status: 500 }
    );
  }
} 
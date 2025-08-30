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
    
    const content = await db.content.findByType("store");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          title: "Store",
          subtitle: "Enhance your role-playing experience with our premium items and packages",
          categories: {
            all: "All Categories"
          },
          filters: {
            title: "Filters",
            price: "Price Range",
            sort: {
              title: "Sort By",
              newest: "Newest",
              priceHighToLow: "Price: High to Low",
              priceLowToHigh: "Price: Low to High",
              popularity: "Popularity"
            },
            apply: "Apply Filters",
            reset: "Reset"
          },
          search: {
            placeholder: "Search products...",
            noResults: "No products found"
          },
          product: {
            addToCart: "Add to Cart",
            outOfStock: "Out of Stock",
            viewDetails: "View Details"
          },
          cart: {
            viewCart: "View Cart",
            itemsInCart: "items in cart"
          }
        },
        ar: {
          title: "المتجر",
          subtitle: "عزز تجربة لعب الأدوار الخاصة بك مع العناصر والباقات المميزة",
          categories: {
            all: "جميع الفئات"
          },
          filters: {
            title: "التصفية",
            price: "نطاق السعر",
            sort: {
              title: "ترتيب حسب",
              newest: "الأحدث",
              priceHighToLow: "السعر: من الأعلى إلى الأقل",
              priceLowToHigh: "السعر: من الأقل إلى الأعلى",
              popularity: "الشعبية"
            },
            apply: "تطبيق الفلاتر",
            reset: "إعادة تعيين"
          },
          search: {
            placeholder: "البحث عن المنتجات...",
            noResults: "لم يتم العثور على منتجات"
          },
          product: {
            addToCart: "أضف إلى السلة",
            outOfStock: "نفذت الكمية",
            viewDetails: "عرض التفاصيل"
          },
          cart: {
            viewCart: "عرض السلة",
            itemsInCart: "عناصر في السلة"
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching store content:", error);
    return NextResponse.json(
      { error: "Failed to fetch store content" },
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
    
    const result = await db.content.upsert("store", content);
    
    return NextResponse.json({
      success: true,
      message: "Store content updated successfully"
    });
  } catch (error) {
    console.error("Error updating store content:", error);
    return NextResponse.json(
      { error: "Failed to update store content" },
      { status: 500 }
    );
  }
}

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
    
    const content = await db.content.findByType("product");
    
    return NextResponse.json({
      success: true,
      content: content?.data || {
        en: {
          addToCart: "Add to Cart",
          outOfStock: "Out of Stock",
          description: "Description",
          features: "Features",
          specifications: "Specifications",
          reviews: {
            title: "Customer Reviews",
            writeReview: "Write a Review",
            noReviews: "No reviews yet",
            rating: "Rating",
            comment: "Your Review",
            submit: "Submit Review"
          },
          relatedProducts: "Related Products",
          quantity: "Quantity",
          inStock: "In Stock",
          category: "Category",
          share: "Share"
        },
        ar: {
          addToCart: "أضف إلى السلة",
          outOfStock: "نفذت الكمية",
          description: "الوصف",
          features: "المميزات",
          specifications: "المواصفات",
          reviews: {
            title: "آراء العملاء",
            writeReview: "اكتب رأيك",
            noReviews: "لا توجد آراء حتى الآن",
            rating: "التقييم",
            comment: "رأيك",
            submit: "إرسال التقييم"
          },
          relatedProducts: "منتجات ذات صلة",
          quantity: "الكمية",
          inStock: "متوفر",
          category: "الفئة",
          share: "مشاركة"
        }
      }
    });
  } catch (error) {
    console.error("Error fetching product content:", error);
    return NextResponse.json(
      { error: "Failed to fetch product content" },
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
    
    const result = await db.content.upsert("product", content);
    
    return NextResponse.json({
      success: true,
      message: "Product content updated successfully"
    });
  } catch (error) {
    console.error("Error updating product content:", error);
    return NextResponse.json(
      { error: "Failed to update product content" },
      { status: 500 }
    );
  }
} 
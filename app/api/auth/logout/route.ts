import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Return a response that indicates to the client to redirect to the signout page
    return NextResponse.json({ 
      success: true, 
      message: "Please use NextAuth signOut method from the client side" 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";

import { authOptions } from "../../../../lib/auth-config";

import { db } from "../../../../lib/db";


export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }
    
 
    if (session.user.discordId) {
      return NextResponse.json(
        { error: "Discord users cannot change passwords", success: false },
        { status: 400 }
      );
    }
    
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    const { currentPassword, newPassword } = data;
    
    // Validate passwords
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required", success: false },
        { status: 400 }
      );
    }
    
    // Check if current password is correct
    // In a real app, you'd use bcrypt.compare here
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect", success: false },
        { status: 400 }
      );
    }
    
    // Update password
    // In a real app, you'd use bcrypt.hash here
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { password: newPassword }
    });
    
    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

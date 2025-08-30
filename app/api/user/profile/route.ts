import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { db } from "../../../../lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
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
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio || "",
        role: user.role,
        avatar: user.avatar,
        discordId: user.discordId
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }
    
    // Try to find user by id
    let user = await db.user.findUnique({
      where: { id: session.user.id }
    });
    
    // If not found by id, try by email
    if (!user && session.user.email) {
      console.log("User not found by ID, trying email:", session.user.email);
      user = await db.user.findUnique({
        where: { email: session.user.email }
      });
    }
    
    if (!user) {
      console.log("User not found:", session.user.id);
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }
    
    console.log("User found:", user.id, user.email);
    
    // Check if user has a Discord ID (Discord users cannot change username)
    const isDiscordUser = !!user.discordId;
    
    // Parse request body
    let data;
    try {
      data = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request body", success: false },
        { status: 400 }
      );
    }
    
    console.log("Update data received:", data);
    
    const updateData: any = {};
    
    // Only update username if not a Discord user and a valid username is provided
    if (!isDiscordUser && data.username !== undefined && data.username !== null) {
      updateData.username = data.username;
    }
    
    // Anyone can update their bio (even with empty string)
    if (data.bio !== undefined) {
      updateData.bio = data.bio;
      console.log("Updating bio to:", data.bio);
    }
    
    console.log("Final update data:", updateData);
    
    // Only update if there are changes to make
    if (Object.keys(updateData).length === 0) {
      console.log("No fields to update");
      return NextResponse.json({
        success: true,
        message: "No changes needed"
      });
    }
    
    // Update user in database
    try {
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: updateData
      });
      
      if (updatedUser) {
        console.log("User updated successfully:", updatedUser.id);
      } else {
        console.log("User update returned null");
      }
      
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile in database", success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

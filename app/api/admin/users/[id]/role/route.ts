import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/auth-config";
import { db } from "../../../../../../lib/db";
import { cookies } from "next/headers";
import { getUserFromToken, UserJwtPayload } from "../../../../../../lib/auth-utils";
import { User } from "../../../../../../lib/db";
 
async function checkAdminAuth(): Promise<{ 
  isAdmin: boolean; 
  user: (UserJwtPayload | User | null);
}> {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    if (session.user.role === 'admin' || session.user.role === 'owner') {
      return { isAdmin: true, user: session.user as UserJwtPayload };
    }
  }
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (token) {
    const user = await getUserFromToken(token);
    
    if (user && user.id && (user.role === 'admin' || user.role === 'owner')) {
      // Convert IUser to UserJwtPayload format to ensure type compatibility
      const userPayload: UserJwtPayload = {
        id: user.id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        role: user.role,
        avatar: user.avatar,
        discordId: user.discordId
      };
      return { isAdmin: true, user: userPayload };
    }
  }
  
  return { isAdmin: false, user: null };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, user: currentUser } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userToUpdate = await db.user.findUnique({
      where: { id }
    });
    
    if (!userToUpdate) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    if (!body.role) {
      return NextResponse.json(
        { error: "Role is required", success: false },
        { status: 400 }
      );
    }

   
    const currentUserId = 'id' in currentUser! ? currentUser.id : '';
    const currentUserRole = currentUser?.role || 'user';
    
    if (
      (currentUserRole === 'admin' && userToUpdate.role === 'owner') ||
      (body.role === 'owner' && currentUserRole !== 'owner') ||
      (currentUserId === id)
    ) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions", success: false },
        { status: 403 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        role: body.role
      }
    });
     
    return NextResponse.json({ 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role
      },
      success: true 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

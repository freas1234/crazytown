import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { db } from "../../../../lib/db";
import { cookies } from "next/headers";
import { getUserFromToken, UserJwtPayload } from "../../../../lib/auth-utils";
import { User } from "../../../../lib/db";

// Helper function to check admin authentication
async function checkAdminAuth(): Promise<{ 
  isAdmin: boolean; 
  user: (UserJwtPayload | User | null);
}> {
  // Method 1: Check NextAuth session
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    if (session.user.role === 'admin' || session.user.role === 'owner') {
      return { isAdmin: true, user: session.user as UserJwtPayload };
    }
  }
  
  // Method 2: Check custom token
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

export async function GET() {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const users = await db.user.findMany();
    
    return NextResponse.json({ 
      users: users.map((user: User) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      success: true 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.email || !body.username || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists", success: false },
        { status: 409 }
      );
    }

    const newUser = await db.user.create({
      data: {
        email: body.email,
        username: body.username,
        password: body.password, 
        role: body.role || 'user',
        bio: body.bio || '',
        avatar: body.avatar || ''
      }
    });
         
    return NextResponse.json({ 
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        avatar: newUser.avatar,
        bio: newUser.bio,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      },
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
} 
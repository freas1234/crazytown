import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { db } from "../../../../lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth-utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      
      try {
        let dbUser = null;
        
        if (session.user.id) {
          dbUser = await db.user.findUnique({
            where: { id: session.user.id }
          });
        }
        
        if (!dbUser && session.user.email) {
          dbUser = await db.user.findUnique({
            where: { email: session.user.email }
          });
        }
        
        if (!dbUser && session.user.discordId) {
          dbUser = await db.user.findUnique({
            where: { discordId: session.user.discordId }
          });
        }

        if (dbUser) {
          return NextResponse.json({ 
            user: {
              id: dbUser.id,
              email: dbUser.email,
              username: dbUser.username,
              role: dbUser.role,
              bio: dbUser.bio || "",
              avatar: dbUser.avatar,
              discordId: dbUser.discordId
            }, 
            success: true 
          });
        } else {
          console.log("User not found in database, will use session data");
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }

  
      const user = {
        id: session.user.id,
        email: session.user.email || "",
        username: session.user.username || session.user.name || "",
        role: session.user.role || 'user',
        bio: "",
        avatar: session.user.image,
        discordId: session.user.discordId
      };

      console.log("Returning user data from session:", user);
      return NextResponse.json({ user, success: true });
    }
    
   
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (token) {
      try {
        const decoded = await verifyToken(token);
        if (decoded) {
          console.log("User found from custom token with role:", decoded.role);
          
          
          let dbUser = null;
          if (decoded.id) {
            dbUser = await db.user.findUnique({
              where: { id: decoded.id }
            });
          }
          
          if (dbUser) {
            console.log("User details from DB for token user:", dbUser.role);
            return NextResponse.json({
              user: {
                id: dbUser.id,
                email: dbUser.email,
                username: dbUser.username,
                role: dbUser.role,
                bio: dbUser.bio || "",
                avatar: dbUser.avatar,
                discordId: dbUser.discordId
              },
              success: true
            });
          }
          
      
          return NextResponse.json({
            user: {
              id: decoded.id,
              email: decoded.email,
              username: decoded.username,
              role: decoded.role,
              avatar: decoded.avatar,
              discordId: decoded.discordId
            },
            success: true
          });
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    }
    
    console.log("No session or user found");
    return NextResponse.json(
      { error: "Unauthorized", success: false },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { getUserPermissions } from "../../../../models/Role";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ permissions: [] }, { status: 200 });
    }

    // Owner and admin always have all permissions (check both single role and multiple roles)
    const userRoles =
      (session.user as any).roles ||
      (session.user.role ? [session.user.role] : []);
    if (userRoles.includes("owner") || userRoles.includes("admin")) {
      return NextResponse.json({ permissions: ["*"] }, { status: 200 });
    }

    const permissions = await getUserPermissions(session.user.id);

    return NextResponse.json({ permissions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json({ permissions: [] }, { status: 200 });
  }
}

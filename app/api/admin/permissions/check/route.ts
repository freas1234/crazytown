import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { checkPermission } from "../../../../../lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ hasPermission: false }, { status: 200 });
    }

    // Owner and admin always have all permissions (check both single role and multiple roles)
    const userRoles =
      (session.user as any).roles ||
      (session.user.role ? [session.user.role] : []);
    if (userRoles.includes("owner") || userRoles.includes("admin")) {
      return NextResponse.json({ hasPermission: true }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const permission = searchParams.get("permission");

    if (!permission) {
      return NextResponse.json(
        { error: "Missing permission parameter" },
        { status: 400 }
      );
    }

    const hasPermission = await checkPermission(session.user.id, permission);

    return NextResponse.json({ hasPermission }, { status: 200 });
  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json({ hasPermission: false }, { status: 200 });
  }
}

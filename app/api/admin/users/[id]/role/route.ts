import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth-config";
import {
  assignRolesToUser,
  getUserPermissions,
} from "../../../../../models/Role";
import { logger, getRequestContext } from "../../../../../../lib/logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session || !["admin", "owner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPerms = await getUserPermissions(session.user.id);
    if (
      !userPerms.includes("users.roles.assign") &&
      session.user.role !== "owner"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;
    const data = await request.json();

    if (!data.roleIds || !Array.isArray(data.roleIds)) {
      return NextResponse.json(
        { error: "Missing required field: roleIds (array)" },
        { status: 400 }
      );
    }

    await assignRolesToUser(userId, data.roleIds);

    await logger.success("admin", "Roles assigned to user", {
      ...getRequestContext(request),
      userId: session.user.id,
      details: { targetUserId: userId, roleIds: data.roleIds },
    });

    return NextResponse.json(
      { message: "Roles assigned successfully" },
      { status: 200 }
    );
  } catch (error) {
    await logger.error("admin", "Failed to assign role", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    const errorMessage =
      error instanceof Error ? error.message : "Failed to assign role";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

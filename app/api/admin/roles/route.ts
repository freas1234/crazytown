import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-config";
import {
  createRole,
  getAllRoles,
  getAllPermissions,
  getUserPermissions,
} from "../../../models/Role";
import { logger, getRequestContext } from "../../../../lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["admin", "owner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view roles
    const userPerms = await getUserPermissions(session.user.id);
    if (!userPerms.includes("roles.view") && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const roles = await getAllRoles();
    const permissions = getAllPermissions();

    return NextResponse.json({ roles, permissions }, { status: 200 });
  } catch (error) {
    await logger.error("admin", "Failed to fetch roles", {
      ...getRequestContext(request),
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session || !["admin", "owner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create roles
    const userPerms = await getUserPermissions(session.user.id);
    if (!userPerms.includes("roles.create") && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    if (!data.name || !data.permissions || !Array.isArray(data.permissions)) {
      return NextResponse.json(
        { error: "Missing required fields: name, permissions" },
        { status: 400 }
      );
    }

    const role = await createRole({
      name: data.name,
      description: data.description || "",
      permissions: data.permissions,
      isSystem: false,
    });

    await logger.success("admin", "Role created", {
      ...getRequestContext(request),
      userId: session.user.id,
      details: { roleId: role.id, roleName: role.name },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    await logger.error("admin", "Failed to create role", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}

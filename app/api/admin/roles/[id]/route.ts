import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import {
  getRole,
  updateRole,
  deleteRole,
  getUserPermissions,
} from "../../../../models/Role";
import { logger, getRequestContext } from "../../../../../lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["admin", "owner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPerms = await getUserPermissions(session.user.id);
    if (!userPerms.includes("roles.view") && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const role = await getRole(id);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ role }, { status: 200 });
  } catch (error) {
    await logger.error("admin", "Failed to fetch role", {
      ...getRequestContext(request),
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

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
    if (!userPerms.includes("roles.edit") && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const role = await getRole(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Don't allow editing system roles permissions (except owner)
    if (role.isSystem && session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Cannot edit system role" },
        { status: 403 }
      );
    }

    const updatedRole = await updateRole(id, {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    });

    await logger.success("admin", "Role updated", {
      ...getRequestContext(request),
      userId: session.user.id,
      details: { roleId: id, roleName: updatedRole?.name },
    });

    return NextResponse.json({ role: updatedRole }, { status: 200 });
  } catch (error) {
    await logger.error("admin", "Failed to update role", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (!userPerms.includes("roles.delete") && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await deleteRole(id);

    await logger.success("admin", "Role deleted", {
      ...getRequestContext(request),
      userId: session.user.id,
      details: { roleId: id },
    });

    return NextResponse.json({ message: "Role deleted" }, { status: 200 });
  } catch (error) {
    await logger.error("admin", "Failed to delete role", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete role";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

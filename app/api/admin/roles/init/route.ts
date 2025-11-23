import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth-config";
import { createDefaultRoles } from "../../../../models/Role";
import { logger, getRequestContext } from "../../../../../lib/logger";

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await createDefaultRoles();

    await logger.success("admin", "Default roles initialized", {
      ...getRequestContext(request),
      userId: session.user.id,
    });

    return NextResponse.json(
      { message: "Default roles initialized successfully" },
      { status: 200 }
    );
  } catch (error) {
    await logger.error("admin", "Failed to initialize default roles", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      { error: "Failed to initialize default roles" },
      { status: 500 }
    );
  }
}

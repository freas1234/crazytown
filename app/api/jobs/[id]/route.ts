import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth-config";
import { getJob, updateJob, deleteJob } from "../../../models/Job";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const job = await getJob(resolvedParams.id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("No session found for job update");
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      console.error("User role not authorized:", session.user.role);
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const data = await request.json();

    // Validate title and description if provided
    if (data.title && (!data.title.en || !data.title.ar)) {
      return NextResponse.json(
        {
          error: "Title must have both English and Arabic translations",
        },
        { status: 400 }
      );
    }

    if (data.description && (!data.description.en || !data.description.ar)) {
      return NextResponse.json(
        {
          error: "Description must have both English and Arabic translations",
        },
        { status: 400 }
      );
    }

    const updatedJob = await updateJob(resolvedParams.id, data);

    return NextResponse.json({ job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update job",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or owner
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    await deleteJob(resolvedParams.id);

    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

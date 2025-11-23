import { NextRequest, NextResponse } from "next/server";
import { getJobs, createJob } from "../../models/Job";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { logger, getRequestContext } from "../../../lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isOpen = searchParams.get("isOpen");
    const isFeatured = searchParams.get("isFeatured");
    const category = searchParams.get("category");

    const filters: {
      isOpen?: boolean;
      isFeatured?: boolean;
      category?: string;
    } = {};

    if (isOpen !== null) {
      filters.isOpen = isOpen === "true";
    }
    if (isFeatured !== null) {
      filters.isFeatured = isFeatured === "true";
    }
    if (category) {
      filters.category = category;
    }

    const jobs = await getJobs(filters);

    await logger.info("api", "Jobs fetched successfully", {
      ...getRequestContext(request),
      details: { count: jobs.length, filters },
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Check for MongoDB/SSL connection errors
    const isConnectionError =
      errorMessage.includes("SSL") ||
      errorMessage.includes("TLS") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout");

    await logger.error("api", "Failed to fetch jobs", {
      ...getRequestContext(request),
      error: error instanceof Error ? error : errorMessage,
      details: { isConnectionError },
    });

    return NextResponse.json(
      {
        error: isConnectionError
          ? "Database connection error. Please try again later."
          : errorMessage || "Failed to fetch jobs",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session) {
      console.error("No session found for job creation");
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

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: "Missing required fields: title, description" },
        { status: 400 }
      );
    }

    // Validate title and description have both en and ar
    if (
      !data.title.en ||
      !data.title.ar ||
      !data.description.en ||
      !data.description.ar
    ) {
      return NextResponse.json(
        {
          error:
            "Title and description must have both English and Arabic translations",
        },
        { status: 400 }
      );
    }

    console.log("Creating job with data:", {
      hasTitle: !!data.title,
      hasDescription: !!data.description,
      category: data.category,
      requirementsCount: data.requirements?.length || 0,
      formFieldsCount: data.formFields?.length || 0,
    });

    const job = await createJob({
      title: data.title,
      description: data.description,
      category: data.category,
      requirements: data.requirements || [],
      isOpen: data.isOpen !== undefined ? data.isOpen : true,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
      formFields: data.formFields || [],
    });

    if (session) {
      await logger.success("jobs", "Job created successfully", {
        ...getRequestContext(request),
        userId: session.user.id,
        details: { jobId: job.id, title: job.title },
      });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logger.error("jobs", "Failed to create job", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : errorMessage,
    });

    return NextResponse.json(
      {
        error: errorMessage || "Failed to create job",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

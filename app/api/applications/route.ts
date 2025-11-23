import { NextRequest, NextResponse } from "next/server";
import {
  createApplication,
  getApplications,
  checkUserApplicationStatus,
} from "../../models/Job";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-config";
import { logger, getRequestContext } from "../../../lib/logger";

export async function GET(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);

    if (!session) {
      console.error("No session found");
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    if (!["admin", "owner"].includes(session.user.role)) {
      console.error("User role not authorized:", session.user.role);
      return NextResponse.json(
        { error: "Unauthorized - Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const jobId = searchParams.get("jobId") || undefined;
    const status = searchParams.get("status") as
      | "pending"
      | "approved"
      | "rejected"
      | undefined;

    const applications = await getApplications(jobId, status);

    if (session) {
      await logger.info("applications", "Applications fetched", {
        ...getRequestContext(request),
        userId: session.user.id,
        details: { count: applications.length, jobId, status },
      });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    await logger.error("applications", "Failed to fetch applications", {
      ...getRequestContext(request),
      userId: session?.user?.id || undefined,
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch applications",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
    const data = await request.json();

    if (!data.jobId) {
      return NextResponse.json(
        { error: "Missing required field: jobId" },
        { status: 400 }
      );
    }

    // Check if job has custom form fields - if so, validate those instead of standard fields
    const { getJob } = await import("../../models/Job");
    const job = await getJob(data.jobId);
    const hasCustomFields = job?.formFields && job.formFields.length > 0;

    // If no custom fields, require standard fields
    if (!hasCustomFields) {
      if (
        !data.name ||
        !data.email ||
        !data.discord ||
        !data.experience ||
        !data.whyJoin ||
        !data.availability
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
    }

    if (session?.user?.id) {
      const applicationStatus = await checkUserApplicationStatus(
        session.user.id,
        data.jobId
      );

      if (applicationStatus) {
        if (
          applicationStatus.status === "pending" ||
          applicationStatus.status === "approved"
        ) {
          return NextResponse.json(
            { error: "You have already applied for this job" },
            { status: 400 }
          );
        } else if (applicationStatus.status === "rejected") {
          const rejectionTime = new Date(applicationStatus.updatedAt).getTime();
          const currentTime = new Date().getTime();
          const hoursSinceRejection =
            (currentTime - rejectionTime) / (1000 * 60 * 60);
          const hoursRemaining = Math.ceil(24 - hoursSinceRejection);

          return NextResponse.json(
            {
              error: `Your previous application was rejected. Please wait ${hoursRemaining} more hour${
                hoursRemaining !== 1 ? "s" : ""
              } before applying again.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Build application data - include all form fields dynamically
    const applicationData: Record<string, any> = {
      jobId: data.jobId,
      userId: session?.user?.id,
    };

    // If job has custom fields, validate and store them
    if (hasCustomFields && job.formFields) {
      // Validate required custom fields
      for (const field of job.formFields) {
        if (field.required) {
          const fieldKey = `field_${field.label.en
            .toLowerCase()
            .replace(/\s+/g, "_")}`;
          const fieldValue = data[fieldKey];

          if (
            !fieldValue ||
            (typeof fieldValue === "string" && !fieldValue.trim())
          ) {
            return NextResponse.json(
              { error: `${field.label.en || field.label.ar} is required` },
              { status: 400 }
            );
          }
        }
      }

      // Store all custom form field responses
      job.formFields.forEach((field: { label: { en: string; ar: string } }) => {
        const fieldKey = `field_${field.label.en
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        if (data[fieldKey] !== undefined) {
          applicationData[fieldKey] = data[fieldKey];
        }
      });
    } else {
      // Add standard fields if no custom fields
      if (data.name) applicationData.name = data.name;
      if (data.email) applicationData.email = data.email;
      if (data.discord) applicationData.discord = data.discord;
      if (data.experience) applicationData.experience = data.experience;
      if (data.whyJoin) applicationData.whyJoin = data.whyJoin;
      if (data.availability) applicationData.availability = data.availability;
      if (data.resume) applicationData.resume = data.resume;
    }

    const application = await createApplication(applicationData);

    await logger.success("applications", "Job application submitted", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      details: {
        applicationId: application.id,
        jobId: applicationData.jobId,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    await logger.error("applications", "Failed to submit application", {
      ...getRequestContext(request),
      userId: session?.user?.id,
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Failed to submit application",
      },
      { status: 500 }
    );
  }
}

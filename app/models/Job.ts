import mongoose, { Schema, Document } from "mongoose";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "../../lib/db";

interface IContent {
  en: string;
  ar: string;
}

interface IFormField {
  type: "text" | "textarea" | "dropdown" | "checkbox";
  label: IContent;
  required: boolean;
  options?: IContent[];
}

export interface IJob extends Document {
  title: IContent;
  description: IContent;
  isOpen: boolean;
  formFields: IFormField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  category?: string;
  description: {
    en: string;
    ar: string;
  };
  requirements?: Array<{
    en: string;
    ar: string;
  }>;
  isOpen: boolean;
  isFeatured?: boolean;
  formFields?: Array<{
    type: "text" | "textarea" | "dropdown" | "checkbox";
    label: {
      en: string;
      ar: string;
    };
    required: boolean;
    options?: Array<{
      en: string;
      ar: string;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId?: string;
  name?: string;
  email?: string;
  discord?: string;
  experience?: string;
  whyJoin?: string;
  availability?: string;
  resume?: string;
  [key: string]: any; // Allow dynamic form fields
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true },
});

const FormFieldSchema = new Schema({
  type: {
    type: String,
    enum: ["text", "textarea", "dropdown", "checkbox"],
    required: true,
  },
  label: {
    type: ContentSchema,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: [ContentSchema],
});

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: ContentSchema,
      required: true,
    },
    description: {
      type: ContentSchema,
      required: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    formFields: [FormFieldSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export const createJob = async (
  jobData: Omit<Job, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const { db } = await connectToDatabase();
    const jobsCollection = db.collection("jobs");

    const now = new Date();
    const newJob = {
      id: uuidv4(),
      ...jobData,
      createdAt: now,
      updatedAt: now,
    };

    await jobsCollection.insertOne(newJob);
    return newJob;
  } catch (error) {
    console.error("Error in createJob:", error);
    throw error;
  }
};

export const updateJob = async (
  id: string,
  jobData: Partial<Omit<Job, "id" | "createdAt" | "updatedAt">>
) => {
  const { db } = await connectToDatabase();
  const jobsCollection = db.collection("jobs");

  const updatedJob = {
    ...jobData,
    updatedAt: new Date(),
  };

  await jobsCollection.updateOne({ id }, { $set: updatedJob });
  return { id, ...updatedJob };
};

export const deleteJob = async (id: string) => {
  const { db } = await connectToDatabase();
  const jobsCollection = db.collection("jobs");

  await jobsCollection.deleteOne({ id });
  return { id };
};

export const getJob = async (id: string) => {
  const { db } = await connectToDatabase();
  const jobsCollection = db.collection("jobs");

  return jobsCollection.findOne({ id });
};

export const getJobs = async (filters?: {
  isOpen?: boolean;
  isFeatured?: boolean;
  category?: string;
}) => {
  try {
    const { db } = await connectToDatabase();
    const jobsCollection = db.collection("jobs");

    const query: Record<string, any> = {};

    if (filters) {
      if (filters.isOpen !== undefined) query.isOpen = filters.isOpen;
      if (filters.isFeatured !== undefined)
        query.isFeatured = filters.isFeatured;
      if (filters.category) query.category = filters.category;
    }

    const jobs = await jobsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return jobs;
  } catch (error) {
    console.error("Error in getJobs:", error);
    throw error;
  }
};

export const createApplication = async (
  applicationData: Omit<
    JobApplication,
    "id" | "status" | "createdAt" | "updatedAt"
  >
) => {
  const { db } = await connectToDatabase();
  const applicationsCollection = db.collection("jobApplications");

  const now = new Date();
  const newApplication = {
    id: uuidv4(),
    ...applicationData,
    status: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };

  await applicationsCollection.insertOne(newApplication);

  if (applicationData.userId) {
    await sendApplicationNotification(
      applicationData.userId,
      applicationData.jobId,
      "submitted",
      newApplication.id
    );
  }

  return newApplication;
};

export const updateApplicationStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected"
) => {
  const { db } = await connectToDatabase();
  const applicationsCollection = db.collection("jobApplications");

  const application = await applicationsCollection.findOne({ id });

  if (!application) {
    throw new Error("Application not found");
  }

  await applicationsCollection.updateOne(
    { id },
    { $set: { status, updatedAt: new Date() } }
  );

  if (application.userId) {
    await sendApplicationNotification(
      application.userId,
      application.jobId,
      status,
      id
    );
  }

  return { id, status };
};

export const getApplications = async (
  jobId?: string,
  status?: "pending" | "approved" | "rejected"
) => {
  const { db } = await connectToDatabase();
  const applicationsCollection = db.collection("jobApplications");

  const query: Record<string, any> = {};

  if (jobId) query.jobId = jobId;
  if (status) query.status = status;

  return applicationsCollection.find(query).sort({ createdAt: -1 }).toArray();
};

export const getApplication = async (id: string) => {
  const { db } = await connectToDatabase();
  const applicationsCollection = db.collection("jobApplications");

  return applicationsCollection.findOne({ id });
};

export const getUserApplications = async (userId: string) => {
  const { db } = await connectToDatabase();
  const applicationsCollection = db.collection("jobApplications");

  return applicationsCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
};

export const checkUserApplicationStatus = async (
  userId: string,
  jobId: string
) => {
  const { db } = await connectToDatabase();
  const applicationsCollection = db.collection("jobApplications");

  const application = await applicationsCollection.findOne({
    userId,
    jobId,
  });

  if (!application) {
    return null;
  }

  if (application.status === "rejected") {
    const rejectionTime = new Date(application.updatedAt).getTime();
    const currentTime = new Date().getTime();
    const hoursSinceRejection =
      (currentTime - rejectionTime) / (1000 * 60 * 60);

    if (hoursSinceRejection >= 24) {
      return null;
    }
  }

  return {
    status: application.status,
    appliedAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
};

export const sendApplicationNotification = async (
  userId: string,
  jobId: string,
  status: "submitted" | "pending" | "approved" | "rejected",
  applicationId: string
) => {
  try {
    const { db } = await connectToDatabase();
    const messagesCollection = db.collection("messages");
    const jobsCollection = db.collection("jobs");

    const job = await jobsCollection.findOne({ id: jobId });

    if (!job) {
      throw new Error("Job not found");
    }

    let subject = "";
    let content = "";

    switch (status) {
      case "submitted":
        subject = `Job Application Received: ${job.title}`;
        content = `Thank you for applying to the ${job.title} position. Our team will review your application and get back to you soon. You can check the status of your application in your profile.`;
        break;
      case "approved":
        subject = `Job Application Approved: ${job.title}`;
        content = `Congratulations! Your application for the ${job.title} position has been approved. Our team will contact you shortly with next steps. Thank you for your interest in joining our community.`;
        break;
      case "rejected":
        subject = `Job Application Update: ${job.title}`;
        content = `Thank you for your interest in the ${job.title} position. After careful consideration, we have decided to move forward with other candidates at this time. We appreciate your interest in our community and encourage you to apply for future positions.`;
        break;
      default:
        subject = `Job Application Update: ${job.title}`;
        content = `There has been an update to your application for the ${job.title} position. Please check your profile for more details.`;
    }

    const message = {
      id: uuidv4(),
      userId: userId,
      subject: subject,
      sender: "Jobs Team",
      content: content,
      read: false,
      applicationId: applicationId,
      jobId: jobId,
      createdAt: new Date().toISOString(),
    };

    await messagesCollection.insertOne(message);
    return message;
  } catch (error) {
    console.error("Error sending application notification:", error);
    throw error;
  }
};

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "../../../lib/hooks/useTranslation";
import { AuthGuard } from "../../../components/AuthGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import {
  Briefcase,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Job {
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
  createdAt: string;
  updatedAt: string;
}

interface ApplicationStatus {
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  updatedAt: string;
}

function JobDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const resolvedParams = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchJob();
    checkApplicationStatus();
  }, [resolvedParams.id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch job");
      const data = await response.json();
      setJob(data.job);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
      router.push("/jobs");
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch(
        `/api/applications/check?jobId=${resolvedParams.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.applicationStatus) {
          setApplicationStatus(data.applicationStatus);
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job) return;

    // Validate required fields
    const requiredFields =
      job.formFields?.filter((field) => field.required) || [];
    for (const field of requiredFields) {
      const fieldKey = `field_${field.label.en
        .toLowerCase()
        .replace(/\s+/g, "_")}`;
      if (
        !formData[fieldKey] ||
        (typeof formData[fieldKey] === "string" && !formData[fieldKey].trim())
      ) {
        toast.error(
          `${field.label[locale as "en" | "ar"] || field.label.en} is required`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Build application data from form fields
      const applicationData: Record<string, any> = {
        jobId: job.id,
      };

      // Add form field responses
      job.formFields?.forEach((field) => {
        const fieldKey = `field_${field.label.en
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        applicationData[fieldKey] = formData[fieldKey];
      });

      // Add standard fields if they exist in form
      if (formData.name) applicationData.name = formData.name;
      if (formData.email) applicationData.email = formData.email;
      if (formData.discord) applicationData.discord = formData.discord;
      if (formData.experience) applicationData.experience = formData.experience;
      if (formData.whyJoin) applicationData.whyJoin = formData.whyJoin;
      if (formData.availability)
        applicationData.availability = formData.availability;
      if (formData.resume) applicationData.resume = formData.resume;

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      const result = await response.json();
      const applicationId = result.application?.id;

      // Redirect to success page with application ID
      router.push(
        `/jobs/${resolvedParams.id}/success${
          applicationId ? `?applicationId=${applicationId}` : ""
        }`
      );
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("jobs.application_error", "Failed to submit application")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("jobs.not_found", "Job not found")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t(
                  "jobs.not_found_message",
                  "The job you're looking for doesn't exist."
                )}
              </p>
              <Button asChild>
                <Link href="/jobs">
                  {t("jobs.back_to_jobs", "Back to Jobs")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job.isOpen) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-12 pb-12 text-center">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("jobs.closed", "Position Closed")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t(
                  "jobs.closed_message",
                  "This position is no longer accepting applications."
                )}
              </p>
              <Button asChild>
                <Link href="/jobs">
                  {t("jobs.back_to_jobs", "Back to Jobs")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80">
        <Header />
        <main className="flex-grow">
          <section className="py-12 md:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
            <div className="container max-w-4xl mx-auto px-4 relative z-10">
              <Button
                variant="ghost"
                onClick={() => router.push("/jobs")}
                className="mb-6 text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("jobs.back_to_jobs", "Back to Jobs")}
              </Button>

              <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-white mb-2">
                        {job.title[locale as "en" | "ar"] || job.title.en}
                      </CardTitle>
                      {job.category && (
                        <Badge variant="outline" className="mb-2">
                          {job.category}
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t("jobs.open", "Open")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-gray-300 whitespace-pre-line">
                      {job.description[locale as "en" | "ar"] ||
                        job.description.en}
                    </p>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {t("jobs.requirements", "Requirements")}
                      </h3>
                      <ul className="space-y-2">
                        {job.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-start text-gray-300"
                          >
                            <span className="text-primary mr-2">•</span>
                            <span>{req[locale as "en" | "ar"] || req.en}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {applicationStatus ? (
                <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      {applicationStatus.status === "pending" && (
                        <>
                          <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            {t(
                              "jobs.application_pending",
                              "Application Pending"
                            )}
                          </h3>
                          <p className="text-gray-400 mb-4">
                            {t(
                              "jobs.application_pending_message",
                              "Your application is under review. We'll notify you once a decision has been made."
                            )}
                          </p>
                        </>
                      )}
                      {applicationStatus.status === "approved" && (
                        <>
                          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            {t(
                              "jobs.application_approved",
                              "Application Approved"
                            )}
                          </h3>
                          <p className="text-gray-400 mb-4">
                            {t(
                              "jobs.application_approved_message",
                              "Congratulations! Your application has been approved. Check your inbox for more details."
                            )}
                          </p>
                        </>
                      )}
                      {applicationStatus.status === "rejected" && (
                        <>
                          <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            {t(
                              "jobs.application_rejected",
                              "Application Not Selected"
                            )}
                          </h3>
                          <p className="text-gray-400 mb-4">
                            {t(
                              "jobs.application_rejected_message",
                              "Thank you for your interest. Unfortunately, we've decided to move forward with other candidates at this time."
                            )}
                          </p>
                        </>
                      )}
                      <Button asChild variant="outline">
                        <Link href="/profile/applications">
                          {t("jobs.view_applications", "View My Applications")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">
                      {t("jobs.apply", "Apply for this Position")}
                    </CardTitle>
                    <CardDescription>
                      {t(
                        "jobs.apply_description",
                        "Fill out the form below to submit your application"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {job.formFields && job.formFields.length > 0 ? (
                        job.formFields.map((field, index) => {
                          const fieldKey = `field_${field.label.en
                            .toLowerCase()
                            .replace(/\s+/g, "_")}`;
                          const fieldLabel =
                            field.label[locale as "en" | "ar"] ||
                            field.label.en;

                          return (
                            <div key={index} className="space-y-2">
                              <Label htmlFor={fieldKey} className="text-white">
                                {fieldLabel}
                                {field.required && (
                                  <span className="text-red-400 ml-1">*</span>
                                )}
                              </Label>
                              {field.type === "text" && (
                                <Input
                                  id={fieldKey}
                                  value={formData[fieldKey] || ""}
                                  onChange={(e) =>
                                    handleInputChange(fieldKey, e.target.value)
                                  }
                                  required={field.required}
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                              )}
                              {field.type === "textarea" && (
                                <Textarea
                                  id={fieldKey}
                                  value={formData[fieldKey] || ""}
                                  onChange={(e) =>
                                    handleInputChange(fieldKey, e.target.value)
                                  }
                                  required={field.required}
                                  className="bg-gray-800 border-gray-700 text-white"
                                  rows={4}
                                />
                              )}
                              {field.type === "dropdown" && field.options && (
                                <Select
                                  value={formData[fieldKey] || ""}
                                  onValueChange={(value) =>
                                    handleInputChange(fieldKey, value)
                                  }
                                  required={field.required}
                                >
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue
                                      placeholder={t(
                                        "jobs.select_option",
                                        "Select an option"
                                      )}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map((option, optIndex) => (
                                      <SelectItem
                                        key={optIndex}
                                        value={option.en}
                                        className="text-white"
                                      >
                                        {option[locale as "en" | "ar"] ||
                                          option.en}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {field.type === "checkbox" && (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={fieldKey}
                                    checked={formData[fieldKey] || false}
                                    onCheckedChange={(checked) =>
                                      handleInputChange(
                                        fieldKey,
                                        checked as boolean
                                      )
                                    }
                                    required={field.required}
                                  />
                                  <label
                                    htmlFor={fieldKey}
                                    className="text-sm text-gray-300"
                                  >
                                    {t("jobs.i_agree", "I agree")}
                                  </label>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-white">
                              {t("jobs.name", "Full Name")}{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name || ""}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              required
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">
                              {t("jobs.email", "Email")}{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email || ""}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              required
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="discord" className="text-white">
                              {t("jobs.discord", "Discord Username")}{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Input
                              id="discord"
                              value={formData.discord || ""}
                              onChange={(e) =>
                                handleInputChange("discord", e.target.value)
                              }
                              required
                              className="bg-gray-800 border-gray-700 text-white"
                              placeholder="username#1234"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="experience" className="text-white">
                              {t("jobs.experience", "Experience")}{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Textarea
                              id="experience"
                              value={formData.experience || ""}
                              onChange={(e) =>
                                handleInputChange("experience", e.target.value)
                              }
                              required
                              className="bg-gray-800 border-gray-700 text-white"
                              rows={4}
                              placeholder={t(
                                "jobs.experience_placeholder",
                                "Tell us about your relevant experience..."
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="whyJoin" className="text-white">
                              {t("jobs.why_join", "Why do you want to join?")}{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Textarea
                              id="whyJoin"
                              value={formData.whyJoin || ""}
                              onChange={(e) =>
                                handleInputChange("whyJoin", e.target.value)
                              }
                              required
                              className="bg-gray-800 border-gray-700 text-white"
                              rows={4}
                              placeholder={t(
                                "jobs.why_join_placeholder",
                                "Tell us why you're interested in this position..."
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="availability"
                              className="text-white"
                            >
                              {t("jobs.availability", "Availability")}{" "}
                              <span className="text-red-400">*</span>
                            </Label>
                            <Textarea
                              id="availability"
                              value={formData.availability || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "availability",
                                  e.target.value
                                )
                              }
                              required
                              className="bg-gray-800 border-gray-700 text-white"
                              rows={3}
                              placeholder={t(
                                "jobs.availability_placeholder",
                                "When are you available?"
                              )}
                            />
                          </div>
                        </>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                      >
                        {isSubmitting
                          ? t("jobs.submitting", "Submitting...")
                          : t("jobs.submit_application", "Submit Application")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading...</span>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <JobDetailContent params={params} />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RoleGuard } from "../../../components/RoleGuard";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  GripVertical,
  Copy,
  ArrowUp,
  ArrowDown,
  EyeIcon,
  Settings,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useTranslation } from "../../../lib/hooks/useTranslation";

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

interface Application {
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
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For dynamic form fields
}

export default function AdminJobs() {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("jobs");
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (activeMainTab === "applications") {
      fetchApplications();
    }
  }, [activeMainTab, selectedJobFilter, selectedStatusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs", {
        credentials: "include",
      });
      if (!response.ok) {
        let errorMessage = `Failed to fetch jobs: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error("API Error Response:", errorData);
        } catch (parseError) {
          const text = await response.text().catch(() => "");
          if (text) {
            console.error("Response text:", text);
            errorMessage = text || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setJobs(data.jobs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load jobs"
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete job");

      setJobs(jobs.filter((job) => job.id !== id));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  const handleToggleStatus = async (job: Job) => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isOpen: !job.isOpen,
        }),
      });

      if (!response.ok) throw new Error("Failed to update job");

      const updatedJob = await response.json();
      setJobs(jobs.map((j) => (j.id === job.id ? updatedJob.job : j)));
      toast.success("Job status updated");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job status");
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const params = new URLSearchParams();
      if (selectedJobFilter !== "all") {
        params.append("jobId", selectedJobFilter);
      }
      if (selectedStatusFilter !== "all") {
        params.append("status", selectedStatusFilter);
      }
      const url = `/api/applications${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch applications: ${response.status}`
        );
      }
      const data = await response.json();
      setApplications(data.applications || []);
      setApplicationsLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load applications"
      );
      setApplicationsLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: "pending" | "approved" | "rejected"
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to update application status"
        );
      }

      const result = await response.json();
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      toast.success("Application status updated");
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update application status"
      );
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "owner"]}>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="cyberpunk-border inline-block">
              Jobs Management
            </span>
          </h1>
          {activeMainTab === "jobs" && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Create Job
                </Button>
              </DialogTrigger>
              <JobFormDialog
                onClose={() => {
                  setIsCreateDialogOpen(false);
                  fetchJobs();
                }}
              />
            </Dialog>
          )}
        </div>

        <Tabs
          value={activeMainTab}
          onValueChange={setActiveMainTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Manage Jobs ({jobs.length})
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-800 rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-800 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No jobs yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first job posting to get started.
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="border-gray-800 bg-secondary/30"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white mb-2">
                            {job.title[locale as "en" | "ar"] || job.title.en}
                          </CardTitle>
                          {job.category && (
                            <Badge variant="outline" className="mb-2">
                              {job.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {job.isOpen ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 line-clamp-2 mb-4">
                        {job.description[locale as "en" | "ar"] ||
                          job.description.en}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={job.isOpen}
                            onCheckedChange={() => handleToggleStatus(job)}
                          />
                          <span className="text-sm text-gray-400">
                            {job.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingJob(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <JobFormDialog
                              job={job}
                              onClose={() => {
                                setEditingJob(null);
                                fetchJobs();
                              }}
                            />
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(job.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="mt-0">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label>Filter by Job</Label>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="all">All Jobs</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title[locale as "en" | "ar"] || job.title.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <Label>Filter by Status</Label>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {applicationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : applications.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No applications found
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedJobFilter !== "all" ||
                      selectedStatusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "No applications have been submitted yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => {
                    const job = jobs.find((j) => j.id === application.jobId);
                    return (
                      <Card
                        key={application.id}
                        className="bg-secondary/30 border-gray-800"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-white mb-2">
                                {job
                                  ? job.title[locale as "en" | "ar"] ||
                                    job.title.en
                                  : "Unknown Job"}
                              </CardTitle>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                                {application.name && (
                                  <span>
                                    <strong>Name:</strong> {application.name}
                                  </span>
                                )}
                                {application.email && (
                                  <span>
                                    <strong>Email:</strong> {application.email}
                                  </span>
                                )}
                                {application.discord && (
                                  <span>
                                    <strong>Discord:</strong>{" "}
                                    {application.discord}
                                  </span>
                                )}
                                <span>
                                  <strong>Applied:</strong>{" "}
                                  {new Date(
                                    application.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={
                                application.status === "approved"
                                  ? "bg-green-500/20 text-green-400"
                                  : application.status === "rejected"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }
                            >
                              {application.status === "pending" && "Pending"}
                              {application.status === "approved" && "Approved"}
                              {application.status === "rejected" && "Rejected"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Display standard fields if they exist */}
                          {!job?.formFields || job.formFields.length === 0 ? (
                            <>
                              {application.experience && (
                                <div>
                                  <Label className="text-white mb-1">
                                    Experience
                                  </Label>
                                  <p className="text-gray-300 text-sm whitespace-pre-line">
                                    {application.experience}
                                  </p>
                                </div>
                              )}
                              {application.whyJoin && (
                                <div>
                                  <Label className="text-white mb-1">
                                    Why Join?
                                  </Label>
                                  <p className="text-gray-300 text-sm whitespace-pre-line">
                                    {application.whyJoin}
                                  </p>
                                </div>
                              )}
                              {application.availability && (
                                <div>
                                  <Label className="text-white mb-1">
                                    Availability
                                  </Label>
                                  <p className="text-gray-300 text-sm whitespace-pre-line">
                                    {application.availability}
                                  </p>
                                </div>
                              )}
                              {application.resume && (
                                <div>
                                  <Label className="text-white mb-1">
                                    Resume
                                  </Label>
                                  <p className="text-gray-300 text-sm">
                                    {application.resume}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            /* Display custom form fields */
                            job.formFields.map((field, index) => {
                              const fieldKey = `field_${field.label.en
                                .toLowerCase()
                                .replace(/\s+/g, "_")}`;
                              const fieldValue = application[fieldKey];

                              // Skip if field value is empty/null/undefined
                              if (
                                fieldValue === undefined ||
                                fieldValue === null ||
                                fieldValue === ""
                              ) {
                                return null;
                              }

                              return (
                                <div key={index}>
                                  <Label className="text-white mb-1">
                                    {field.label[locale as "en" | "ar"] ||
                                      field.label.en}
                                    {field.required && (
                                      <span className="text-red-400 ml-1">
                                        *
                                      </span>
                                    )}
                                  </Label>
                                  <p className="text-gray-300 text-sm whitespace-pre-line">
                                    {typeof fieldValue === "boolean"
                                      ? fieldValue
                                        ? "Yes"
                                        : "No"
                                      : Array.isArray(fieldValue)
                                      ? fieldValue.join(", ")
                                      : String(fieldValue)}
                                  </p>
                                </div>
                              );
                            })
                          )}

                          <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                            <Label className="text-white">Update Status:</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateApplicationStatus(
                                  application.id,
                                  "pending"
                                )
                              }
                              disabled={application.status === "pending"}
                              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                            >
                              Pending
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateApplicationStatus(
                                  application.id,
                                  "approved"
                                )
                              }
                              disabled={application.status === "approved"}
                              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateApplicationStatus(
                                  application.id,
                                  "rejected"
                                )
                              }
                              disabled={application.status === "rejected"}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}

function JobFormDialog({ job, onClose }: { job?: Job; onClose: () => void }) {
  const { locale, t } = useTranslation();
  const [formData, setFormData] = useState({
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    category: "",
    requirements: [] as Array<{ en: string; ar: string }>,
    isOpen: true,
    isFeatured: false,
    formFields: [] as Array<{
      type: "text" | "textarea" | "dropdown" | "checkbox";
      label: { en: string; ar: string };
      required: boolean;
      options?: Array<{ en: string; ar: string }>;
    }>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(true);
  const [activeTab, setActiveTab] = useState("fields");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description,
        category: job.category || "",
        requirements: job.requirements || [],
        isOpen: job.isOpen,
        isFeatured: job.isFeatured || false,
        formFields: job.formFields || [],
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data before sending
      if (!formData.title?.en || !formData.title?.ar) {
        toast.error("Please provide both English and Arabic titles");
        setIsSubmitting(false);
        return;
      }

      if (!formData.description?.en || !formData.description?.ar) {
        toast.error("Please provide both English and Arabic descriptions");
        setIsSubmitting(false);
        return;
      }

      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      console.log("Submitting job data:", {
        url,
        method,
        hasTitle: !!formData.title,
        hasDescription: !!formData.description,
        formFieldsCount: formData.formFields?.length || 0,
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = `Failed to save job: ${response.status} ${response.statusText}`;
        try {
          // Clone the response so we can read it multiple times if needed
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          try {
            const text = await response.text();
            if (text) {
              console.error("Response text:", text);
              // Try to extract error from text if it's JSON-like
              try {
                const parsed = JSON.parse(text);
                errorMessage =
                  parsed.error || parsed.details || text || errorMessage;
              } catch {
                errorMessage = text || errorMessage;
              }
            }
          } catch (textError) {
            console.error("Failed to read response text:", textError);
          }
        }
        throw new Error(errorMessage);
      }

      toast.success(
        job ? "Job updated successfully" : "Job created successfully"
      );
      onClose();
    } catch (error) {
      console.error("Error saving job:", error);
      let errorMessage = "Failed to save job";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for common error patterns
        if (error.message.includes("SSL") || error.message.includes("TLS")) {
          errorMessage =
            "Database connection error. Please check your MongoDB connection settings.";
        } else if (error.message.includes("Unauthorized")) {
          errorMessage =
            "You are not authorized to perform this action. Please log in again.";
        } else if (error.message.includes("Forbidden")) {
          errorMessage = "You don't have permission to perform this action.";
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFormField = () => {
    setFormData({
      ...formData,
      formFields: [
        ...formData.formFields,
        {
          type: "text",
          label: { en: "", ar: "" },
          required: false,
        },
      ],
    });
  };

  const updateFormField = (
    index: number,
    field: Partial<(typeof formData.formFields)[0]>
  ) => {
    const newFields = [...formData.formFields];
    newFields[index] = { ...newFields[index], ...field };
    setFormData({ ...formData, formFields: newFields });
  };

  const removeFormField = (index: number) => {
    setFormData({
      ...formData,
      formFields: formData.formFields.filter((_, i) => i !== index),
    });
  };

  const addFormFieldOption = (fieldIndex: number) => {
    const newFields = [...formData.formFields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options!.push({ en: "", ar: "" });
    setFormData({ ...formData, formFields: newFields });
  };

  const updateFormFieldOption = (
    fieldIndex: number,
    optionIndex: number,
    option: { en: string; ar: string }
  ) => {
    const newFields = [...formData.formFields];
    if (newFields[fieldIndex].options) {
      newFields[fieldIndex].options![optionIndex] = option;
    }
    setFormData({ ...formData, formFields: newFields });
  };

  const removeFormFieldOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...formData.formFields];
    if (newFields[fieldIndex].options) {
      newFields[fieldIndex].options = newFields[fieldIndex].options!.filter(
        (_, i) => i !== optionIndex
      );
    }
    setFormData({ ...formData, formFields: newFields });
  };

  // Requirements management
  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, { en: "", ar: "" }],
    });
  };

  const updateRequirement = (
    index: number,
    requirement: { en: string; ar: string }
  ) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = requirement;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  // Field reordering and management
  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...formData.formFields];
    [newFields[index - 1], newFields[index]] = [
      newFields[index],
      newFields[index - 1],
    ];
    setFormData({ ...formData, formFields: newFields });
  };

  const moveFieldDown = (index: number) => {
    if (index === formData.formFields.length - 1) return;
    const newFields = [...formData.formFields];
    [newFields[index], newFields[index + 1]] = [
      newFields[index + 1],
      newFields[index],
    ];
    setFormData({ ...formData, formFields: newFields });
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = formData.formFields[index];
    const newField = {
      ...fieldToDuplicate,
      label: {
        en: `${fieldToDuplicate.label.en} (Copy)`,
        ar: `${fieldToDuplicate.label.ar} (نسخة)`,
      },
      options: fieldToDuplicate.options
        ? [...fieldToDuplicate.options]
        : undefined,
    };
    const newFields = [
      ...formData.formFields.slice(0, index + 1),
      newField,
      ...formData.formFields.slice(index + 1),
    ];
    setFormData({ ...formData, formFields: newFields });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...formData.formFields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    setFormData({ ...formData, formFields: newFields });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{job ? "Edit Job" : "Create New Job"}</DialogTitle>
        <DialogDescription>
          {job
            ? "Update the job details and form fields"
            : "Create a new job posting with custom application form"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title-en">Title (English) *</Label>
            <Input
              id="title-en"
              value={formData.title.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: { ...formData.title, en: e.target.value },
                })
              }
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title-ar">Title (Arabic) *</Label>
            <Input
              id="title-ar"
              value={formData.title.ar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: { ...formData.title, ar: e.target.value },
                })
              }
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description-en">Description (English) *</Label>
            <Textarea
              id="description-en"
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
              required
              rows={4}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description-ar">Description (Arabic) *</Label>
            <Textarea
              id="description-ar"
              value={formData.description.ar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, ar: e.target.value },
                })
              }
              required
              rows={4}
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Police, Medic, Admin"
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isOpen"
              checked={formData.isOpen}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isOpen: checked })
              }
            />
            <Label htmlFor="isOpen">Open for Applications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isFeatured: checked })
              }
            />
            <Label htmlFor="isFeatured">Featured</Label>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Form Fields ({formData.formFields.length})
              </TabsTrigger>
              <TabsTrigger
                value="requirements"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Requirements ({formData.requirements.length})
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  Manage application form fields. Drag to reorder.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFormField}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>

              {formData.formFields.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-gray-400 mb-4">
                      No form fields yet. Add your first field to get started.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFormField}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Field
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {formData.formFields.map((field, index) => (
                    <Card
                      key={index}
                      className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-colors"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-gray-500 cursor-move" />
                            <CardTitle className="text-sm">
                              {field.label.en ||
                                field.label.ar ||
                                `Field ${index + 1}`}
                              {field.required && (
                                <span className="text-red-400 ml-1">*</span>
                              )}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFieldUp(index)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                              title="Move up"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFieldDown(index)}
                              disabled={
                                index === formData.formFields.length - 1
                              }
                              className="h-8 w-8 p-0"
                              title="Move down"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateField(index)}
                              className="h-8 w-8 p-0"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFormField(index)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Field Type</Label>
                            <select
                              value={field.type}
                              onChange={(e) =>
                                updateFormField(index, {
                                  type: e.target.value as any,
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="checkbox">Checkbox</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) =>
                                updateFormField(index, { required: checked })
                              }
                            />
                            <Label>Required</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Label (English)</Label>
                            <Input
                              value={field.label.en}
                              onChange={(e) =>
                                updateFormField(index, {
                                  label: { ...field.label, en: e.target.value },
                                })
                              }
                              className="bg-gray-800 border-gray-700"
                              placeholder="Field label in English"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Label (Arabic)</Label>
                            <Input
                              value={field.label.ar}
                              onChange={(e) =>
                                updateFormField(index, {
                                  label: { ...field.label, ar: e.target.value },
                                })
                              }
                              className="bg-gray-800 border-gray-700"
                              placeholder="تسمية الحقل بالعربية"
                            />
                          </div>
                        </div>

                        {field.type === "dropdown" && (
                          <div className="space-y-2">
                            <Label>Dropdown Options</Label>
                            {field.options?.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="grid grid-cols-2 gap-2 items-end"
                              >
                                <Input
                                  placeholder="English option"
                                  value={option.en}
                                  onChange={(e) =>
                                    updateFormFieldOption(index, optIndex, {
                                      ...option,
                                      en: e.target.value,
                                    })
                                  }
                                  className="bg-gray-800 border-gray-700"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Arabic option"
                                    value={option.ar}
                                    onChange={(e) =>
                                      updateFormFieldOption(index, optIndex, {
                                        ...option,
                                        ar: e.target.value,
                                      })
                                    }
                                    className="bg-gray-800 border-gray-700"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeFormFieldOption(index, optIndex)
                                    }
                                    className="text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addFormFieldOption(index)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  Add job requirements that will be displayed on the job page.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRequirement}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Requirement
                </Button>
              </div>

              {formData.requirements.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-gray-400 mb-4">
                      No requirements added yet.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRequirement}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Requirement
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {formData.requirements.map((requirement, index) => (
                    <Card
                      key={index}
                      className="bg-gray-900/50 border-gray-800"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Requirement (English)</Label>
                              <Input
                                value={requirement.en}
                                onChange={(e) =>
                                  updateRequirement(index, {
                                    ...requirement,
                                    en: e.target.value,
                                  })
                                }
                                className="bg-gray-800 border-gray-700"
                                placeholder="e.g., Must be 18+ years old"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Requirement (Arabic)</Label>
                              <Input
                                value={requirement.ar}
                                onChange={(e) =>
                                  updateRequirement(index, {
                                    ...requirement,
                                    ar: e.target.value,
                                  })
                                }
                                className="bg-gray-800 border-gray-700"
                                placeholder="مثال: يجب أن يكون عمره 18+ سنة"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                            className="text-red-400 hover:text-red-300 mt-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Form Preview</CardTitle>
                  <CardDescription>
                    Preview how the application form will look to users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.formFields.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No form fields to preview. Add fields in the "Form Fields"
                      tab.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.formFields.map((field, index) => (
                        <div key={index} className="space-y-2">
                          <Label className="text-white">
                            {field.label[locale as "en" | "ar"] ||
                              field.label.en ||
                              `Field ${index + 1}`}
                            {field.required && (
                              <span className="text-red-400 ml-1">*</span>
                            )}
                          </Label>
                          {field.type === "text" && (
                            <Input
                              disabled
                              placeholder="Text input"
                              className="bg-gray-800 border-gray-700"
                            />
                          )}
                          {field.type === "textarea" && (
                            <Textarea
                              disabled
                              placeholder="Textarea input"
                              rows={3}
                              className="bg-gray-800 border-gray-700"
                            />
                          )}
                          {field.type === "dropdown" && (
                            <select
                              disabled
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400"
                            >
                              <option>Select an option</option>
                              {field.options?.map((opt, optIdx) => (
                                <option key={optIdx}>
                                  {opt[locale as "en" | "ar"] || opt.en}
                                </option>
                              ))}
                            </select>
                          )}
                          {field.type === "checkbox" && (
                            <div className="flex items-center space-x-2">
                              <Checkbox disabled />
                              <Label className="text-gray-400">
                                {field.label[locale as "en" | "ar"] ||
                                  field.label.en}
                              </Label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : job ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

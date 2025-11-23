"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../lib/AuthContext";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useTranslation } from "../../../lib/hooks/useTranslation";

interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  discord: string;
  experience: string;
  whyJoin: string;
  availability: string;
  resume: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface Job {
  id: string;
  title: {
    en: string;
    ar: string;
  };
}

export default function MyApplications() {
  const { user, isLoading: authLoading } = useAuth();
  const { locale } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplications();
    }
  }, [authLoading, user, refreshKey]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/applications");

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setApplications(data.applications);

      const jobIds: string[] = Array.from(
        new Set(data.applications.map((app: Application) => app.jobId))
      );
      const jobsData: Record<string, Job> = {};

      await Promise.all(
        jobIds.map(async (jobId: string) => {
          try {
            const jobResponse = await fetch(`/api/jobs/${jobId}`);
            if (jobResponse.ok) {
              const jobData = await jobResponse.json();
              jobsData[jobId] = jobData.job;
            }
          } catch (error) {
            console.error(`Error fetching job ${jobId}:`, error);
          }
        })
      );

      setJobs(jobsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your applications"
      );
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <div className="bg-secondary/80 border border-gray-800 rounded-lg p-8 max-w-lg mx-auto">
              <div className="text-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-yellow-500 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0l3-3m-3 3l-3-3m-2-5a4 4 0 011.5-3.2A4 4 0 0116 6.5 4 4 0 0119.5 10m-13.5 0l3 3m-3-3l-3 3"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-white mt-4">
                  Login Required
                </h2>
                <p className="text-gray-400 mt-2">
                  Please login to view your job applications.
                </p>
              </div>
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-32 pb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">
                My Job Applications
              </h1>
              <p className="text-gray-400 mt-1">
                Track the status of your job applications
              </p>
            </div>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : applications.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {applications.map((application) => {
                const job = jobs[application.jobId];
                return (
                  <div
                    key={application.id}
                    className="bg-secondary/80 border border-gray-800 rounded-lg p-6"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {job?.title
                            ? job.title[locale as "en" | "ar"] ||
                              job.title.en ||
                              "Unknown Position"
                            : "Unknown Position"}
                        </h2>
                        <p className="text-gray-400 text-sm">
                          Applied on{" "}
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
                            application.status
                          )}`}
                        >
                          {application.status === "pending" && "Under Review"}
                          {application.status === "approved" && "Approved"}
                          {application.status === "rejected" && "Not Selected"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Discord
                        </h3>
                        <p className="text-gray-300">{application.discord}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Availability
                        </h3>
                        <p className="text-gray-300">
                          {application.availability}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Experience
                      </h3>
                      <p className="text-gray-300 line-clamp-2">
                        {application.experience}
                      </p>
                    </div>

                    {application.status === "pending" && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm">
                        <p className="text-yellow-400">
                          Your application is currently being reviewed. We'll
                          notify you when there's an update.
                        </p>
                      </div>
                    )}

                    {application.status === "approved" && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm">
                        <p className="text-green-400">
                          Congratulations! Your application has been approved.
                          Our team will contact you soon with next steps.
                        </p>
                      </div>
                    )}

                    {application.status === "rejected" && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm">
                        <p className="text-red-400">
                          Thank you for your interest. Unfortunately, we've
                          decided to move forward with other candidates at this
                          time.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-secondary/80 border border-gray-800 rounded-lg p-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-600 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-bold text-white mb-2">
                No Applications Yet
              </h2>
              <p className="text-gray-400 mb-6">
                You haven't applied for any positions yet. Check out our open
                positions and submit your application.
              </p>
              <Link
                href="/jobs"
                className="inline-block px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors"
              >
                Browse Open Positions
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

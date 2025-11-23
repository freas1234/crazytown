"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import Link from "next/link";
import { useTranslation } from "../../../../lib/hooks/useTranslation";
import { AuthGuard } from "../../../../components/AuthGuard";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { CheckCircle, ArrowLeft, Briefcase, FileText } from "lucide-react";

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
}

function JobApplicationSuccessContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  const resolvedParams = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const applicationId = searchParams?.get("applicationId");

  // Ensure locale is valid
  const currentLocale = (locale === "en" || locale === "ar" ? locale : "en") as
    | "en"
    | "ar";

  useEffect(() => {
    if (resolvedParams.id) {
      fetchJob();
    }
  }, [resolvedParams.id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      const data = await response.json();
      if (data.job) {
        setJob(data.job);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job:", error);
      setLoading(false);
      // Don't redirect on error, just show the page without job details
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

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80">
        <Header />
        <main className="flex-grow">
          <section className="py-12 md:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
            <div className="container max-w-4xl mx-auto px-4 relative z-10">
              <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                      <div className="relative flex items-center justify-center w-full h-full bg-green-500/10 rounded-full border-4 border-green-500/30">
                        <CheckCircle className="h-12 w-12 text-green-400" />
                      </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                      {t(
                        "jobs.success.title",
                        "Application Submitted Successfully!"
                      )}
                    </h1>

                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                      {t(
                        "jobs.success.message",
                        "Thank you for your interest! Your application has been received and is now under review. We'll notify you once a decision has been made."
                      )}
                    </p>

                    {job && job.title && job.description && (
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8 text-left">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-white mb-2">
                              {job.title?.[currentLocale] ||
                                job.title?.en ||
                                ""}
                            </h2>
                            {job.category && (
                              <p className="text-gray-400 text-sm mb-2">
                                {t("jobs.category", "Category")}: {job.category}
                              </p>
                            )}
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {job.description?.[currentLocale] ||
                                job.description?.en ||
                                ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {applicationId && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
                        <p className="text-blue-400 text-sm">
                          <strong>
                            {t("jobs.success.application_id", "Application ID")}
                            :
                          </strong>{" "}
                          {applicationId}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        asChild
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <Link href="/profile/applications">
                          <FileText className="h-4 w-4 mr-2" />
                          {t(
                            "jobs.success.view_applications",
                            "View My Applications"
                          )}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Link href="/jobs">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          {t("jobs.success.back_to_jobs", "Back to Jobs")}
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-800">
                      <p className="text-gray-500 text-sm">
                        {t(
                          "jobs.success.next_steps",
                          "What happens next? We'll review your application and get back to you via email or through your account notifications."
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default function JobApplicationSuccessPage({
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
      <JobApplicationSuccessContent params={params} />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useTranslation } from "../../lib/hooks/useTranslation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Briefcase, MapPin, Clock, CheckCircle } from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
}

export default function JobsPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs?isOpen=true");

      if (!response.ok) {
        let errorMessage = `Failed to fetch jobs: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (textError) {
            // If both fail, use default message
            console.error("Failed to parse error response:", textError);
          }
        }

        // Check for SSL/database connection errors
        if (
          errorMessage.includes("SSL") ||
          errorMessage.includes("TLS") ||
          errorMessage.includes("database") ||
          errorMessage.includes("connection")
        ) {
          errorMessage =
            "Database connection error. Please try again later or contact support.";
        }

        console.error("Failed to fetch jobs:", {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });

        setJobs([]);
        setLoading(false);
        return; // Don't throw, just show empty state
      }

      const data = await response.json();
      console.log("Fetched jobs:", {
        total: data.jobs?.length || 0,
        openJobs: data.jobs?.filter((j: Job) => j.isOpen === true).length || 0,
      });
      setJobs(data.jobs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);

      // Handle specific error types
      let errorMessage = "Failed to load jobs";
      if (error instanceof Error) {
        if (
          error.message.includes("SSL") ||
          error.message.includes("TLS") ||
          error.message.includes("database")
        ) {
          errorMessage = "Database connection error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }

      console.error("Error details:", errorMessage);
      setJobs([]);
      setLoading(false);
    }
  };

  const openJobs = jobs.filter((job) => job.isOpen);
  const featuredJobs = openJobs.filter((job) => job.isFeatured);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80">
      <Header />
      <main className="flex-grow">
        <section className="py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  <span className="cyberpunk-border inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[3px] after:bg-primary">
                    {t("jobs.title", "Available Positions")}
                  </span>
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t(
                    "jobs.subtitle",
                    "Join our team and help build amazing experiences"
                  )}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg animate-pulse"
                  >
                    <CardHeader>
                      <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-800 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : openJobs.length === 0 ? (
              <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-12 pb-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <div className="relative w-24 h-24 mb-6 text-muted-foreground">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-secondary rounded-full">
                      <Briefcase className="h-12 w-12" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {t("jobs.no_jobs", "No positions available")}
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {t(
                      "jobs.no_jobs_message",
                      "We don't have any open positions at the moment. Check back soon!"
                    )}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {featuredJobs.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {t("jobs.featured", "Featured Positions")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {featuredJobs.map((job) => (
                        <JobCard key={job.id} job={job} locale={locale} t={t} />
                      ))}
                    </div>
                  </div>
                )}

                {openJobs.length > featuredJobs.length && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {t("jobs.all_positions", "All Open Positions")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {openJobs
                        .filter((job) => !job.isFeatured)
                        .map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            locale={locale}
                            t={t}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function JobCard({ job, locale, t }: { job: Job; locale: string; t: any }) {
  return (
    <Card className="border-gray-800 bg-secondary/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:border-primary/50 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white group-hover:text-primary transition-colors mb-2">
              {job.title[locale as "en" | "ar"] || job.title.en}
            </CardTitle>
            {job.category && (
              <Badge variant="outline" className="text-xs">
                {job.category}
              </Badge>
            )}
          </div>
          {job.isFeatured && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {t("jobs.featured_badge", "Featured")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400 line-clamp-3 mb-4">
          {job.description[locale as "en" | "ar"] || job.description.en}
        </CardDescription>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span>{t("jobs.open", "Open")}</span>
        </div>
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          <Link href={`/jobs/${job.id}`}>
            {t("jobs.apply_now", "Apply Now")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

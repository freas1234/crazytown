"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { signIn } from "next-auth/react";
import { useTranslation } from "../../lib/hooks/useTranslation";
import { usePageContent } from "../../lib/usePageContent";
import RecaptchaV2 from "../../components/RecaptchaV2";
import { useAuth } from "../../lib/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || null;
  const redirectTo = searchParams?.get("redirectTo") || null;

  const { locale } = useTranslation();
  const { localizedContent, isLoading } = usePageContent("login");
  const { user, isLoading: authLoading } = useAuth();

  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaError, setRecaptchaError] = useState("");

  // Use localizedContent instead of t
  const t = localizedContent;

  useEffect(() => {
    if (error === "InvalidCredentials") {
      setErrorMessage(
        t?.errorMessages?.invalidCredentials || "Invalid email or password"
      );
    } else if (error === "ServerError") {
      setErrorMessage(
        t?.errorMessages?.serverError || "Server error, please try again later"
      );
    } else if (
      error === "DiscordAuthFailed" ||
      error === "OAuthSignin" ||
      error === "OAuthCallback"
    ) {
      setErrorMessage("Discord authentication failed");
    } else if (error === "DiscordConfigMissing" || error === "Configuration") {
      setErrorMessage(
        "Discord login is not configured. Please set up the required environment variables."
      );
    } else if (error === "DiscordUserNotFound") {
      setErrorMessage(
        "No account found with this Discord ID. Please register first."
      );
    } else if (error === "AuthError") {
      setErrorMessage("Authentication error. Please try again.");
    }
  }, [error, t]);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo || "/");
    }
  }, [user, authLoading, router, redirectTo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
    setRecaptchaError("");
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken("");
    setRecaptchaError("reCAPTCHA expired. Please verify again.");
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken("");
    setRecaptchaError("reCAPTCHA verification failed. Please try again.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Skip reCAPTCHA check in development mode
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment && !recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setRecaptchaError("");

    try {
      // Skip reCAPTCHA verification in development mode
      if (!isDevelopment) {
        // First verify reCAPTCHA
        const verifyResponse = await fetch("/api/auth/verify-captcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recaptchaToken,
          }),
        });

        if (!verifyResponse.ok) {
          setErrorMessage("reCAPTCHA verification failed");
          setRecaptchaToken("");
          return;
        }
      }

      // Then use NextAuth signIn
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage(
          t?.errorMessages?.serverError ||
            "Login failed. Please check your credentials."
        );
        setRecaptchaToken("");
      } else {
        // Redirect after successful login
        router.push(redirectTo || "/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        t?.errorMessages?.serverError || "Server error. Please try again later."
      );
      setRecaptchaToken("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscordLogin = () => {
    setIsDiscordLoading(true);
    const baseUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : window.location.origin;

    signIn("discord", {
      callbackUrl: redirectTo ? `${baseUrl}${redirectTo}` : baseUrl,
      redirect: true,
    });
  };

  // Show loading while checking authentication
  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
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

  // If user is authenticated, don't show login form
  if (user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Redirecting...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12 parallax-bg">
        <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
        <div
          className="absolute top-20 left-1/4 w-1 h-20 bg-primary/20 skew-y-12 parallax-element"
          data-speed="0.03"
        ></div>
        <div
          className="absolute bottom-20 right-1/4 w-1 h-20 bg-primary/20 -skew-y-12 parallax-element"
          data-speed="0.02"
        ></div>

        <div className="w-full max-w-md relative z-10 p-6 bg-secondary/80 border border-gray-800 rounded-lg shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl font-display font-bold text-primary mb-6 text-center cyberpunk-border">
            {t?.title || "Login"}
          </h1>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t?.emailLabel || "Email"}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  {t?.passwordLabel || "Password"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <RecaptchaV2
              onVerify={handleRecaptchaVerify}
              onExpire={handleRecaptchaExpire}
              onError={handleRecaptchaError}
              className="my-4"
            />

            {recaptchaError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-200 text-sm">
                {recaptchaError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !recaptchaToken}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-gray-600 text-white font-medium rounded-md shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : t?.loginButton || "Login"}
            </button>
          </form>

          <div className="my-6 flex items-center justify-center">
            <div className="flex-grow h-px bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow h-px bg-gray-700"></div>
          </div>

          <button
            onClick={handleDiscordLogin}
            disabled={isDiscordLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-md shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 127.14 96.36"
              fill="#FFFFFF"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            <span>
              {isDiscordLoading
                ? locale === "ar"
                  ? "جاري الاتصال..."
                  : "Connecting..."
                : "Continue with Discord"}
            </span>
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            <span>{t?.noAccount || "Don't have an account?"} </span>
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              {t?.registerLink || "Register"}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
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
      <LoginContent />
    </Suspense>
  );
}

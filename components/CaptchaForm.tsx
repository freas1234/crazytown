"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import GoogleRecaptcha from "./GoogleRecaptcha";
import { isRecaptchaConfigured } from "../lib/google-recaptcha";

interface CaptchaFormProps {
  onSubmit: (data: {
    recaptchaToken: string;
    formStartTime: number;
    [key: string]: any;
  }) => void;
  loading?: boolean;
  error?: string;
  children: React.ReactNode;
  action?: string;
  threshold?: number;
}

export default function CaptchaForm({
  onSubmit,
  loading = false,
  error,
  children,
  action = "form_submit",
  threshold = 0.5,
}: CaptchaFormProps) {
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [formStartTime] = useState(Date.now());
  const [captchaError, setCaptchaError] = useState("");
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);

  useEffect(() => {
    // Auto-verify in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] reCAPTCHA auto-verified in CaptchaForm");
      setRecaptchaToken("dev-bypass-token");
      setIsRecaptchaReady(true);
      return;
    }

    if (!isRecaptchaConfigured()) {
      setCaptchaError("reCAPTCHA is not configured. Please contact support.");
      return;
    }

    // Set a small delay to ensure reCAPTCHA script is loaded
    const timer = setTimeout(() => {
      setIsRecaptchaReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Skip reCAPTCHA check in development mode
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment && !recaptchaToken) {
      setCaptchaError("Please complete the reCAPTCHA verification");
      return;
    }

    // Create form data with reCAPTCHA
    const formData = {
      recaptchaToken: isDevelopment ? "dev-bypass-token" : recaptchaToken,
      formStartTime,
    };

    onSubmit(formData);
  };

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
    setCaptchaError("");
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken("");
  };

  const handleRecaptchaError = () => {
    setCaptchaError("reCAPTCHA verification failed. Please try again.");
    setRecaptchaToken("");
  };

  if (!isRecaptchaReady) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading security verification...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (captchaError && !isRecaptchaConfigured()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{captchaError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      {/* Security Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <GoogleRecaptcha
              onVerify={handleRecaptchaVerify}
              onExpire={handleRecaptchaExpire}
              onError={handleRecaptchaError}
              action={action}
              threshold={threshold}
              className="flex justify-center"
            />
            {captchaError && (
              <p className="text-sm text-red-500 mt-2 text-center">
                {captchaError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form content */}
      {children}

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loading || !recaptchaToken}
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}

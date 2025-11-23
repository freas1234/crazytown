interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  score?: number;
  action?: string;
}

interface RecaptchaV3Config {
  siteKey: string;
  action: string;
  threshold: number;
}

class GoogleRecaptchaService {
  private siteKey: string;
  private secretKey: string;
  private verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

  constructor() {
    this.siteKey =
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY! ||
      "6LfOP9UrAAAAAKHF4NOrQChURSButq801EbaoQOR";
    this.secretKey =
      process.env.RECAPTCHA_SECRET_KEY! ||
      "6LfOP9UrAAAAAMTmT-XHh5yTZP13c7xu3p3c4Id2";

    if (!this.siteKey || !this.secretKey) {
      console.warn(
        "Google reCAPTCHA keys not configured. Using fallback CAPTCHA."
      );
    }
  }

  async verifyToken(
    token: string,
    remoteip?: string,
    action?: string,
    threshold: number = 0.5
  ): Promise<{
    success: boolean;
    score?: number;
    errors?: string[];
  }> {
    // Bypass reCAPTCHA verification in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] reCAPTCHA verification bypassed");
      return { success: true, score: 1.0 };
    }

    if (!this.secretKey) {
      return { success: false, errors: ["reCAPTCHA not configured"] };
    }

    try {
      const response = await fetch(this.verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: this.secretKey,
          response: token,
          remoteip: remoteip || "",
        }),
      });

      const data: RecaptchaResponse = await response.json();

      if (data.success) {
        // Check if this is reCAPTCHA v3 (has score) or v2 (no score)
        if (data.score !== undefined) {
          // reCAPTCHA v3 - check score and action
          const score = data.score || 0;
          const isValidAction = !action || data.action === action;
          const isValidScore = score >= threshold;

          if (isValidAction && isValidScore) {
            return {
              success: true,
              score: score,
            };
          } else {
            return {
              success: false,
              errors: [`Score too low: ${score} (minimum: ${threshold})`],
            };
          }
        } else {
          // reCAPTCHA v2 - no score validation needed
          return {
            success: true,
          };
        }
      } else {
        return {
          success: false,
          errors: data["error-codes"] || ["Verification failed"],
        };
      }
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return {
        success: false,
        errors: ["Network error during verification"],
      };
    }
  }

  getSiteKey(): string {
    return this.siteKey;
  }

  isConfigured(): boolean {
    return !!(this.siteKey && this.secretKey);
  }
}

// Global reCAPTCHA service instance
export const recaptchaService = new GoogleRecaptchaService();

// Helper functions
export async function verifyRecaptchaToken(
  token: string,
  remoteip?: string,
  action?: string,
  threshold?: number
) {
  return recaptchaService.verifyToken(token, remoteip, action, threshold);
}

export function getRecaptchaSiteKey() {
  return recaptchaService.getSiteKey();
}

export function isRecaptchaConfigured() {
  return recaptchaService.isConfigured();
}

// Generate a simple browser fingerprint for security purposes
export function generateBrowserFingerprint(): string {
  if (typeof window === "undefined") {
    return "server-side";
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Browser fingerprint", 2, 2);
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

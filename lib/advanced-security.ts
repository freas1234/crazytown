import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, RATE_LIMITS, getClientIP, createRateLimitResponse } from './rate-limit';
import { validateFields, VALIDATION_RULES, sanitizeInput, detectSuspiciousActivity, validateRequestBodySize, validateJSONStructure } from './validation';
import { logSecurityEvent } from './security-monitor';
import { generateBrowserFingerprint } from './google-recaptcha';
import crypto from 'crypto';

interface SecurityConfig {
  requireCaptcha?: boolean;
  requireHoneypot?: boolean;
  requireTiming?: boolean;
  maxBodySize?: number;
  rateLimitType?: keyof typeof RATE_LIMITS;
  allowedMethods?: string[];
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

interface RequestContext {
  clientIP: string;
  userAgent: string;
  fingerprint: string;
  startTime: number;
  headers: Record<string, string>;
  rawBody?: string;
}

class AdvancedSecurityManager {
  private blockedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();
  private userSessions = new Map<string, { userId: string; lastActivity: Date }>();

  // Enhanced IP blocking
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const { db } = await import('./db');
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('IP check timeout')), 3000);
      });
      
      const checkPromise = db.security.isIPBlocked(ip);
      return await Promise.race([checkPromise, timeoutPromise]);
    } catch (error) {
      console.warn('IP check failed, allowing request to proceed:', error instanceof Error ? error.message : 'Unknown error');
      // Return false to allow request to proceed if IP check fails
      return false;
    }
  }

  async blockIP(ip: string, reason: string, duration: number = 24 * 60 * 60 * 1000) {
    try {
      const { db } = await import('./db');
      await db.security.blockIP(ip, reason, 'system', duration);
      await logSecurityEvent('IP_BLOCKED', 'HIGH', ip, { reason, duration });
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  }

  async unblockIP(ip: string) {
    try {
      const { db } = await import('./db');
      await db.security.unblockIP(ip, 'system');
      await logSecurityEvent('IP_UNBLOCKED', 'MEDIUM', ip, {});
    } catch (error) {
      console.error('Error unblocking IP:', error);
    }
  }

  // Suspicious activity tracking
  markSuspiciousActivity(ip: string) {
    const existing = this.suspiciousIPs.get(ip);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
    } else {
      this.suspiciousIPs.set(ip, { count: 1, lastSeen: new Date() });
    }

    // Auto-block after 5 suspicious activities
    const activity = this.suspiciousIPs.get(ip);
    if (activity && activity.count >= 5) {
      this.blockIP(ip, 'Multiple suspicious activities detected');
    }
  }

  // Advanced request validation
  async validateRequest(
    request: NextRequest,
    config: SecurityConfig = {}
  ): Promise<{
    valid: boolean;
    response?: NextResponse;
    context?: RequestContext;
  }> {
    const {
      requireCaptcha = false,
      requireHoneypot = false,
      requireTiming = false,
      maxBodySize = 1024 * 1024,
      rateLimitType = 'GENERAL_API',
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
      requireAuth = false,
      requireAdmin = false
    } = config;

    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const acceptLanguage = request.headers.get('accept-language') || 'unknown';
    const fingerprint = generateBrowserFingerprint();

    // Check if IP is blocked
    if (await this.isIPBlocked(clientIP)) {
      await logSecurityEvent('BLOCKED_IP_ACCESS', 'HIGH', clientIP, { userAgent });
      return {
        valid: false,
        response: NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      };
    }

    // Check request method
    if (!allowedMethods.includes(request.method)) {
      logSecurityEvent('INVALID_METHOD', 'MEDIUM', clientIP, { 
        method: request.method, 
        allowedMethods 
      });
      return {
        valid: false,
        response: NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
      };
    }

    // Rate limiting
    const rateLimitResult = rateLimiter.isAllowed(
      `${rateLimitType}:${clientIP}`,
      RATE_LIMITS[rateLimitType].maxRequests,
      RATE_LIMITS[rateLimitType].windowMs
    );

    if (!rateLimitResult.allowed) {
      this.markSuspiciousActivity(clientIP);
      logSecurityEvent('RATE_LIMIT_EXCEEDED', 'HIGH', clientIP, { 
        rateLimitType, 
        remaining: rateLimitResult.remaining 
      });
      return {
        valid: false,
        response: createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime)
      };
    }

    // For POST/PUT requests, validate body
    let rawBody = '';
    if (request.method === 'POST' || request.method === 'PUT') {
      rawBody = await request.text();
      
      // Validate body size
      const sizeValidation = validateRequestBodySize(rawBody, maxBodySize);
      if (!sizeValidation.isValid) {
        this.markSuspiciousActivity(clientIP);
        logSecurityEvent('DOS_ATTEMPT', 'CRITICAL', clientIP, { 
          bodySize: new TextEncoder().encode(rawBody).length,
          maxSize: maxBodySize 
        });
        return {
          valid: false,
          response: NextResponse.json(
            { error: sizeValidation.errors[0] },
            { status: 413 }
          )
        };
      }

      // Detect suspicious activity in body
      if (detectSuspiciousActivity(rawBody)) {
        this.markSuspiciousActivity(clientIP);
        logSecurityEvent('SUSPICIOUS_ACTIVITY', 'HIGH', clientIP, { 
          bodyPreview: rawBody.substring(0, 100) 
        });
        return {
          valid: false,
          response: NextResponse.json(
            { error: 'Suspicious activity detected' },
            { status: 400 }
          )
        };
      }

      // Parse and validate JSON
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logSecurityEvent('INVALID_JSON', 'MEDIUM', clientIP, { error: errorMessage });
        return {
          valid: false,
          response: NextResponse.json(
            { error: 'Invalid JSON format' },
            { status: 400 }
          )
        };
      }

      // reCAPTCHA validation is handled by the API routes directly

      // Honeypot validation
      if (requireHoneypot) {
        const honeypotFields = Object.keys(body).filter(key => key.startsWith('hp_'));
        for (const field of honeypotFields) {
          if (body[field] && body[field].trim() !== '') {
            this.markSuspiciousActivity(clientIP);
            logSecurityEvent('HONEYPOT_TRIGGERED', 'HIGH', clientIP, { field });
            return {
              valid: false,
              response: NextResponse.json(
                { error: 'Invalid form submission' },
                { status: 400 }
              )
            };
          }
        }
      }

      // Timing validation
      if (requireTiming) {
        const { formStartTime } = body;
        if (!formStartTime || (Date.now() - formStartTime) < 2000) {
          this.markSuspiciousActivity(clientIP);
          logSecurityEvent('TIMING_ATTACK', 'MEDIUM', clientIP, { 
            formStartTime, 
            elapsed: Date.now() - formStartTime 
          });
          return {
            valid: false,
            response: NextResponse.json(
              { error: 'Form submitted too quickly' },
              { status: 400 }
            )
          };
        }
      }
    }

    // Authentication validation
    if (requireAuth || requireAdmin) {
      const authHeader = request.headers.get('authorization');
      const sessionCookie = request.cookies.get('next-auth.session-token');
      
      if (!authHeader && !sessionCookie) {
        logSecurityEvent('UNAUTHORIZED_ACCESS', 'MEDIUM', clientIP, { 
          requireAuth, 
          requireAdmin 
        });
        return {
          valid: false,
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        };
      }
    }

    const context: RequestContext = {
      clientIP,
      userAgent,
      fingerprint,
      startTime: Date.now(),
      headers: Object.fromEntries(request.headers.entries()),
      rawBody
    };

    return { valid: true, context };
  }

  // Enhanced security headers
  applySecurityHeaders(response: NextResponse): NextResponse {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Get security statistics
  getSecurityStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      activeSessions: this.userSessions.size
    };
  }
}

// Global security manager instance
export const securityManager = new AdvancedSecurityManager();

// Helper function to create protected API handler
export function createProtectedAPI(
  handler: (request: NextRequest, context: RequestContext) => Promise<NextResponse>,
  config: SecurityConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await securityManager.validateRequest(request, config);
    
    if (!validation.valid) {
      return validation.response!;
    }

    try {
      const response = await handler(request, validation.context!);
      return securityManager.applySecurityHeaders(response);
    } catch (error) {
      console.error('API Error:', error);
      logSecurityEvent('API_ERROR', 'HIGH', validation.context!.clientIP, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

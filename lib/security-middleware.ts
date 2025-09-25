import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, RATE_LIMITS, getClientIP, createRateLimitResponse } from './rate-limit';
import { validateRequestBodySize, detectSuspiciousActivity } from './validation';

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Rate limiting middleware
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  rateLimitType: keyof typeof RATE_LIMITS = 'GENERAL_API'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimiter.isAllowed(
      `${rateLimitType}:${clientIP}`,
      RATE_LIMITS[rateLimitType].maxRequests,
      RATE_LIMITS[rateLimitType].windowMs
    );

    if (!rateLimitResult.allowed) {
      const response = createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime);
      return NextResponse.json(
        await response.json(),
        { 
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      );
    }

    const response = await handler(request);
    return applySecurityHeaders(response);
  };
}

// Request validation middleware
export function withRequestValidation(
  handler: (request: NextRequest) => Promise<NextResponse>,
  maxBodySize: number = 1024 * 1024 // 1MB default
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check request method
    if (request.method !== 'GET' && request.method !== 'POST' && request.method !== 'PUT' && request.method !== 'DELETE') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // For POST/PUT requests, validate body
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const body = await request.text();
        
        // Validate body size
        const sizeValidation = validateRequestBodySize(body, maxBodySize);
        if (!sizeValidation.isValid) {
          return NextResponse.json(
            { error: sizeValidation.errors[0] },
            { status: 413 }
          );
        }

        // Detect suspicious activity in body
        if (detectSuspiciousActivity(body)) {
          return NextResponse.json(
            { error: 'Suspicious activity detected' },
            { status: 400 }
          );
        }

        // Parse JSON to validate format
        try {
          JSON.parse(body);
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON format' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to process request body' },
          { status: 400 }
        );
      }
    }

    const response = await handler(request);
    return applySecurityHeaders(response);
  };
}

// Combined security middleware
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimitType?: keyof typeof RATE_LIMITS;
    maxBodySize?: number;
  } = {}
) {
  const { rateLimitType = 'GENERAL_API', maxBodySize = 1024 * 1024 } = options;
  
  return withRateLimit(
    withRequestValidation(handler, maxBodySize),
    rateLimitType
  );
}

// Log security events
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  request: NextRequest
) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.warn('Security Event:', {
    event,
    clientIP,
    userAgent,
    timestamp: new Date().toISOString(),
    details
  });
}

// Block suspicious IPs (basic implementation)
const BLOCKED_IPS = new Set<string>();

export function isIPBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip);
}

export function blockIP(ip: string, reason: string) {
  BLOCKED_IPS.add(ip);
  console.warn(`IP ${ip} blocked: ${reason}`);
}

export function unblockIP(ip: string) {
  BLOCKED_IPS.delete(ip);
  console.log(`IP ${ip} unblocked`);
}

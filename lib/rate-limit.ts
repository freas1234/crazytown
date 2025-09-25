import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.requests.entries())) {
      if (entry.resetTime < now) {
        this.requests.delete(key);
      }
    }
  }

  isAllowed(
    identifier: string, 
    maxRequests: number, 
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || entry.resetTime < now) {
      // New window or expired entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  // Registration: 3 attempts per 15 minutes per IP
  REGISTRATION: { maxRequests: 3, windowMs: 15 * 60 * 1000 },
  // Login: 5 attempts per 15 minutes per IP
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  // Password reset: 3 attempts per hour per IP
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  // General API: 100 requests per 15 minutes per IP
  GENERAL_API: { maxRequests: 100, windowMs: 15 * 60 * 1000 },
  // Admin operations: 50 requests per 15 minutes per IP
  ADMIN: { maxRequests: 50, windowMs: 15 * 60 * 1000 }
} as const;

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// Helper function to create rate limit response
export function createRateLimitResponse(remaining: number, resetTime: number) {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      remaining,
      resetTime
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '0',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  );
}

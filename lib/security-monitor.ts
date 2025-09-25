interface SecurityEvent {
  id: string;
  type: 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'INVALID_INPUT' | 'AUTH_FAILURE' | 'DOS_ATTEMPT' | 'CAPTCHA_FAILED' | 'HONEYPOT_TRIGGERED' | 'TIMING_ATTACK' | 'USER_LOGIN' | 'USER_REGISTERED' | 'LOGIN_ERROR' | 'REGISTRATION_ERROR' | 'IP_BLOCKED' | 'IP_UNBLOCKED' | 'BLOCKED_IP_ACCESS' | 'INVALID_METHOD' | 'INVALID_JSON' | 'API_ERROR' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clientIP: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events
  private alertThresholds = {
    RATE_LIMIT_EXCEEDED: 10, // Alert after 10 rate limit violations
    SUSPICIOUS_ACTIVITY: 5,  // Alert after 5 suspicious activities
    DOS_ATTEMPT: 3,          // Alert after 3 DoS attempts
    AUTH_FAILURE: 20         // Alert after 20 auth failures
  };

  logEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    clientIP: string,
    details: Record<string, any>,
    userAgent?: string
  ) {
    const event: SecurityEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      clientIP,
      userAgent,
      details,
      timestamp: new Date(),
      resolved: false
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Check for alerts
    this.checkAlerts(event);

    // Log to console for development
    console.warn('Security Event:', {
      id: event.id,
      type: event.type,
      severity: event.severity,
      clientIP: event.clientIP,
      timestamp: event.timestamp.toISOString(),
      details: event.details
    });
  }

  private checkAlerts(event: SecurityEvent) {
    const recentEvents = this.getRecentEvents(event.clientIP, 15 * 60 * 1000); // Last 15 minutes
    const eventCounts = this.countEventsByType(recentEvents);

    for (const [eventType, count] of Object.entries(eventCounts)) {
      const threshold = this.alertThresholds[eventType as keyof typeof this.alertThresholds];
      if (threshold && count >= threshold) {
        this.triggerAlert(eventType, event.clientIP, count, recentEvents);
      }
    }
  }

  private getRecentEvents(clientIP: string, timeWindow: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.events.filter(
      event => event.clientIP === clientIP && event.timestamp > cutoff
    );
  }

  private countEventsByType(events: SecurityEvent[]): Record<string, number> {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    return counts;
  }

  private triggerAlert(eventType: string, clientIP: string, count: number, events: SecurityEvent[]) {
    console.error('🚨 SECURITY ALERT:', {
      eventType,
      clientIP,
      count,
      timeWindow: '15 minutes',
      recentEvents: events.map(e => ({
        type: e.type,
        severity: e.severity,
        timestamp: e.timestamp.toISOString()
      }))
    });

    // In production, you would send alerts to monitoring services
    // like Sentry, DataDog, or custom webhooks
  }

  getEvents(clientIP?: string, limit: number = 100): SecurityEvent[] {
    let filteredEvents = this.events;
    
    if (clientIP) {
      filteredEvents = this.events.filter(event => event.clientIP === clientIP);
    }

    return filteredEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      ipCounts[event.clientIP] = (ipCounts[event.clientIP] || 0) + 1;
    });

    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      topIPs
    };
  }

  resolveEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      return true;
    }
    return false;
  }

  clearOldEvents(olderThanHours: number = 24): number {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const initialLength = this.events.length;
    this.events = this.events.filter(event => event.timestamp > cutoff);
    return initialLength - this.events.length;
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Helper functions
export async function logSecurityEvent(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'],
  clientIP: string,
  details: Record<string, any>,
  userAgent?: string
) {
  // Log to in-memory monitor
  securityMonitor.logEvent(type, severity, clientIP, details, userAgent);
  
  // Also log to database with timeout
  try {
    const { db } = await import('./db');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), 2000);
    });
    
    const logPromise = db.security.createEvent({
      type,
      severity,
      ipAddress: clientIP,
      userAgent,
      details
    });
    
    await Promise.race([logPromise, timeoutPromise]);
  } catch (error) {
    // Only log error if it's not a timeout
    if (error instanceof Error && !error.message.includes('timeout')) {
      console.error('Failed to log security event to database:', error);
    }
  }
}

export function getSecurityStats() {
  return securityMonitor.getStats();
}

export function getSecurityEvents(clientIP?: string, limit?: number) {
  return securityMonitor.getEvents(clientIP, limit);
}

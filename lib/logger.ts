/**
 * Comprehensive Logging System with Discord Webhook Integration
 * Manages all logs across the website and sends them to Discord
 */

export type LogLevel = "info" | "warn" | "error" | "debug" | "success";

export type LogCategory =
  | "auth"
  | "api"
  | "database"
  | "jobs"
  | "applications"
  | "store"
  | "payments"
  | "admin"
  | "security"
  | "user"
  | "system"
  | "general";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  error?: Error | string;
  metadata?: Record<string, any>;
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  categories?: LogCategory[];
  levels?: LogLevel[];
}

export interface LoggerConfig {
  webhooks: {
    [key: string]: WebhookConfig;
  };
  enableConsole: boolean;
  enableDiscord: boolean;
  logToDatabase: boolean;
  maxLogAge: number; // days
}

class LoggerManager {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000;

  constructor() {
    this.config = {
      webhooks: {
        general: {
          url:
            process.env.DISCORD_WEBHOOK_URL ||
            "https://discord.com/api/webhooks/1441476448039997500/EOWcMBnd8cRXa-wVhepfuSWkc4FoxbBgdcGVSIq1IIAwxH7OxmcDPAVyCXKqiCyDvtPU",
          enabled: process.env.DISCORD_WEBHOOK_ENABLED === "true",
          categories: ["general", "system"],
          levels: ["error", "warn"],
        },
        auth: {
          url:
            process.env.DISCORD_WEBHOOK_AUTH_URL ||
            "https://discord.com/api/webhooks/1441476541497348196/zLCk5SPNJZ9RaZDBJDbxOwNAo3GsuC5TPtsClw9nX6tGgMWRKdkUg-RsQc56xYZRpFWs",
          enabled: process.env.DISCORD_WEBHOOK_AUTH_ENABLED === "true",
          categories: ["auth", "security"],
          levels: ["error", "warn", "info"],
        },
        jobs: {
          url:
            process.env.DISCORD_WEBHOOK_JOBS_URL ||
            "https://discord.com/api/webhooks/1441476623890124802/-Fy69AxBiIE-yEilKJWNI578_SxtH8bI5lSvvJlCCa8cyM_03qR4oEQNJU-sFvUfnzY7",
          enabled: process.env.DISCORD_WEBHOOK_JOBS_ENABLED === "true",
          categories: ["jobs", "applications"],
          levels: ["error", "warn", "info", "success"],
        },
        store: {
          url:
            process.env.DISCORD_WEBHOOK_STORE_URL ||
            "https://discord.com/api/webhooks/1441476694429929595/n69Yc07NLDMg8rjsAoUwNlp_9iUNWDEFePF08x0vTsEdJyxBphnxMAVHgArJY-wrwNob",
          enabled: process.env.DISCORD_WEBHOOK_STORE_ENABLED === "true",
          categories: ["store", "payments"],
          levels: ["error", "warn", "info", "success"],
        },
        admin: {
          url:
            process.env.DISCORD_WEBHOOK_ADMIN_URL ||
            "https://discord.com/api/webhooks/1441476809215709307/oYgOG9ypLKpS_6mm7NqmHysIFT0cm1It5YNcGez7S-Ye5NKETMssmd8UXdjPbK7Q96CS",
          enabled: process.env.DISCORD_WEBHOOK_ADMIN_ENABLED === "true",
          categories: ["admin", "api"],
          levels: ["error", "warn", "info"],
        },
        database: {
          url:
            process.env.DISCORD_WEBHOOK_DATABASE_URL ||
            "https://discord.com/api/webhooks/1441476935967313982/QMZZ2KTlecaLGmpUnb7obwK9llJ7-ZiWsR8LraQEf94ZK38NdRu7q9MzxLQSsMkmsnns",
          enabled: process.env.DISCORD_WEBHOOK_DATABASE_ENABLED === "true",
          categories: ["database"],
          levels: ["error", "warn"],
        },
      },
      enableConsole: process.env.LOG_CONSOLE_ENABLED !== "false",
      enableDiscord: process.env.LOG_DISCORD_ENABLED !== "false",
      logToDatabase: process.env.LOG_DATABASE_ENABLED === "true",
      maxLogAge: parseInt(process.env.LOG_MAX_AGE_DAYS || "30", 10),
    };
  }

  /**
   * Get color for Discord embed based on log level
   */
  private getDiscordColor(level: LogLevel): number {
    const colors: Record<LogLevel, number> = {
      error: 0xff0000, // Red
      warn: 0xffaa00, // Orange
      info: 0x0099ff, // Blue
      debug: 0x808080, // Gray
      success: 0x00ff00, // Green
    };
    return colors[level] || 0x808080;
  }

  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      error: "❌",
      warn: "⚠️",
      info: "ℹ️",
      debug: "🔍",
      success: "✅",
    };
    return emojis[level] || "📝";
  }

  /**
   * Format log entry for Discord webhook
   */
  private formatDiscordMessage(log: LogEntry): any {
    const timestamp = new Date(log.timestamp).toISOString();
    const emoji = this.getLevelEmoji(log.level);
    const color = this.getDiscordColor(log.level);

    const fields: any[] = [
      {
        name: "Category",
        value: log.category,
        inline: true,
      },
      {
        name: "Level",
        value: log.level.toUpperCase(),
        inline: true,
      },
      {
        name: "Timestamp",
        value: `<t:${Math.floor(log.timestamp.getTime() / 1000)}:F>`,
        inline: true,
      },
    ];

    if (log.userId) {
      fields.push({
        name: "User ID",
        value: log.userId,
        inline: true,
      });
    }

    if (log.ip) {
      fields.push({
        name: "IP Address",
        value: log.ip,
        inline: true,
      });
    }

    if (log.url) {
      fields.push({
        name: "URL",
        value:
          log.url.length > 100 ? log.url.substring(0, 100) + "..." : log.url,
        inline: false,
      });
    }

    if (log.error) {
      const errorMessage =
        log.error instanceof Error ? log.error.message : String(log.error);
      fields.push({
        name: "Error",
        value: `\`\`\`${errorMessage.substring(0, 1000)}\`\`\``,
        inline: false,
      });

      if (log.error instanceof Error && log.error.stack) {
        fields.push({
          name: "Stack Trace",
          value: `\`\`\`${log.error.stack.substring(0, 1000)}\`\`\``,
          inline: false,
        });
      }
    }

    if (log.details && Object.keys(log.details).length > 0) {
      const detailsStr = JSON.stringify(log.details, null, 2);
      fields.push({
        name: "Details",
        value: `\`\`\`json\n${detailsStr.substring(0, 1000)}\n\`\`\``,
        inline: false,
      });
    }

    if (log.metadata && Object.keys(log.metadata).length > 0) {
      const metadataStr = JSON.stringify(log.metadata, null, 2);
      fields.push({
        name: "Metadata",
        value: `\`\`\`json\n${metadataStr.substring(0, 1000)}\n\`\`\``,
        inline: false,
      });
    }

    return {
      embeds: [
        {
          title: `${emoji} ${log.message}`,
          color: color,
          fields: fields,
          timestamp: timestamp,
          footer: {
            text: `CrazyTown Store Logger`,
          },
        },
      ],
    };
  }

  /**
   * Send log to Discord webhook
   */
  private async sendToDiscord(log: LogEntry): Promise<void> {
    if (!this.config.enableDiscord) return;

    try {
      // Find matching webhooks
      const matchingWebhooks = Object.entries(this.config.webhooks).filter(
        ([_, config]) => {
          if (!config.enabled || !config.url) return false;
          if (config.categories && !config.categories.includes(log.category))
            return false;
          if (config.levels && !config.levels.includes(log.level)) return false;
          return true;
        }
      );

      if (matchingWebhooks.length === 0) return;

      const message = this.formatDiscordMessage(log);

      // Send to all matching webhooks
      await Promise.allSettled(
        matchingWebhooks.map(async ([name, config]) => {
          try {
            const response = await fetch(config.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(message),
            });

            if (!response.ok) {
              console.error(
                `Failed to send log to Discord webhook ${name}:`,
                response.status,
                response.statusText
              );
            }
          } catch (error) {
            console.error(
              `Error sending log to Discord webhook ${name}:`,
              error
            );
          }
        })
      );
    } catch (error) {
      console.error("Error in sendToDiscord:", error);
    }
  }

  /**
   * Save log to database (if enabled)
   */
  private async saveToDatabase(log: LogEntry): Promise<void> {
    if (!this.config.logToDatabase) return;

    try {
      // Import here to avoid circular dependencies
      const { connectToDatabase } = await import("./db");
      const { db } = await connectToDatabase();
      const logsCollection = db.collection("logs");

      await logsCollection.insertOne({
        ...log,
        timestamp: log.timestamp,
      });
    } catch (error) {
      console.error("Error saving log to database:", error);
    }
  }

  /**
   * Create a log entry
   */
  private createLog(
    level: LogLevel,
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      error?: Error | string;
      metadata?: Record<string, any>;
    }
  ): LogEntry {
    const log: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      ...options,
    };

    // Add to in-memory logs
    this.logs.push(log);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift(); // Remove oldest log
    }

    return log;
  }

  /**
   * Log an entry
   */
  private async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      error?: Error | string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const logEntry = this.createLog(level, category, message, options);

    // Console logging
    if (this.config.enableConsole) {
      const consoleMethod =
        level === "error"
          ? console.error
          : level === "warn"
          ? console.warn
          : level === "debug"
          ? console.debug
          : console.log;

      consoleMethod(
        `[${logEntry.category.toUpperCase()}] ${logEntry.level.toUpperCase()}: ${
          logEntry.message
        }`,
        options?.details || options?.error || ""
      );
    }

    // Send to Discord (async, don't wait)
    this.sendToDiscord(logEntry).catch((error) => {
      console.error("Failed to send log to Discord:", error);
    });

    // Save to database (async, don't wait)
    this.saveToDatabase(logEntry).catch((error) => {
      console.error("Failed to save log to database:", error);
    });
  }

  // Public logging methods
  async info(
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log("info", category, message, options);
  }

  async warn(
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      error?: Error | string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log("warn", category, message, options);
  }

  async error(
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      error?: Error | string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log("error", category, message, options);
  }

  async debug(
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log("debug", category, message, options);
  }

  async success(
    category: LogCategory,
    message: string,
    options?: {
      details?: any;
      userId?: string;
      ip?: string;
      userAgent?: string;
      url?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log("success", category, message, options);
  }

  /**
   * Get all logs (in-memory)
   */
  getLogs(category?: LogCategory, level?: LogLevel): LogEntry[] {
    let filtered = [...this.logs];

    if (category) {
      filtered = filtered.filter((log) => log.category === category);
    }

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get logs from database
   */
  async getLogsFromDatabase(
    category?: LogCategory,
    level?: LogLevel,
    limit: number = 100
  ): Promise<LogEntry[]> {
    try {
      const { connectToDatabase } = await import("./db");
      const { db } = await connectToDatabase();
      const logsCollection = db.collection("logs");

      const query: any = {};
      if (category) query.category = category;
      if (level) query.level = level;

      const logs = await logsCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch (error) {
      console.error("Error fetching logs from database:", error);
      return [];
    }
  }

  /**
   * Update webhook configuration
   */
  updateWebhook(name: string, config: WebhookConfig): void {
    this.config.webhooks[name] = config;
  }

  /**
   * Get webhook configuration
   */
  getWebhook(name: string): WebhookConfig | undefined {
    return this.config.webhooks[name];
  }

  /**
   * Get all webhook configurations
   */
  getAllWebhooks(): Record<string, WebhookConfig> {
    return { ...this.config.webhooks };
  }

  /**
   * Clear old logs from database
   */
  async clearOldLogs(): Promise<number> {
    try {
      const { connectToDatabase } = await import("./db");
      const { db } = await connectToDatabase();
      const logsCollection = db.collection("logs");

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.maxLogAge);

      const result = await logsCollection.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      return result.deletedCount || 0;
    } catch (error) {
      console.error("Error clearing old logs:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const logger = new LoggerManager();

// Export helper function to get request context
export function getRequestContext(request?: Request): {
  ip?: string;
  userAgent?: string;
  url?: string;
} {
  if (!request) return {};

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;
  const url = request.url || undefined;

  return { ip, userAgent, url };
}

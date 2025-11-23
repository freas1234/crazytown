# Logging System Documentation

## Overview

The logging system provides comprehensive logging across the entire website with Discord webhook integration. All logs are categorized and can be sent to different Discord channels based on their category and severity level.

## Features

- **Multiple Log Categories**: Auth, API, Database, Jobs, Applications, Store, Payments, Admin, Security, User, System, General
- **Log Levels**: Info, Warn, Error, Debug, Success
- **Discord Webhook Integration**: Send logs to Discord channels automatically
- **Database Storage**: Optional storage of logs in MongoDB
- **In-Memory Logs**: Fast access to recent logs
- **Admin Interface**: View and manage logs through the admin panel
- **Webhook Management**: Configure different webhooks for different log types

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# General Logging Settings
LOG_CONSOLE_ENABLED=true
LOG_DISCORD_ENABLED=true
LOG_DATABASE_ENABLED=true
LOG_MAX_AGE_DAYS=30

# Discord Webhook URLs
# General/System logs
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_WEBHOOK_ENABLED=true

# Auth/Security logs
DISCORD_WEBHOOK_AUTH_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_WEBHOOK_AUTH_ENABLED=true

# Jobs/Applications logs
DISCORD_WEBHOOK_JOBS_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_WEBHOOK_JOBS_ENABLED=true

# Store/Payments logs
DISCORD_WEBHOOK_STORE_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_WEBHOOK_STORE_ENABLED=true

# Admin/API logs
DISCORD_WEBHOOK_ADMIN_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_WEBHOOK_ADMIN_ENABLED=true

# Database logs
DISCORD_WEBHOOK_DATABASE_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
DISCORD_WEBHOOK_DATABASE_ENABLED=true
```

### 2. Creating Discord Webhooks

1. Go to your Discord server
2. Navigate to Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Name your webhook (e.g., "General Logs", "Auth Logs", etc.)
5. Select the channel where logs should be sent
6. Copy the webhook URL
7. Paste it into your `.env.local` file

## Usage

### Basic Logging

```typescript
import { logger } from "@/lib/logger";

// Info log
await logger.info("api", "User logged in", {
  userId: "user123",
  details: { method: "email" },
});

// Error log
await logger.error("database", "Failed to connect to MongoDB", {
  error: errorInstance,
  details: { connectionString: "..." },
});

// Success log
await logger.success("jobs", "Job created successfully", {
  userId: "user123",
  details: { jobId: "job456" },
});

// Warning log
await logger.warn("security", "Suspicious activity detected", {
  userId: "user123",
  ip: "192.168.1.1",
  details: { action: "multiple_failed_logins" },
});

// Debug log
await logger.debug("api", "Processing request", {
  details: { endpoint: "/api/users", method: "GET" },
});
```

### In API Routes

```typescript
import { logger, getRequestContext } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Your code here

    await logger.info("api", "Request processed successfully", {
      ...getRequestContext(request),
      details: {
        /* additional data */
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    await logger.error("api", "Request failed", {
      ...getRequestContext(request),
      error: error instanceof Error ? error : String(error),
    });

    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

## Log Categories

- **auth**: Authentication and authorization events
- **api**: API route events
- **database**: Database operations and errors
- **jobs**: Job-related events
- **applications**: Job application events
- **store**: Store and product events
- **payments**: Payment processing events
- **admin**: Admin panel events
- **security**: Security-related events
- **user**: User-related events
- **system**: System-level events
- **general**: General application events

## Log Levels

- **error**: Critical errors that need immediate attention
- **warn**: Warnings that should be monitored
- **info**: Informational messages
- **success**: Successful operations
- **debug**: Debug information (usually disabled in production)

## Webhook Configuration

Each webhook can be configured to receive logs based on:

- **Categories**: Which log categories to receive
- **Levels**: Which log levels to receive
- **Enabled/Disabled**: Toggle webhook on/off

### Default Webhook Configuration

- **general**: Receives `error` and `warn` from `general` and `system` categories
- **auth**: Receives `error`, `warn`, and `info` from `auth` and `security` categories
- **jobs**: Receives `error`, `warn`, `info`, and `success` from `jobs` and `applications` categories
- **store**: Receives `error`, `warn`, `info`, and `success` from `store` and `payments` categories
- **admin**: Receives `error`, `warn`, and `info` from `admin` and `api` categories
- **database**: Receives `error` and `warn` from `database` category

## Admin Interface

Access the logs management interface at `/admin/logs`:

- **View Logs**: Filter by category, level, and source (database/memory)
- **Clear Old Logs**: Remove logs older than the configured max age
- **Webhook Management**: View webhook configurations

## API Endpoints

### Get Logs

```
GET /api/admin/logs?category=auth&level=error&source=database&limit=100
```

### Clear Old Logs

```
DELETE /api/admin/logs
```

### Get Webhook Configuration

```
GET /api/admin/logs/webhooks
```

### Update Webhook Configuration

```
PUT /api/admin/logs/webhooks
Body: { name: "general", config: { ... } }
```

## Best Practices

1. **Use appropriate log levels**: Don't log everything as `error`
2. **Include context**: Always include relevant details in the `details` field
3. **Don't log sensitive data**: Never log passwords, tokens, or personal information
4. **Use categories correctly**: Choose the right category for each log
5. **Monitor Discord channels**: Set up notifications for important channels
6. **Regular cleanup**: Clear old logs periodically to save database space

## Integration Examples

The logger is already integrated into:

- Job creation and fetching
- Application submission and management
- API error handling

You can integrate it into other parts of your application by importing `logger` and using the appropriate methods.

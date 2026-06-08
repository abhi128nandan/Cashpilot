/**
 * Lightweight structured logger for CashPilot.
 *
 * Design decisions:
 *  - JSON-structured output for production log aggregation (ELK, Datadog, etc.)
 *  - Human-readable in development for DX
 *  - Severity levels: debug, info, warn, error
 *  - Never logs sensitive data (passwords, tokens, full user objects)
 *  - Includes timestamp + context for correlation
 *
 * Usage:
 *   import { logger } from '@/lib/utils/logger';
 *   logger.error('db.getTransactions', 'Query failed', { userId: 'xxx', code: err.code });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  functionName: string;
  message: string;
  timestamp: string;
  requestId: string;
  userId: string;
  data?: Record<string, unknown>;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  totalRetries: 0,
  totalFallbacks: 0,
};

export const performanceMetrics = {
  dbQueries: 0,
  totalDbLatencyMs: 0,
  slowQueries: 0,
};

/**
 * Sanitize data to prevent leaking secrets into logs.
 * Strips known-sensitive keys and truncates large values.
 */
function sanitize(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;

  const REDACTED_KEYS = new Set([
    'password', 'token', 'secret', 'authorization',
    'cookie', 'session', 'creditcard', 'ssn', 'apikey',
    'cvv', 'card_number', 'account_number', 'pin', 'routing_number'
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatEntry(entry: LogEntry): string {
  if (IS_PRODUCTION) {
    // Structured JSON for log aggregators
    return JSON.stringify(entry);
  }
  // Human-readable for dev
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `[${entry.level.toUpperCase()}] [${entry.functionName}] [req:${entry.requestId}] [user:${entry.userId}] ${entry.message}${dataStr}`;
}

function log(level: LogLevel, scope: string, message: string, data?: Record<string, unknown>) {
  // Suppress debug logs in production
  if (level === 'debug' && IS_PRODUCTION) return;

  const dataCopy = data ? { ...data } : {};
  const requestId = (dataCopy.requestId as string) || 'unknown';
  const userId = (dataCopy.userId as string) || 'unknown';

  delete dataCopy.requestId;
  delete dataCopy.userId;

  // Track metrics
  if (level === 'error') metrics.totalErrors++;
  if (message === 'Fallback triggered' || message === 'Empty result, fallback used') {
    metrics.totalFallbacks++;
  }
  if (message.includes('Query failed (attempt')) {
    metrics.totalRetries++;
  }
  if (scope === 'middleware' && message === 'Request start') {
    metrics.totalRequests++;
  }

  const entry: LogEntry = {
    level,
    functionName: scope,
    message,
    timestamp: new Date().toISOString(),
    requestId,
    userId,
    data: Object.keys(dataCopy).length > 0 ? sanitize(dataCopy) : undefined,
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (scope: string, message: string, data?: Record<string, unknown>) =>
    log('debug', scope, message, data),

  info: (scope: string, message: string, data?: Record<string, unknown>) =>
    log('info', scope, message, data),

  warn: (scope: string, message: string, data?: Record<string, unknown>) =>
    log('warn', scope, message, data),

  error: (scope: string, message: string, data?: Record<string, unknown>) =>
    log('error', scope, message, data),
};

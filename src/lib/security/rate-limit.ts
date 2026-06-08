import { logger } from '@/lib/utils/logger';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitTracker>();
const userMap = new Map<string, RateLimitTracker>();

const IP_LIMIT = 50; // per minute
const USER_LIMIT = 100; // per minute
const WINDOW_MS = 60 * 1000; // 1 minute

function checkLimit(map: Map<string, RateLimitTracker>, key: string, limit: number): boolean {
  const now = Date.now();
  const record = map.get(key);

  if (!record || now > record.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export function checkRateLimit(ip: string, userId?: string): { allowed: boolean; reason?: string } {
  // 1. Check IP limit
  if (!checkLimit(ipMap, ip, IP_LIMIT)) {
    logger.warn('security.rateLimit', 'IP rate limit exceeded', { ip });
    return { allowed: false, reason: 'Too many requests from this IP' };
  }

  // 2. Check User limit (if authenticated)
  if (userId) {
    if (!checkLimit(userMap, userId, USER_LIMIT)) {
      logger.warn('security.rateLimit', 'User rate limit exceeded', { userId, ip });
      return { allowed: false, reason: 'Too many requests from this user' };
    }
  }

  return { allowed: true };
}

// Clean up maps periodically to prevent memory leaks in long-running processes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipMap.entries()) {
    if (now > record.resetAt) ipMap.delete(key);
  }
  for (const [key, record] of userMap.entries()) {
    if (now > record.resetAt) userMap.delete(key);
  }
}, WINDOW_MS);

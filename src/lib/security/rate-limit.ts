import { logger } from '@/lib/utils/logger';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const inMemoryCache = new Map<string, RateLimitTracker>();

// Fallback logic for graceful degradation if Upstash is not configured or fails
const fallbackRateLimit = (key: string, limit: number) => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  let record = inMemoryCache.get(key);
  
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count += 1;
  inMemoryCache.set(key, record);
  return true;
};

// Initialize Upstash Redis only if env variables are present
const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const ipRatelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
  analytics: true,
}) : null;

const userRatelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
}) : null;

export async function checkRateLimit(ip: string, userId?: string): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Check IP limit
  if (ipRatelimit) {
    try {
      const { success } = await ipRatelimit.limit(`ip:${ip}`);
      if (!success) {
        logger.warn('security.rateLimit', 'IP rate limit exceeded', { ip });
        return { allowed: false, reason: 'Too many requests from this IP' };
      }
    } catch (error) {
      logger.error('security.rateLimit', 'Upstash Redis IP limit failed, falling back', { error });
      if (!fallbackRateLimit(`ip:${ip}`, 50)) {
        return { allowed: false, reason: 'Too many requests from this IP' };
      }
    }
  } else {
    if (!fallbackRateLimit(`ip:${ip}`, 50)) {
      return { allowed: false, reason: 'Too many requests from this IP' };
    }
  }

  // 2. Check User limit
  if (userId) {
    if (userRatelimit) {
      try {
        const { success } = await userRatelimit.limit(`user:${userId}`);
        if (!success) {
          logger.warn('security.rateLimit', 'User rate limit exceeded', { userId, ip });
          return { allowed: false, reason: 'Too many requests from this user' };
        }
      } catch (error) {
        logger.error('security.rateLimit', 'Upstash Redis user limit failed, falling back', { error });
        if (!fallbackRateLimit(`user:${userId}`, 100)) {
          return { allowed: false, reason: 'Too many requests from this user' };
        }
      }
    } else {
      if (!fallbackRateLimit(`user:${userId}`, 100)) {
        return { allowed: false, reason: 'Too many requests from this user' };
      }
    }
  }

  return { allowed: true };
}

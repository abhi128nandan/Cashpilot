import type { AIContextData } from '@/services/ai-context.service';
import { logger } from '@/lib/utils/logger';

interface CacheEntry {
  context: AIContextData;
  expiry: number;
}

// Global in-memory map for the AI session context.
// In a serverless environment (like Vercel), this exists per lambda instance.
// For short-lived multi-turn chats, the hit rate is very high as the lambda stays warm.
const aiSessionCache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class AIContextCache {
  /**
   * Retrieves the cached AI Context for a user if it exists and hasn't expired.
   */
  static get(userId: string): AIContextData | null {
    const key = `ai_context:${userId}`;
    const entry = aiSessionCache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      aiSessionCache.delete(key);
      logger.info('ai', 'AI Context Cache expired', { userId });
      return null;
    }

    logger.info('ai', 'AI Context Cache HIT', { userId });
    return entry.context;
  }

  /**
   * Saves the AI Context for a user.
   */
  static set(userId: string, context: AIContextData): void {
    const key = `ai_context:${userId}`;
    aiSessionCache.set(key, {
      context,
      expiry: Date.now() + CACHE_TTL_MS,
    });
    logger.info('ai', 'AI Context Cache SET', { userId });
  }

  /**
   * Invalidates the user's AI context immediately.
   * Call this whenever a financial mutation occurs (new transaction, etc).
   */
  static invalidate(userId: string): void {
    const key = `ai_context:${userId}`;
    if (aiSessionCache.has(key)) {
      aiSessionCache.delete(key);
      logger.info('ai', 'AI Context Cache INVALIDATED', { userId });
    }
  }

  /**
   * Flushes the entire cache (useful for testing).
   */
  static clearAll(): void {
    aiSessionCache.clear();
  }
}

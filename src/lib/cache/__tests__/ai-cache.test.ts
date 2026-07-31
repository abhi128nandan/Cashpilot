import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AIContextCache } from '../ai-cache';
import type { AIContextData } from '@/services/ai-context.service';

const mockContext1: AIContextData = {
  user: { id: 'user-1', email: 'test1@example.com' },
  analytics: { totalIncome: 1000, totalExpenses: 500, netBalance: 500, savingsRate: 50, topCategories: [], recentAnomalies: [] },
  budgets: [],
  recurring: []
};

const mockContext2: AIContextData = {
  user: { id: 'user-2', email: 'test2@example.com' },
  analytics: { totalIncome: 2000, totalExpenses: 1000, netBalance: 1000, savingsRate: 50, topCategories: [], recentAnomalies: [] },
  budgets: [],
  recurring: []
};

describe('AIContextCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    AIContextCache.clearAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null for a cache miss', () => {
    expect(AIContextCache.get('user-1')).toBeNull();
  });

  it('should store and retrieve context for a specific user', () => {
    AIContextCache.set('user-1', mockContext1);
    
    const retrieved = AIContextCache.get('user-1');
    expect(retrieved).toEqual(mockContext1);
  });

  it('should isolate cache entries between different users', () => {
    AIContextCache.set('user-1', mockContext1);
    AIContextCache.set('user-2', mockContext2);
    
    expect(AIContextCache.get('user-1')?.user.id).toBe('user-1');
    expect(AIContextCache.get('user-2')?.user.id).toBe('user-2');
  });

  it('should invalidate cache when TTL expires', () => {
    AIContextCache.set('user-1', mockContext1);
    
    // Fast forward 6 minutes (TTL is 5 minutes)
    vi.advanceTimersByTime(6 * 60 * 1000);
    
    expect(AIContextCache.get('user-1')).toBeNull();
  });

  it('should manually invalidate context', () => {
    AIContextCache.set('user-1', mockContext1);
    expect(AIContextCache.get('user-1')).not.toBeNull();
    
    AIContextCache.invalidate('user-1');
    
    expect(AIContextCache.get('user-1')).toBeNull();
  });
});

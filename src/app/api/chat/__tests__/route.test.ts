/**
 * @vitest-environment node
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../route';
import * as aiContextService from '@/services/ai-context.service';
import * as guard from '@/lib/auth/guard';
import { AIContextCache } from '@/lib/cache/ai-cache';

vi.mock('@/services/ai-context.service', () => ({
  gatherAIContext: vi.fn(),
}));

vi.mock('@/lib/auth/guard', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/cache/ai-cache', () => ({
  AIContextCache: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  }
}));

vi.mock('@ai-sdk/groq', () => ({
  groq: vi.fn().mockReturnValue('mock-model'),
}));

vi.mock('ai', () => ({
  streamText: vi.fn().mockReturnValue({
    toTextStreamResponse: vi.fn().mockReturnValue(new Response('stream-mock')),
  }),
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if auth fails', async () => {
    vi.mocked(guard.requireAuth).mockRejectedValue(new Error('Unauthorized'));
    
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] })
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should hit cache and bypass gatherAIContext if cache exists', async () => {
    vi.mocked(guard.requireAuth).mockResolvedValue({ id: '1', email: 'e' } as any);
    
    vi.mocked(AIContextCache.get).mockReturnValue({
      user: { id: '1', email: 'e' },
      analytics: { topCategories: [], recentAnomalies: [] },
      budgets: [],
      recurring: []
    } as any);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(aiContextService.gatherAIContext).not.toHaveBeenCalled();
    const text = await response.text();
    expect(text).toBe('stream-mock');
  });

  it('should miss cache, gather context, and set cache', async () => {
    vi.mocked(guard.requireAuth).mockResolvedValue({ id: '1', email: 'e' } as any);
    vi.mocked(AIContextCache.get).mockReturnValue(null);
    
    vi.mocked(aiContextService.gatherAIContext).mockResolvedValue({
      user: { id: '1', email: 'e' },
      analytics: { topCategories: [], recentAnomalies: [] },
      budgets: [],
      recurring: []
    } as any);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(aiContextService.gatherAIContext).toHaveBeenCalled();
    expect(AIContextCache.set).toHaveBeenCalledWith('1', expect.anything());
  });

  it('should return 200 with graceful fallback if AI provider throws', async () => {
    vi.mocked(guard.requireAuth).mockResolvedValue({ id: '1', email: 'e' } as any);
    vi.mocked(AIContextCache.get).mockReturnValue(null);
    vi.mocked(aiContextService.gatherAIContext).mockResolvedValue({
      user: { id: '1', email: 'e' },
      analytics: { topCategories: [], recentAnomalies: [] },
      budgets: [],
      recurring: []
    } as any);

    // Mock streamText to throw (e.g. rate limit error)
    const { streamText } = await import('ai');
    vi.mocked(streamText).mockImplementationOnce(() => {
      throw new Error('Groq Rate Limit');
    });
    
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('trouble connecting to the AI provider');
  });
});

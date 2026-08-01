import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { NextResponse } from 'next/server';
import { gatherAIContext } from '@/services/ai-context.service';
import { PromptBuilder } from '@/lib/ai/prompt-builder';
import { logger } from '@/lib/utils/logger';

import { requireAuth } from '@/lib/auth/guard';
import { AIContextCache } from '@/lib/cache/ai-cache';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // 1. Authenticate user before any cache access
    let user;
    try {
      user = await requireAuth();
    } catch {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch AI context (Cache Hit vs Miss)
    let aiContext;
    try {
      aiContext = AIContextCache.get(user.id);
      
      if (!aiContext) {
        // Cache Miss: Rebuild the expensive context
        aiContext = await gatherAIContext();
        
        // Save to cache for subsequent messages
        AIContextCache.set(user.id, aiContext);
      }
    } catch (e: unknown) {
      throw e; // Rethrow to general handler if it's a DB issue
    }

    // 3. Build deterministic prompt
    const systemPrompt = PromptBuilder.buildChatSystemPrompt(aiContext);

    try {
      const result = streamText({
        model: groq('llama-3.1-8b-instant'),
        messages,
        system: systemPrompt,
      });

      return result.toTextStreamResponse();
    } catch (aiError) {
      logger.error('ai', 'Groq API Generation Error', { 
        userId: aiContext.user.id, 
        error: aiError instanceof Error ? aiError.message : String(aiError) 
      });
      // Return a graceful fallback that won't crash the client-side parser
      return new NextResponse('I am having trouble connecting to the AI provider right now. Please try again later.', { 
        status: 200, 
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

  } catch (error: unknown) {
    logger.error('ai', 'AI Chat Route Error', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

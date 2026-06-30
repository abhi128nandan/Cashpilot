'use server';

import { requireAuth } from '@/lib/auth/guard';
import { aiService } from '@/services/ai.service';

export async function sendMessageToAI(message: string) {
  await requireAuth();
  
  try {
    return await aiService.generateInsights(message);
  } catch (error: any) {
    if (error?.message?.includes('No AI provider configured')) {
      return "⚠️ No AI Provider Configured. Please configure GROQ_API_KEY in your .env.local file. See FREE_AI_SETUP.md for instructions.";
    }
    console.error("AI Generation Error:", error);
    return "I'm having trouble analyzing your live data right now. Please try again later.";
  }
}

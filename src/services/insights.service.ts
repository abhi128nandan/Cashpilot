'use server';

import { requireAuth } from '@/lib/auth/guard';
import { fetchDashboardAnalytics } from './analytics.service';
import { buildFinancialContext } from '@/lib/ai/financial-context';
import { generateText } from 'ai';
import { getAIProvider } from '@/lib/ai/provider';

export async function sendMessageToAI(message: string) {
  await requireAuth();
  
  try {
    const context = await fetchDashboardAnalytics();
    const systemPrompt = buildFinancialContext(context);
    
    const aiProvider = getAIProvider();
    
    if (!aiProvider) {
      return "⚠️ No AI Provider Configured. Please configure GROQ_API_KEY in your .env.local file. See FREE_AI_SETUP.md for instructions.";
    }

    const { text } = await generateText({
      model: aiProvider.model as any,
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "I'm having trouble analyzing your live data right now. Please try again later.";
  }
}

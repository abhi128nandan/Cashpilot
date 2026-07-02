'use server';

import { requireAuth } from '@/lib/auth/guard';
import { fetchDashboardAnalytics } from './analytics.service';
import { buildFinancialContext } from '@/lib/ai/financial-context';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function sendMessageToAI(message: string) {
  await requireAuth();
  
  try {
    const context = await fetchDashboardAnalytics();
    const systemPrompt = buildFinancialContext(context);
    
    if (!process.env.OPENAI_API_KEY) {
      return "⚠️ No AI Provider Configured. Please configure OPENAI_API_KEY in your .env.local file.";
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
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

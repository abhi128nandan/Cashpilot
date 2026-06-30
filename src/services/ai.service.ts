import { streamText, generateText } from 'ai';
import { getAIProvider } from '@/lib/ai/provider';
import { buildFinancialContext } from '@/lib/ai/financial-context';
import { fetchDashboardAnalytics } from './analytics.service';

/**
 * Single production AI pipeline using Groq.
 */
export const aiService = {
  /**
   * Generates a streaming response for the chat interface.
   * Uses transaction history as context.
   */
  async generateChatStream(messages: any[], transactionContextData: string) {
    const aiProvider = getAIProvider();

    if (!aiProvider) {
      throw new Error('No AI provider configured. Please set GROQ_API_KEY.');
    }

    return streamText({
      model: aiProvider.model as any,
      messages,
      system: `You are CashPilot AI, a financial assistant. You help users understand their spending, track budgets, and find anomalies.
Here is the user's recent transaction data (last 30 transactions):
${transactionContextData}

Answer questions specifically based on this data when relevant. Keep answers concise, helpful, and friendly.`,
    });
  },

  /**
   * Generates a single text response (non-streaming) for dashboard insights.
   */
  async generateInsights(message: string) {
    const aiProvider = getAIProvider();
    
    if (!aiProvider) {
      throw new Error('No AI provider configured. Please set GROQ_API_KEY.');
    }

    const context = await fetchDashboardAnalytics();
    const systemPrompt = buildFinancialContext(context);

    const { text } = await generateText({
      model: aiProvider.model as any,
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
    });

    return text;
  }
};

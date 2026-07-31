import { AIContextFormatter } from './ai-formatter';
import type { AIContextData } from '@/services/ai-context.service';

export class PromptBuilder {
  static buildChatSystemPrompt(context: AIContextData): string {
    const formattedSummary = AIContextFormatter.formatFinancialSummary(context.analytics);
    const formattedBudgets = AIContextFormatter.formatBudgets(context.budgets);
    const formattedRecurring = AIContextFormatter.formatRecurringLiabilities(context.recurring);
    const formattedAnomalies = AIContextFormatter.formatAnomalies(context.analytics.recentAnomalies);

    return `
You are CashPilot AI, an expert financial assistant.
Analyze the following LIVE user data and answer their question clearly, professionally, and concisely.

${formattedSummary}
${formattedBudgets}
${formattedRecurring}
${formattedAnomalies}

Guidelines:
1. Always base your advice on the numerical data provided above.
2. If the user asks about a specific category (e.g. "Food & Dining"), look for it in the categories list and use the exact live amount.
3. If they ask if they are saving enough, reference the Savings Rate. Generally >20% is excellent.
4. If a budget is 'OVER BUDGET' or 'AT RISK', proactively suggest holding back on that category.
5. Keep responses brief but highly actionable. Do not use overly verbose financial jargon unless asked.
6. Do NOT hallucinate data. If a category, budget, or number is not present, state that there is no data for it.
7. Address the user directly and friendly (e.g., "You spent...", "Your budget for...").
`.trim();
  }
}

import type { DashboardStats, SpendingByCategory, MonthlyTrend, Transaction, Anomaly } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';

export interface AnalyticsContext {
  stats: DashboardStats;
  spendingByCategory: SpendingByCategory[];
  monthlyTrends: MonthlyTrend[];
  recentTransactions: Transaction[];
  anomalies: Anomaly[];
}

export function buildFinancialContext(context: AnalyticsContext): string {
  const { stats, spendingByCategory, monthlyTrends, anomalies } = context;

  // Handle Edge Cases for NaNs
  const safeSavingsRate = isNaN(stats.savingsRate) ? 0 : stats.savingsRate;
  
  const categorySummary = spendingByCategory
    .slice(0, 5)
    .map(c => `- ${c.categoryName}: ${formatCurrency(c.totalAmount)} (${isNaN(c.percentage) ? 0 : c.percentage}%)`)
    .join('\n');

  const trendSummary = monthlyTrends
    .slice(-3) // Last 3 months
    .map(t => `- ${t.month}: Income: ${formatCurrency(t.income)}, Expenses: ${formatCurrency(t.expenses)}`)
    .join('\n');

  const anomalySummary = anomalies.length > 0
    ? anomalies.slice(0, 3).map(a => `- [${a.severity}] ${a.description}`).join('\n')
    : '- No anomalies detected.';

  return `
You are CashPilot AI, a smart financial assistant.

Analyze:
- income
- expenses
- budgets
- spending patterns
- savings trends
- financial habits

Give:
- concise answers
- realistic suggestions
- budgeting advice
- category insights
- anomaly alerts

Always use Indian Rupee formatting.
Be accurate and data-driven.

[LIVE FINANCIAL STATE]
Total Income: ${formatCurrency(stats.totalIncome || 0)}
Total Expenses: ${formatCurrency(stats.totalExpenses || 0)}
Net Balance: ${formatCurrency(stats.netBalance || 0)}
Savings Rate: ${safeSavingsRate}%

[TOP 5 SPENDING CATEGORIES]
${categorySummary || '- No expense categories recorded yet.'}

[RECENT TRENDS (Last 3 Months)]
${trendSummary || '- No historical trends available.'}

[ANOMALIES & ALERTS]
${anomalySummary}
`.trim();
}

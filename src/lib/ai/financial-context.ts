import type { DashboardStats, SpendingByCategory, MonthlyTrend, Transaction, Anomaly } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface AnalyticsContext {
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
You are CashPilot AI, an expert financial assistant.
Analyze the following LIVE user data and answer their question clearly, professionally, and concisely.

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

Guidelines:
1. Always base your advice on the numerical data provided above.
2. If the user asks about a specific category (e.g. "Food & Dining"), look for it in the categories list and use the exact live amount.
3. If they ask if they are saving enough, reference the Savings Rate. Generally >20% is excellent.
4. Keep responses brief but highly actionable.
5. Do NOT hallucinate data. If a category or number is not present, state that there is no data for it.
`.trim();
}

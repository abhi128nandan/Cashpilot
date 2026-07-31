import { formatCurrency } from '@/lib/utils/formatters';
import type { 
  AIAnalyticsContext, 
  AIBudgetContext, 
  AIRecurringContext 
} from '@/services/ai-context.service';

export class AIContextFormatter {
  static formatFinancialSummary(analytics: AIAnalyticsContext): string {
    const savingsRate = isNaN(analytics.savingsRate) ? 0 : analytics.savingsRate;
    
    let summary = `[LIVE FINANCIAL STATE]
Total Income: ${formatCurrency(analytics.totalIncome)}
Total Expenses: ${formatCurrency(analytics.totalExpenses)}
Net Balance: ${formatCurrency(analytics.netBalance)}
Savings Rate: ${savingsRate}%

[TOP SPENDING CATEGORIES]
`;

    if (analytics.topCategories.length === 0) {
      summary += '- No expense categories recorded yet.\n';
    } else {
      summary += analytics.topCategories
        .map(c => `- ${c.name}: ${formatCurrency(c.amount)} (${isNaN(c.percentage) ? 0 : c.percentage}%)`)
        .join('\n') + '\n';
    }

    return summary;
  }

  static formatBudgets(budgets: AIBudgetContext[]): string {
    let summary = `[ACTIVE BUDGETS]\n`;
    
    if (budgets.length === 0) {
      return summary + '- No active budgets.\n';
    }

    summary += budgets
      .map(b => {
        const percentage = isNaN(b.percentageUsed) ? 0 : b.percentageUsed;
        const status = percentage >= 100 ? 'OVER BUDGET' : (percentage >= 80 ? 'AT RISK' : 'ON TRACK');
        return `- ${b.categoryName}: Spent ${formatCurrency(b.spentAmount)} of ${formatCurrency(b.limitAmount)} (${percentage.toFixed(1)}%) - [${status}]`;
      })
      .join('\n') + '\n';

    return summary;
  }

  static formatRecurringLiabilities(recurring: AIRecurringContext[]): string {
    let summary = `[UPCOMING RECURRING TRANSACTIONS]\n`;
    
    if (recurring.length === 0) {
      return summary + '- No active recurring transactions.\n';
    }

    summary += recurring
      .map(r => {
        const dateString = new Date(r.nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `- ${r.merchant}: ${formatCurrency(r.amount)} (${r.frequency}, next on ${dateString})`;
      })
      .join('\n') + '\n';

    return summary;
  }

  static formatAnomalies(anomalies: AIAnalyticsContext['recentAnomalies']): string {
    let summary = `[ANOMALIES & ALERTS]\n`;
    
    if (anomalies.length === 0) {
      return summary + '- No anomalies detected.\n';
    }

    summary += anomalies
      .map(a => `- [${a.severity}] ${a.description}`)
      .join('\n') + '\n';

    return summary;
  }
}

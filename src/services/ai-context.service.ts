'use server';

import { requireAuth } from '@/lib/auth/guard';
import { fetchDashboardAnalytics } from './analytics.service';
import { fetchBudgets } from './budget.service';
import { getRecurringTransactions } from './recurring.service';

export interface AIBudgetContext {
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface AIRecurringContext {
  merchant: string;
  amount: number;
  frequency: string;
  nextDate: string;
}

export interface AIAnalyticsContext {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  recentAnomalies: Array<{ description: string; severity: string }>;
}

export interface AIContextData {
  user: {
    id: string;
    email: string;
  };
  analytics: AIAnalyticsContext;
  budgets: AIBudgetContext[];
  recurring: AIRecurringContext[];
}

export async function gatherAIContext(): Promise<AIContextData> {
  const user = await requireAuth();

  const [analytics, rawBudgets, rawRecurring] = await Promise.all([
    fetchDashboardAnalytics(),
    fetchBudgets(),
    getRecurringTransactions(user.id)
  ]);

  // Transform Budgets
  const aiBudgets: AIBudgetContext[] = rawBudgets.map((budget) => {
    // Find matching category spending from analytics
    const matchingCategory = analytics.spendingByCategory.find(
      (c) => c.categoryName === budget.category?.name
    );
    const spentAmount = matchingCategory ? matchingCategory.totalAmount : 0;
    const remainingAmount = budget.limitAmount - spentAmount;
    let percentageUsed = 0;
    if (budget.limitAmount > 0) {
      percentageUsed = (spentAmount / budget.limitAmount) * 100;
    }

    return {
      categoryName: budget.category?.name || 'Unknown',
      limitAmount: budget.limitAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      period: budget.period,
    };
  });

  // Transform Recurring Transactions
  // We only want active ones, formatted safely
  const aiRecurring: AIRecurringContext[] = rawRecurring
    .filter(r => r.status === 'active')
    .map(r => ({
      merchant: r.merchant || 'Unknown Merchant',
      amount: r.amount,
      frequency: r.frequency,
      nextDate: r.nextDate,
    }));

  // Transform Analytics
  const aiAnalytics: AIAnalyticsContext = {
    totalIncome: analytics.stats.totalIncome || 0,
    totalExpenses: analytics.stats.totalExpenses || 0,
    netBalance: analytics.stats.netBalance || 0,
    savingsRate: isNaN(analytics.stats.savingsRate) ? 0 : analytics.stats.savingsRate,
    topCategories: analytics.spendingByCategory
      .slice(0, 5)
      .map(c => ({
        name: c.categoryName,
        amount: c.totalAmount,
        percentage: isNaN(c.percentage) ? 0 : c.percentage
      })),
    recentAnomalies: analytics.anomalies.slice(0, 3).map(a => ({
      description: a.description,
      severity: a.severity
    }))
  };

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    analytics: aiAnalytics,
    budgets: aiBudgets,
    recurring: aiRecurring
  };
}

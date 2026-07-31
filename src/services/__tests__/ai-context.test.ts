import { vi, describe, it, expect, beforeEach } from 'vitest';
import { gatherAIContext } from '../ai-context.service';
import * as analyticsService from '../analytics.service';
import * as budgetService from '../budget.service';
import * as recurringService from '../recurring.service';
import * as guard from '@/lib/auth/guard';

vi.mock('@/lib/auth/guard', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('../analytics.service', () => ({
  fetchDashboardAnalytics: vi.fn(),
}));

vi.mock('../budget.service', () => ({
  fetchBudgets: vi.fn(),
}));

vi.mock('../recurring.service', () => ({
  getRecurringTransactions: vi.fn(),
}));

describe('AI Context Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  it('should aggregate data successfully and format budgets percentages', async () => {
    vi.mocked(guard.requireAuth).mockResolvedValue(mockUser as any);
    
    vi.mocked(analyticsService.fetchDashboardAnalytics).mockResolvedValue({
      stats: { totalIncome: 1000, totalExpenses: 500, netBalance: 500, savingsRate: 50 },
      spendingByCategory: [{ categoryName: 'Food', totalAmount: 500, percentage: 100 }],
      monthlyTrends: [],
      recentTransactions: [],
      anomalies: []
    } as any);

    vi.mocked(budgetService.fetchBudgets).mockResolvedValue([
      { limitAmount: 400, category: { name: 'Food' }, period: 'monthly' }
    ] as any);

    vi.mocked(recurringService.getRecurringTransactions).mockResolvedValue([
      { merchant: 'Netflix', amount: 15, frequency: 'monthly', nextDate: '2024-04-01', status: 'active' },
      { merchant: 'Gym', amount: 50, frequency: 'monthly', nextDate: '2024-04-05', status: 'paused' }
    ] as any);

    const result = await gatherAIContext();

    expect(result.user.id).toBe('user-123');
    
    // Budgets formatting validation
    expect(result.budgets.length).toBe(1);
    expect(result.budgets[0].categoryName).toBe('Food');
    expect(result.budgets[0].spentAmount).toBe(500);
    expect(result.budgets[0].percentageUsed).toBe(125); // 500 / 400 * 100
    
    // Recurring formatting validation (paused should be filtered)
    expect(result.recurring.length).toBe(1);
    expect(result.recurring[0].merchant).toBe('Netflix');
    
    // Analytics formatting validation
    expect(result.analytics.totalIncome).toBe(1000);
  });
});

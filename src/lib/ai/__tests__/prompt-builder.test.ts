import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../prompt-builder';
import type { AIContextData } from '@/services/ai-context.service';

const mockContext: AIContextData = {
  user: { id: 'user-1', email: 'test@example.com' },
  analytics: {
    totalIncome: 5000,
    totalExpenses: 2000,
    netBalance: 3000,
    savingsRate: 40,
    topCategories: [
      { name: 'Food', amount: 500, percentage: 25 },
      { name: 'Transport', amount: 200, percentage: 10 }
    ],
    recentAnomalies: [
      { description: 'Unusually high dining expense', severity: 'medium' }
    ]
  },
  budgets: [
    {
      categoryName: 'Food',
      limitAmount: 400,
      spentAmount: 500,
      remainingAmount: -100,
      percentageUsed: 125,
      period: 'monthly'
    }
  ],
  recurring: [
    {
      merchant: 'Netflix',
      amount: 15,
      frequency: 'monthly',
      nextDate: '2024-04-01'
    }
  ]
};

const emptyContext: AIContextData = {
  user: { id: 'user-1', email: 'test@example.com' },
  analytics: {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsRate: 0,
    topCategories: [],
    recentAnomalies: []
  },
  budgets: [],
  recurring: []
};

describe('PromptBuilder', () => {
  it('should format a fully populated context correctly', () => {
    const prompt = PromptBuilder.buildChatSystemPrompt(mockContext);
    
    // Check analytics
    expect(prompt).toContain('Total Income:');
    expect(prompt).toContain('5,000.00');
    expect(prompt).toContain('Savings Rate: 40%');
    expect(prompt).toContain('- Food:');
    expect(prompt).toContain('500.00 (25%)');
    
    // Check anomalies
    expect(prompt).toContain('- [medium] Unusually high dining expense');
    
    // Check budgets
    expect(prompt).toContain('500.00 of');
    expect(prompt).toContain('400.00 (125.0%) - [OVER BUDGET]');
    
    // Check recurring
    expect(prompt).toContain('- Netflix:');
    expect(prompt).toContain('15.00 (monthly, next on');
  });

  it('should gracefully handle empty states without breaking', () => {
    const prompt = PromptBuilder.buildChatSystemPrompt(emptyContext);
    
    expect(prompt).toContain('Total Income:');
    expect(prompt).toContain('0.00');
    expect(prompt).toContain('- No expense categories recorded yet.');
    expect(prompt).toContain('- No active budgets.');
    expect(prompt).toContain('- No active recurring transactions.');
    expect(prompt).toContain('- No anomalies detected.');
  });
});

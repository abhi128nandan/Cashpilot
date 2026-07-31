import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RecurringProcessingEngine } from '../recurring-engine.service';
import * as queries from '@/lib/db/queries';

vi.mock('@/lib/db/queries', () => ({
  getDueRecurringTransactions: vi.fn(),
  createTransaction: vi.fn(),
  updateRecurringTransactionAdmin: vi.fn(),
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  }
}));

describe('RecurringProcessingEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a fixed system time: 2024-03-15T12:00:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockRuleBase = {
    id: 'rule-1',
    userId: 'user-1',
    amount: 50.00,
    type: 'expense' as const,
    currency: 'USD',
    categoryId: 'cat-1',
    merchant: 'Test Merchant',
    description: null,
    startDate: '2024-03-01',
    endDate: null,
    status: 'active' as const,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  };

  it('should process a due daily schedule', async () => {
    // Next date was yesterday
    const rule = { ...mockRuleBase, frequency: 'daily', nextDate: '2024-03-14' };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);
    vi.mocked(queries.createTransaction).mockResolvedValue({ transaction: { id: 'txn-1' } as any });

    const result = await RecurringProcessingEngine.processAll();

    expect(result.processedCount).toBe(1);
    expect(result.generatedCount).toBe(2); // Processes both 14th AND 15th
    expect(result.skippedCount).toBe(0);

    expect(queries.createTransaction).toHaveBeenCalledTimes(2);

    expect(queries.updateRecurringTransactionAdmin).toHaveBeenCalledWith('rule-1', expect.objectContaining({
      nextDate: '2024-03-16', // Advanced past 15th
      status: 'active'
    }));
  });

  it('should process multiple catch-up occurrences if rule is far behind', async () => {
    // Next date was 3 days ago
    const rule = { ...mockRuleBase, frequency: 'daily', nextDate: '2024-03-12' };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);
    vi.mocked(queries.createTransaction).mockResolvedValue({ transaction: { id: 'txn-1' } as any });

    const result = await RecurringProcessingEngine.processAll();

    // 12th, 13th, 14th, 15th -> 4 transactions
    expect(result.generatedCount).toBe(4);
    expect(queries.createTransaction).toHaveBeenCalledTimes(4);
    
    // Updates to 16th
    expect(queries.updateRecurringTransactionAdmin).toHaveBeenCalledWith('rule-1', expect.objectContaining({
      nextDate: '2024-03-16'
    }));
  });

  it('should skip duplicate transactions safely using idempotency keys', async () => {
    const rule = { ...mockRuleBase, frequency: 'daily', nextDate: '2024-03-14' };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);
    // Simulate DB constraint rejection
    vi.mocked(queries.createTransaction).mockResolvedValue({ isDuplicate: true });

    const result = await RecurringProcessingEngine.processAll();

    expect(result.generatedCount).toBe(0);
    expect(result.skippedCount).toBe(2); // Skipped both 14th and 15th
    
    // It should STILL update the next date so we don't get stuck in a loop
    expect(queries.updateRecurringTransactionAdmin).toHaveBeenCalledWith('rule-1', expect.objectContaining({
      nextDate: '2024-03-16'
    }));
  });

  it('should archive a rule if it reaches its end date', async () => {
    // Rule is due on 14th, but end date is 14th.
    const rule = { ...mockRuleBase, frequency: 'monthly', nextDate: '2024-03-14', endDate: '2024-03-14' };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);
    vi.mocked(queries.createTransaction).mockResolvedValue({ transaction: { id: 'txn-1' } as any });

    await RecurringProcessingEngine.processAll();

    // After processing 14th, the next calculated date would be April 14th, which is > end date.
    expect(queries.updateRecurringTransactionAdmin).toHaveBeenCalledWith('rule-1', expect.objectContaining({
      status: 'archived'
    }));
  });

  it('should not process if the rule is not actually due', async () => {
    const rule = { ...mockRuleBase, frequency: 'daily', nextDate: '2024-03-16' };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);

    const result = await RecurringProcessingEngine.processAll();

    expect(result.generatedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(queries.createTransaction).not.toHaveBeenCalled();
    expect(queries.updateRecurringTransactionAdmin).not.toHaveBeenCalled();
  });

  it('should ignore paused or archived rules', async () => {
    const rule = { ...mockRuleBase, frequency: 'daily', nextDate: '2024-03-14', status: 'paused' as const };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);

    const result = await RecurringProcessingEngine.processAll();

    expect(result.generatedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(queries.createTransaction).not.toHaveBeenCalled();
  });

  it('should handle leap years correctly (monthly on Feb 29)', async () => {
    // Set time to March 29, 2024 (leap year)
    vi.setSystemTime(new Date('2024-03-29T12:00:00Z'));
    
    // Rule was due on Feb 29
    const rule = { ...mockRuleBase, frequency: 'monthly', nextDate: '2024-02-29' };
    vi.mocked(queries.getDueRecurringTransactions).mockResolvedValue([rule]);
    vi.mocked(queries.createTransaction).mockResolvedValue({ transaction: { id: 'txn-1' } as any });

    await RecurringProcessingEngine.processAll();

    // It processed Feb 29 AND March 29. So next date should be April 29
    expect(queries.updateRecurringTransactionAdmin).toHaveBeenCalledWith('rule-1', expect.objectContaining({
      nextDate: '2024-04-29'
    }));
  });
});

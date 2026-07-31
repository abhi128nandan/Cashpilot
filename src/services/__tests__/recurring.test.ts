import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as recurringService from '../recurring.service';
import * as queries from '@/lib/db/queries';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';

vi.mock('@/lib/db/queries', () => ({
  getRecurringTransactions: vi.fn(),
  getRecurringTransactionById: vi.fn(),
  createRecurringTransactionRule: vi.fn(),
  updateRecurringTransactionRule: vi.fn(),
  archiveRecurringTransactionRule: vi.fn(),
  invalidateUserCache: vi.fn(),
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() }
}));

describe('RecurringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserId = 'user-123';
  const mockRuleId = 'rule-456';
  
  const mockExistingRule = {
    id: mockRuleId,
    userId: mockUserId,
    amount: 100,
    type: 'expense',
    currency: 'USD',
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    frequency: 'monthly',
    startDate: '2024-01-01T00:00:00Z',
    nextDate: '2024-01-01T00:00:00Z',
    status: 'active'
  };

  describe('getRecurringTransactionById', () => {
    it('should throw NotFoundError if rule does not exist', async () => {
      vi.mocked(queries.getRecurringTransactionById).mockResolvedValue(null);
      await expect(recurringService.getRecurringTransactionById(mockRuleId, mockUserId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return rule if exists', async () => {
      vi.mocked(queries.getRecurringTransactionById).mockResolvedValue(mockExistingRule as any);
      const result = await recurringService.getRecurringTransactionById(mockRuleId, mockUserId);
      expect(result).toEqual(mockExistingRule);
    });
  });

  describe('createRecurringTransaction', () => {
    it('should invalidate cache and log on success', async () => {
      const input = {
        amount: 50,
        currency: 'USD',
        type: 'expense' as const,
        frequency: 'weekly' as const,
        startDate: new Date('2024-02-01'),
        nextDate: new Date('2024-02-01'),
      };
      
      vi.mocked(queries.createRecurringTransactionRule).mockResolvedValue({ id: 'new-id' } as any);
      
      const result = await recurringService.createRecurringTransaction(mockUserId, input);
      
      expect(result.id).toBe('new-id');
      expect(queries.invalidateUserCache).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('updateRecurringTransaction', () => {
    it('should throw NotFoundError if attempting to update a missing rule', async () => {
      vi.mocked(queries.getRecurringTransactionById).mockResolvedValue(null);
      
      await expect(recurringService.updateRecurringTransaction(mockRuleId, mockUserId, { amount: 200 }))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw ValidationError if merged update violates schema', async () => {
      vi.mocked(queries.getRecurringTransactionById).mockResolvedValue(mockExistingRule as any);
      
      // Amount cannot be negative
      await expect(recurringService.updateRecurringTransaction(mockRuleId, mockUserId, { amount: -50 }))
        .rejects
        .toThrow(ValidationError);
        
      expect(queries.updateRecurringTransactionRule).not.toHaveBeenCalled();
    });

    it('should permit partial updates that conform to schema', async () => {
      vi.mocked(queries.getRecurringTransactionById).mockResolvedValue(mockExistingRule as any);
      vi.mocked(queries.updateRecurringTransactionRule).mockResolvedValue({ ...mockExistingRule, amount: 200 } as any);
      
      const result = await recurringService.updateRecurringTransaction(mockRuleId, mockUserId, { amount: 200 });
      
      expect(queries.updateRecurringTransactionRule).toHaveBeenCalledWith(
        mockRuleId, 
        mockUserId, 
        expect.objectContaining({ amount: 200 })
      );
      expect(result.amount).toBe(200);
      expect(queries.invalidateUserCache).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('archiveRecurringTransaction', () => {
    it('should throw NotFoundError if archive fails', async () => {
      vi.mocked(queries.archiveRecurringTransactionRule).mockResolvedValue(false);
      
      await expect(recurringService.archiveRecurringTransaction(mockRuleId, mockUserId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return success and invalidate cache if archived', async () => {
      vi.mocked(queries.archiveRecurringTransactionRule).mockResolvedValue(true);
      
      const result = await recurringService.archiveRecurringTransaction(mockRuleId, mockUserId);
      
      expect(result.success).toBe(true);
      expect(queries.invalidateUserCache).toHaveBeenCalledWith(mockUserId);
    });
  });
});

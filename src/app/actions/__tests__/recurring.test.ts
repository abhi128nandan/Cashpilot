import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as actions from '../recurring.actions';
import * as guard from '@/lib/auth/guard';
import * as service from '@/services/recurring.service';
import { revalidatePath } from 'next/cache';
import { ValidationError, AppError, UnauthorizedError } from '@/lib/utils/errors';

vi.mock('@/lib/auth/guard', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/services/recurring.service', () => ({
  getRecurringTransactions: vi.fn(),
  getRecurringTransactionById: vi.fn(),
  createRecurringTransaction: vi.fn(),
  updateRecurringTransaction: vi.fn(),
  archiveRecurringTransaction: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Recurring Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-123', email: 'test@example.com' };
  
  describe('getRecurringTransactionsAction', () => {
    it('should return error if auth fails', async () => {
      vi.mocked(guard.requireAuth).mockRejectedValue(new UnauthorizedError('Unauthorized'));
      
      const result = await actions.getRecurringTransactionsAction();
      
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(service.getRecurringTransactions).not.toHaveBeenCalled();
    });

    it('should return data if successful', async () => {
      vi.mocked(guard.requireAuth).mockResolvedValue(mockUser as any);
      vi.mocked(service.getRecurringTransactions).mockResolvedValue([{ id: '1' } as any]);
      
      const result = await actions.getRecurringTransactionsAction();
      
      expect(result).toEqual({ success: true, data: [{ id: '1' }] });
      expect(service.getRecurringTransactions).toHaveBeenCalledWith('user-123');
    });
  });

  describe('createRecurringTransactionAction', () => {
    const validPayload = {
      amount: 100,
      currency: 'USD',
      type: 'expense',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      frequency: 'monthly',
      startDate: '2024-01-01T00:00:00.000Z',
      nextDate: '2024-01-01T00:00:00.000Z',
    };

    it('should return validation error for bad input', async () => {
      vi.mocked(guard.requireAuth).mockResolvedValue(mockUser as any);
      
      const badPayload = { amount: -50 }; // invalid amount, missing fields
      const result = await actions.createRecurringTransactionAction(badPayload);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect((result as any).fieldErrors).toBeDefined();
      expect(service.createRecurringTransaction).not.toHaveBeenCalled();
    });

    it('should return success and revalidate paths on valid input', async () => {
      vi.mocked(guard.requireAuth).mockResolvedValue(mockUser as any);
      vi.mocked(service.createRecurringTransaction).mockResolvedValue({ id: 'new-id' } as any);
      
      const result = await actions.createRecurringTransactionAction(validPayload);
      
      expect(result.success).toBe(true);
      expect((result as any).data.id).toBe('new-id');
      
      // Verification of service layer call with Zod-parsed Date objects
      expect(service.createRecurringTransaction).toHaveBeenCalledWith(
        'user-123', 
        expect.objectContaining({ 
          amount: 100, 
          startDate: expect.any(Date),
          nextDate: expect.any(Date) 
        })
      );
      
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should return generic error if service throws', async () => {
      vi.mocked(guard.requireAuth).mockResolvedValue(mockUser as any);
      vi.mocked(service.createRecurringTransaction).mockRejectedValue(new AppError('DB Failure', 500));
      
      const result = await actions.createRecurringTransactionAction(validPayload);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Failure');
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecurringTransactions, useUpdateRecurringTransaction } from '../use-recurring';
import * as actions from '@/app/actions/recurring.actions';
import React from 'react';

vi.mock('@/app/actions/recurring.actions', () => ({
  getRecurringTransactionsAction: vi.fn(),
  createRecurringTransactionAction: vi.fn(),
  updateRecurringTransactionAction: vi.fn(),
  archiveRecurringTransactionAction: vi.fn(),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('use-recurring hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useRecurringTransactions', () => {
    it('should fetch and return data on success', async () => {
      const mockData = [{ id: '1', amount: 50 }];
      vi.mocked(actions.getRecurringTransactionsAction).mockResolvedValue({
        success: true,
        data: mockData as any
      });

      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useRecurringTransactions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle errors correctly', async () => {
      vi.mocked(actions.getRecurringTransactionsAction).mockResolvedValue({
        success: false,
        error: 'Network Error'
      });

      const queryClient = createTestQueryClient();
      const wrapper = createWrapper(queryClient);

      const { result } = renderHook(() => useRecurringTransactions(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      
      expect(result.current.error?.message).toBe('Network Error');
    });
  });

  describe('useUpdateRecurringTransaction', () => {
    it('should perform optimistic update and rollback on error', async () => {
      const mockData = [{ id: '1', amount: 50, status: 'active' }];
      
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(['recurring-transactions'], mockData);

      // Mock failure
      vi.mocked(actions.updateRecurringTransactionAction).mockResolvedValue({
        success: false,
        error: 'Update failed'
      });

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useUpdateRecurringTransaction('1'), { wrapper });

      // Trigger mutation
      result.current.mutate({ status: 'paused' } as any);

      // Wait for mutation to fail
      await waitFor(() => expect(result.current.isError).toBe(true));

      // Verify rollback
      const cache = queryClient.getQueryData(['recurring-transactions']);
      expect(cache).toEqual(mockData); // Back to 'active'
    });
  });
});

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recurringKeys } from '@/lib/api/query-keys';
import { 
  getRecurringTransactionsAction,
  getRecurringTransactionByIdAction,
  createRecurringTransactionAction,
  updateRecurringTransactionAction,
  archiveRecurringTransactionAction
} from '@/app/actions/recurring.actions';
import type { RecurringTransaction } from '@/types';
import type { CreateRecurringInput, UpdateRecurringInput } from '@/lib/validators/recurring';

// --- Queries ---

export function useRecurringTransactions() {
  return useQuery({
    queryKey: recurringKeys.lists(),
    queryFn: async () => {
      const result = await getRecurringTransactionsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

export function useRecurringTransaction(id: string) {
  return useQuery({
    queryKey: recurringKeys.detail(id),
    queryFn: async () => {
      const result = await getRecurringTransactionByIdAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
}

// --- Mutations ---

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRecurringInput) => {
      const result = await createRecurringTransactionAction(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate recurring lists to fetch the newly created item
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      // Invalidate global analytics, as new recurring transactions might affect scheduled cash flow
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Recurring transaction created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create recurring transaction');
    },
  });
}

export function useUpdateRecurringTransaction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateRecurringInput) => {
      const result = await updateRecurringTransactionAction(id, input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async (newUpdates) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: recurringKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: recurringKeys.lists() });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData<RecurringTransaction>(recurringKeys.detail(id));
      const previousList = queryClient.getQueryData<RecurringTransaction[]>(recurringKeys.lists());

      // Optimistically update the detail view
      if (previousDetail) {
        queryClient.setQueryData<RecurringTransaction>(recurringKeys.detail(id), {
          ...previousDetail,
          ...newUpdates,
          // Handle dates safely for optimistic updates
          startDate: newUpdates.startDate ? new Date(newUpdates.startDate).toISOString() : previousDetail.startDate,
          nextDate: newUpdates.nextDate ? new Date(newUpdates.nextDate).toISOString() : previousDetail.nextDate,
          endDate: newUpdates.endDate !== undefined 
            ? (newUpdates.endDate ? new Date(newUpdates.endDate).toISOString() : null) 
            : previousDetail.endDate,
        });
      }

      // Optimistically update the list view
      if (previousList) {
        queryClient.setQueryData<RecurringTransaction[]>(
          recurringKeys.lists(),
          previousList.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                ...newUpdates,
                startDate: newUpdates.startDate ? new Date(newUpdates.startDate).toISOString() : item.startDate,
                nextDate: newUpdates.nextDate ? new Date(newUpdates.nextDate).toISOString() : item.nextDate,
                endDate: newUpdates.endDate !== undefined 
                  ? (newUpdates.endDate ? new Date(newUpdates.endDate).toISOString() : null) 
                  : item.endDate,
              };
            }
            return item;
          })
        );
      }

      return { previousDetail, previousList };
    },
    onError: (error, newUpdates, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(recurringKeys.detail(id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(recurringKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to update recurring transaction');
    },
    onSettled: () => {
      // Always re-fetch to ensure server parity
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onSuccess: () => {
      toast.success('Recurring transaction updated');
    },
  });
}

export function useArchiveRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await archiveRecurringTransactionAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: recurringKeys.lists() });

      const previousList = queryClient.getQueryData<RecurringTransaction[]>(recurringKeys.lists());

      // Optimistically remove from list
      if (previousList) {
        queryClient.setQueryData<RecurringTransaction[]>(
          recurringKeys.lists(),
          previousList.filter((item) => item.id !== id)
        );
      }

      return { previousList };
    },
    onError: (error, id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(recurringKeys.lists(), context.previousList);
      }
      toast.error(error.message || 'Failed to archive recurring transaction');
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onSuccess: () => {
      toast.success('Recurring transaction archived');
    },
  });
}

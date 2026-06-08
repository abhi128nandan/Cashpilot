import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, addTransaction, deleteTransaction } from '@/services/transaction.service';
import { toast } from 'sonner';

export function useTransactions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Transaction added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add transaction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Transaction deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete transaction');
    },
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addTransaction: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

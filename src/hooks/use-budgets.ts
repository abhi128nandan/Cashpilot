import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBudgets, addBudget, deleteBudget } from '@/services/budget.service';
import { toast } from 'sonner';

export function useBudgets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['budgets'],
    queryFn: fetchBudgets,
  });

  const addMutation = useMutation({
    mutationFn: addBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget added successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add budget');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete budget');
    },
  });

  return {
    budgets: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addBudget: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    deleteBudget: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

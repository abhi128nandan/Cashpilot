'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, RecurringTransaction } from '@/types';
import { useRecurringTransactions, useUpdateRecurringTransaction, useArchiveRecurringTransaction, useCreateRecurringTransaction } from '@/hooks/use-recurring';
import { RecurringTransactionCard } from '@/components/features/recurring/recurring-transaction-card';
import { RecurringTransactionDialog } from '@/components/features/recurring/recurring-transaction-dialog';
import { RecurringTransactionForm } from '@/components/features/recurring/recurring-transaction-form';
import { ArchiveRecurringModal } from '@/components/features/recurring/archive-recurring-modal';
import Skeleton from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import { AlertCircle } from '@/components/icons';
import styles from './page.module.css';

interface RecurringClientProps {
  categories: Category[];
}

export default function RecurringClient({ categories }: RecurringClientProps) {
  const { data: transactions = [], isLoading, isError } = useRecurringTransactions();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Note: We use a placeholder ID ('') for the update hook since we update it dynamically.
  // Wait, useUpdateRecurringTransaction expects an ID when called. 
  // Wait, the hook is configured per-ID: `useUpdateRecurringTransaction(id)`. 
  // It's better to manage the mutation inside the handlers, but since hooks can't be called in callbacks, 
  // we can use the `useMutation` directly here, OR since `useUpdateRecurringTransaction` takes an `id`, 
  // wait... `useUpdateRecurringTransaction` in `use-recurring.ts` takes `id` as an argument to the hook. 
  // Let's check `use-recurring.ts`. Yes, `export function useUpdateRecurringTransaction(id: string)`. 
  // This means we can't easily dynamically call it for any ID in a list without a custom wrapper.
  // Actually, we can use the `updateRecurringTransactionAction` directly, but the hook provides optimistic updates.
  // A common pattern is to wrap the Card in a child component that calls the hook, OR we modify the hook to take `id` in the mutate function.
  // Let's modify `useUpdateRecurringTransaction` to take `id` inside the mutation function if we need to.
  // Wait, the prompt says "DO NOT change business logic" but `use-recurring.ts` is UI data layer.
  // Let's check how we can do this without modifying the hook. We can just create a wrapper component `<CardWrapper>` that calls the hook for its specific ID.
  
  const archiveMutation = useArchiveRecurringTransaction();
  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction(editingTransaction?.id || '');

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0] | Parameters<typeof updateMutation.mutateAsync>[0]) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync(data as Parameters<typeof updateMutation.mutateAsync>[0]);
    } else {
      await createMutation.mutateAsync(data as Parameters<typeof createMutation.mutateAsync>[0]);
    }
    handleCloseDialog();
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Recurring Transactions</h1>
        </div>
        <div className={styles.skeletonGrid}>
          <Skeleton className={styles.skeletonCard} />
          <Skeleton className={styles.skeletonCard} />
          <Skeleton className={styles.skeletonCard} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <EmptyState 
          icon={<AlertCircle size={48} />}
          title="Unable to load schedules" 
          description="There was a problem loading your recurring transactions."
        />
      </div>
    );
  }

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTransaction(null);
  };

  const handleArchiveConfirm = () => {
    if (archivingId) {
      archiveMutation.mutate(archivingId, {
        onSuccess: () => {
          setArchivingId(null);
        }
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recurring Transactions</h1>
        <button 
          type="button" 
          className={styles.createBtn}
          onClick={() => setShowDialog(true)}
        >
          <Plus size={18} /> New Schedule
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState 
          icon={<span style={{ fontSize: 48 }}>🔁</span>}
          title="No recurring transactions"
          description="Create your first schedule to automate your income or expenses."
        />
      ) : (
        <div className={styles.grid}>
          {transactions.map((txn) => (
            <CardWrapper 
              key={txn.id} 
              transaction={txn} 
              onEdit={handleEdit} 
              onArchive={setArchivingId} 
            />
          ))}
        </div>
      )}

      <RecurringTransactionDialog
        isOpen={showDialog}
        onClose={handleCloseDialog}
        title={editingTransaction ? 'Edit Recurring Schedule' : 'New Recurring Schedule'}
      >
        <RecurringTransactionForm
          categories={categories}
          initialData={
            editingTransaction 
              ? {
                  ...editingTransaction,
                  merchant: editingTransaction.merchant || undefined,
                  description: editingTransaction.description || undefined,
                  categoryId: editingTransaction.categoryId || undefined,
                  endDate: editingTransaction.endDate || undefined,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isPending={editingTransaction ? updateMutation.isPending : createMutation.isPending}
          onCancel={handleCloseDialog}
        />
      </RecurringTransactionDialog>

      {archivingId && (
        <ArchiveRecurringModal
          isArchiving={archiveMutation.isPending}
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchivingId(null)}
        />
      )}
    </div>
  );
}

// Wrapper component to isolate the per-ID hooks for optimistic updates
function CardWrapper({ 
  transaction, 
  onEdit, 
  onArchive 
}: { 
  transaction: RecurringTransaction; 
  onEdit: (t: RecurringTransaction) => void;
  onArchive: (id: string) => void;
}) {
  const updateMutation = useUpdateRecurringTransaction(transaction.id);

  const handleToggleStatus = () => {
    const newStatus = transaction.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ status: newStatus }, {
      onError: () => {
        toast.error(`Failed to ${newStatus === 'paused' ? 'pause' : 'resume'} schedule`);
      }
    });
  };

  return (
    <RecurringTransactionCard
      transaction={transaction}
      onEdit={onEdit}
      onArchive={onArchive}
      onToggleStatus={handleToggleStatus}
    />
  );
}

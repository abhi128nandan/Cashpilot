import { createClient } from '@/lib/supabase/server';
import type { Transaction } from '@/types';

function safeNumber(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  const categoryRow = row.category as Record<string, unknown> | null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    categoryId: (row.category_id as string) ?? null,
    amount: safeNumber(row.amount),
    currency: (row.currency as string) || 'USD',
    type: row.type as Transaction['type'],
    merchant: (row.merchant as string) ?? null,
    description: (row.description as string) ?? null,
    transactionDate: row.transaction_date as string,
    source: row.source as Transaction['source'],
    category: categoryRow
      ? {
          id: categoryRow.id as string,
          userId: (categoryRow.user_id as string) ?? null,
          name: categoryRow.name as string,
          icon: (categoryRow.icon as string) ?? null,
          color: (categoryRow.color as string) ?? null,
          isSystem: categoryRow.is_system as boolean,
        }
      : null,
    createdAt: row.created_at as string,
  };
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }

  return (data || []).map(mapTransaction);
}

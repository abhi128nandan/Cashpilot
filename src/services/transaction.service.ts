'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/guard';
import { getTransactions as dbGetTransactions, createTransaction as dbCreateTransaction, invalidateUserCache } from '@/lib/db/queries';

export async function fetchTransactions() {
  const user = await requireAuth();
  return dbGetTransactions(user.id);
}

export async function addTransaction(input: {
  amount: number;
  type: string;
  categoryId?: string | null;
  merchant?: string | null;
  description?: string | null;
  transactionDate: string;
}) {
  const user = await requireAuth();
  
  // Here you can add Zod validation later
  
  const result = await dbCreateTransaction(user.id, {
    ...input,
    currency: 'INR',
    source: 'manual',
  });
  
  if (!result.transaction) {
    throw new Error('Failed to create transaction');
  }
  
  invalidateUserCache(user.id);
  
  return result.transaction;
}

export async function deleteTransaction(transactionId: string) {
  const user = await requireAuth();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', user.id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  invalidateUserCache(user.id);
  
  return true;
}

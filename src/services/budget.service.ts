'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/guard';
import { getBudgets as dbGetBudgets } from '@/lib/db/queries';

export async function fetchBudgets() {
  const user = await requireAuth();
  // Ensure the DB queries fallback to mock data correctly 
  // or return actual data
  return dbGetBudgets(user.id);
}

export async function addBudget(input: {
  categoryId: string;
  limitAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}) {
  const user = await requireAuth();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      category_id: input.categoryId,
      limit_amount: input.limitAmount,
      period: input.period,
    })
    .select('*, category:categories(*)')
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function deleteBudget(budgetId: string) {
  const user = await requireAuth();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)
    .eq('user_id', user.id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
}

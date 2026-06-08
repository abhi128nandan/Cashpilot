import { createClient } from '@/lib/supabase/server';
import type { Budget, Category } from '@/types';

function safeNumber(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    name: row.name as string,
    icon: (row.icon as string) ?? null,
    color: (row.color as string) ?? null,
    isSystem: row.is_system as boolean,
  };
}

function mapBudget(row: Record<string, unknown>): Budget {
  const categoryRow = row.category as Record<string, unknown> | null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    categoryId: (row.category_id as string) ?? null,
    limitAmount: safeNumber(row.limit_amount),
    period: row.period as Budget['period'],
    spentAmount: 0,
    periodStart: '',
    periodEnd: '',
    category: categoryRow ? mapCategory(categoryRow) : null,
  };
}

export async function getUserBudgets(userId: string): Promise<Budget[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('budgets')
    .select('*, category:categories(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user budgets:', error);
    return [];
  }

  return (data || []).map(mapBudget);
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guard';
import { getCategories } from '@/lib/db/queries';
import { getUserBudgets } from '@/lib/queries/budgets';
import BudgetList from '@/components/features/budgets/budget-list';

export const metadata: Metadata = {
  title: 'Budgets',
  description: 'Set spending limits and track your budget progress across categories.',
};

export default async function BudgetsPage() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect('/login');
  }

  const [budgets, categories] = await Promise.all([
    getUserBudgets(user.id),
    getCategories(user.id)
  ]);

  return <BudgetList budgets={budgets} categories={categories} />;
}

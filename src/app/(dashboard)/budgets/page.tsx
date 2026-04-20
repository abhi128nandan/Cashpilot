import type { Metadata } from 'next';
import { getBudgets } from '@/lib/mock-data';
import BudgetList from '@/components/features/budgets/budget-list';

export const metadata: Metadata = {
  title: 'Budgets',
  description: 'Set spending limits and track your budget progress across categories.',
};

export default async function BudgetsPage() {
  const budgets = await getBudgets();
  return <BudgetList budgets={budgets} />;
}

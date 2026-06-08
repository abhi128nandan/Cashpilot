import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guard';
import { getCategories } from '@/lib/db/queries';
import { getUserTransactions } from '@/lib/queries/transactions';
import TransactionList from '@/components/features/transactions/transaction-list';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'View, filter, and manage all your financial transactions.',
};

export default async function TransactionsPage() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect('/login');
  }

  const [transactions, categories] = await Promise.all([
    getUserTransactions(user.id),
    getCategories(user.id),
  ]);

  return <TransactionList transactions={transactions} categories={categories} />;
}

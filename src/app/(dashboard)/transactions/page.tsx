import type { Metadata } from 'next';
import { getTransactions, getCategories } from '@/lib/mock-data';
import TransactionList from '@/components/features/transactions/transaction-list';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'View, filter, and manage all your financial transactions.',
};

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return <TransactionList transactions={transactions} categories={categories} />;
}

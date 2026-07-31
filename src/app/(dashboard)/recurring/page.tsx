import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guard';
import { getCategories } from '@/lib/db/queries';
import RecurringClient from './recurring-client';

export const metadata: Metadata = {
  title: 'Recurring Transactions',
  description: 'Manage your scheduled income and expenses.',
};

export default async function RecurringPage() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect('/login');
  }

  const categories = await getCategories(user.id);

  return <RecurringClient categories={categories} />;
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guard';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your financial overview at a glance — track income, expenses, and savings.',
};

export default async function DashboardPage() {
  // Guard route
  try {
    await requireAuth();
  } catch {
    redirect('/login');
  }

  return <DashboardClient />;
}

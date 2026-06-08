import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guard';
import { getMonthlyTrends, getSpendingByCategory, getDashboardStats } from '@/lib/queries/analytics';
import AnalyticsDashboard from '@/components/features/analytics/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Deep dive into your spending patterns, trends, and financial health.',
};

export default async function AnalyticsPage() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect('/login');
  }

  const [trends, spending, stats] = await Promise.all([
    getMonthlyTrends(user.id),
    getSpendingByCategory(user.id),
    getDashboardStats(user.id),
  ]);

  return <AnalyticsDashboard trends={trends} spending={spending} stats={stats} />;
}

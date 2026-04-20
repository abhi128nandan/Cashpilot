import type { Metadata } from 'next';
import { getMonthlyTrends, getSpendingByCategory, getDashboardStats } from '@/lib/mock-data';
import AnalyticsDashboard from '@/components/features/analytics/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Deep dive into your spending patterns, trends, and financial health.',
};

export default async function AnalyticsPage() {
  const [trends, spending, stats] = await Promise.all([
    getMonthlyTrends(),
    getSpendingByCategory(),
    getDashboardStats(),
  ]);

  return <AnalyticsDashboard trends={trends} spending={spending} stats={stats} />;
}

import type { Metadata } from 'next';
import StatsCards from '@/components/features/dashboard/stats-cards';
import SpendingChart from '@/components/features/dashboard/spending-chart';
import CategoryBreakdown from '@/components/features/dashboard/category-breakdown';
import RecentTransactions from '@/components/features/dashboard/recent-transactions';
import AnomalyAlerts from '@/components/features/dashboard/anomaly-alerts';
import {
  getDashboardStats,
  getMonthlyTrends,
  getSpendingByCategory,
  getRecentTransactions,
  getAnomalies,
} from '@/lib/mock-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your financial overview at a glance — track income, expenses, and savings.',
};

export default async function DashboardPage() {
  // All data fetching happens on the server — zero client-side fetching
  const [stats, trends, spending, transactions, anomalies] = await Promise.all([
    getDashboardStats(),
    getMonthlyTrends(),
    getSpendingByCategory(),
    getRecentTransactions(7),
    getAnomalies(),
  ]);

  return (
    <div className={styles.page} id="dashboard-page">
      {/* Stats cards row */}
      <StatsCards stats={stats} />

      {/* Charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartMain}>
          <SpendingChart data={trends} />
        </div>
        <div className={styles.chartSide}>
          <CategoryBreakdown data={spending} />
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <div className={styles.transactionsCol}>
          <RecentTransactions transactions={transactions} />
        </div>
        <div className={styles.alertsCol}>
          <AnomalyAlerts anomalies={anomalies} />
        </div>
      </div>
    </div>
  );
}

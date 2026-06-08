'use client';

import StatsCards from '@/components/features/dashboard/stats-cards';
import SpendingChart from '@/components/features/dashboard/spending-chart';
import CategoryBreakdown from '@/components/features/dashboard/category-breakdown';
import RecentTransactions from '@/components/features/dashboard/recent-transactions';
import AnomalyAlerts from '@/components/features/dashboard/anomaly-alerts';
import { useAnalytics } from '@/hooks/use-analytics';
import Skeleton from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import { AlertCircle } from '@/components/icons';
import styles from './page.module.css';

export default function DashboardClient() {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <div className={styles.page} id="dashboard-page">
        <div className={styles.grid}>
          <Skeleton className={styles.card} style={{ height: '140px' }} />
          <Skeleton className={styles.card} style={{ height: '140px' }} />
          <Skeleton className={styles.card} style={{ height: '140px' }} />
          <Skeleton className={styles.card} style={{ height: '140px' }} />
        </div>
        <div className={styles.chartsRow}>
          <Skeleton className={styles.chartMain} style={{ height: '400px' }} />
          <Skeleton className={styles.chartSide} style={{ height: '400px' }} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.page} id="dashboard-page">
        <EmptyState 
          icon={<AlertCircle size={48} />}
          title="Unable to load dashboard" 
          description="There was a problem loading your financial data."
        />
      </div>
    );
  }

  return (
    <div className={styles.page} id="dashboard-page">
      {/* Stats cards row */}
      <StatsCards stats={data.stats} />

      {/* Charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartMain}>
          <SpendingChart data={data.monthlyTrends} />
        </div>
        <div className={styles.chartSide}>
          <CategoryBreakdown data={data.spendingByCategory} />
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <div className={styles.transactionsCol}>
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
        <div className={styles.alertsCol}>
          <AnomalyAlerts anomalies={data.anomalies} />
        </div>
      </div>
    </div>
  );
}

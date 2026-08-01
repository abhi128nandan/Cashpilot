'use client';

import StatsCards from '@/components/features/dashboard/stats-cards';
import SpendingChart from '@/components/features/dashboard/spending-chart';
import CategoryBreakdown from '@/components/features/dashboard/category-breakdown';
import RecentTransactions from '@/components/features/dashboard/recent-transactions';
import AnomalyAlerts from '@/components/features/dashboard/anomaly-alerts';
import { useAnalytics } from '@/hooks/use-analytics';
import Skeleton from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import { AlertCircle, CheckCircle } from '@/components/icons';
import styles from './page.module.css';
import Link from 'next/link';

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
        <div className={styles.dashboardGrid}>
          <div className={styles.col8}>
            <Skeleton className={styles.chartMain} style={{ height: '400px' }} />
          </div>
          <div className={styles.col4}>
            <Skeleton className={styles.chartSide} style={{ height: '400px' }} />
          </div>
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
      {data.stats.transactionCount === 0 && (
        <div className={styles.onboardingPanel}>
          <div className={styles.onboardingHeader}>
            <h2 className={styles.onboardingTitle}>Welcome to CashPilot 👋</h2>
            <p className={styles.onboardingDesc}>You are all set! Follow these quick steps to get started with your financial tracking.</p>
          </div>
          <div className={styles.onboardingSteps}>
            <Link href="/transactions" className={styles.onboardingStep}>
              <CheckCircle size={20} className={styles.stepIcon} />
              <div className={styles.stepInfo}>
                <span className={styles.stepTitle}>Add your first transaction</span>
                <span className={styles.stepDesc}>Record your first income or expense</span>
              </div>
            </Link>
            <Link href="/budgets" className={styles.onboardingStep}>
              <CheckCircle size={20} className={styles.stepIcon} />
              <div className={styles.stepInfo}>
                <span className={styles.stepTitle}>Create a budget</span>
                <span className={styles.stepDesc}>Set spending limits for your categories</span>
              </div>
            </Link>
            <Link href="/recurring" className={styles.onboardingStep}>
              <CheckCircle size={20} className={styles.stepIcon} />
              <div className={styles.stepInfo}>
                <span className={styles.stepTitle}>Configure recurring payments</span>
                <span className={styles.stepDesc}>Track your subscriptions and bills</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Stats cards row */}
      <StatsCards stats={data.stats} />

      {/* 12-Column Layout */}
      <div className={styles.dashboardGrid}>
        <div className={styles.col12} id="dash-cashflow">
          <SpendingChart data={data.monthlyTrends} />
        </div>

        <div className={styles.col6}>
          <CategoryBreakdown data={data.spendingByCategory} />
        </div>
        <div className={styles.col6}>
          <AnomalyAlerts anomalies={data.anomalies} />
        </div>

        <div className={styles.col12}>
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>
    </div>
  );
}

'use server';

import { requireAuth } from '@/lib/auth/guard';
import { 
  getDashboardStats, 
  getSpendingByCategory, 
  getMonthlyTrends
} from '@/lib/queries/analytics';
import { getRecentTransactions } from '@/lib/db/queries';
import { getAnomalies } from '@/lib/db/queries';

export async function fetchDashboardAnalytics() {
  const user = await requireAuth();
  
  const [stats, spendingByCategory, monthlyTrends, recentTransactions, anomalies] = await Promise.all([
    getDashboardStats(user.id),
    getSpendingByCategory(user.id),
    getMonthlyTrends(user.id),
    getRecentTransactions(user.id, 7),
    getAnomalies(user.id)
  ]);
  
  return {
    stats,
    spendingByCategory,
    monthlyTrends,
    recentTransactions,
    anomalies
  };
}

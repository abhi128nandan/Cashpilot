'use server';

import { requireAuth } from '@/lib/auth/guard';
import { 
  getDashboardStats, 
  getSpendingByCategory, 
  getMonthlyTrends
} from '@/lib/queries/analytics';
import { getRecentTransactions, getAnomalies, invalidateUserCache } from '@/lib/db/queries';
import { RecurringProcessingEngine } from '@/services/recurring-engine.service';
import { logger } from '@/lib/utils/logger';

export async function fetchDashboardAnalytics() {
  const user = await requireAuth();
  
  // 1. Lazy Processing: Synchronize recurring transactions for this user.
  // We wrap this in a try/catch so the dashboard never fails if processing errors.
  try {
    const processingResult = await RecurringProcessingEngine.processForUser(user.id);
    
    // 2. Cache Invalidation: Only if we successfully generated new transactions.
    // If generatedCount > 0, we must clear the in-memory TTL cache before Promise.all runs.
    if (processingResult.generatedCount > 0) {
      logger.info('dashboard', 'Invalidating cache due to new recurring transactions', { userId: user.id });
      invalidateUserCache(user.id);
    }
  } catch (error) {
    // 3. Graceful Degradation
    logger.error('dashboard', 'Lazy recurring processing failed', { 
      userId: user.id, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
  
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

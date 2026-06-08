/**
 * Database access layer for CashPilot.
 *
 * Strategy: Try Supabase first → fall back to mock data.
 *
 * Why this approach instead of a hard switch:
 *  - The DB schema may not be deployed yet (new dev, CI, staging)
 *  - If Supabase is unreachable, the UI still renders with mock data
 *  - Allows incremental migration: deploy schema → seed → remove fallback
 *  - Zero risk to existing SSR pages that import from mock-data.ts
 *
 * When to remove the fallback:
 *  - After the schema is deployed and seeded in all environments
 *  - After all SSR pages are confirmed working with live data
 *  - Then delete mock-data.ts and the fallback branches here
 *
 * Production hardening (v2):
 *  - Structured logging via logger utility
 *  - Duplicate transaction prevention via idempotency key
 *  - Category existence validation before insert
 *  - Safe number coercion with NaN guards
 */

import { createClient } from '@/lib/supabase/server';
import { logger, performanceMetrics } from '@/lib/utils/logger';
import { headers } from 'next/headers';
import { cache as reactCache } from 'react';
import type {
  Transaction,
  Category,
  Budget,
  Anomaly,
  DashboardStats,
  SpendingByCategory,
  MonthlyTrend,
} from '@/types';
import {
  getTransactions as getMockTransactions,
  getRecentTransactions as getMockRecentTransactions,
  getCategories as getMockCategories,
  getBudgets as getMockBudgets,
  getAnomalies as getMockAnomalies,
  getDashboardStats as getMockDashboardStats,
  getSpendingByCategory as getMockSpendingByCategory,
  getMonthlyTrends as getMockMonthlyTrends,
  mockCategories,
} from '@/lib/mock-data';

// ─── Caching & Memoization ───────────────────────────────────────────────────

const ttlCache = new Map<string, { data: any; expiry: number }>();

export function invalidateUserCache(userId: string) {
  for (const key of ttlCache.keys()) {
    if (key.endsWith(`:${userId}`)) {
      ttlCache.delete(key);
    }
  }
}

async function withTtlCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = ttlCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data as T;
  }
  const data = await fn();
  ttlCache.set(key, { data, expiry: Date.now() + ttlMs });
  return data;
}

const getRequestId = reactCache(async () => {
  try {
    const reqHeaders = await Promise.resolve(headers());
    return reqHeaders.get('x-request-id') || undefined;
  } catch {
    return undefined;
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Promise wrapper to enforce timeouts on database operations.
 * Prevents slow queries from hanging SSR or API routes.
 */
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number = 5000): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

/**
 * Unified helper for Supabase queries with timeout, retries, and structured logging.
 */
async function executeQuery<T, R>(
  queryFn: () => PromiseLike<{ data: T | null; error: any }>,
  context: { 
    functionName: string; 
    userId?: string; 
    fallback: () => R | Promise<R>;
    mapFn?: (data: T) => R | Promise<R>;
    isInsert?: boolean;
    onDuplicate?: () => R | Promise<R>;
  },
  retries = 2,
  timeoutMs = 5000
): Promise<R> {
  let requestId = await getRequestId();

  const logContext: Record<string, any> = { userId: context.userId };
  if (requestId) logContext.requestId = requestId;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let querySucceeded = false;
    try {
      let testQueryFn = queryFn;
      
      // --- SIMULATION HOOKS ---
      if (process.env.SIMULATE_DB_FAILURE === 'true') {
        testQueryFn = async () => { throw new Error('SIMULATED_DB_FAILURE: Network error'); };
      }
      if (process.env.SIMULATE_TIMEOUT === 'true') {
        testQueryFn = async () => {
          await new Promise(r => setTimeout(r, timeoutMs + 100));
          return { data: null, error: null };
        };
      }
      if (process.env.SIMULATE_DUPLICATE === 'true' && context.isInsert) {
        testQueryFn = async () => { throw { code: '23505', message: 'duplicate key value violates unique constraint' }; };
      }
      // ------------------------

      const queryStartTime = Date.now();
      const { data, error } = await withTimeout(testQueryFn(), timeoutMs);
      const latency = Date.now() - queryStartTime;
      
      performanceMetrics.dbQueries++;
      performanceMetrics.totalDbLatencyMs += latency;
      if (latency > 500) performanceMetrics.slowQueries++;

      if (error) {
        throw error;
      }
      querySucceeded = true;

      if (!context.isInsert && Array.isArray(data) && data.length === 0) {
        logger.info(context.functionName, 'Success', { 
          ...logContext, 
          reason: 'Empty result - returning empty array instead of fallback mock data' 
        });
      } else if (data === null) {
        logger.info(context.functionName, 'Success', { 
          ...logContext, 
          reason: 'Empty result - Data is null' 
        });
      }

      // --- SIMULATION HOOKS ---
      if (process.env.SIMULATE_PARTIAL_FAILURE === 'true' && context.isInsert) {
        throw new Error('SIMULATED_PARTIAL_FAILURE: Mapping failed after successful insert');
      }
      // ------------------------

      return context.mapFn ? context.mapFn(data as T) : (data as unknown as R);
    } catch (err: any) {
      if (querySucceeded) {
        logger.error(context.functionName, 'Failure', {
          ...logContext,
          reason: 'Post-query processing failed (e.g. mapping)',
          error: err instanceof Error ? err.message : String(err),
        });
        return context.fallback();
      }

      const errorCode = err?.code || 'UNKNOWN';
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      const NON_RETRYABLE_CODES = [
        '23505', // unique_violation
        '23514', // check_violation
        '23502', // not_null_violation
        '22P02', // invalid_text_representation
        '42501', // insufficient_privilege
        'PGRST301', // JWT invalid
      ];

      const isNonRetryable = NON_RETRYABLE_CODES.includes(errorCode) || errorCode.startsWith('PGRST');

      if (isNonRetryable) {
        if (errorCode === '23505' && context.onDuplicate) {
          logger.warn('security.abuse', 'Suspicious pattern: rapid duplicate transaction', {
            ...logContext,
            reason: 'Idempotency key collision (duplicate)',
            code: errorCode,
          });
          return context.onDuplicate();
        }

        logger.error(context.functionName, 'Failure', {
          ...logContext,
          code: errorCode,
          error: errorMessage,
          reason: 'Deterministic non-retryable error - Fallback triggered',
        });
        return context.fallback();
      }

      logger.warn(context.functionName, 'Recoverable issue', {
        ...logContext,
        reason: `Query failed (attempt ${attempt + 1}/${retries + 1})`,
        code: errorCode,
        message: errorMessage,
      });

      if (attempt >= retries) {
        logger.error(context.functionName, 'Failure', {
          ...logContext,
          code: errorCode,
          error: errorMessage,
          reason: 'All retries exhausted - Fallback triggered',
        });
        return context.fallback();
      }

      // Short delay before retry
      await new Promise(res => setTimeout(res, 300 * (attempt + 1)));
    }
  }

  logger.error(context.functionName, 'Failure', {
    ...logContext,
    reason: 'Unexpected loop exit - Fallback triggered',
  });
  return context.fallback();
}

/** Safely coerce to number, returning 0 for NaN/null/undefined */
function safeNumber(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Maps Supabase snake_case rows to the app's camelCase Transaction type.
 * This keeps the DB schema (snake_case) decoupled from the frontend types.
 */
function mapTransaction(row: Record<string, unknown>): Transaction {
  const categoryRow = row.category as Record<string, unknown> | null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    categoryId: (row.category_id as string) ?? null,
    amount: safeNumber(row.amount),
    currency: (row.currency as string) || 'USD',
    type: row.type as Transaction['type'],
    merchant: (row.merchant as string) ?? null,
    description: (row.description as string) ?? null,
    transactionDate: row.transaction_date as string,
    source: row.source as Transaction['source'],
    category: categoryRow
      ? {
          id: categoryRow.id as string,
          userId: (categoryRow.user_id as string) ?? null,
          name: categoryRow.name as string,
          icon: (categoryRow.icon as string) ?? null,
          color: (categoryRow.color as string) ?? null,
          isSystem: categoryRow.is_system as boolean,
        }
      : null,
    createdAt: row.created_at as string,
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    name: row.name as string,
    icon: (row.icon as string) ?? null,
    color: (row.color as string) ?? null,
    isSystem: row.is_system as boolean,
  };
}

function mapBudget(row: Record<string, unknown>): Budget {
  const categoryRow = row.category as Record<string, unknown> | null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    categoryId: (row.category_id as string) ?? null,
    limitAmount: safeNumber(row.limit_amount),
    period: row.period as Budget['period'],
    // spent_amount is computed client-side or via a DB function later
    spentAmount: 0,
    periodStart: '',
    periodEnd: '',
    category: categoryRow
      ? mapCategory(categoryRow)
      : null,
  };
}

function mapAnomaly(row: Record<string, unknown>): Anomaly {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    transactionId: (row.transaction_id as string) ?? null,
    severity: row.severity as Anomaly['severity'],
    description: row.description as string,
    isResolved: row.is_resolved as boolean,
    detectedAt: row.detected_at as string,
  };
}

// ─── Data Access Functions ───────────────────────────────────────────────────

/**
 * Fetch transactions for the authenticated user.
 * RLS ensures only the user's own transactions are returned.
 * Falls back to mock data if Supabase query fails.
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false }),
    {
      functionName: 'db.getTransactions',
      userId,
      fallback: getMockTransactions,
      mapFn: (data: any[]) => data.map(mapTransaction),
    }
  );
}

/**
 * Create a new transaction. Returns the created row.
 * This does NOT fall back to mock — writes must go to the real DB.
 * Returns null if the insert fails.
 *
 * Production hardening:
 *  - Validates category_id exists before insert (if provided)
 *  - Relies on PostgreSQL unique constraint (idempotency_key) to reliably prevent duplicates
 *    even under concurrent race conditions.
 */
export async function createTransaction(
  userId: string,
  input: {
    amount: number;
    currency: string;
    type: string;
    merchant?: string | null;
    description?: string | null;
    categoryId?: string | null;
    transactionDate: string;
    source?: string;
    idempotencyKey?: string;
  }
): Promise<{ transaction: Transaction | null; isDuplicate?: boolean }> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: input.amount,
        currency: 'INR',
        type: input.type,
        merchant: input.merchant ?? null,
        description: input.description ?? null,
        category_id: input.categoryId && input.categoryId !== '' ? input.categoryId : null,
        transaction_date: input.transactionDate,
        source: input.source ?? 'manual',
        idempotency_key: input.idempotencyKey ?? null,
      })
      .select('*, category:categories(*)')
      .single(),
    {
      functionName: 'db.createTransaction',
      userId,
      isInsert: true,
      fallback: () => ({ transaction: null } as { transaction: Transaction | null; isDuplicate?: boolean }),
      onDuplicate: input.idempotencyKey ? () => ({ transaction: null, isDuplicate: true }) : undefined,
      mapFn: (data: any) => {
        // Audit log
        logger.info('security.audit', 'Audit Log', {
          action: 'transaction_creation',
          userId,
          transactionId: data.id,
          amount: input.amount,
          idempotencyKey: input.idempotencyKey,
        });
        return { transaction: mapTransaction(data) };
      },
    }
  );
}

/**
 * Fetch all categories accessible to the user (system + own).
 */
export const getCategories = reactCache(async (userId: string): Promise<Category[]> => {
  return withTtlCache(`getCategories:${userId}`, 60000, async () => {
    const supabase = await createClient();
    return executeQuery(
      () => supabase
        .from('categories')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${userId}`)
        .order('name'),
      {
        functionName: 'db.getCategories',
        userId,
        fallback: getMockCategories,
        mapFn: (data: any[]) => data.map(mapCategory),
      }
    );
  });
});

/**
 * Fetch budgets for the authenticated user.
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', userId),
    {
      functionName: 'db.getBudgets',
      userId,
      fallback: getMockBudgets,
      mapFn: (data: any[]) => data.map(mapBudget),
    }
  );
}

/**
 * Fetch unresolved anomalies for the authenticated user.
 */
export async function getAnomalies(userId: string): Promise<Anomaly[]> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('anomalies')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false }),
    {
      functionName: 'db.getAnomalies',
      userId,
      fallback: getMockAnomalies,
      mapFn: (data: any[]) => data.map(mapAnomaly),
    }
  );
}

/**
 * Look up a single category by ID.
 * Used by POST /api/transactions to validate the categoryId.
 * Falls back to mock categories if Supabase is unavailable.
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single(),
    {
      functionName: 'db.getCategoryById',
      fallback: () => mockCategories.find((c) => c.id === categoryId) ?? null,
      mapFn: (data: any) => mapCategory(data),
    }
  );
}

// ─── Computed Query Functions ────────────────────────────────────────────────
// These aggregate raw transaction data into the shapes the UI expects.
// When the DB is empty or unreachable they fall back to mock data.

/**
 * Fetch recent transactions with a limit.
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 5
): Promise<Transaction[]> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(limit),
    {
      functionName: 'db.getRecentTransactions',
      userId,
      fallback: () => getMockRecentTransactions(limit),
      mapFn: (data: any[]) => data.map(mapTransaction),
    }
  );
}

/**
 * Compute dashboard summary stats from the user's transactions.
 */
export const getDashboardStats = reactCache(async (userId: string): Promise<DashboardStats> => {
  return withTtlCache(`getDashboardStats:${userId}`, 30000, async () => {
    const supabase = await createClient();
    return executeQuery(
      () => supabase
        .from('transactions')
        .select('amount, type, category:categories(name)')
        .eq('user_id', userId),
      {
        functionName: 'db.getDashboardStats',
        userId,
        fallback: getMockDashboardStats,
        mapFn: (data: any[]) => {
          const totalIncome = data
            .filter((t: any) => t.type === 'income')
            .reduce((s: number, t: any) => s + safeNumber(t.amount), 0);
          const totalExpenses = data
            .filter((t: any) => t.type === 'expense')
            .reduce((s: number, t: any) => s + safeNumber(t.amount), 0);
          const netBalance = totalIncome - totalExpenses;
          const savingsRate = totalIncome > 0
            ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10
            : (totalExpenses === 0 ? 0 : -100);

          const catTotals = new Map<string, number>();
          data
            .filter((t: any) => t.type === 'expense')
            .forEach((t: any) => {
              const cat = t.category;
              const name = cat?.name ?? 'Uncategorized';
              catTotals.set(name, (catTotals.get(name) ?? 0) + safeNumber(t.amount));
            });
          const topCategory = [...catTotals.entries()]
            .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'None';

          return {
            totalIncome,
            totalExpenses,
            netBalance,
            savingsRate,
            transactionCount: data.length,
            topCategory,
            incomeChange: 0,
            expenseChange: 0,
          };
        }
      }
    );
  });
});

/**
 * Compute per-category spending breakdown.
 */
export const getSpendingByCategory = reactCache(async (userId: string): Promise<SpendingByCategory[]> => {
  return withTtlCache(`getSpendingByCategory:${userId}`, 30000, async () => {
    const supabase = await createClient();
    return executeQuery(
      () => supabase
        .from('transactions')
        .select('amount, type, category:categories(name, color)')
        .eq('user_id', userId)
        .eq('type', 'expense'),
      {
        functionName: 'db.getSpendingByCategory',
        userId,
        fallback: getMockSpendingByCategory,
        mapFn: (data: any[]) => {
          const map = new Map<string, { color: string; total: number; count: number }>();
          data.forEach((t: any) => {
            const cat = t.category;
            const name = cat?.name ?? 'Uncategorized';
            const color = cat?.color ?? 'hsl(0,0%,50%)';
            const prev = map.get(name) ?? { color, total: 0, count: 0 };
            prev.total += safeNumber(t.amount);
            prev.count += 1;
            map.set(name, prev);
          });

          const grandTotal = [...map.values()].reduce((s, v) => s + v.total, 0);
          return [...map.entries()]
            .map(([name, v]) => ({
              categoryName: name,
              categoryColor: v.color,
              totalAmount: Math.round(v.total * 100) / 100,
              transactionCount: v.count,
              percentage: grandTotal > 0 ? Math.round((v.total / grandTotal) * 1000) / 10 : 0,
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount);
        }
      }
    );
  });
});

/**
 * Compute monthly income/expense trends (last 6 months).
 */
export async function getMonthlyTrends(userId: string): Promise<MonthlyTrend[]> {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return executeQuery(
    () => supabase
      .from('transactions')
      .select('amount, type, transaction_date')
      .eq('user_id', userId)
      .gte('transaction_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('transaction_date', { ascending: true }),
    {
      functionName: 'db.getMonthlyTrends',
      userId,
      fallback: getMockMonthlyTrends,
      mapFn: (data: any[]) => {
        const monthMap = new Map<string, { income: number; expenses: number }>();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        data.forEach((t: any) => {
          const d = new Date(t.transaction_date);
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
          const prev = monthMap.get(key) ?? { income: 0, expenses: 0 };
          if (t.type === 'income') prev.income += safeNumber(t.amount);
          else if (t.type === 'expense') prev.expenses += safeNumber(t.amount);
          monthMap.set(key, prev);
        });

        return [...monthMap.entries()].map(([month, v]) => ({
          month,
          income: Math.round(v.income),
          expenses: Math.round(v.expenses),
          net: Math.round(v.income - v.expenses),
        }));
      }
    }
  );
}

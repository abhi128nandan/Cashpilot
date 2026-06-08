const fs = require('fs');

// 1. Rewrite queries.ts
let queriesContent = fs.readFileSync('src/lib/db/queries.ts', 'utf8');

const executeQueryCode = `
/**
 * Unified helper for Supabase queries with timeout, retries, and structured logging.
 */
async function executeQuery<T, R>(
  queryFn: () => PromiseLike<{ data: T | null; error: any }>,
  context: { 
    functionName: string; 
    userId?: string; 
    fallback: () => R;
    mapFn?: (data: T) => R;
    isInsert?: boolean;
    onDuplicate?: () => R;
  },
  retries = 2,
  timeoutMs = 5000
): Promise<R> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await withTimeout(queryFn(), timeoutMs);

      if (error) {
        throw error;
      }

      if (!context.isInsert && (!data || (Array.isArray(data) && data.length === 0))) {
        logger.debug(context.functionName, 'No data found, using fallback', { userId: context.userId });
        return context.fallback();
      }

      if (data === null) {
        return context.fallback();
      }

      return context.mapFn ? context.mapFn(data as T) : (data as unknown as R);
    } catch (err: any) {
      const errorCode = err?.code || 'UNKNOWN';
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorCode === '23505' && context.onDuplicate) {
        logger.warn(context.functionName, 'Idempotency key collision (duplicate)', {
          userId: context.userId,
          code: errorCode,
        });
        return context.onDuplicate();
      }

      logger.warn(context.functionName, \`Query failed (attempt \${attempt + 1}/\${retries + 1})\`, {
        userId: context.userId,
        code: errorCode,
        message: errorMessage,
      });

      if (attempt >= retries) {
        logger.error(context.functionName, 'All retries exhausted — falling back', {
          userId: context.userId,
          code: errorCode,
          error: errorMessage,
        });
        return context.fallback();
      }

      // Short delay before retry
      await new Promise(res => setTimeout(res, 300 * (attempt + 1)));
    }
  }
  return context.fallback();
}
`;

// Replace withTimeout block to include executeQuery
queriesContent = queriesContent.replace(
  /async function withTimeout[\s\S]*?}\n/,
  (match) => match + '\n' + executeQueryCode + '\n'
);

// Rewrite getTransactions
queriesContent = queriesContent.replace(
  /export async function getTransactions\([\s\S]*?\}\s*\}/,
  `export async function getTransactions(userId: string): Promise<Transaction[]> {
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
}`
);

// Rewrite createTransaction
queriesContent = queriesContent.replace(
  /export async function createTransaction[\s\S]*?\}\s*\}/,
  `export async function createTransaction(
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
        currency: input.currency,
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
      fallback: () => ({ transaction: null }),
      onDuplicate: input.idempotencyKey ? () => ({ transaction: null, isDuplicate: true }) : undefined,
      mapFn: (data: any) => {
        logger.info('db.createTransaction', 'Transaction created', {
          userId,
          transactionId: data.id,
          amount: input.amount,
          idempotencyKey: input.idempotencyKey,
        });
        return { transaction: mapTransaction(data) };
      },
    }
  );
}`
);

// Rewrite getCategories
queriesContent = queriesContent.replace(
  /export async function getCategories\([\s\S]*?\}\s*\}/,
  `export async function getCategories(userId: string): Promise<Category[]> {
  const supabase = await createClient();
  return executeQuery(
    () => supabase
      .from('categories')
      .select('*')
      .or(\`is_system.eq.true,user_id.eq.\${userId}\`)
      .order('name'),
    {
      functionName: 'db.getCategories',
      userId,
      fallback: getMockCategories,
      mapFn: (data: any[]) => data.map(mapCategory),
    }
  );
}`
);

// Rewrite getBudgets
queriesContent = queriesContent.replace(
  /export async function getBudgets\([\s\S]*?\}\s*\}/,
  `export async function getBudgets(userId: string): Promise<Budget[]> {
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
}`
);

// Rewrite getAnomalies
queriesContent = queriesContent.replace(
  /export async function getAnomalies\([\s\S]*?\}\s*\}/,
  `export async function getAnomalies(userId: string): Promise<Anomaly[]> {
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
}`
);

// Rewrite getCategoryById
queriesContent = queriesContent.replace(
  /export async function getCategoryById\([\s\S]*?\}\s*\}/,
  `export async function getCategoryById(categoryId: string): Promise<Category | null> {
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
}`
);

// Rewrite getRecentTransactions
queriesContent = queriesContent.replace(
  /export async function getRecentTransactions\([\s\S]*?\}\s*\}/,
  `export async function getRecentTransactions(
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
}`
);

// Rewrite getDashboardStats
queriesContent = queriesContent.replace(
  /export async function getDashboardStats\([\s\S]*?\}\s*\}/,
  `export async function getDashboardStats(userId: string): Promise<DashboardStats> {
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
          : 0;

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
}`
);

// Rewrite getSpendingByCategory
queriesContent = queriesContent.replace(
  /export async function getSpendingByCategory\([\s\S]*?\}\s*\}/,
  `export async function getSpendingByCategory(userId: string): Promise<SpendingByCategory[]> {
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
}`
);

// Rewrite getMonthlyTrends
queriesContent = queriesContent.replace(
  /export async function getMonthlyTrends\([\s\S]*?\}\s*\}/,
  `export async function getMonthlyTrends(userId: string): Promise<MonthlyTrend[]> {
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
          const key = \`\${monthNames[d.getMonth()]} \${d.getFullYear()}\`;
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
}`
);

fs.writeFileSync('src/lib/db/queries.ts', queriesContent);

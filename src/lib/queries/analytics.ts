import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, SpendingByCategory, MonthlyTrend } from '@/types';

function safeNumber(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, category:categories(name)')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      savingsRate: 0,
      transactionCount: 0,
      topCategory: 'None',
      incomeChange: 0,
      expenseChange: 0,
    };
  }

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

export async function getSpendingByCategory(userId: string): Promise<SpendingByCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, category:categories(name, color)')
    .eq('user_id', userId)
    .eq('type', 'expense');

  if (error || !data) {
    console.error('Error fetching spending by category:', error);
    return [];
  }

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

export async function getMonthlyTrends(userId: string): Promise<MonthlyTrend[]> {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', sixMonthsAgo.toISOString().split('T')[0])
    .order('transaction_date', { ascending: true });

  if (error || !data) {
    console.error('Error fetching monthly trends:', error);
    return [];
  }

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

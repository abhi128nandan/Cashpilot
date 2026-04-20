/**
 * Type definitions for the application.
 * These types represent the shape of data used across components,
 * decoupled from the database schema for flexibility.
 */

export type TransactionType = 'income' | 'expense' | 'transfer';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  type: TransactionType;
  merchant: string | null;
  description: string | null;
  transactionDate: string;
  source: 'manual' | 'csv' | 'plaid';
  category?: Category | null;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  limitAmount: number;
  period: BudgetPeriod;
  spentAmount: number;
  periodStart: string;
  periodEnd: string;
  category?: Category | null;
}

export interface Anomaly {
  id: string;
  userId: string;
  transactionId: string | null;
  severity: AnomalySeverity;
  description: string;
  isResolved: boolean;
  detectedAt: string;
  transaction?: Transaction | null;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string | null;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface SpendingByCategory {
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  topCategory: string;
  incomeChange: number;
  expenseChange: number;
}

// Server Action return type
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

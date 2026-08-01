import {
  Transaction,
  Category,
  Budget,
  DashboardStats,
  MonthlyTrend,
  SpendingByCategory,
  AIConversation,
} from '@/types';

const USER_ID = 'demo_alex_carter';

export const demoUser = {
  id: USER_ID,
  email: 'alex.carter@example.com',
  name: 'Alex Carter',
  role: 'user' as const,
  avatarUrl: null,
  subscriptionTier: 'pro' as const,
  createdAt: '2025-01-01T00:00:00Z',
};

export const demoCategories: Record<string, Category> = {
  salary: { id: 'c1', userId: USER_ID, name: 'Salary', icon: '💰', color: '#10B981', isSystem: true },
  rent: { id: 'c2', userId: USER_ID, name: 'Housing', icon: '🏠', color: '#6366F1', isSystem: true },
  dining: { id: 'c3', userId: USER_ID, name: 'Dining', icon: '🍽️', color: '#F59E0B', isSystem: true },
  subscriptions: { id: 'c4', userId: USER_ID, name: 'Subscriptions', icon: '🔄', color: '#8B5CF6', isSystem: true },
  groceries: { id: 'c5', userId: USER_ID, name: 'Groceries', icon: '🛒', color: '#14B8A6', isSystem: true },
  transport: { id: 'c6', userId: USER_ID, name: 'Transport', icon: '🚗', color: '#F43F5E', isSystem: true },
};

export const demoTransactions: Transaction[] = [
  // Current Month
  {
    id: 't1',
    userId: USER_ID,
    categoryId: 'c1',
    amount: 185000,
    currency: 'INR',
    type: 'income',
    merchant: 'TechCorp India Pvt Ltd',
    description: 'Monthly Salary',
    transactionDate: new Date(new Date().setDate(1)).toISOString(),
    source: 'plaid',
    category: demoCategories.salary,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    userId: USER_ID,
    categoryId: 'c2',
    amount: 45000,
    currency: 'INR',
    type: 'expense',
    merchant: 'Skyline Apartments',
    description: 'Rent',
    transactionDate: new Date(new Date().setDate(2)).toISOString(),
    source: 'plaid',
    category: demoCategories.rent,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    userId: USER_ID,
    categoryId: 'c4',
    amount: 1990,
    currency: 'INR',
    type: 'expense',
    merchant: 'GitHub Copilot',
    description: 'Annual Subscription',
    transactionDate: new Date(new Date().setDate(3)).toISOString(),
    source: 'plaid',
    category: demoCategories.subscriptions,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    userId: USER_ID,
    categoryId: 'c4',
    amount: 1950,
    currency: 'INR',
    type: 'expense',
    merchant: 'ChatGPT Plus',
    description: 'Monthly Subscription',
    transactionDate: new Date(new Date().setDate(4)).toISOString(),
    source: 'plaid',
    category: demoCategories.subscriptions,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't5',
    userId: USER_ID,
    categoryId: 'c3',
    amount: 3200,
    currency: 'INR',
    type: 'expense',
    merchant: 'Social Offline',
    description: 'Weekend Dining',
    transactionDate: new Date(new Date().setDate(6)).toISOString(),
    source: 'plaid',
    category: demoCategories.dining,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't6',
    userId: USER_ID,
    categoryId: 'c5',
    amount: 5400,
    currency: 'INR',
    type: 'expense',
    merchant: 'Nature\'s Basket',
    description: 'Weekly Groceries',
    transactionDate: new Date(new Date().setDate(8)).toISOString(),
    source: 'plaid',
    category: demoCategories.groceries,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't7',
    userId: USER_ID,
    categoryId: 'c6',
    amount: 850,
    currency: 'INR',
    type: 'expense',
    merchant: 'Uber',
    description: 'Office Commute',
    transactionDate: new Date(new Date().setDate(10)).toISOString(),
    source: 'plaid',
    category: demoCategories.transport,
    createdAt: new Date().toISOString(),
  },
];

export const demoBudgets: Budget[] = [
  {
    id: 'b1',
    userId: USER_ID,
    categoryId: 'c3',
    limitAmount: 15000,
    period: 'monthly',
    spentAmount: 3200,
    periodStart: new Date(new Date().setDate(1)).toISOString(),
    periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString(),
    category: demoCategories.dining,
  },
  {
    id: 'b2',
    userId: USER_ID,
    categoryId: 'c5',
    limitAmount: 20000,
    period: 'monthly',
    spentAmount: 5400,
    periodStart: new Date(new Date().setDate(1)).toISOString(),
    periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString(),
    category: demoCategories.groceries,
  },
];

export const demoDashboardStats: DashboardStats = {
  totalIncome: 185000,
  totalExpenses: 58390,
  netBalance: 126610,
  savingsRate: 68.4,
  transactionCount: 7,
  topCategory: 'Housing',
  incomeChange: 2.1,
  expenseChange: -5.4,
};

export const demoMonthlyTrends: MonthlyTrend[] = [
  { month: 'Mar', income: 185000, expenses: 142000, net: 43000 },
  { month: 'Apr', income: 185000, expenses: 138000, net: 47000 },
  { month: 'May', income: 185000, expenses: 155000, net: 30000 },
  { month: 'Jun', income: 185000, expenses: 131000, net: 54000 },
  { month: 'Jul', income: 185000, expenses: 129000, net: 56000 },
  { month: 'Aug', income: 185000, expenses: 58390, net: 126610 },
];

export const demoSpendingByCategory: SpendingByCategory[] = [
  { categoryName: 'Housing', categoryColor: '#6366F1', totalAmount: 45000, transactionCount: 1, percentage: 77 },
  { categoryName: 'Groceries', categoryColor: '#14B8A6', totalAmount: 5400, transactionCount: 1, percentage: 9 },
  { categoryName: 'Dining', categoryColor: '#F59E0B', totalAmount: 3200, transactionCount: 1, percentage: 5 },
  { categoryName: 'Subscriptions', categoryColor: '#8B5CF6', totalAmount: 3940, transactionCount: 2, percentage: 7 },
  { categoryName: 'Transport', categoryColor: '#F43F5E', totalAmount: 850, transactionCount: 1, percentage: 2 },
];

export const demoAIConversation: AIConversation = {
  id: 'chat_1',
  userId: USER_ID,
  title: 'Can I afford a MacBook Pro?',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'm1',
      role: 'user',
      content: 'Can I afford a ₹1,40,000 MacBook Pro this month?',
      createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 5)).toISOString(),
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'Based on your current cash flow, yes! You have a net balance of ₹1,26,610 this month, and your historical average savings rate is 25%. However, purchasing it immediately would dip into your baseline emergency reserves.\n\nI recommend saving ₹35,000 per month for the next 4 months to purchase it comfortably without affecting your SIP investments.',
      createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 4)).toISOString(),
    },
  ],
};

export const demoAnomalies = [
  {
    id: 'a1',
    userId: USER_ID,
    transactionId: 't3',
    severity: 'medium' as const,
    description: 'New recurring charge detected: GitHub Copilot.',
    isResolved: false,
    detectedAt: new Date().toISOString(),
    transaction: demoTransactions[2],
  },
  {
    id: 'a2',
    userId: USER_ID,
    transactionId: null,
    severity: 'high' as const,
    description: 'AWS Cloud charge is 40% higher than last month.',
    isResolved: false,
    detectedAt: new Date().toISOString(),
  }
];

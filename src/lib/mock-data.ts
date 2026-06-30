/**
 * Mock data layer for CashPilot MVP.
 * 
 * This replaces a real database during development. All data is generated
 * deterministically so the UI is populated with realistic fintech data.
 * When Supabase tables are fully populated, swap these functions
 * for actual Supabase queries — the interfaces are identical.
 */
import type {
  User,
  Transaction,
  Category,
  Budget,
  Anomaly,
  DashboardStats,
  SpendingByCategory,
  MonthlyTrend,
} from '@/types';

// ─── Mock User ───────────────────────────────────────────────
export const mockUser: User = {
  id: 'usr_01HQXYZ',
  email: 'alex@cashpilot.io',
  name: 'Alex Morgan',
  role: 'user',
  avatarUrl: null,
  subscriptionTier: 'pro',
  createdAt: '2024-01-15T08:00:00Z',
};

// ─── Mock Categories ─────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: 'cat_01', userId: null, name: 'Housing', icon: '🏠', color: 'hsl(225, 82%, 52%)', isSystem: true },
  { id: 'cat_02', userId: null, name: 'Food & Dining', icon: '🍕', color: 'hsl(38, 92%, 50%)', isSystem: true },
  { id: 'cat_03', userId: null, name: 'Transportation', icon: '🚗', color: 'hsl(160, 78%, 42%)', isSystem: true },
  { id: 'cat_04', userId: null, name: 'Entertainment', icon: '🎬', color: 'hsl(280, 70%, 55%)', isSystem: true },
  { id: 'cat_05', userId: null, name: 'Shopping', icon: '🛍️', color: 'hsl(340, 75%, 55%)', isSystem: true },
  { id: 'cat_06', userId: null, name: 'Healthcare', icon: '💊', color: 'hsl(0, 78%, 54%)', isSystem: true },
  { id: 'cat_07', userId: null, name: 'Utilities', icon: '⚡', color: 'hsl(200, 70%, 50%)', isSystem: true },
  { id: 'cat_08', userId: null, name: 'Salary', icon: '💰', color: 'hsl(130, 65%, 45%)', isSystem: true },
  { id: 'cat_09', userId: null, name: 'Freelance', icon: '💻', color: 'hsl(170, 60%, 45%)', isSystem: true },
  { id: 'cat_10', userId: null, name: 'Investments', icon: '📈', color: 'hsl(45, 80%, 50%)', isSystem: true },
  { id: 'cat_11', userId: null, name: 'Subscriptions', icon: '📱', color: 'hsl(260, 65%, 55%)', isSystem: true },
  { id: 'cat_12', userId: null, name: 'Travel', icon: '✈️', color: 'hsl(190, 70%, 50%)', isSystem: true },
];

// ─── Mock Transactions ───────────────────────────────────────
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_001', userId: mockUser.id, categoryId: 'cat_08', amount: 8500.00, currency: 'USD',
    type: 'income', merchant: 'TechCorp Inc.', description: 'Monthly salary',
    transactionDate: '2024-03-01', source: 'manual', createdAt: '2024-03-01T09:00:00Z',
    category: mockCategories[7],
  },
  {
    id: 'txn_002', userId: mockUser.id, categoryId: 'cat_09', amount: 2400.00, currency: 'USD',
    type: 'income', merchant: 'ClientX', description: 'Web development project',
    transactionDate: '2024-03-05', source: 'manual', createdAt: '2024-03-05T14:30:00Z',
    category: mockCategories[8],
  },
  {
    id: 'txn_003', userId: mockUser.id, categoryId: 'cat_01', amount: 2200.00, currency: 'USD',
    type: 'expense', merchant: 'Sunrise Apartments', description: 'Monthly rent',
    transactionDate: '2024-03-01', source: 'manual', createdAt: '2024-03-01T08:00:00Z',
    category: mockCategories[0],
  },
  {
    id: 'txn_004', userId: mockUser.id, categoryId: 'cat_02', amount: 67.50, currency: 'USD',
    type: 'expense', merchant: 'Whole Foods Market', description: 'Weekly groceries',
    transactionDate: '2024-03-02', source: 'csv', createdAt: '2024-03-02T17:45:00Z',
    category: mockCategories[1],
  },
  {
    id: 'txn_005', userId: mockUser.id, categoryId: 'cat_03', amount: 45.00, currency: 'USD',
    type: 'expense', merchant: 'Shell Gas Station', description: 'Gas fill-up',
    transactionDate: '2024-03-03', source: 'csv', createdAt: '2024-03-03T11:20:00Z',
    category: mockCategories[2],
  },
  {
    id: 'txn_006', userId: mockUser.id, categoryId: 'cat_11', amount: 14.99, currency: 'USD',
    type: 'expense', merchant: 'Netflix', description: 'Monthly subscription',
    transactionDate: '2024-03-04', source: 'csv', createdAt: '2024-03-04T00:00:00Z',
    category: mockCategories[10],
  },
  {
    id: 'txn_007', userId: mockUser.id, categoryId: 'cat_02', amount: 42.80, currency: 'USD',
    type: 'expense', merchant: 'Olive Garden', description: 'Dinner with friends',
    transactionDate: '2024-03-06', source: 'manual', createdAt: '2024-03-06T20:15:00Z',
    category: mockCategories[1],
  },
  {
    id: 'txn_008', userId: mockUser.id, categoryId: 'cat_05', amount: 189.99, currency: 'USD',
    type: 'expense', merchant: 'Amazon', description: 'Noise-cancelling headphones',
    transactionDate: '2024-03-07', source: 'csv', createdAt: '2024-03-07T09:30:00Z',
    category: mockCategories[4],
  },
  {
    id: 'txn_009', userId: mockUser.id, categoryId: 'cat_07', amount: 148.32, currency: 'USD',
    type: 'expense', merchant: 'City Power & Gas', description: 'Electric bill',
    transactionDate: '2024-03-08', source: 'manual', createdAt: '2024-03-08T10:00:00Z',
    category: mockCategories[6],
  },
  {
    id: 'txn_010', userId: mockUser.id, categoryId: 'cat_04', amount: 32.00, currency: 'USD',
    type: 'expense', merchant: 'AMC Theaters', description: 'Movie night',
    transactionDate: '2024-03-09', source: 'manual', createdAt: '2024-03-09T19:00:00Z',
    category: mockCategories[3],
  },
  {
    id: 'txn_011', userId: mockUser.id, categoryId: 'cat_06', amount: 25.00, currency: 'USD',
    type: 'expense', merchant: 'CVS Pharmacy', description: 'Prescriptions',
    transactionDate: '2024-03-10', source: 'csv', createdAt: '2024-03-10T15:30:00Z',
    category: mockCategories[5],
  },
  {
    id: 'txn_012', userId: mockUser.id, categoryId: 'cat_10', amount: 500.00, currency: 'USD',
    type: 'expense', merchant: 'Vanguard', description: 'Monthly investment contribution',
    transactionDate: '2024-03-11', source: 'manual', createdAt: '2024-03-11T08:00:00Z',
    category: mockCategories[9],
  },
  {
    id: 'txn_013', userId: mockUser.id, categoryId: 'cat_02', amount: 12.50, currency: 'USD',
    type: 'expense', merchant: 'Starbucks', description: 'Coffee and pastry',
    transactionDate: '2024-03-12', source: 'csv', createdAt: '2024-03-12T07:45:00Z',
    category: mockCategories[1],
  },
  {
    id: 'txn_014', userId: mockUser.id, categoryId: 'cat_12', amount: 350.00, currency: 'USD',
    type: 'expense', merchant: 'United Airlines', description: 'Flight booking to NYC',
    transactionDate: '2024-03-13', source: 'manual', createdAt: '2024-03-13T16:00:00Z',
    category: mockCategories[11],
  },
  {
    id: 'txn_015', userId: mockUser.id, categoryId: 'cat_11', amount: 9.99, currency: 'USD',
    type: 'expense', merchant: 'Spotify', description: 'Music subscription',
    transactionDate: '2024-03-14', source: 'csv', createdAt: '2024-03-14T00:00:00Z',
    category: mockCategories[10],
  },
];

// ─── Mock Dashboard Stats ────────────────────────────────────
export const mockDashboardStats: DashboardStats = {
  totalIncome: 10900.00,
  totalExpenses: 3638.09,
  netBalance: 7261.91,
  savingsRate: 66.6,
  transactionCount: 15,
  topCategory: 'Housing',
  incomeChange: 12.5,
  expenseChange: -8.3,
};

// ─── Mock Spending by Category ───────────────────────────────
export const mockSpendingByCategory: SpendingByCategory[] = [
  { categoryName: 'Housing', categoryColor: 'hsl(225, 82%, 52%)', totalAmount: 2200.00, transactionCount: 1, percentage: 60.5 },
  { categoryName: 'Investments', categoryColor: 'hsl(45, 80%, 50%)', totalAmount: 500.00, transactionCount: 1, percentage: 13.7 },
  { categoryName: 'Travel', categoryColor: 'hsl(190, 70%, 50%)', totalAmount: 350.00, transactionCount: 1, percentage: 9.6 },
  { categoryName: 'Shopping', categoryColor: 'hsl(340, 75%, 55%)', totalAmount: 189.99, transactionCount: 1, percentage: 5.2 },
  { categoryName: 'Utilities', categoryColor: 'hsl(200, 70%, 50%)', totalAmount: 148.32, transactionCount: 1, percentage: 4.1 },
  { categoryName: 'Food & Dining', categoryColor: 'hsl(38, 92%, 50%)', totalAmount: 122.80, transactionCount: 3, percentage: 3.4 },
  { categoryName: 'Transportation', categoryColor: 'hsl(160, 78%, 42%)', totalAmount: 45.00, transactionCount: 1, percentage: 1.2 },
  { categoryName: 'Entertainment', categoryColor: 'hsl(280, 70%, 55%)', totalAmount: 32.00, transactionCount: 1, percentage: 0.9 },
  { categoryName: 'Subscriptions', categoryColor: 'hsl(260, 65%, 55%)', totalAmount: 24.98, transactionCount: 2, percentage: 0.7 },
  { categoryName: 'Healthcare', categoryColor: 'hsl(0, 78%, 54%)', totalAmount: 25.00, transactionCount: 1, percentage: 0.7 },
];

// ─── Mock Monthly Trends ─────────────────────────────────────
export const mockMonthlyTrends: MonthlyTrend[] = [
  { month: 'Oct 2023', income: 8500, expenses: 4200, net: 4300 },
  { month: 'Nov 2023', income: 9200, expenses: 3800, net: 5400 },
  { month: 'Dec 2023', income: 11000, expenses: 5500, net: 5500 },
  { month: 'Jan 2024', income: 8500, expenses: 3900, net: 4600 },
  { month: 'Feb 2024', income: 9700, expenses: 4100, net: 5600 },
  { month: 'Mar 2024', income: 10900, expenses: 3638, net: 7262 },
];

// ─── Mock Budgets ────────────────────────────────────────────
export const mockBudgets: Budget[] = [
  {
    id: 'bgt_01', userId: mockUser.id, categoryId: 'cat_02',
    limitAmount: 400, period: 'monthly', spentAmount: 122.80,
    periodStart: '2024-03-01', periodEnd: '2024-03-31',
    category: mockCategories[1],
  },
  {
    id: 'bgt_02', userId: mockUser.id, categoryId: 'cat_04',
    limitAmount: 150, period: 'monthly', spentAmount: 32.00,
    periodStart: '2024-03-01', periodEnd: '2024-03-31',
    category: mockCategories[3],
  },
  {
    id: 'bgt_03', userId: mockUser.id, categoryId: 'cat_05',
    limitAmount: 300, period: 'monthly', spentAmount: 189.99,
    periodStart: '2024-03-01', periodEnd: '2024-03-31',
    category: mockCategories[4],
  },
  {
    id: 'bgt_04', userId: mockUser.id, categoryId: 'cat_03',
    limitAmount: 200, period: 'monthly', spentAmount: 45.00,
    periodStart: '2024-03-01', periodEnd: '2024-03-31',
    category: mockCategories[2],
  },
];

// ─── Mock Anomalies ──────────────────────────────────────────
export const mockAnomalies: Anomaly[] = [
  {
    id: 'ano_01', userId: mockUser.id, transactionId: 'txn_008',
    severity: 'medium',
    description: 'Unusual purchase at Amazon ($189.99) — 3x higher than your average shopping transaction',
    isResolved: false, detectedAt: '2024-03-07T09:35:00Z',
  },
  {
    id: 'ano_02', userId: mockUser.id, transactionId: 'txn_014',
    severity: 'low',
    description: 'New merchant detected: United Airlines. First transaction with this merchant.',
    isResolved: false, detectedAt: '2024-03-13T16:05:00Z',
  },
];

// ─── Data Access Functions (mock DB queries) ─────────────────
export async function getUser(): Promise<User> {
  return mockUser;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return mockDashboardStats;
}

export async function getTransactions(): Promise<Transaction[]> {
  return [...mockTransactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
}

export async function getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
  const sorted = [...mockTransactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
  return sorted.slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  return mockCategories;
}

export async function getSpendingByCategory(): Promise<SpendingByCategory[]> {
  return mockSpendingByCategory;
}

export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  return mockMonthlyTrends;
}

export async function getBudgets(): Promise<Budget[]> {
  return mockBudgets;
}

export async function getAnomalies(): Promise<Anomaly[]> {
  return mockAnomalies;
}

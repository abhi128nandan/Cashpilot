/**
 * Zod validation schemas for transaction-related inputs.
 * Shared between server actions and client-side form validation.
 */
import { z } from 'zod';

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

export const createTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  type: transactionTypeEnum,
  merchant: z.string().min(1, 'Merchant is required').max(255).optional(),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid('Invalid category').optional().or(z.literal('')),
  transactionDate: z.coerce.date(),
  currency: z.string().length(3).default('USD'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial();
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFilterSchema = z.object({
  type: transactionTypeEnum.optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['transactionDate', 'amount', 'merchant', 'createdAt']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;

/**
 * Zod validation schemas for transaction-related inputs.
 * Shared between server actions and client-side form validation.
 */
import { z } from 'zod';

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

export const baseTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  type: transactionTypeEnum,
  merchant: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid('Invalid category').optional().or(z.literal('')),
  transactionDate: z.coerce.date().refine(
    (date) => date <= new Date(Date.now() + 86400000),
    'Transaction date cannot be in the future'
  ),
  currency: z.string().length(3).default('INR'),
  idempotencyKey: z.string().max(128, 'Idempotency key too long').optional(),
});

export const createTransactionSchema = baseTransactionSchema.superRefine((data, ctx) => {
  if (data.type === 'expense' && (!data.categoryId || data.categoryId.trim() === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Category is required for expenses", path: ["categoryId"] });
  }
  if (data.type === 'income' && (!data.merchant || data.merchant.trim() === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Income source is required", path: ["merchant"] });
  }
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = baseTransactionSchema.partial();
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

import { z } from 'zod';
import { transactionTypeEnum } from './transaction';

export const recurringFrequencyEnum = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
export const recurringStatusEnum = z.enum(['active', 'paused', 'archived']);

export type RecurringFrequency = z.infer<typeof recurringFrequencyEnum>;
export type RecurringStatus = z.infer<typeof recurringStatusEnum>;

export const baseRecurringSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount is too large'),
  type: transactionTypeEnum,
  currency: z.string().length(3).default('INR'),
  merchant: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid('Invalid category').optional().or(z.literal('')),
  frequency: recurringFrequencyEnum,
  startDate: z.coerce.date(),
  nextDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

export const createRecurringSchema = baseRecurringSchema.superRefine((data, ctx) => {
  if (data.type === 'expense' && (!data.categoryId || data.categoryId.trim() === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Category is required for expenses", path: ["categoryId"] });
  }
  if (data.type === 'income' && (!data.merchant || data.merchant.trim() === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Income source is required", path: ["merchant"] });
  }
  
  const start = new Date(data.startDate);
  start.setHours(0, 0, 0, 0);
  
  const next = new Date(data.nextDate);
  next.setHours(0, 0, 0, 0);
  
  if (next < start) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Next date must be on or after start date", path: ["nextDate"] });
  }
  
  if (data.endDate) {
    const end = new Date(data.endDate);
    end.setHours(0, 0, 0, 0);
    if (end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date", path: ["endDate"] });
    }
  }
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;

export const updateRecurringSchema = baseRecurringSchema.partial().extend({
  status: recurringStatusEnum.optional(),
});

export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;

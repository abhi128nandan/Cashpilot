import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid('Please select a category'),
  limitAmount: z.coerce
    .number()
    .positive('Budget limit must be positive')
    .max(999999999.99, 'Amount is too large'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

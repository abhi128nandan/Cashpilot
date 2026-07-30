import { 
  getRecurringTransactions as dbGetRecurringTransactions, 
  getRecurringTransactionById as dbGetRecurringTransactionById,
  createRecurringTransactionRule, 
  updateRecurringTransactionRule,
  archiveRecurringTransactionRule,
  invalidateUserCache
} from '@/lib/db/queries';
import { createRecurringSchema, type CreateRecurringInput, type UpdateRecurringInput } from '@/lib/validators/recurring';
import { ValidationError, NotFoundError, AppError } from '@/lib/utils/errors';
import type { RecurringTransaction } from '@/types';
import { logger } from '@/lib/utils/logger';

export async function getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
  return dbGetRecurringTransactions(userId);
}

export async function getRecurringTransactionById(id: string, userId: string): Promise<RecurringTransaction> {
  const data = await dbGetRecurringTransactionById(id, userId);
  
  if (!data) {
    throw new NotFoundError('Recurring transaction');
  }
  
  return data;
}

export async function createRecurringTransaction(userId: string, input: CreateRecurringInput): Promise<RecurringTransaction> {
  const result = await createRecurringTransactionRule(userId, {
    amount: input.amount,
    currency: input.currency,
    type: input.type,
    frequency: input.frequency,
    startDate: input.startDate.toISOString(),
    nextDate: input.nextDate.toISOString(),
    endDate: input.endDate ? input.endDate.toISOString() : null,
    merchant: input.merchant,
    description: input.description,
    categoryId: input.categoryId,
  });
  
  if (!result) {
    throw new AppError('Failed to create recurring transaction', 500);
  }
  
  invalidateUserCache(userId);
  logger.info('recurring.service', 'Recurring rule created', { userId, ruleId: result.id });
  
  return result;
}

export async function updateRecurringTransaction(id: string, userId: string, validatedPartialData: UpdateRecurringInput): Promise<RecurringTransaction> {
  // Fetch existing record to merge and validate cross-field business rules
  const existing = await dbGetRecurringTransactionById(id, userId);
  if (!existing) {
    throw new NotFoundError('Recurring transaction');
  }
  
  // Merge existing and updates for strict validation
  const mergedForValidation = {
    amount: validatedPartialData.amount ?? existing.amount,
    type: validatedPartialData.type ?? existing.type,
    currency: validatedPartialData.currency ?? existing.currency,
    merchant: validatedPartialData.merchant !== undefined ? validatedPartialData.merchant ?? undefined : existing.merchant ?? undefined,
    description: validatedPartialData.description !== undefined ? validatedPartialData.description ?? undefined : existing.description ?? undefined,
    categoryId: validatedPartialData.categoryId !== undefined ? (validatedPartialData.categoryId === null ? '' : validatedPartialData.categoryId) : existing.categoryId ?? '',
    frequency: validatedPartialData.frequency ?? existing.frequency,
    startDate: validatedPartialData.startDate ?? new Date(existing.startDate),
    nextDate: validatedPartialData.nextDate ?? new Date(existing.nextDate),
    endDate: validatedPartialData.endDate !== undefined ? validatedPartialData.endDate : (existing.endDate ? new Date(existing.endDate) : null),
  };

  const strictParse = createRecurringSchema.safeParse(mergedForValidation);
  if (!strictParse.success) {
    throw new ValidationError(strictParse.error.flatten().fieldErrors);
  }
  
  const result = await updateRecurringTransactionRule(id, userId, {
    amount: validatedPartialData.amount,
    currency: validatedPartialData.currency,
    type: validatedPartialData.type,
    frequency: validatedPartialData.frequency,
    startDate: validatedPartialData.startDate ? validatedPartialData.startDate.toISOString() : undefined,
    nextDate: validatedPartialData.nextDate ? validatedPartialData.nextDate.toISOString() : undefined,
    endDate: validatedPartialData.endDate !== undefined ? (validatedPartialData.endDate ? validatedPartialData.endDate.toISOString() : null) : undefined,
    merchant: validatedPartialData.merchant,
    description: validatedPartialData.description,
    categoryId: validatedPartialData.categoryId,
    status: validatedPartialData.status,
  });
  
  if (!result) {
    throw new NotFoundError('Recurring transaction');
  }
  
  invalidateUserCache(userId);
  logger.info('recurring.service', 'Recurring rule updated', { userId, ruleId: result.id });
  
  return result;
}

export async function archiveRecurringTransaction(id: string, userId: string): Promise<{ success: boolean }> {
  const success = await archiveRecurringTransactionRule(id, userId);
  
  if (!success) {
    throw new NotFoundError('Recurring transaction');
  }
  
  invalidateUserCache(userId);
  logger.info('recurring.service', 'Recurring rule archived', { userId, ruleId: id });
  
  return { success: true };
}

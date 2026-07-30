'use server';

import { requireAuth } from '@/lib/auth/guard';
import { 
  getRecurringTransactions as dbGetRecurringTransactions, 
  getRecurringTransactionById as dbGetRecurringTransactionById,
  createRecurringTransactionRule, 
  updateRecurringTransactionRule,
  archiveRecurringTransactionRule,
  invalidateUserCache
} from '@/lib/db/queries';
import { 
  createRecurringSchema, 
  updateRecurringSchema, 
  type CreateRecurringInput, 
  type UpdateRecurringInput 
} from '@/lib/validators/recurring';
import { ValidationError, NotFoundError, toErrorResponse, AppError } from '@/lib/utils/errors';
import type { ActionResult, RecurringTransaction } from '@/types';
import { logger } from '@/lib/utils/logger';

export async function getRecurringTransactions(): Promise<ActionResult<RecurringTransaction[]>> {
  try {
    const user = await requireAuth();
    const data = await dbGetRecurringTransactions(user.id);
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}

export async function getRecurringTransactionById(id: string): Promise<ActionResult<RecurringTransaction>> {
  try {
    const user = await requireAuth();
    const data = await dbGetRecurringTransactionById(id, user.id);
    
    if (!data) {
      throw new NotFoundError('Recurring transaction');
    }
    
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}

export async function createRecurringTransaction(input: CreateRecurringInput): Promise<ActionResult<RecurringTransaction>> {
  try {
    const user = await requireAuth();
    
    const parseResult = createRecurringSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      throw new ValidationError(fieldErrors);
    }
    
    const validatedData = parseResult.data;
    
    const result = await createRecurringTransactionRule(user.id, {
      amount: validatedData.amount,
      currency: validatedData.currency,
      type: validatedData.type,
      frequency: validatedData.frequency,
      startDate: validatedData.startDate.toISOString(),
      nextDate: validatedData.nextDate.toISOString(),
      endDate: validatedData.endDate ? validatedData.endDate.toISOString() : null,
      merchant: validatedData.merchant,
      description: validatedData.description,
      categoryId: validatedData.categoryId,
    });
    
    if (!result) {
      throw new AppError('Failed to create recurring transaction', 500);
    }
    
    invalidateUserCache(user.id);
    logger.info('recurring.service', 'Recurring rule created', { userId: user.id, ruleId: result.id });
    
    return { success: true, data: result };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message, fieldErrors: error instanceof ValidationError ? error.fieldErrors : undefined };
  }
}

export async function updateRecurringTransaction(id: string, input: UpdateRecurringInput): Promise<ActionResult<RecurringTransaction>> {
  try {
    const user = await requireAuth();
    
    // Validate basic types of incoming payload
    const partialParse = updateRecurringSchema.safeParse(input);
    if (!partialParse.success) {
      throw new ValidationError(partialParse.error.flatten().fieldErrors);
    }
    
    const validatedData = partialParse.data;

    // Fetch existing record to merge and validate cross-field business rules
    const existing = await dbGetRecurringTransactionById(id, user.id);
    if (!existing) {
      throw new NotFoundError('Recurring transaction');
    }
    
    // Merge existing and updates for strict validation
    const mergedForValidation = {
      amount: validatedData.amount ?? existing.amount,
      type: validatedData.type ?? existing.type,
      currency: validatedData.currency ?? existing.currency,
      merchant: validatedData.merchant !== undefined ? validatedData.merchant ?? undefined : existing.merchant ?? undefined,
      description: validatedData.description !== undefined ? validatedData.description ?? undefined : existing.description ?? undefined,
      categoryId: validatedData.categoryId !== undefined ? (validatedData.categoryId === null ? '' : validatedData.categoryId) : existing.categoryId ?? '',
      frequency: validatedData.frequency ?? existing.frequency,
      startDate: validatedData.startDate ?? new Date(existing.startDate),
      nextDate: validatedData.nextDate ?? new Date(existing.nextDate),
      endDate: validatedData.endDate !== undefined ? validatedData.endDate : (existing.endDate ? new Date(existing.endDate) : null),
    };

    const strictParse = createRecurringSchema.safeParse(mergedForValidation);
    if (!strictParse.success) {
      throw new ValidationError(strictParse.error.flatten().fieldErrors);
    }
    
    const result = await updateRecurringTransactionRule(id, user.id, {
      amount: validatedData.amount,
      currency: validatedData.currency,
      type: validatedData.type,
      frequency: validatedData.frequency,
      startDate: validatedData.startDate ? validatedData.startDate.toISOString() : undefined,
      nextDate: validatedData.nextDate ? validatedData.nextDate.toISOString() : undefined,
      endDate: validatedData.endDate !== undefined ? (validatedData.endDate ? validatedData.endDate.toISOString() : null) : undefined,
      merchant: validatedData.merchant,
      description: validatedData.description,
      categoryId: validatedData.categoryId,
      status: validatedData.status,
    });
    
    if (!result) {
      throw new NotFoundError('Recurring transaction');
    }
    
    invalidateUserCache(user.id);
    logger.info('recurring.service', 'Recurring rule updated', { userId: user.id, ruleId: result.id });
    
    return { success: true, data: result };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message, fieldErrors: error instanceof ValidationError ? error.fieldErrors : undefined };
  }
}

export async function archiveRecurringTransaction(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await requireAuth();
    
    const success = await archiveRecurringTransactionRule(id, user.id);
    if (!success) {
      throw new NotFoundError('Recurring transaction');
    }
    
    invalidateUserCache(user.id);
    logger.info('recurring.service', 'Recurring rule archived', { userId: user.id, ruleId: id });
    
    return { success: true, data: { success: true } };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}


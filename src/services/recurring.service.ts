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
    
    // Validate ownership before updating
    const existing = await dbGetRecurringTransactionById(id, user.id);
    if (!existing) {
      throw new NotFoundError('Recurring transaction');
    }
    
    const parseResult = updateRecurringSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      throw new ValidationError(fieldErrors);
    }
    
    const validatedData = parseResult.data;
    
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
      throw new AppError('Failed to update recurring transaction', 500);
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
    
    // Ensure ownership exists before archiving
    const existing = await dbGetRecurringTransactionById(id, user.id);
    if (!existing) {
      throw new NotFoundError('Recurring transaction');
    }
    
    const success = await archiveRecurringTransactionRule(id, user.id);
    if (!success) {
      throw new AppError('Failed to archive recurring transaction', 500);
    }
    
    invalidateUserCache(user.id);
    logger.info('recurring.service', 'Recurring rule archived', { userId: user.id, ruleId: id });
    
    return { success: true, data: { success: true } };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}

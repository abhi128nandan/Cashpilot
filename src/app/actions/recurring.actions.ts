'use server';

import { requireAuth } from '@/lib/auth/guard';
import { 
  getRecurringTransactions, 
  getRecurringTransactionById, 
  createRecurringTransaction, 
  updateRecurringTransaction, 
  archiveRecurringTransaction 
} from '@/services/recurring.service';
import { 
  createRecurringSchema, 
  updateRecurringSchema, 
  type CreateRecurringInput, 
  type UpdateRecurringInput 
} from '@/lib/validators/recurring';
import { ValidationError, toErrorResponse } from '@/lib/utils/errors';
import type { ActionResult, RecurringTransaction } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getRecurringTransactionsAction(): Promise<ActionResult<RecurringTransaction[]>> {
  try {
    const user = await requireAuth();
    const data = await getRecurringTransactions(user.id);
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}

export async function getRecurringTransactionByIdAction(id: string): Promise<ActionResult<RecurringTransaction>> {
  try {
    const user = await requireAuth();
    const data = await getRecurringTransactionById(id, user.id);
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}

export async function createRecurringTransactionAction(input: unknown): Promise<ActionResult<RecurringTransaction>> {
  try {
    const user = await requireAuth();
    
    // Validate untrusted input
    const parseResult = createRecurringSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.flatten().fieldErrors);
    }
    
    const data = await createRecurringTransaction(user.id, parseResult.data as CreateRecurringInput);
    
    // Revalidate paths affected by this data
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { 
      success: false, 
      error: err.message, 
      fieldErrors: error instanceof ValidationError ? error.fieldErrors : undefined 
    };
  }
}

export async function updateRecurringTransactionAction(id: string, input: unknown): Promise<ActionResult<RecurringTransaction>> {
  try {
    const user = await requireAuth();
    
    // Validate untrusted input (basic shape only)
    const parseResult = updateRecurringSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.flatten().fieldErrors);
    }
    
    const data = await updateRecurringTransaction(id, user.id, parseResult.data as UpdateRecurringInput);
    
    // Revalidate paths affected by this data
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { 
      success: false, 
      error: err.message, 
      fieldErrors: error instanceof ValidationError ? error.fieldErrors : undefined 
    };
  }
}

export async function archiveRecurringTransactionAction(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await requireAuth();
    
    const data = await archiveRecurringTransaction(id, user.id);
    
    // Revalidate paths affected by this data
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    
    return { success: true, data };
  } catch (error) {
    const err = toErrorResponse(error);
    return { success: false, error: err.message };
  }
}

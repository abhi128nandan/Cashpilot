import { getDueRecurringTransactions, createTransaction, updateRecurringTransactionAdmin } from '@/lib/db/queries';
import { logger } from '@/lib/utils/logger';
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO, startOfDay, format } from 'date-fns';
import type { RecurringTransaction } from '@/types';

export interface ProcessingResult {
  processedCount: number;
  generatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Core engine for processing recurring transactions.
 * Designed to be framework-agnostic. Can be invoked via Cron Jobs,
 * API routes, or Dashboard hooks.
 */
export class RecurringProcessingEngine {
  
  /**
   * Process all currently due recurring transactions across all users.
   */
  static async processAll(): Promise<ProcessingResult> {
    return this.executeProcessing();
  }

  /**
   * Process due recurring transactions for a specific user.
   */
  static async processForUser(userId: string): Promise<ProcessingResult> {
    return this.executeProcessing(userId);
  }

  private static async executeProcessing(userId?: string): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      processedCount: 0,
      generatedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      errors: [],
    };

    logger.info('recurring_engine', 'Starting processing batch', { userId });
    const startTime = Date.now();

    try {
      const dueRules = await getDueRecurringTransactions(userId);
      
      if (dueRules.length === 0) {
        logger.info('recurring_engine', 'No due rules found', { durationMs: Date.now() - startTime });
        return result;
      }

      // Process sequentially to avoid DB pool exhaustion for MVP.
      // For massive scale (>10k), this should push to a queue (SQS/Kafka).
      for (const rule of dueRules) {
        result.processedCount++;
        try {
          await this.processRule(rule, result);
        } catch (error) {
          result.failedCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Rule ${rule.id}: ${errorMessage}`);
          
          logger.error('recurring_engine', 'Rule processing failed', {
            ruleId: rule.id,
            error: errorMessage
          });
        }
      }

      logger.info('recurring_engine', 'Completed processing batch', {
        durationMs: Date.now() - startTime,
        ...result
      });

    } catch (error) {
      logger.error('recurring_engine', 'Fatal error during processing execution', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    return result;
  }

  private static async processRule(rule: RecurringTransaction, result: ProcessingResult): Promise<void> {
    // 1. Double check status to prevent processing archived/paused
    if (rule.status !== 'active') {
      result.skippedCount++;
      return;
    }

    // Use UTC midnight for all calculations to avoid timezone shifts
    const today = startOfDay(new Date());
    let currentDateToProcess = startOfDay(parseISO(rule.nextDate));
    
    // We only process if the rule is truly due
    if (isAfter(currentDateToProcess, today)) {
      result.skippedCount++;
      return;
    }

    // Safety limit: Don't process more than 365 catch-up occurrences at once
    // to prevent infinite loops if something is deeply broken
    let loopGuard = 0;
    const MAX_CATCH_UP_ITERATIONS = 365;
    
    // Process all missed occurrences up to today
    while (!isAfter(currentDateToProcess, today) && loopGuard < MAX_CATCH_UP_ITERATIONS) {
      loopGuard++;
      
      // Stop if we hit the end_date
      if (rule.endDate) {
        const endDate = startOfDay(parseISO(rule.endDate));
        if (isAfter(currentDateToProcess, endDate)) {
          break; // Rule expired
        }
      }

      // Format date for the idempotency key (YYYY-MM-DD)
      const dateString = format(currentDateToProcess, 'yyyy-MM-dd');
      
      // IDEMPOTENCY KEY: Guarantees exact mathematical prevention of duplicates.
      // If two cron jobs run this exact code simultaneously, the database unique
      // constraint on transactions (user_id, idempotency_key) will reject the second.
      const idempotencyKey = `rec_${rule.id}_${dateString}`;
      
      const insertResult = await createTransaction(rule.userId, {
        amount: rule.amount,
        type: rule.type,
        currency: rule.currency,
        categoryId: rule.categoryId,
        merchant: rule.merchant,
        description: rule.description || `Recurring: ${rule.frequency}`,
        transactionDate: dateString,
        source: 'recurring',
        idempotencyKey: idempotencyKey
      });

      if (insertResult.isDuplicate) {
        // Safe skip: Another worker processed this, or it was manually retried.
        logger.info('recurring_engine', 'Skipped duplicate occurrence', { ruleId: rule.id, dateString });
        result.skippedCount++;
      } else if (!insertResult.transaction) {
        throw new Error(`Failed to insert transaction for date ${dateString}`);
      } else {
        result.generatedCount++;
      }

      // Calculate next date
      currentDateToProcess = this.calculateNextDate(currentDateToProcess, rule.frequency);
    }
    
    // After processing all catch-ups (or skipping duplicates), update the rule.
    // Determine if the rule is now expired based on end_date
    let newStatus: RecurringTransaction['status'] = rule.status;
    if (rule.endDate) {
      const endDate = startOfDay(parseISO(rule.endDate));
      if (isAfter(currentDateToProcess, endDate)) {
        newStatus = 'archived'; // Automatically archive completed rules
      }
    }

    await updateRecurringTransactionAdmin(rule.id, {
      nextDate: format(currentDateToProcess, 'yyyy-MM-dd'),
      lastProcessedAt: new Date().toISOString(),
      status: newStatus
    });
  }

  /**
   * Pure function to calculate the next date based on the frequency.
   * Handles leap years and variable month lengths automatically via date-fns.
   */
  private static calculateNextDate(current: Date, frequency: string): Date {
    switch (frequency) {
      case 'daily':
        return addDays(current, 1);
      case 'weekly':
        return addWeeks(current, 1);
      case 'monthly':
        return addMonths(current, 1);
      case 'yearly':
        return addYears(current, 1);
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }
}

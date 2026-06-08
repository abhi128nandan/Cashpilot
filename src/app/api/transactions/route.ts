/**
 * Route Handler: /api/transactions
 *
 * GET  /api/transactions              → list transactions for the authenticated user
 * POST /api/transactions              → create a new transaction
 *
 * Authentication: every handler calls requireAuth() which verifies the
 * Supabase session server-side. An unauthenticated request returns 401.
 *
 * Validation: Zod schemas from @/lib/validators/transaction (already in project).
 *
 * Data source: Supabase via db/queries.ts (falls back to mock-data internally).
 *
 * Production hardening (v2):
 *  - Structured logging
 *  - Duplicate transaction detection (409 Conflict)
 *  - Top-level try/catch on all handlers
 *  - Category existence validation before insert
 */

import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/guard';
import { UnauthorizedError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import {
  getTransactions,
  getCategoryById,
  createTransaction,
} from '@/lib/db/queries';
import {
  createTransactionSchema,
  transactionFilterSchema,
} from '@/lib/validators/transaction';
import { respond } from '@/lib/api/respond';
import { checkRateLimit } from '@/lib/security/rate-limit';
import type { Transaction } from '@/types';

// ─── GET /api/transactions ───────────────────────────────────────────────────
//
// Returns the authenticated user's transactions.
// Supports optional query parameters defined in transactionFilterSchema:
//   ?type=expense&search=amazon&page=1&limit=20&sortOrder=desc
//
// Response: { data: Transaction[] }

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // 1. Auth guard — returns 401 if no valid session
    let user;
    try {
      user = await requireAuth();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return respond.unauthorized();
      }
      return respond.internalError();
    }

    // 2. Rate limiting (Per IP + User)
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimit = checkRateLimit(ip, user.id);
    if (!rateLimit.allowed) {
      return respond.tooManyRequests(rateLimit.reason || 'Too Many Requests');
    }

    // 3. Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const rawParams = Object.fromEntries(searchParams.entries());

    const parsed = transactionFilterSchema.safeParse(rawParams);
    if (!parsed.success) {
      logger.warn('security.abuse', 'Suspicious pattern: invalid query parameters', {
        reason: 'Invalid query parameters',
        userId: user.id,
        ip,
        errors: parsed.error.flatten().fieldErrors,
      });
      return respond.badRequest(
        'Invalid query parameters',
        parsed.error.flatten().fieldErrors
      );
    }

    const filters = parsed.data;

    // 3. Fetch data from DB (falls back to mock internally)
    let transactions = await getTransactions(user.id);

    // Apply in-memory filters that mirror what Supabase would do server-side
    if (filters.type) {
      transactions = transactions.filter((t) => t.type === filters.type);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.merchant?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    if (filters.categoryId) {
      transactions = transactions.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters.startDate) {
      transactions = transactions.filter(
        (t) => new Date(t.transactionDate) >= filters.startDate!
      );
    }
    if (filters.endDate) {
      transactions = transactions.filter(
        (t) => new Date(t.transactionDate) <= filters.endDate!
      );
    }
    if (filters.minAmount !== undefined) {
      transactions = transactions.filter((t) => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      transactions = transactions.filter((t) => t.amount <= filters.maxAmount!);
    }

    // Sort — type-aware comparator
    // `amount` is a number; `merchant` can be null; dates are ISO strings (lexicographically sortable).
    transactions = [...transactions].sort((a, b) => {
      const key = filters.sortBy as keyof Transaction;
      const valA = a[key];
      const valB = b[key];

      // Push nulls/undefined to the end regardless of sort order
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      let cmp: number;
      if (typeof valA === 'number' && typeof valB === 'number') {
        cmp = valA - valB;
      } else {
        cmp = String(valA).localeCompare(String(valB));
      }

      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    // Paginate
    const offset = (filters.page - 1) * filters.limit;
    const paginated = transactions.slice(offset, offset + filters.limit);

    return respond.ok(paginated);
  } catch (err) {
    logger.error('api.transactions.GET', 'Failure', {
      reason: 'Unhandled exception',
      error: err instanceof Error ? err.message : String(err),
    });
    return respond.internalError();
  }
}

// ─── POST /api/transactions ──────────────────────────────────────────────────
//
// Creates a new transaction for the authenticated user.
//
// Request body (JSON):
//   { amount, type, merchant?, description?, categoryId?, transactionDate, currency? }
//
// Response: { data: Transaction }  (201 Created)
//           { error: string }      (409 Conflict — duplicate)

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Auth guard
    let user;
    try {
      user = await requireAuth();
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return respond.unauthorized();
      }
      return respond.internalError();
    }

    // 3. Rate limiting (Per IP + User)
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimit = checkRateLimit(ip, user.id);
    if (!rateLimit.allowed) {
      return respond.tooManyRequests(rateLimit.reason || 'Too Many Requests');
    }

    // 4. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return respond.badRequest('Request body must be valid JSON');
    }

    // 5. Validate with Zod
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('security.abuse', 'Suspicious pattern: invalid inputs', {
        reason: 'Validation failed',
        userId: user.id,
        ip,
        errors: parsed.error.flatten().fieldErrors,
      });
      return respond.badRequest(
        'Validation failed',
        parsed.error.flatten().fieldErrors
      );
    }

    const input = parsed.data;

    // 6. Validate category exists (if provided)
    if (input.categoryId && input.categoryId !== '') {
      const category = await getCategoryById(input.categoryId);
      if (!category) {
        logger.warn('security.abuse', 'Suspicious pattern: invalid category', {
          reason: 'Invalid categoryId',
          userId: user.id,
          ip,
          categoryId: input.categoryId,
        });
        return respond.badRequest('Invalid categoryId — category not found');
      }
    }

    // 7. Insert via DB layer (returns { transaction, isDuplicate })
    const result = await createTransaction(user.id, {
      amount: input.amount,
      currency: input.currency,
      type: input.type,
      merchant: input.merchant ?? null,
      description: input.description ?? null,
      categoryId: input.categoryId,
      transactionDate: (input.transactionDate as Date).toISOString().split('T')[0],
      source: 'manual',
      idempotencyKey: input.idempotencyKey,
    });

    // 5a. Duplicate detection — return 409 Conflict
    if (result.isDuplicate) {
      return respond.conflict(
        'Duplicate transaction detected. A similar transaction was submitted within the last 60 seconds.'
      );
    }

    if (!result.transaction) {
      return respond.internalError('Failed to create transaction');
    }

    return respond.created(result.transaction);
  } catch (err) {
    logger.error('api.transactions.POST', 'Failure', {
      reason: 'Unhandled exception',
      error: err instanceof Error ? err.message : String(err),
    });
    return respond.internalError();
  }
}

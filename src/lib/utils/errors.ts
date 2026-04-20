/**
 * Custom error class hierarchy for CashPilot.
 * 
 * Provides type-safe error matching, automatic HTTP status mapping,
 * and prevents leaking internal details to clients.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>) {
    super('Validation failed', 422);
    this.fieldErrors = fieldErrors;
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      `Rate limit exceeded.${retryAfter ? ` Try again in ${retryAfter} seconds.` : ''}`,
      429
    );
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Formats error for API/action responses — never leaks stack traces in production
 */
export function toErrorResponse(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof AppError) {
    return { message: error.message, status: error.statusCode };
  }

  console.error('[UnexpectedError]', error);
  return { message: 'An unexpected error occurred', status: 500 };
}

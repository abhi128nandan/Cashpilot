/**
 * API response helpers for Route Handlers.
 *
 * Why a shared helper instead of inline `Response.json()` calls:
 *  - Enforces consistent JSON envelope: { data } | { error, details? }
 *  - Centralizes HTTP status codes — no magic numbers scattered across handlers
 *  - Makes it trivial to add response-level headers (e.g. Cache-Control) later
 *
 * Every API response from CashPilot follows this shape:
 *   Success: { data: T }
 *   Error:   { error: string, details?: unknown }
 */

type SuccessPayload<T> = { data: T };
type ErrorPayload = { error: string; details?: unknown };

function json<T>(body: SuccessPayload<T> | ErrorPayload, status: number): Response {
  return Response.json(body, { status });
}

export const respond = {
  ok<T>(data: T): Response {
    return json<T>({ data }, 200);
  },

  created<T>(data: T): Response {
    return json<T>({ data }, 201);
  },

  badRequest(message: string, details?: unknown): Response {
    return json<ErrorPayload>({ error: message, details }, 400);
  },

  unauthorized(message = 'Authentication required'): Response {
    return json<ErrorPayload>({ error: message }, 401);
  },

  forbidden(message = 'Insufficient permissions'): Response {
    return json<ErrorPayload>({ error: message }, 403);
  },

  notFound(resource: string): Response {
    return json<ErrorPayload>({ error: `${resource} not found` }, 404);
  },

  conflict(message = 'Resource already exists'): Response {
    return json<ErrorPayload>({ error: message }, 409);
  },

  tooManyRequests(message = 'Too many requests', retryAfter?: number): Response {
    const headers: Record<string, string> = {};
    if (retryAfter) headers['Retry-After'] = String(retryAfter);
    return Response.json({ error: message } satisfies ErrorPayload, { status: 429, headers });
  },

  internalError(message = 'An unexpected error occurred'): Response {
    return json<ErrorPayload>({ error: message }, 500);
  },
};

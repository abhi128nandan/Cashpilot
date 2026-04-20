/**
 * Auth guard helpers for Server Components and Server Actions.
 *
 * Uses Supabase server client for authentication checks.
 * These centralize auth/authz so every data access point
 * doesn't need to duplicate session logic.
 */
import { createClient } from '@/lib/supabase/server';
import { UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

/**
 * Require an authenticated session. Call this at the top of any
 * Server Component or Server Action that needs a logged-in user.
 *
 * @returns The authenticated Supabase user (never null)
 * @throws UnauthorizedError if no session exists
 *
 * @example
 * ```ts
 * const user = await requireAuth();
 * // user.id is guaranteed to exist here
 * ```
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return user;
}

/**
 * Require that the authenticated user owns the requested resource.
 * Prevents Insecure Direct Object Reference (IDOR) attacks.
 *
 * @param resourceUserId - The userId field on the resource being accessed
 * @param sessionUserId - The authenticated user's ID
 * @throws ForbiddenError if the session user doesn't own the resource
 */
export function requireOwnership(resourceUserId: string, sessionUserId: string) {
  if (resourceUserId !== sessionUserId) {
    throw new ForbiddenError('You do not have access to this resource');
  }
}

/**
 * Require admin role. Checks user profile in Supabase.
 *
 * @throws ForbiddenError if the user is not an admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  return user;
}

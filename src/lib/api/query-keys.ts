/**
 * Query Key Factory
 * Centralizes query keys to avoid string literals and typos across React Query hooks.
 */

export const recurringKeys = {
  all: ['recurring'] as const,
  lists: () => [...recurringKeys.all, 'list'] as const,
  list: (filters: string) => [...recurringKeys.lists(), { filters }] as const,
  details: () => [...recurringKeys.all, 'detail'] as const,
  detail: (id: string) => [...recurringKeys.details(), id] as const,
};

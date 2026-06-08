import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

import { safeNumber } from '@/lib/math';

/**
 * Format a currency amount with locale-aware formatting (INR).
 */
export function formatCurrency(amount: number | null | undefined, _currency?: string, _locale?: string): string {
  const num = safeNumber(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a compact number with currency (e.g., ₹1.2L, ₹3.4Cr)
 */
export function formatCompactNumber(value: number | null | undefined): string {
  const num = safeNumber(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a date in a human-readable way
 */
export function formatDate(dateStr: string): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return format(date, 'MMM d, yyyy');
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Get month-year label (e.g., "Jan 2024")
 */
export function formatMonthYear(dateStr: string): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'MMM yyyy');
}

/**
 * Generate a readable ID for display
 */
export function truncateId(id: string, length: number = 8): string {
  return id.substring(0, length);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a deterministic color from a string (for category colors)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

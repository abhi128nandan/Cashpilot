/**
 * Safe mathematical operations for CashPilot.
 * Prevents NaN, undefined, or Infinity from reaching the UI.
 */

/**
 * Safely coerce any value to a finite number.
 * Returns 0 if the value is NaN, null, undefined, or Infinity.
 */
export function safeNumber(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Safely calculates a percentage (part / total * 100).
 * Prevents division by zero, returning 0 if total is 0.
 */
export function safePercentage(part: number, total: number): number {
  const safePart = safeNumber(part);
  const safeTotal = safeNumber(total);
  
  if (safeTotal === 0) return 0;
  
  const percentage = (safePart / safeTotal) * 100;
  return Number.isFinite(percentage) ? percentage : 0;
}

/**
 * Safely divides two numbers.
 * Prevents division by zero, returning 0 if divisor is 0.
 */
export function safeDivision(dividend: number, divisor: number): number {
  const safeDividend = safeNumber(dividend);
  const safeDivisor = safeNumber(divisor);
  
  if (safeDivisor === 0) return 0;
  
  const result = safeDividend / safeDivisor;
  return Number.isFinite(result) ? result : 0;
}

/**
 * Centralized currency formatting utility for CashPilot.
 * Uses Intl.NumberFormat to correctly format Indian Rupees (INR)
 * according to the en-IN locale (e.g., ₹1,20,000 instead of ₹120,000).
 */

export function formatCurrency(amount: number | null | undefined, compact = false): string {
  if (amount == null || Number.isNaN(amount)) {
    amount = 0;
  }

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  };

  if (compact) {
    options.notation = 'compact';
    options.compactDisplay = 'short';
  }

  return new Intl.NumberFormat('en-IN', options).format(amount);
}

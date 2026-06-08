-- ============================================================================
-- CashPilot: Update Default Currency to INR
-- ============================================================================

ALTER TABLE public.transactions 
  ALTER COLUMN currency SET DEFAULT 'INR';

-- Note: Any existing transactions with 'USD' will remain 'USD' unless manually updated.
-- To update all existing rows to 'INR':
-- UPDATE public.transactions SET currency = 'INR' WHERE currency = 'USD';

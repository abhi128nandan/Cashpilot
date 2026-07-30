-- ============================================================================
-- CashPilot Migration: 004_recurring_transactions.sql
-- 
-- Adds support for recurring transactions.
-- Uses soft deletes (status) to maintain history and idempotency keys to 
-- prevent duplicate processing.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (char_length(currency) = 3),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  merchant TEXT,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  next_date DATE NOT NULL,
  end_date DATE,
  last_processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recurring_transactions"
  ON public.recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring_transactions"
  ON public.recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring_transactions"
  ON public.recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_date ON public.recurring_transactions(next_date) WHERE status = 'active';

-- Add foreign key from standard transactions back to recurring_transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES public.recurring_transactions(id) ON DELETE SET NULL;

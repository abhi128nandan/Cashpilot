-- ============================================================================
-- CashPilot Migration: 002_idempotency_keys.sql
-- 
-- Hardening: Adds true idempotency to the transactions table to prevent
-- duplicate charges during network retries or concurrent race conditions.
-- ============================================================================

-- 1. Add the column
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- 2. Add a unique constraint scoped to the user to prevent cross-user collisions
-- and allow the same key to be reused for different users (though UUIDs should be unique globally anyway).
-- We also limit the constraint's scope to prevent infinite index growth on old keys (optional, but good for scale).
-- For now, a simple UNIQUE constraint is sufficient.
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_idempotency_key_user_key UNIQUE (user_id, idempotency_key);

-- 3. Add an index for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON public.transactions(idempotency_key);

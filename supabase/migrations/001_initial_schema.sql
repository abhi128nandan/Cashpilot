-- ============================================================================
-- CashPilot: Initial Database Schema
-- 
-- This migration creates the core tables for the fintech application.
-- All tables use user_id FK to auth.users for data isolation.
-- Row Level Security (RLS) ensures users can only access their own data.
-- ============================================================================

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Extends auth.users with application-specific fields.
-- Created automatically via trigger on user signup.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to make migration idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
-- System categories (user_id IS NULL) are shared across all users.
-- User-created categories have user_id set.

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Users can see system categories + their own
CREATE POLICY "Users can read accessible categories"
  ON public.categories FOR SELECT
  USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);


-- ─── TRANSACTIONS ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (char_length(currency) = 3),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  merchant TEXT,
  description TEXT,
  transaction_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv', 'plaid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);


-- ─── BUDGETS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent duplicate budgets for same category+period per user
  UNIQUE (user_id, category_id, period)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);


-- ─── ANOMALIES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own anomalies"
  ON public.anomalies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own anomalies"
  ON public.anomalies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON public.anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_unresolved ON public.anomalies(user_id) WHERE is_resolved = false;


-- ─── SEED: System Categories ─────────────────────────────────────────────────
-- These are shared across all users. user_id is NULL, is_system is true.

INSERT INTO public.categories (id, user_id, name, icon, color, is_system) VALUES
  (gen_random_uuid(), NULL, 'Housing',        '🏠', 'hsl(225, 82%, 52%)', true),
  (gen_random_uuid(), NULL, 'Food & Dining',  '🍕', 'hsl(38, 92%, 50%)',  true),
  (gen_random_uuid(), NULL, 'Transportation', '🚗', 'hsl(160, 78%, 42%)', true),
  (gen_random_uuid(), NULL, 'Entertainment',  '🎬', 'hsl(280, 70%, 55%)', true),
  (gen_random_uuid(), NULL, 'Shopping',       '🛍️', 'hsl(340, 75%, 55%)', true),
  (gen_random_uuid(), NULL, 'Healthcare',     '💊', 'hsl(0, 78%, 54%)',   true),
  (gen_random_uuid(), NULL, 'Utilities',      '⚡', 'hsl(200, 70%, 50%)', true),
  (gen_random_uuid(), NULL, 'Salary',         '💰', 'hsl(130, 65%, 45%)', true),
  (gen_random_uuid(), NULL, 'Freelance',      '💻', 'hsl(170, 60%, 45%)', true),
  (gen_random_uuid(), NULL, 'Investments',    '📈', 'hsl(45, 80%, 50%)',  true),
  (gen_random_uuid(), NULL, 'Subscriptions',  '📱', 'hsl(260, 65%, 55%)', true),
  (gen_random_uuid(), NULL, 'Travel',         '✈️', 'hsl(190, 70%, 50%)', true)
ON CONFLICT DO NOTHING;

-- Add missing columns to daily_records table
ALTER TABLE public.daily_records 
  ADD COLUMN IF NOT EXISTS cash_collection numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lube numeric NOT NULL DEFAULT 0;
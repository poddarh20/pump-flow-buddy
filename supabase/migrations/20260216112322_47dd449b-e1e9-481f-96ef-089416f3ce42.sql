
ALTER TABLE public.daily_records ADD COLUMN IF NOT EXISTS paytm numeric NOT NULL DEFAULT 0;

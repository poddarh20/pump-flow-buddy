
-- Daily records (one per date)
CREATE TABLE public.daily_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  price_ms NUMERIC NOT NULL DEFAULT 0,
  price_hsd NUMERIC NOT NULL DEFAULT 0,
  price_xtra_green NUMERIC NOT NULL DEFAULT 0,
  price_cng NUMERIC NOT NULL DEFAULT 0,
  bank_deposit NUMERIC NOT NULL DEFAULT 0,
  credit_party_total NUMERIC NOT NULL DEFAULT 0,
  daily_expense NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meter readings per nozzle per day
CREATE TABLE public.meter_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_record_id UUID NOT NULL REFERENCES public.daily_records(id) ON DELETE CASCADE,
  unit_id INTEGER NOT NULL,
  nozzle_name TEXT NOT NULL,
  opening NUMERIC NOT NULL DEFAULT 0,
  closing NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(daily_record_id, unit_id, nozzle_name)
);

-- Credit parties (JBA, OSS, Satya Yadav, etc.)
CREATE TABLE public.credit_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily credit transactions per party
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.credit_parties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('MS', 'HSD', 'Xtra Green', 'CNG')),
  quantity NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_received NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (public access for single-user pump)
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth needed for single pump)
CREATE POLICY "Public access" ON public.daily_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.meter_readings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.credit_parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.credit_transactions FOR ALL USING (true) WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_credit_transactions_party_date ON public.credit_transactions(party_id, date);
CREATE INDEX idx_daily_records_date ON public.daily_records(date);

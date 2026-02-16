
-- 1. Fix credit ledger: drop the fuel_type check constraint and make fuel_type have a default
ALTER TABLE public.credit_transactions DROP CONSTRAINT credit_transactions_fuel_type_check;
ALTER TABLE public.credit_transactions ALTER COLUMN fuel_type SET DEFAULT 'CREDIT';
ALTER TABLE public.credit_transactions ALTER COLUMN quantity SET DEFAULT 0;

-- 2. Add testing column to meter_readings
ALTER TABLE public.meter_readings ADD COLUMN testing numeric NOT NULL DEFAULT 0;

-- 3. Add fleet_card and cms columns to daily_records
ALTER TABLE public.daily_records ADD COLUMN fleet_card numeric NOT NULL DEFAULT 0;
ALTER TABLE public.daily_records ADD COLUMN cms numeric NOT NULL DEFAULT 0;

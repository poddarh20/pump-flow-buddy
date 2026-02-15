import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  MeterReading, Prices, Outflow, LedgerEntry,
  defaultPrices, units,
} from '@/lib/petrolPumpData';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function buildDefaultReadings(): MeterReading[] {
  const readings: MeterReading[] = [];
  for (const unit of units) {
    for (const nozzle of unit.nozzles) {
      readings.push({ unitId: unit.id, nozzleName: nozzle.name, opening: 0, closing: 0 });
    }
  }
  return readings;
}

export function usePetrolPumpStore() {
  const [date, setDate] = useState(getToday());
  const [readings, setReadings] = useState<MeterReading[]>(buildDefaultReadings());
  const [prices, setPrices] = useState<Prices>({ ...defaultPrices });
  const [outflow, setOutflow] = useState<Outflow>({ bankDeposit: 0, creditParty: 0, dailyExpense: 0 });
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [dailyRecordId, setDailyRecordId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load data for selected date
  useEffect(() => {
    loadDayData(date);
  }, [date]);

  const loadDayData = async (d: string) => {
    const { data: record } = await supabase
      .from('daily_records')
      .select('*')
      .eq('date', d)
      .maybeSingle();

    if (record) {
      setDailyRecordId(record.id);
      setPrices({
        MS: Number(record.price_ms),
        HSD: Number(record.price_hsd),
        'Xtra Premium': Number(record.price_xtra_premium ?? 0),
        'Xtra Green': Number(record.price_xtra_green),
        CNG: Number(record.price_cng),
      });
      setOutflow({
        bankDeposit: Number(record.bank_deposit),
        creditParty: Number(record.credit_party_total),
        dailyExpense: Number(record.daily_expense),
      });

      // Load meter readings
      const { data: meterData } = await supabase
        .from('meter_readings')
        .select('*')
        .eq('daily_record_id', record.id);

      if (meterData && meterData.length > 0) {
        const defaultReadings = buildDefaultReadings();
        const merged = defaultReadings.map(dr => {
          const found = meterData.find(m => m.unit_id === dr.unitId && m.nozzle_name === dr.nozzleName);
          return found ? { ...dr, opening: Number(found.opening), closing: Number(found.closing) } : dr;
        });
        setReadings(merged);
      } else {
        setReadings(buildDefaultReadings());
      }
    } else {
      setDailyRecordId(null);
      setPrices({ ...defaultPrices });
      setOutflow({ bankDeposit: 0, creditParty: 0, dailyExpense: 0 });
      setReadings(buildDefaultReadings());
    }
  };

  // Save/update daily record
  const saveDay = useCallback(async () => {
    setSaving(true);
    try {
      let recordId = dailyRecordId;

      const recordData = {
        date,
        price_ms: prices.MS,
        price_hsd: prices.HSD,
        price_xtra_green: prices['Xtra Green'],
        price_cng: prices.CNG,
        bank_deposit: outflow.bankDeposit,
        credit_party_total: outflow.creditParty,
        daily_expense: outflow.dailyExpense,
      };

      if (recordId) {
        await supabase.from('daily_records').update(recordData).eq('id', recordId);
      } else {
        const { data } = await supabase.from('daily_records').insert(recordData).select().single();
        if (data) {
          recordId = data.id;
          setDailyRecordId(data.id);
        }
      }

      if (recordId) {
        // Upsert meter readings
        const readingsData = readings.map(r => ({
          daily_record_id: recordId!,
          unit_id: r.unitId,
          nozzle_name: r.nozzleName,
          opening: r.opening,
          closing: r.closing,
        }));

        await supabase.from('meter_readings').delete().eq('daily_record_id', recordId);
        await supabase.from('meter_readings').insert(readingsData);
      }
    } finally {
      setSaving(false);
    }
  }, [date, prices, outflow, readings, dailyRecordId]);

  const updateReading = useCallback((unitId: number, nozzleName: string, field: 'opening' | 'closing', value: number) => {
    setReadings(prev => prev.map(r =>
      r.unitId === unitId && r.nozzleName === nozzleName ? { ...r, [field]: value } : r
    ));
  }, []);

  const updatePrice = useCallback((fuel: keyof Prices, value: number) => {
    setPrices(prev => ({ ...prev, [fuel]: value }));
  }, []);

  const updateOutflow = useCallback((field: keyof Outflow, value: number) => {
    setOutflow(prev => ({ ...prev, [field]: value }));
  }, []);

  const addLedgerParty = useCallback((name: string) => {
    setLedger(prev => [...prev, { party: name, balance: 0 }]);
  }, []);

  const updateLedgerBalance = useCallback((party: string, amount: number) => {
    setLedger(prev => prev.map(e => e.party === party ? { ...e, balance: e.balance + amount } : e));
  }, []);

  return {
    date, setDate,
    readings, updateReading,
    prices, updatePrice,
    outflow, updateOutflow,
    ledger, addLedgerParty, updateLedgerBalance,
    saveDay, saving, dailyRecordId,
  };
}

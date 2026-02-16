import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  MeterReading, Prices, Outflow, LedgerEntry,
  defaultPrices, units,
} from '@/lib/petrolPumpData';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function buildDefaultReadings(): MeterReading[] {
  const readings: MeterReading[] = [];
  for (const unit of units) {
    for (const nozzle of unit.nozzles) {
      readings.push({ unitId: unit.id, nozzleName: nozzle.name, opening: 0, closing: 0, testing: 0 });
    }
  }
  return readings;
}

export function usePetrolPumpStore() {
  const [date, setDate] = useState(getToday());
  const [readings, setReadings] = useState<MeterReading[]>(buildDefaultReadings());
  const [prices, setPrices] = useState<Prices>({ ...defaultPrices });
  const [outflow, setOutflow] = useState<Outflow>({ bankDeposit: 0, creditParty: 0, dailyExpense: 0, fleetCard: 0, cms: 0 });
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
      const rec = record as any;
      setPrices({
        MS: Number(rec.price_ms),
        HSD: Number(rec.price_hsd),
        'Xtra Premium': Number(rec.price_xtra_premium ?? 0),
        'Xtra Green': Number(rec.price_xtra_green),
        CNG: Number(rec.price_cng),
      });
      setOutflow({
        bankDeposit: Number(record.bank_deposit),
        creditParty: Number(record.credit_party_total),
        dailyExpense: Number(record.daily_expense),
        fleetCard: Number(rec.fleet_card ?? 0),
        cms: Number(rec.cms ?? 0),
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
          return found ? { ...dr, opening: Number(found.opening), closing: Number(found.closing), testing: Number((found as any).testing ?? 0) } : dr;
        });
        setReadings(merged);
      } else {
        // No readings for this day yet — auto-populate opening from previous day's closing
        await autoPopulateOpenings(d);
      }
    } else {
      setDailyRecordId(null);
      setPrices({ ...defaultPrices });
      setOutflow({ bankDeposit: 0, creditParty: 0, dailyExpense: 0, fleetCard: 0, cms: 0 });
      // Auto-populate opening from previous day's closing
      await autoPopulateOpenings(d);
    }
  };

  const autoPopulateOpenings = async (d: string) => {
    const prevDate = getPreviousDate(d);
    const { data: prevRecord } = await supabase
      .from('daily_records')
      .select('id')
      .eq('date', prevDate)
      .maybeSingle();

    if (prevRecord) {
      const { data: prevMeterData } = await supabase
        .from('meter_readings')
        .select('*')
        .eq('daily_record_id', prevRecord.id);

      if (prevMeterData && prevMeterData.length > 0) {
        const defaultReadings = buildDefaultReadings();
        const populated = defaultReadings.map(dr => {
          const prev = prevMeterData.find(m => m.unit_id === dr.unitId && m.nozzle_name === dr.nozzleName);
          return prev ? { ...dr, opening: Number(prev.closing) } : dr;
        });
        setReadings(populated);
        return;
      }
    }
    setReadings(buildDefaultReadings());
  };

  // Save/update daily record
  const saveDay = useCallback(async () => {
    setSaving(true);
    try {
      let recordId = dailyRecordId;

      const recordData: any = {
        date,
        price_ms: prices.MS,
        price_hsd: prices.HSD,
        price_xtra_premium: prices['Xtra Premium'],
        price_xtra_green: prices['Xtra Green'],
        price_cng: prices.CNG,
        bank_deposit: outflow.bankDeposit,
        credit_party_total: outflow.creditParty,
        daily_expense: outflow.dailyExpense,
        fleet_card: outflow.fleetCard,
        cms: outflow.cms,
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
          testing: r.testing,
        }));

        await supabase.from('meter_readings').delete().eq('daily_record_id', recordId);
        await supabase.from('meter_readings').insert(readingsData);
      }
    } finally {
      setSaving(false);
    }
  }, [date, prices, outflow, readings, dailyRecordId]);

  const updateReading = useCallback((unitId: number, nozzleName: string, field: 'opening' | 'closing' | 'testing', value: number) => {
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

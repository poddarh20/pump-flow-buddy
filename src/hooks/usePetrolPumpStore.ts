import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  MeterReading, Prices, Outflow,
  defaultPrices, units,
} from '@/lib/petrolPumpData';

function getToday() {
  return new Date().toISOString().split('T')[0];
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
  const [outflow, setOutflow] = useState<Outflow>({ bankDeposit: 0, creditParty: 0, fleetCard: 0, cms: 0, paytm: 0, cashCollection: 0 });
  const [lube, setLube] = useState<number>(0);
  const [dailyRecordId, setDailyRecordId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDayData(date);
  }, [date]);

  const loadCreditPartyTotal = async (d: string): Promise<number> => {
    const { data } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('date', d);
    return data ? data.reduce((sum, t) => sum + Number(t.amount), 0) : 0;
  };

  const loadDayData = async (d: string) => {
    // Always compute credit party total from credit_transactions
    const creditTotal = await loadCreditPartyTotal(d);

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
        creditParty: creditTotal,
        fleetCard: Number(rec.fleet_card ?? 0),
        cms: Number(rec.cms ?? 0),
        paytm: Number(rec.paytm ?? 0),
        cashCollection: Number(rec.cash_collection ?? 0),
      });
      setLube(Number(rec.lube ?? 0));

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
        setReadings(buildDefaultReadings());
      }
    } else {
      setDailyRecordId(null);
      setPrices({ ...defaultPrices });
      setOutflow({ bankDeposit: 0, creditParty: creditTotal, fleetCard: 0, cms: 0, paytm: 0, cashCollection: 0 });
      setLube(0);
      setReadings(buildDefaultReadings());
    }
  };

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
        fleet_card: outflow.fleetCard,
        cms: outflow.cms,
        paytm: outflow.paytm,
        cash_collection: outflow.cashCollection,
        lube: lube,
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
  }, [date, prices, outflow, readings, dailyRecordId, lube]);

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

  const refreshCreditTotal = useCallback(async () => {
    const creditTotal = await loadCreditPartyTotal(date);
    setOutflow(prev => ({ ...prev, creditParty: creditTotal }));
  }, [date]);

  return {
    date, setDate,
    readings, updateReading,
    prices, updatePrice,
    outflow, updateOutflow,
    lube, setLube,
    saveDay, saving, dailyRecordId,
    refreshCreditTotal,
  };
}

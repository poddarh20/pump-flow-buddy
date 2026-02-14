import { useState, useCallback } from 'react';
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
  const [ledger, setLedger] = useState<LedgerEntry[]>([
    { party: 'Credit Party A', balance: 0 },
    { party: 'Credit Party B', balance: 0 },
  ]);

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
  };
}

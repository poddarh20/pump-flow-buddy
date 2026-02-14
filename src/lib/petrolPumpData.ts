// Unit definitions
export interface Nozzle {
  name: string;
  fuelType: FuelType;
}

export interface Unit {
  id: number;
  name: string;
  nozzles: Nozzle[];
}

export const units: Unit[] = [
  {
    id: 1,
    name: 'Petrol Unit 1',
    nozzles: [
      { name: 'Petrol1', fuelType: 'MS' },
      { name: 'Petrol2', fuelType: 'MS' },
      { name: 'Diesel1', fuelType: 'HSD' },
      { name: 'Diesel2', fuelType: 'HSD' },
    ],
  },
  {
    id: 2,
    name: 'Petrol Unit 2',
    nozzles: [
      { name: 'Petrol1', fuelType: 'MS' },
      { name: 'Petrol2', fuelType: 'MS' },
      { name: 'Diesel1', fuelType: 'HSD' },
      { name: 'Diesel2', fuelType: 'HSD' },
    ],
  },
  {
    id: 3,
    name: 'Diesel Unit 3',
    nozzles: [
      { name: 'HSD', fuelType: 'HSD' },
      { name: 'Xtra Green', fuelType: 'Xtra Green' },
    ],
  },
  {
    id: 4,
    name: 'Diesel Unit 4',
    nozzles: [
      { name: 'HSD', fuelType: 'HSD' },
      { name: 'Xtra Green', fuelType: 'Xtra Green' },
    ],
  },
  {
    id: 5,
    name: 'CNG Unit',
    nozzles: [{ name: 'CNG', fuelType: 'CNG' }],
  },
];

export type FuelType = 'MS' | 'HSD' | 'Xtra Green' | 'CNG';

export const fuelTypes: FuelType[] = ['MS', 'HSD', 'Xtra Green', 'CNG'];

export const fuelColors: Record<FuelType, string> = {
  MS: 'hsl(38, 92%, 50%)',
  HSD: 'hsl(200, 80%, 50%)',
  'Xtra Green': 'hsl(142, 70%, 45%)',
  CNG: 'hsl(280, 60%, 55%)',
};

export interface MeterReading {
  unitId: number;
  nozzleName: string;
  opening: number;
  closing: number;
}

export interface Prices {
  MS: number;
  HSD: number;
  'Xtra Green': number;
  CNG: number;
}

export interface Outflow {
  bankDeposit: number;
  creditParty: number;
  dailyExpense: number;
}

export interface LedgerEntry {
  party: string;
  balance: number;
}

export interface DailyRecord {
  date: string;
  readings: MeterReading[];
  prices: Prices;
  outflow: Outflow;
  ledgerEntries: LedgerEntry[];
}

export const defaultPrices: Prices = {
  MS: 0,
  HSD: 0,
  'Xtra Green': 0,
  CNG: 0,
};

export function calculateSales(readings: MeterReading[]): Record<FuelType, number> {
  const sales: Record<FuelType, number> = {
    MS: 0, HSD: 0, 'Xtra Green': 0, CNG: 0,
  };
  
  for (const r of readings) {
    const unit = units.find(u => u.id === r.unitId);
    const nozzle = unit?.nozzles.find(n => n.name === r.nozzleName);
    if (nozzle) {
      const volume = r.closing - r.opening;
      if (volume > 0) sales[nozzle.fuelType] += volume;
    }
  }
  return sales;
}

export function calculateInflow(sales: Record<FuelType, number>, prices: Prices): number {
  return fuelTypes.reduce((sum, ft) => sum + sales[ft] * prices[ft], 0);
}

export function calculateTotalOutflow(outflow: Outflow): number {
  return outflow.bankDeposit + outflow.creditParty + outflow.dailyExpense;
}

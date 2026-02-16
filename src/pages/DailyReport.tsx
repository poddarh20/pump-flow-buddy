import {
  calculateSales, calculateInflow, calculateTotalOutflow,
  fuelTypes, fuelColors,
} from '@/lib/petrolPumpData';
import { Input } from '@/components/ui/input';
import type { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';

type StoreReturn = ReturnType<typeof usePetrolPumpStore>;

export default function DailyReport({ store }: { store: StoreReturn }) {
  const { date, readings, prices, outflow, updateOutflow } = store;
  const sales = calculateSales(readings);
  const inflow = calculateInflow(sales, prices);
  const totalOutflow = calculateTotalOutflow(outflow);
  const balance = inflow - totalOutflow;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Daily Report</h2>
        <p className="text-sm text-muted-foreground mt-1">Summary for {date}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4 text-lg">📥 Inflow (Sales)</h3>
          <div className="space-y-2">
            {fuelTypes.map(ft => {
              const vol = sales[ft];
              const amt = vol * prices[ft];
              return (
                <div key={ft} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fuelColors[ft] }} />
                    <span className="text-sm text-muted-foreground">{ft}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground mr-3">{vol.toFixed(1)}L × ₹{prices[ft]}</span>
                    <span className="font-mono text-foreground">₹{amt.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-between">
            <span className="font-semibold text-foreground">Total Inflow</span>
            <span className="font-mono font-bold text-success text-lg">₹{inflow.toFixed(0)}</span>
          </div>
        </div>

        {/* Outflow */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4 text-lg">📤 Outflow</h3>
          <div className="space-y-4">
            {([
              { key: 'bankDeposit' as const, label: 'Bank Deposit' },
              { key: 'creditParty' as const, label: 'Credit Party Payments' },
              { key: 'dailyExpense' as const, label: 'Daily Expenses' },
              { key: 'fleetCard' as const, label: 'Fleet Card' },
              { key: 'cms' as const, label: 'CMS (Card Machine)' },
            ]).map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={outflow[key] || ''}
                    onChange={e => updateOutflow(key, Number(e.target.value))}
                    className="font-mono bg-secondary border-border"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-between">
            <span className="font-semibold text-foreground">Total Outflow</span>
            <span className="font-mono font-bold text-destructive text-lg">₹{totalOutflow.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className={`rounded-lg border p-6 text-center ${balance >= 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
        <p className="text-sm text-muted-foreground mb-1">Net Balance</p>
        <p className={`text-4xl font-bold font-mono ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
          ₹{balance.toFixed(0)}
        </p>
      </div>
    </div>
  );
}
